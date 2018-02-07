#pragma once
#include <vector>
#include <Eigen/Dense>
#include <flint/core/FrameState.h>
#include <flint/rendering/gl/CommandBuffer.h>
#include "Tile.h"

namespace flint {
namespace tileset {

class TileBase;
class TilesetBase {
protected:
    Eigen::Matrix<float, 4, 4> transform;

    virtual const std::vector<TileBase*>& SelectTiles(const flint::core::FrameState &frameState) = 0;
    virtual void UpdateTiles(const flint::core::FrameState &frameState,
                             flint::rendering::gl::CommandBuffer* commands) = 0;
    virtual void LoadTiles() = 0;
    virtual void UnloadTiles() = 0;

    const std::vector<TileBase*>* selectedTiles = nullptr;

public:
    TilesetBase(const Eigen::Matrix<float, 4, 4> &transform) : transform(transform) {
    }

    const Eigen::Matrix<float, 4, 4>& Transform() const;
    void Update(const flint::core::FrameState &frameState,
                flint::rendering::gl::CommandBuffer* commands);
    void Commit();

    virtual ~TilesetBase() {
    }

};

template <typename Derived>
class Tileset : public TilesetBase {
protected:
    virtual const std::vector<TileBase*>& SelectTiles(const flint::core::FrameState &frameState) override {
        return static_cast<Derived*>(this)->SelectTilesImpl(frameState);
    }

    virtual void UpdateTiles(const flint::core::FrameState &frameState,
                             flint::rendering::gl::CommandBuffer* commands) override {
        static_cast<Derived*>(this)->UpdateTilesImpl(frameState, commands);
    }

    virtual void LoadTiles() override {
        static_cast<Derived*>(this)->LoadTilesImpl();
    }

    virtual void UnloadTiles() override {
        static_cast<Derived*>(this)->UnloadTilesImpl();
    }

public:
    Tileset() : Tileset(Eigen::Matrix<float, 4, 4>::Identity())
    {
    }

    Tileset(const Eigen::Matrix<float, 4, 4> &transform) : TilesetBase(transform)
    {
    }


    virtual ~Tileset() {
    }
};

}
}
