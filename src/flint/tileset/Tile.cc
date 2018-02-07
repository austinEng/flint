#include "Tile.h"

namespace flint {
namespace tileset {

TileBase::TileBase(TilesetBase* tileset, TileBase* parent, const Eigen::Matrix<float, 4, 4> &transform)
  : tileset(tileset),
    parent(parent),
    transform(transform),
    parentTransform(parent ? parent->computedTransform : tileset->Transform()),
    computedTransform(parentTransform * transform) {
}

bool TileBase::ContentReady() const {
    return content && content->IsReady();
}

bool TileBase::HasRendererableContent() const {
    return content && !content->IsEmpty();
}


bool TileBase::LoadContent() {
    if (!HasRendererableContent()) {
        return false;
    }

    content->Create();
    return true;
}

void TileBase::UnloadContent() {
    if (!HasRendererableContent()) {
        return;
    }

    content->Destroy();
}

void TileBase::Update(const flint::core::FrameState &frameState,
                      flint::rendering::gl::CommandBuffer* commands)
{
    if (!ContentReady() || !HasRendererableContent()) {
        return;
    }
    content->Update(frameState, commands);
}

TileBase::~TileBase() {
    UnloadContent();
    delete content;
    content = nullptr;
}

}
}
