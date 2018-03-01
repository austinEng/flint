#pragma once
#include <array>
#include <vector>
#include <steel/rendering/gl/SerialCounted.h>
#include <steel/rendering/gl/Objects.h>
#include "TileContent.h"
#include "TerrainTile.h"

namespace steel {
namespace tileset {

class TerrainTile;

class TerrainTileContentShaderProgram {
private:
    TerrainTileContentShaderProgram();
    rendering::gl::SerialCounted<rendering::gl::ShaderProgram> program;
public:
    static TerrainTileContentShaderProgram& GetInstance() {
        static TerrainTileContentShaderProgram instance;
        return instance;
    }

    void Create(steel::rendering::gl::CommandBuffer* commands);
    void Use(steel::rendering::gl::CommandBuffer* commands);
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

    void Create(steel::rendering::gl::CommandBuffer* commands);
    void Draw(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands);
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
    bool useShaderOffsets;
    bool ready = false;

    rendering::gl::SerialCounted<rendering::gl::VertexArray> vertexArray;
    Eigen::Matrix<float, 4, 4> modelMatrix;

    void CreateImpl(steel::rendering::gl::CommandBuffer* commands);
    void DestroyImpl(steel::rendering::gl::CommandBuffer* commands);
    bool IsEmptyImpl() const;
    bool IsReadyImpl() const;
    void UpdateImpl(const flint::core::FrameState &frameState);
    void DrawImpl(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands);
    void DrawBoundingBoxImpl(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands);
};

}
}
