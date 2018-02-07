#include "Tileset.h"

namespace flint {
namespace tileset {

const Eigen::Matrix<float, 4, 4>& TilesetBase::Transform() const {
    return transform;
}

void TilesetBase::Update(const flint::core::FrameState &frameState,
                         flint::rendering::gl::CommandBuffer* commands)
{
    selectedTiles = &SelectTiles(frameState);
    LoadTiles();
    UpdateTiles(frameState, commands);
    UnloadTiles();
}

void TilesetBase::Commit() {
    if (selectedTiles) {
        for (TileBase* tile : *selectedTiles) {
            tile->content->Commit();
        }
    }
}

}
}
