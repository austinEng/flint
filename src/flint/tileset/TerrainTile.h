#pragma once
#include <array>
#include <flint/core/AxisAlignedBox.h>
#include "Tileset.h"
#include "Tile.h"

namespace flint {
namespace tileset {

constexpr float TERRAIN_ROOT_SIZE = 10000.f;

class TerrainTileContent;
class TerrainTileset;
class TerrainTileChildren;
class TerrainTile : public Tile<TerrainTile> {
public:
    using Base = Tile<TerrainTile>;

    struct Index {
        unsigned int depth;
        int i;
        int j;
        int k;

        constexpr friend bool operator<(const Index &a, const Index &b) {
            return (
                a.depth != b.depth ? a.depth < b.depth :
                a.i != b.i ? a.i < b.i :
                a.j != b.j ? a.j < b.j :
                a.k != b.k ? a.k < b.k : false
            );
        }
    };

    TerrainTile() = delete;
    TerrainTile(const Index& index, TilesetBase* tileset, TerrainTile* parent = nullptr);
    ~TerrainTile();

    void Update(const flint::core::FrameState &frameState);

    bool IsVisible() const;

private:
    friend class Tile<TerrainTile>;
    friend class TerrainTileset;
    friend class TerrainTileChildren;
    friend class TerrainTileContent;

    Index index;
    TerrainTileChildren* children = nullptr;
    core::PlaneMask visibilityPlaneMask;
    float distanceToCamera;
    float screenSpaceError;

    void CreateChildren();
    void DeleteChildren();

    void GetChildren(TerrainTile** firstChild, unsigned int* childCount);

    void GetChildren(const TerrainTile** firstChild, unsigned int* childCount) const;

    flint::core::AxisAlignedBox<3, float> ComputeBoundingVolumeImpl() const;

    float ComputeGeometricErrorImpl() const;
};

class TerrainTileChildren {
    std::array<TerrainTile, 8> tiles;

public:
    TerrainTileChildren() = delete;
    TerrainTileChildren(TerrainTile* parent);
};

}
}
