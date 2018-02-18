#include "TerrainTile.h"
#include "TerrainTileContent.h"
#include "TerrainTileset.h"

namespace flint {
namespace tileset {

TerrainTile::TerrainTile(const Index& index, TilesetBase* tileset, TerrainTile* parent)
    : Base(tileset, parent), index(index), lruNode({ this, nullptr, nullptr }) {
    reinterpret_cast<TerrainTileset*>(this->tileset)->lruCache.Append(&lruNode);
    Init();
    content = new TerrainTileContent(this);
}

TerrainTile* TerrainTile::GetChildImpl(uint32_t index) {
    assert(index < children.size());
    if (!children[index]) {
        TerrainTile* parent = reinterpret_cast<TerrainTile*>(this);
        children[index] = new TerrainTile(TerrainTile::Index{
            parent->index.depth + 1,
            parent->index.i * 2 + static_cast<int>((index >> 2u) & 1u),
            parent->index.j * 2 + static_cast<int>((index >> 1u) & 1u),
            parent->index.k * 2 + static_cast<int>((index >> 0u) & 1u)
        }, parent->tileset, parent);
    }
    return children[index];
}

const TerrainTile* TerrainTile::GetChildImpl(uint32_t index) const {
    assert(index < children.size());
    return children[index];
}

flint::core::AxisAlignedBox<3, float> TerrainTile::ComputeBoundingVolumeImpl() const {
    float size = static_cast<float>(std::pow(0.5f, index.depth) * TERRAIN_ROOT_SIZE);
    Eigen::Array<float, 3, 1> base (
        size * index.i - 0.5f * TERRAIN_ROOT_SIZE,
        size * index.j - 0.5f * TERRAIN_ROOT_SIZE,
        size * index.k - 0.5f * TERRAIN_ROOT_SIZE
    );

    return flint::core::AxisAlignedBox<3, float>(
        base, base + Eigen::Array<float, 3, 1>(size, size, size)
    );
}

float TerrainTile::ComputeGeometricErrorImpl() const {
    // constexpr auto errorReduction = 1.0 / TERRAIN_SUBDIVISION_LEVEL;
    // return static_cast<float>(TERRAIN_ROOT_GEOMETRIC_ERROR * std::pow(errorReduction, index.depth));

    constexpr float oneOverX = 0.55;
    constexpr float x = 1.0 / oneOverX;
    return TERRAIN_ROOT_GEOMETRIC_ERROR * core::constPow(oneOverX, index.depth) / (x - 1.0);
}

TerrainTile::~TerrainTile() {
    for (TerrainTile* child : children) {
        delete child;
    }
}

void TerrainTile::Update(const flint::core::FrameState &frameState) {
    if (lastVisitedFrameNumber == frameState.frameNumber) {
        return;
    }
    lastVisitedFrameNumber = frameState.frameNumber;

    auto bv = getBoundingVolume();
    visibilityPlaneMask = parent ?
        frameState.camera.GetCullingVolume().ComputeVisibility(bv, parent->visibilityPlaneMask) :
        frameState.camera.GetCullingVolume().ComputeVisibility(bv);

    auto diag = bv.max() - bv.min();
    auto h = (diag * 0.5f).eval();
    auto center = ((bv.max() + bv.min()) * 0.5f).eval();
    auto offset = (frameState.camera.GetPosition() - center.matrix()).eval();
    Eigen::Matrix<float, 3, 1> d(
        offset[0] < -h[0] ? offset[0] + h[0] : offset[0] > h[0] ? offset[0] - h[0] : 0,
        offset[1] < -h[1] ? offset[1] + h[1] : offset[1] > h[1] ? offset[1] - h[1] : 0,
        offset[2] < -h[2] ? offset[2] + h[0] : offset[2] > h[2] ? offset[2] - h[2] : 0
    );
    distanceToCamera = std::max(1e-7f, d.dot(d));

    float sseDenominator = static_cast<float>(2.f * std::tan(0.5f * frameState.camera.GetFieldOfView()));
    screenSpaceError = (geometricError * frameState.height) / (distanceToCamera * sseDenominator);
}

bool TerrainTile::IsVisible() const {
    return visibilityPlaneMask != core::CullingMaskOutside;
}

core::AxisAlignedBox<3, float> TerrainTile::getBoundingVolume() const {
    if (ContentReady() && HasRendererableContent() && content->contentBoundingVolume.hasValue()) {
        return content->contentBoundingVolume.value();
    } else {
        assert(boundingVolume.hasValue());
        return boundingVolume.value();
    }
}

}
}
