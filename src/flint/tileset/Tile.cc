#include "Tile.h"

namespace flint {
namespace tileset {

TileBase::TileBase(TilesetBase* tileset, TileBase* parent, const Eigen::Matrix<float, 4, 4> &transform)
  : tileset(tileset),
    parent(parent),
    transform(transform),
    parentTransform(parent ? parent->computedTransform : tileset->Transform()),
    computedTransform(parentTransform * transform),
    visibilityPlaneMask(core::CullingMaskIndeterminate) {
}

bool TileBase::ContentReady() const {
    return content && content->IsReady();
}

bool TileBase::HasRendererableContent() const {
    return content && !content->IsEmpty();
}


bool TileBase::LoadContent(flint::rendering::gl::CommandBuffer* commands) {
    if (!HasRendererableContent()) {
        return false;
    }

    content->Create(commands);
    return true;
}

void TileBase::UnloadContent(flint::rendering::gl::CommandBuffer* commands) {
    if (!HasRendererableContent()) {
        return;
    }

    content->Destroy(commands);
}

void TileBase::Update(const flint::core::FrameState &frameState) {
    if (!ContentReady() || !HasRendererableContent()) {
        return;
    }
    content->Update(frameState);
}

void TileBase::Draw(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands) {
    if (!ContentReady() || !HasRendererableContent()) {
        return;
    }
    content->Draw(frameState, commands);
}

TileBase::~TileBase() {
    delete content;
    content = nullptr;
}

}
}
