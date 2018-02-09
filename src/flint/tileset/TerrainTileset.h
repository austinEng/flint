#pragma once
#include <map>
#include "Tileset.h"
#include "TerrainTile.h"

namespace flint {
namespace tileset {

class TerrainTileset : public Tileset<TerrainTileset> {
    friend class Tileset<TerrainTileset>;
    std::map<TerrainTile::Index, TerrainTile*> rootTiles;
    float maximumScreenSpaceError = 20;
    std::vector<TileBase*> selectedTiles;

    void Touch(TerrainTile* tile);

    const std::vector<TileBase*>& SelectTilesImpl(const flint::core::FrameState &frameState);

    void UpdateTilesImpl(const flint::core::FrameState &frameState,
                         flint::rendering::gl::CommandBuffer* commands);

    void LoadTilesImpl();

    void UnloadTilesImpl();
};

}
}
