#pragma once
#include <array>
#include <vector>
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
    void Commit();
    TerrainTileContentShaderProgram(const TerrainTileContentShaderProgram&) = delete;
    void operator=(const TerrainTileContentShaderProgram&) = delete;

    bool created = false;
    bool committed = false;
};

class TerrainTileContent : public TileContent<TerrainTileContent> {
    friend class TileContent<TerrainTileContent>;

public:
    TerrainTileContent() = delete;
    TerrainTileContent(TerrainTile* tile);

private:
    TerrainTile* tile;
    bool ready = false;

    uint32_t indexCount;
    uint32_t bboxIndexCount;
    std::vector<uint32_t> indices;
    std::vector<std::array<float, 3>> positions;
    std::vector<std::array<float, 3>> normals;
    std::vector<std::array<float, 3>> colors;

    uint32_t indexBufferId;
    uint32_t positionBufferId;
    uint32_t normalBufferId;
    uint32_t colorBufferId;

    bool committed;

    void CreateImpl(flint::rendering::gl::CommandBuffer* commands);
    void DestroyImpl(flint::rendering::gl::CommandBuffer* commands);
    bool IsEmptyImpl() const;
    bool IsReadyImpl() const;
    void UpdateImpl(const flint::core::FrameState &frameState);
    void DrawImpl(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands);
    void CommitImpl();
};

}
}
