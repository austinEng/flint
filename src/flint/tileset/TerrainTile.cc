#include "TerrainTile.h"
#include "TerrainTileContent.h"

namespace flint {
namespace tileset {

TerrainTile::TerrainTile(const Index& index, TilesetBase* tileset, TerrainTile* parent)
  : Base(tileset, parent), index(index) {
    boundingVolume = ComputeBoundingVolume();
    geometricError = ComputeGeometricError();
    content = new TerrainTileContent(this);
}

void TerrainTile::GetChildren(TerrainTile** firstChild, unsigned int* childCount) {
    if (!children) {
        CreateChildren();
    }

    *firstChild = reinterpret_cast<TerrainTile*>(children);
    *childCount = 8;
}

void TerrainTile::GetChildren(const TerrainTile** firstChild, unsigned int* childCount) const {
    if (children) {
        *firstChild = reinterpret_cast<TerrainTile*>(children);
        *childCount = 8;
    } else {
        *firstChild = nullptr;
        *childCount = 0;
    }

}

flint::core::AxisAlignedBox<3, float> TerrainTile::ComputeBoundingVolumeImpl() const {
    float size = static_cast<float>(std::pow(0.5f, index.depth) * TERRAIN_ROOT_SIZE);
    Eigen::Array<float, 3, 1> base(
        size * index.i,
        size * index.j,
        size * index.k
    );

    return flint::core::AxisAlignedBox<3, float>(
        base, base + Eigen::Array<float, 3, 1>(size, size, size)
    );
}

float TerrainTile::ComputeGeometricErrorImpl() const {
    return static_cast<float>(100.f * std::pow(0.5f, index.depth));
}

void TerrainTile::CreateChildren() {
    children = new TerrainTileChildren(this);
}

void TerrainTile::DeleteChildren() {
    delete children;
    children = nullptr;
}

TerrainTile::~TerrainTile() {
    DeleteChildren();
    delete content;
}

void TerrainTile::Update(const flint::core::FrameState &frameState) {
    visibilityPlaneMask = frameState.camera.GetCullingVolume().ComputeVisibility(boundingVolume);

    auto diag = boundingVolume.max() - boundingVolume.min();
    auto h = (diag * 0.5f).eval();
    auto center = ((boundingVolume.max() + boundingVolume.min()) * 0.5f).eval();
    auto offset = (frameState.camera.GetPosition() - center.matrix()).eval();
    Eigen::Matrix<float, 3, 1> d(
        offset[0] < -h[0] ? offset[0] + h[0] : offset[0] > h[0] ? offset[0] - h[0] : 0,
        offset[1] < -h[1] ? offset[1] + h[1] : offset[1] > h[1] ? offset[1] - h[1] : 0,
        offset[2] < -h[2] ? offset[2] + h[0] : offset[2] > h[2] ? offset[2] - h[2] : 0
    );
    distanceToCamera = std::max(10.f, d.dot(d));

    float sseDenominator = static_cast<float>(2.f * std::tan(0.5f * frameState.camera.GetFieldOfView()));
    screenSpaceError = (geometricError * frameState.height) / (distanceToCamera * sseDenominator);
}

bool TerrainTile::IsVisible() const {
    return visibilityPlaneMask != core::CullingMaskOutside;
}

TerrainTileChildren::TerrainTileChildren(TerrainTile* parent) : tiles {{
    TerrainTile(TerrainTile::Index {
        parent->index.depth + 1,
        parent->index.i * 2 + 0, parent->index.j * 2 + 0, parent->index.k * 2 + 0
    }, parent->tileset, parent),
    TerrainTile(TerrainTile::Index {
        parent->index.depth + 1,
        parent->index.i * 2 + 0, parent->index.j * 2 + 0, parent->index.k * 2 + 1
    }, parent->tileset, parent),
    TerrainTile(TerrainTile::Index {
        parent->index.depth + 1,
        parent->index.i * 2 + 0, parent->index.j * 2 + 1, parent->index.k * 2 + 0
    }, parent->tileset, parent),
    TerrainTile(TerrainTile::Index {
        parent->index.depth + 1,
        parent->index.i * 2 + 0, parent->index.j * 2 + 1, parent->index.k * 2 + 1
    }, parent->tileset, parent),
    TerrainTile(TerrainTile::Index {
        parent->index.depth + 1,
        parent->index.i * 2 + 1, parent->index.j * 2 + 0, parent->index.k * 2 + 0
    }, parent->tileset, parent),
    TerrainTile(TerrainTile::Index {
        parent->index.depth + 1,
        parent->index.i * 2 + 1, parent->index.j * 2 + 0, parent->index.k * 2 + 1
    }, parent->tileset, parent),
    TerrainTile(TerrainTile::Index {
        parent->index.depth + 1,
        parent->index.i * 2 + 1, parent->index.j * 2 + 1, parent->index.k * 2 + 0
    }, parent->tileset, parent),
    TerrainTile(TerrainTile::Index {
        parent->index.depth + 1,
        parent->index.i * 2 + 1, parent->index.j * 2 + 1, parent->index.k * 2 + 1
    }, parent->tileset, parent),
}} {

}

}
}
