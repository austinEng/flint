#pragma once
#include <list>
#include <map>
#include "Tileset.h"
#include "TerrainTile.h"

namespace flint {
namespace tileset {

class TerrainTileset : public Tileset<TerrainTileset> {
public:
    std::map<TerrainTile::Index, std::shared_ptr<TerrainTile>> rootTiles;
    float maximumScreenSpaceError = 20;

    TerrainTile::LRUNode lruSentinel;
    struct LRUCache {
        TerrainTile::LRUNode* head;
        TerrainTile::LRUNode* tail;

        void Append(TerrainTile::LRUNode* node);
        void Splice(TerrainTile::LRUNode* node1, TerrainTile::LRUNode* node2);
    };

    LRUCache lruCache;

    TerrainTileset();

    void Touch(std::shared_ptr<TerrainTile> tile);

    void SelectTilesImpl(const flint::core::FrameState &frameState);

    void UpdateTilesImpl(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands);

    void DrawTilesImpl(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands);

    void LoadTilesImpl(flint::rendering::gl::CommandBuffer* commands);

    void UnloadTilesImpl(flint::rendering::gl::CommandBuffer* commands);
};

}
}
