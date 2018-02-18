#include <vector>
#include <Eigen/Dense>
#include <flint/debug/Print.h>
#include "TerrainTileset.h"
#include "TerrainTileContent.h"

namespace flint {
namespace tileset {

void TerrainTileset::LRUCache::Append(TerrainTile::LRUNode* node) {
    tail->next = node;
    node->prev = tail;
    tail = node;
}

void TerrainTileset::LRUCache::Splice(TerrainTile::LRUNode* n1, TerrainTile::LRUNode* n2) {
    if (n1 == n2) {
        return;
    }

    auto* n1_prev = n1->prev;
    auto* n2_prev = n2->prev;
    auto* n2_next = n2->next;

    if (n2_prev) n2_prev->next = n2_next;
    if (n2_next) n2_next->prev = n2_prev;

    if (n1_prev) n1_prev->next = n2;
    n1->prev = n2;
    n2->prev = n1_prev;
    n2->next = n1;

    if (n1 == head) head = n2;
    if (n2 == tail) tail = n2_prev;
}

TerrainTileset::TerrainTileset() 
  : lruSentinel({ nullptr, nullptr, nullptr }),
    lruCache({ &lruSentinel, &lruSentinel }) {

}

void TerrainTileset::Touch(TerrainTile* tile) {
    lruCache.Splice(&lruSentinel, &tile->lruNode);
}

void TerrainTileset::SelectTilesImpl(const flint::core::FrameState &frameState) {
    auto cameraIndex = (frameState.camera.GetPosition() / TERRAIN_ROOT_SIZE).template cast<int>();

    lruCache.Splice(lruCache.head, &lruSentinel);

    std::vector<TerrainTile*> stack;
    stack.reserve(27);

    for (int i = -1; i <= 1; ++i) {
        for (int j = -1; j <= 1; ++j) {
            for (int k = -1; k <= 1; ++k) {

                TerrainTile::Index index {
                    0,
                    cameraIndex[0] + i,
                    cameraIndex[1] + j,
                    cameraIndex[2] + k,
                };

                TerrainTile* rootTile;
                auto it = rootTiles.find(index);
                if (it == rootTiles.end()) {
                    rootTile = new TerrainTile(index, this);
                    rootTiles.emplace(index, rootTile);
                } else {
                    rootTile = it->second;
                }
                stack.push_back(rootTile);
            }
        }
    }

    selectedTiles.resize(0);
    while (stack.size() > 0) {
        TerrainTile* tile = stack.back();
        stack.pop_back();

        Touch(tile);
        tile->Update(frameState);
        if (tile->IsVisible()) {
            if (tile->HasRendererableContent()) {
                if (tile->ContentReady()) {
                    if (tile->screenSpaceError > maximumScreenSpaceError) {
                        bool allVisibleRenderableChildrenReady = true;
                        bool hasRenderableChildren = false;
                        
                        for (TerrainTile* child : tile->IterChildren()) {
                            child->Update(frameState);
                            stack.push_back(child);
                            if (child->HasRendererableContent()) {
                                hasRenderableChildren = true;
                                if (child->IsVisible() && !child->ContentReady()) {
                                    allVisibleRenderableChildrenReady = false;
                                }
                            }
                        }

                        if (!allVisibleRenderableChildrenReady || !hasRenderableChildren) {
                            selectedTiles.push_back(tile);
                        }
                    } else {
                        selectedTiles.push_back(tile);
                    }
                } else {
                    loadQueue.push_back(tile);
                }
            }
        }
    }
}

void TerrainTileset::UpdateTilesImpl(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands) {
    for (TileBase* tile : selectedTiles) {
        tile->Update(frameState);
    }
}

void TerrainTileset::DrawTilesImpl(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands) {
    TerrainTileContentShaderProgram::GetInstance().Use(commands);

    commands->Record<flint::rendering::gl::CommandType::UniformMatrix4fv>(
        flint::rendering::gl::UniformMatrix4fvCmd{ "viewProj", 1, false });
    commands->RecordData<float>(frameState.camera.GetViewProjection().data(), 16);

    for (TileBase* tile : selectedTiles) {
        tile->Draw(frameState, commands);
    }
}

void TerrainTileset::LoadTilesImpl(flint::rendering::gl::CommandBuffer* commands) {
    std::sort(loadQueue.begin(), loadQueue.end(), [](const TileBase* a, const TileBase* b) {
        return reinterpret_cast<const TerrainTile*>(a)->screenSpaceError - reinterpret_cast<const TerrainTile*>(b)->screenSpaceError;
    });

    for (TileBase* tile : loadQueue) {
        tile->LoadContent(commands);
    }
}

void TerrainTileset::UnloadTilesImpl(flint::rendering::gl::CommandBuffer* commands) {
    auto* node = lruSentinel.next;
    while (node) {
        auto it = rootTiles.find(node->tile->index);
        if (it != rootTiles.end()) {
            rootTiles.erase(it);
            // delete it->tile;
        }

        unloadQueue.push_back(node->tile);

        node = node->next;
    }

    lruSentinel.next = nullptr;
    lruCache.tail = &lruSentinel;

    for (TileBase* tile : unloadQueue) {
        tile->UnloadContent(commands);
    }
}

}
}
