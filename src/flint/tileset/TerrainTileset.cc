#include <vector>
#include <Eigen/Dense>
#include <flint/debug/Print.h>
#include "TerrainTileset.h"

namespace flint {
namespace tileset {

void TerrainTileset::Touch(TerrainTile* tile) {

}

const std::vector<TileBase*>& TerrainTileset::SelectTilesImpl(const flint::core::FrameState &frameState) {
    auto cameraIndex = (frameState.camera.GetPosition() / TERRAIN_ROOT_SIZE).template cast<int>();

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
                        TerrainTile* children;
                        uint32_t childrenCount;
                        bool allVisibleRenderableChildrenReady = true;
                        bool hasRenderableChildren = false;
                        tile->GetChildren(&children, &childrenCount);
                        for (uint32_t i = 0; i < childrenCount; ++i) {
                            TerrainTile* child = children + i;
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
                    tile->LoadContent();
                }
            }
        }
    }
    return selectedTiles;
}

void TerrainTileset::UpdateTilesImpl(
        const flint::core::FrameState &frameState,
        flint::rendering::gl::CommandBuffer* commands) {

    for (TileBase* tile : selectedTiles) {
        static_cast<TerrainTile*>(tile)->content->Update(frameState, commands);
    }
}

void TerrainTileset::LoadTilesImpl() {

}

void TerrainTileset::UnloadTilesImpl() {

}

}
}
