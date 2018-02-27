#pragma once
#include <memory>
#include <vector>
#include <Eigen/Dense>
#include <flint/core/FrameState.h>
#include <flint/core/AxisAlignedBox.h>
#include <steel/rendering/gl/CommandBuffer.h>
#include "Tileset.h"
#include "TileContent.h"

namespace steel {
namespace tileset {

class TilesetBase;
class TileContentBase;
class TileBase {

public:
    TilesetBase* tileset = nullptr;
    TileBase* parent = nullptr;
    TileContentBase* content = nullptr;

    Eigen::Matrix<float, 4, 4> transform;
    Eigen::Matrix<float, 4, 4> parentTransform;
    Eigen::Matrix<float, 4, 4> computedTransform;

    flint::core::Optional<flint::core::AxisAlignedBox<3, float>> boundingVolume;
    float geometricError;
    flint::core::PlaneMask visibilityPlaneMask;

    TileBase(TilesetBase* tileset, TileBase* parent, const Eigen::Matrix<float, 4, 4> &transform);

    template <typename T>
    class children_iterator {
    public:
        children_iterator(T* tile, uint32_t index) : tile(tile), index(index) { }
        children_iterator operator++() {
            children_iterator i = *this;
            index++;
            return i;
        }
        std::shared_ptr<T> operator*() {
            return std::static_pointer_cast<T, TileBase>(tile->GetChild(index));
        }
        std::shared_ptr<T> operator->() {
            return std::static_pointer_cast<T, TileBase>(tile->GetChild(index));
        }
        bool operator==(const children_iterator& rhs) {
            return tile == rhs.tile && index == rhs.index;
        }
        bool operator!=(const children_iterator& rhs) {
            return tile != rhs.tile || index != rhs.index;
        }
    private:
        T* tile;
        uint32_t index = 0;
    };

    template <typename T>
    class const_children_iterator {
    public:
        const_children_iterator(const T* tile, uint32_t index) : tile(tile), index(index) { }
        const_children_iterator operator++() {
            const_children_iterator i = *this;
            index++;
            return i;
        }
        std::shared_ptr<const T> operator*() {
            return std::static_pointer_cast<const T, const TileBase>(tile->GetChild(index));
        }
        std::shared_ptr<const T> operator->() {
            return std::static_pointer_cast<const T, const TileBase>(tile->GetChild(index));
        }
        bool operator==(const const_children_iterator& rhs) {
            return tile == rhs.tile && index == rhs.index;
        }
        bool operator!=(const const_children_iterator& rhs) {
            return tile != rhs.tile || index != rhs.index;
        }
    private:
        const T* tile;
        uint32_t index = 0;
    };

    virtual std::shared_ptr<TileBase> GetChild(uint32_t index) = 0;
    virtual std::shared_ptr<const TileBase> GetChild(uint32_t index) const = 0;

    bool ContentReady() const;
    bool HasRendererableContent() const;

    bool LoadContent(steel::rendering::gl::CommandBuffer* commands);

    void UnloadContent(steel::rendering::gl::CommandBuffer* commands);

    void Update(const flint::core::FrameState &frameState);

    void Draw(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands);

    virtual ~TileBase();
};

template <typename Derived>
class Tile : public TileBase {
public:
    class TileChildren {
    public:
        TileChildren(Derived* tile) : tile(tile) {

        }

        children_iterator<Derived> begin() {
            return tile->ChildrenBegin();
        }

        children_iterator<Derived> end() {
            return tile->ChildrenEnd();
        }

    private:
        Derived* tile;
    };

    class ConstTileChildren {
    public:
        ConstTileChildren(const Derived* tile) : tile(tile) {

        }
        const_children_iterator<Derived> begin() const {
            return tile->ChildrenBegin();
        }

        const_children_iterator<Derived> end() const {
            return tile->ChildrenEnd();
        }
    private:
        const Derived* tile;
    };


    void Init() {
        boundingVolume.set(ComputeBoundingVolume());
        geometricError = ComputeGeometricError();
    }

    TileChildren IterChildren() {
        return TileChildren(static_cast<Derived*>(this));
    }

    ConstTileChildren IterChildren() const {
        return ConstTileChildren(static_cast<const Derived*>(this));
    }

    flint::core::AxisAlignedBox<3, float> ComputeBoundingVolume() const {
        return static_cast<const Derived*>(this)->ComputeBoundingVolumeImpl();
    }

    float ComputeGeometricError() const {
        return static_cast<const Derived*>(this)->ComputeGeometricErrorImpl();
    }

    Tile(TilesetBase* tileset, Tile<Derived>* parent = nullptr)
      : Tile(tileset, parent, Eigen::Matrix<float, 4, 4>::Identity())
    {
    }

    Tile(TilesetBase* tileset, Tile<Derived>* parent, const Eigen::Matrix<float, 4, 4> &transform)
      : TileBase(tileset, parent, transform) {
    }

    virtual std::shared_ptr<TileBase> GetChild(uint32_t index) override {
        return static_cast<Derived*>(this)->GetChildImpl(index);
    }

    virtual std::shared_ptr<const TileBase> GetChild(uint32_t index) const override {
        return static_cast<const Derived*>(this)->GetChildImpl(index);
    }

    virtual ~Tile() {
    }
};

}
}
