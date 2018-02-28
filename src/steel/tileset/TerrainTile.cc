#include "TerrainTile.h"
#include "TerrainTileContent.h"
#include "TerrainTileset.h"

namespace steel {
namespace tileset {

using namespace flint;

TerrainTile::TerrainTile(const Index& index, TilesetBase* tileset, TerrainTile* parent)
    : Base(tileset, parent), index(index) {
    reinterpret_cast<TerrainTileset*>(tileset)->lruCache.Append(&lruNode);
    Init();
    content = new TerrainTileContent(this);
}

std::shared_ptr<TerrainTile> TerrainTile::GetChildImpl(uint32_t index) {
    assert(index < children.size());

    if (!children[index]) {
        TerrainTile* parent = reinterpret_cast<TerrainTile*>(this);
        children[index] = TerrainTile::Create(TerrainTile::Index{
            parent->index.depth + 1,
            parent->index.i * 2 + static_cast<int>((index >> 1u) & 1u),
            parent->index.j * 2 + static_cast<int>((index >> 0u) & 1u),
        }, parent->tileset, parent);
    }
    return children[index];
}

std::shared_ptr<const TerrainTile> TerrainTile::GetChildImpl(uint32_t index) const {
    assert(index < children.size());
    return children[index];
}

flint::core::AxisAlignedBox<3, float> TerrainTile::ComputeBoundingVolumeImpl() const {
    float size = static_cast<float>(std::pow(0.5f, index.depth) * TERRAIN_ROOT_SIZE);
    Eigen::Array<float, 3, 1> base (
        size * index.i - 0.5f * TERRAIN_ROOT_SIZE,
        -TERRAIN_ROOT_SIZE * 0.5f,
        size * index.j - 0.5f * TERRAIN_ROOT_SIZE
    );

    return flint::core::AxisAlignedBox<3, float>(
        base, base + Eigen::Array<float, 3, 1>(size, TERRAIN_ROOT_SIZE, size)
    );
}

float TerrainTile::ComputeGeometricErrorImpl() const {
    //constexpr auto errorReduction = 1.0 / TERRAIN_SUBDIVISION_LEVEL;
    //constexpr auto errorReduction = 0.5;
    //return static_cast<float>(TERRAIN_ROOT_GEOMETRIC_ERROR * std::pow(errorReduction, index.depth));

    return TerrainTileContent::GeometricError(index.depth);
    // constexpr float oneOverX = 0.4;
    // constexpr float x = 1.0 / oneOverX;
    // return TERRAIN_ROOT_GEOMETRIC_ERROR * core::constPow(oneOverX, index.depth) / (x - 1.0);
}

TerrainTile::~TerrainTile() {
    for (std::shared_ptr<TerrainTile>& child : children) {
        child.reset();
    }
}

void TerrainTile::Update(const flint::core::FrameState &frameState) {
    if (lastVisitedFrameNumber == frameState.frameNumber) {
        return;
    }
    lastVisitedFrameNumber = frameState.frameNumber;

    content->Update(frameState);

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

    geometricError = ComputeGeometricError();
    float sseDenominator = static_cast<float>(2.f * std::tan(0.5f * frameState.camera.GetFieldOfView()));
    screenSpaceError = (geometricError * frameState.height) / (distanceToCamera * sseDenominator);
}

bool TerrainTile::IsVisible() const {
    return visibilityPlaneMask != core::CullingMaskOutside;
}

flint::core::AxisAlignedBox<3, float> TerrainTile::getBoundingVolume() const {
    if (ContentReady() && HasRendererableContent() && content->contentBoundingVolume.hasValue()) {
        return content->contentBoundingVolume.value();
    } else {
        assert(boundingVolume.hasValue());
        return boundingVolume.value();
    }
}

}
}
