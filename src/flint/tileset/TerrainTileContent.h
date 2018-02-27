#pragma once
#include <array>
#include <vector>
#include <flint/rendering/gl/SerialCounted.h>
#include <flint/rendering/gl/Objects.h>
#include "TileContent.h"
#include "TerrainTile.h"

namespace flint {
namespace tileset {

class TerrainTileContentShaderProgram {
private:
    TerrainTileContentShaderProgram();
    uint32_t vertexShaderId;
    uint32_t fragmentShaderId;
    uint32_t programId;
public:
    static TerrainTileContentShaderProgram& GetInstance() {
        static TerrainTileContentShaderProgram instance;
        return instance;
    }

    void Create(flint::rendering::gl::CommandBuffer* commands);
    void Use(flint::rendering::gl::CommandBuffer* commands);
    TerrainTileContentShaderProgram(const TerrainTileContentShaderProgram&) = delete;
    TerrainTileContentShaderProgram& operator=(const TerrainTileContentShaderProgram&) = delete;

    bool created = false;
};

class TerrainTileContentGeometry {
private:
    TerrainTileContentGeometry();
    rendering::gl::SerialCounted<rendering::gl::VertexArray> vertexArray;
public:
    static TerrainTileContentGeometry& GetInstance() {
        static TerrainTileContentGeometry instance;
        return instance;
    }

    void Create(flint::rendering::gl::CommandBuffer* commands);
    void Draw(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands);
    TerrainTileContentGeometry(const TerrainTileContentGeometry&) = delete;
    TerrainTileContentGeometry& operator=(const TerrainTileContentGeometry&) = delete;

    bool created = false;
};

class TerrainTileContent : public TileContent<TerrainTileContent> {
    friend class TileContent<TerrainTileContent>;

public:
    TerrainTileContent() = delete;
    TerrainTileContent(TerrainTile* tile);
    
    struct TerrainSample {
        float height;
        Eigen::Matrix<float, 3, 1> normal;
    };

    static TerrainSample SampleTerrain(float x, float z, uint32_t depth);
    static float GeometricError(uint32_t depth);

private:
    TerrainTile* tile;
    bool ready = false;

    rendering::gl::SerialCounted<rendering::gl::VertexArray> vertexArray;
    Eigen::Matrix<float, 4, 4> modelMatrix;

    void CreateImpl(flint::rendering::gl::CommandBuffer* commands);
    void DestroyImpl(flint::rendering::gl::CommandBuffer* commands);
    bool IsEmptyImpl() const;
    bool IsReadyImpl() const;
    void UpdateImpl(const flint::core::FrameState &frameState);
    void DrawImpl(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands);
};

}
}
