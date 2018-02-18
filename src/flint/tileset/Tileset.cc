#include "Tileset.h"

namespace flint {
namespace tileset {

const Eigen::Matrix<float, 4, 4>& TilesetBase::Transform() const {
    return transform;
}

void TilesetBase::Update(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands) {
    SelectTiles(frameState);
    UpdateTiles(frameState, commands);
    LoadTiles(commands);
    UnloadTiles(commands);
}

void TilesetBase::Draw(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands) {
    DrawTiles(frameState, commands);
}

void TilesetBase::Commit() {
    for (TileBase* tile : selectedTiles) {
        tile->content->Commit();
    }
    loadQueue.resize(0);
    unloadQueue.resize(0);
}

}
}
