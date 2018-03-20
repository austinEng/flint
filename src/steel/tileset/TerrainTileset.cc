#include <chrono>
#include <vector>
#include <Eigen/Dense>
#include <flint/debug/Print.h>
#include <steel/shader/WireProgram.h>
#include "TerrainTileset.h"
#include "TerrainTileContent.h"

namespace steel {
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

    if (n2 == n1_prev) {
        return;
    }

    if (n2_prev) n2_prev->next = n2_next;
    if (n2_next) n2_next->prev = n2_prev;

    if (n1_prev) n1_prev->next = n2;
    n1->prev = n2;
    n2->prev = n1_prev;
    n2->next = n1;

    if (n1 == head) head = n2;
    if (n2 == tail) tail = n2_prev;
}

TerrainTileset::TerrainTileset(TerrainTilesetGenerationMode generationMode)
  : lruCache({ &lruSentinel, &lruSentinel }), generationMode(generationMode) {

}

void TerrainTileset::Touch(std::shared_ptr<TerrainTile> tile) {
    tile->lruNode.tile = tile;
    lruCache.Splice(&lruSentinel, &tile->lruNode);
}

void TerrainTileset::SelectTilesImpl(const flint::core::FrameState &frameState) {
    auto cameraIndex = (frameState.camera.GetPosition() / TERRAIN_ROOT_SIZE).template cast<int>();

    lruCache.Splice(lruCache.head, &lruSentinel);

    std::vector<std::weak_ptr<TerrainTile>> stack;
    stack.reserve(0);

    for (int i = -1; i <= 1; ++i) {
        for (int j = -1; j <= 1; ++j) {
            TerrainTile::Index index {
                0,
                cameraIndex[0] + i,
                cameraIndex[2] + j,
            };

            std::shared_ptr<TerrainTile> rootTile;
            auto it = rootTiles.find(index);
            if (it == rootTiles.end()) {
                rootTile = TerrainTile::Create(index, this);
                rootTiles.emplace(index, rootTile);
            } else {
                rootTile = it->second;
            }
            stack.push_back(rootTile);
        }
    }

    selectedTiles.clear();
    while (stack.size() > 0) {
        std::shared_ptr<TerrainTile> tile = stack.back().lock();
        stack.pop_back();

        Touch(tile);
        tile->Update(frameState);
        if (tile->IsVisible()) {
            if (tile->HasRendererableContent()) {
                if (tile->ContentReady()) {
                    if (tile->screenSpaceError > maximumScreenSpaceError) {
                        bool allVisibleRenderableChildrenReady = true;
                        bool hasRenderableChildren = false;

                        for (std::shared_ptr<TerrainTile> child : tile->IterChildren()) {
                            Touch(child);
                            child->Update(frameState);
                            if (child->HasRendererableContent()) {
                                hasRenderableChildren = true;
                                if (child->IsVisible() && !child->ContentReady()) {
                                    loadQueue.push_back(child);
                                    allVisibleRenderableChildrenReady = false;
                                }
                            }
                        }

                        if (!allVisibleRenderableChildrenReady || !hasRenderableChildren) {
                            selectedTiles.push_back(tile);
                        } else {
                            for (std::shared_ptr<TerrainTile> child : tile->IterChildren()) {
                                stack.push_back(child);
                            }
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

void TerrainTileset::UpdateTilesImpl(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands) {
    for (std::shared_ptr<TileBase> tile : selectedTiles) {
        tile->Update(frameState);
    }
}

void TerrainTileset::DrawTilesImpl(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands) {
    TerrainTileContentShaderProgram::GetInstance().Use(commands);

    using namespace steel::rendering::gl;
    commands->Record<CommandType::Uniform1ui>(Uniform1uiCmd{ "shaderOffsets", generationMode == TerrainTilesetGenerationMode::GPU });

    // Sort tiles for early Z
    std::sort(selectedTiles.begin(), selectedTiles.end(), [](std::shared_ptr<const TileBase> a, std::shared_ptr<const TileBase> b) {
        return std::static_pointer_cast<const TerrainTile, const TileBase>(a)->distanceToCamera < std::static_pointer_cast<const TerrainTile, const TileBase>(b)->distanceToCamera;
    });

    for (std::shared_ptr<TileBase> tile : selectedTiles) {
        tile->Draw(frameState, commands);
    }

    if (showBoundingBoxes) {
        steel::shader::WireProgram::GetInstance().Use(commands);
        for (std::shared_ptr<TileBase> tile : selectedTiles) {
            tile->DrawBoundingBox(frameState, commands);
        }
    }
}

void TerrainTileset::LoadTilesImpl(steel::rendering::gl::CommandBuffer* commands) {
    std::sort(loadQueue.begin(), loadQueue.end(), [](std::shared_ptr<const TileBase> a, std::shared_ptr<const TileBase> b) {
        return std::static_pointer_cast<const TerrainTile, const TileBase>(a)->screenSpaceError > std::static_pointer_cast<const TerrainTile, const TileBase>(b)->screenSpaceError;
    });

    using namespace std::chrono;
    auto start = high_resolution_clock::now();
    for (std::shared_ptr<TileBase> tile : loadQueue) {
        tile->LoadContent(commands);
        Touch(std::static_pointer_cast<TerrainTile, TileBase>(tile));
        if (duration_cast<milliseconds>(high_resolution_clock::now() - start).count() > 10) {
            break;
        }
    }
    loadQueue.clear();
}

void TerrainTileset::UnloadTilesImpl(steel::rendering::gl::CommandBuffer* commands) {
    auto* node = lruSentinel.next;
    while (node) {
        auto* current = node;
        auto ptr = current->tile;
        node = current->next;
        current->tile.reset();

        if (ptr) {
            ptr->UnloadContent(commands);
            auto it = rootTiles.find(ptr->index);
            if (it != rootTiles.end()) {
                rootTiles.erase(it);
            }
        }
    }

    lruSentinel.next = nullptr;
    lruCache.tail = &lruSentinel;
}

TerrainTileContent::TerrainSample TerrainTileset::SampleTerrain(float x, float z, uint32_t depth) const {
    return TerrainTileContent::SampleTerrain(x, z, depth);
}

void TerrainTileset::UpdateShowBoundingBoxes(bool showBoundingBoxes) {
    this->showBoundingBoxes = showBoundingBoxes;
}

}
}
