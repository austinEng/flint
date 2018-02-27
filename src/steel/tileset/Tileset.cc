#include "Tileset.h"

namespace steel {
namespace tileset {

const Eigen::Matrix<float, 4, 4>& TilesetBase::Transform() const {
    return transform;
}

void TilesetBase::Update(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands) {
    SelectTiles(frameState);
    UpdateTiles(frameState, commands);
    LoadTiles(commands);
    UnloadTiles(commands);
}

void TilesetBase::Draw(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands) {
    DrawTiles(frameState, commands);
}

}
}
