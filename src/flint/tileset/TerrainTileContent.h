#pragma once
#include <array>
#include <vector>
#include "TileContent.h"
#include "TerrainTile.h"

namespace flint {
namespace tileset {

class TerrainTileContent : public TileContent<TerrainTileContent> {
    friend class TileContent<TerrainTileContent>;

public:
    TerrainTileContent() = delete;
    TerrainTileContent(TerrainTile* tile);

private:
    TerrainTile* tile;

    std::vector<uint32_t> indices;
    std::vector<std::array<float, 3>> positions;
    std::vector<std::array<float, 3>> normals;
    bool ready = false;

    bool committed = false;
    uint32_t indexBufferId;
    uint32_t positionBufferId;
    uint32_t normalBufferId;

    void CreateImpl();
    void DestroyImpl();
    bool IsEmptyImpl() const;
    bool IsReadyImpl() const;
    void UpdateImpl(const flint::core::FrameState &frameState,
        flint::rendering::gl::CommandBuffer* commands);
    void CommitImpl();
    ~TerrainTileContent();
};

}
}
