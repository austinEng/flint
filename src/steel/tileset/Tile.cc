#include "Tile.h"

namespace steel {
namespace tileset {

TileBase::TileBase(TilesetBase* tileset, TileBase* parent, const Eigen::Matrix<float, 4, 4> &transform)
  : tileset(tileset),
    parent(parent),
    transform(transform),
    parentTransform(parent ? parent->computedTransform : tileset->Transform()),
    computedTransform(parentTransform * transform),
    visibilityPlaneMask(flint::core::CullingMaskIndeterminate) {
}

bool TileBase::ContentReady() const {
    return content && content->IsReady();
}

bool TileBase::HasRendererableContent() const {
    return content && !content->IsEmpty();
}


bool TileBase::LoadContent(steel::rendering::gl::CommandBuffer* commands) {
    if (!HasRendererableContent()) {
        return false;
    }

    content->Create(commands);
    return true;
}

void TileBase::UnloadContent(steel::rendering::gl::CommandBuffer* commands) {
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

void TileBase::Draw(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands) {
    if (!ContentReady() || !HasRendererableContent()) {
        return;
    }
    content->Draw(frameState, commands);
}

void TileBase::DrawBoundingBox(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands) {
    if (content) {
        content->DrawBoundingBox(frameState, commands);
    }
}


TileBase::~TileBase() {
    delete content;
    content = nullptr;
}

}
}
