#pragma once
#include <list>
#include <map>
#include "Tileset.h"
#include "TerrainTile.h"
#include "TerrainTileContent.h"

namespace steel {
namespace tileset {

class TerrainTile;
class TerrainTileContent;

enum class TerrainTilesetGenerationMode : unsigned short {
    CPU,
    GPU,
};

class TerrainTileset : public Tileset<TerrainTileset> {
public:
    std::map<TerrainTile::Index, std::shared_ptr<TerrainTile>> rootTiles;
    float maximumScreenSpaceError = 15;

    TerrainTile::LRUNode lruSentinel;
    struct LRUCache {
        TerrainTile::LRUNode* head;
        TerrainTile::LRUNode* tail;

        void Append(TerrainTile::LRUNode* node);
        void Splice(TerrainTile::LRUNode* node1, TerrainTile::LRUNode* node2);
    };

    LRUCache lruCache;
    TerrainTilesetGenerationMode generationMode;
    bool freeze = false;
    bool showBoundingBoxes = false;
    bool showTerrain = true;
    bool drawWireframe = false;

    TerrainTileset() = delete;
    TerrainTileset(TerrainTilesetGenerationMode generationMode);

    void Touch(std::shared_ptr<TerrainTile> tile);

    void SelectTilesImpl(const flint::core::FrameState &frameState);

    void UpdateTilesImpl(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands);

    void DrawTilesImpl(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands);

    void LoadTilesImpl(steel::rendering::gl::CommandBuffer* commands);

    void UnloadTilesImpl(steel::rendering::gl::CommandBuffer* commands);

    TerrainTileContent::TerrainSample SampleTerrain(float x, float z, uint32_t depth) const;
};

}
}
