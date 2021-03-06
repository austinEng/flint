#pragma once
#include <array>
#include <list>
#include <flint/core/AxisAlignedBox.h>
#include "Tileset.h"
#include "Tile.h"

namespace steel {
namespace tileset {

constexpr float TERRAIN_ROOT_SIZE = 50000.f;
constexpr float TERRAIN_ROOT_GEOMETRIC_ERROR = 2000000.f;
constexpr uint32_t TERRAIN_SUBDIVISION_LEVEL = 5;

class TerrainTileset;
class TerrainTileContent;
class TerrainTileChildren;
class TerrainTile : public Tile<TerrainTile> {
public:
    using Base = Tile<TerrainTile>;

    struct Index {
        unsigned int depth;
        int i;
        int j;

        constexpr friend bool operator<(const Index &a, const Index &b) {
            return (
                a.depth != b.depth ? a.depth < b.depth :
                a.i != b.i ? a.i < b.i :
                a.j != b.j ? a.j < b.j : false
            );
        }
    };

    TerrainTile(const Index& index, TilesetBase* tileset, TerrainTile* parent = nullptr);
    TerrainTile() = delete;
    ~TerrainTile();

    template <typename... Args>
    static std::shared_ptr<TerrainTile> Create(Args&&... args) {
        std::shared_ptr<TerrainTile> ptr(new TerrainTile(std::forward<Args>(args)...));
        ptr->lruNode.tile = ptr;
        return ptr;
    }

    void Update(const flint::core::FrameState &frameState);

    bool IsVisible() const;

    Index index;
    float distanceToCamera;
    float screenSpaceError;
    uint64_t lastVisitedFrameNumber = -1;
    bool deleted = false;

    struct LRUNode {
        std::shared_ptr<TerrainTile> tile;
        LRUNode* prev = nullptr;
        LRUNode* next = nullptr;
    } lruNode;

    children_iterator<TerrainTile> ChildrenBegin() {
        return children_iterator<TerrainTile>(this, 0);
    }

    children_iterator<TerrainTile> ChildrenEnd() {
        return children_iterator<TerrainTile>(this, 4);
    }

    const_children_iterator<TerrainTile> ChildrenBegin() const {
        return const_children_iterator<TerrainTile>(this, 0);
    }

    const_children_iterator<TerrainTile> ChildrenEnd() const {
        return const_children_iterator<TerrainTile>(this, 4);
    }

    std::shared_ptr<TerrainTile> GetChildImpl(uint32_t index);

    std::shared_ptr<const TerrainTile> GetChildImpl(uint32_t index) const;

    flint::core::AxisAlignedBox<3, float> ComputeBoundingVolumeImpl() const;

    float ComputeGeometricErrorImpl() const;

    flint::core::AxisAlignedBox<3, float> getBoundingVolume() const;

private:
    std::array<std::shared_ptr<TerrainTile>, 4> children = {};
};

}
}
