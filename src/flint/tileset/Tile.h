#pragma once
#include <vector>
#include <Eigen/Dense>
#include <flint/core/FrameState.h>
#include <flint/core/AxisAlignedBox.h>
#include <flint/rendering/gl/CommandBuffer.h>
#include "Tileset.h"
#include "TileContent.h"

namespace flint {
namespace tileset {

class TilesetBase;
class TileContentBase;
class TileBase {
    friend class TilesetBase;
protected:
    TilesetBase* tileset = nullptr;
    TileBase* parent = nullptr;
    TileContentBase* content = nullptr;
    bool selected = false;

    Eigen::Matrix<float, 4, 4> transform;
    Eigen::Matrix<float, 4, 4> parentTransform;
    Eigen::Matrix<float, 4, 4> computedTransform;

public:
    TileBase(TilesetBase* tileset, TileBase* parent, const Eigen::Matrix<float, 4, 4> &transform);

    virtual const flint::core::AxisAlignedBox<3, float>& BoundingVolume() const = 0;
    virtual float GeometricError() const = 0;
    virtual void Children(TileBase** firstChild, unsigned int* childCount) = 0;
    virtual void Children(const TileBase** firstChild, unsigned int* childCount) const = 0;

    bool ContentReady() const;
    bool HasRendererableContent() const;

    bool LoadContent();

    void UnloadContent();

    void Update(const flint::core::FrameState &frameState,
                flint::rendering::gl::CommandBuffer* commands);

    virtual ~TileBase();
};

template <typename Derived>
class Tile : public TileBase {
protected:
    bool selected = false;

    Eigen::Matrix<float, 4, 4> transform;
    Eigen::Matrix<float, 4, 4> parentTransform;
    Eigen::Matrix<float, 4, 4> computedTransform;

    flint::core::AxisAlignedBox<3, float> boundingVolume;
    float geometricError;

    flint::core::AxisAlignedBox<3, float> ComputeBoundingVolume() const {
        return static_cast<const Derived*>(this)->ComputeBoundingVolumeImpl();
    }

    float ComputeGeometricError() const {
        return static_cast<const Derived*>(this)->ComputeGeometricErrorImpl();
    }

public:
    Tile(TilesetBase* tileset, Tile<Derived>* parent = nullptr)
      : Tile(tileset, parent, Eigen::Matrix<float, 4, 4>::Identity())
    {
    }

    Tile(TilesetBase* tileset, Tile<Derived>* parent, const Eigen::Matrix<float, 4, 4> &transform)
      : TileBase(tileset, parent, transform),
        boundingVolume(ComputeBoundingVolume()),
        geometricError(ComputeGeometricError())
    {
    }

    virtual const flint::core::AxisAlignedBox<3, float>& BoundingVolume() const override {
        return boundingVolume;
    }

    virtual float GeometricError() const override {
        return geometricError;
    }

    virtual void Children(const TileBase** firstChild, unsigned int* childCount) const override {
        static_cast<const Derived*>(this)->GetChildren(reinterpret_cast<const Derived**>(firstChild), childCount);
    }

    virtual void Children(TileBase** firstChild, unsigned int* childCount) override {
        static_cast<Derived*>(this)->GetChildren(reinterpret_cast<Derived**>(firstChild), childCount);
    }

    virtual ~Tile() {
    }
};

}
}
