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

    virtual void SelectTiles(const flint::core::FrameState &frameState) = 0;
    virtual void UpdateTiles(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands) = 0;
    virtual void DrawTiles(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands) = 0;
    virtual void LoadTiles(flint::rendering::gl::CommandBuffer* commands) = 0;
    virtual void UnloadTiles(flint::rendering::gl::CommandBuffer* commands) = 0;

    std::vector<TileBase*> selectedTiles;
    std::vector<TileBase*> loadQueue;
    std::vector<TileBase*> unloadQueue;

public:
    TilesetBase(const Eigen::Matrix<float, 4, 4> &transform) : transform(transform) {
    }

    const Eigen::Matrix<float, 4, 4>& Transform() const;
    void Update(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands);
    void Draw(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands);
    void Commit();

    virtual ~TilesetBase() {
    }

};

template <typename Derived>
class Tileset : public TilesetBase {
protected:
    virtual void SelectTiles(const flint::core::FrameState &frameState) override {
        static_cast<Derived*>(this)->SelectTilesImpl(frameState);
    }

    virtual void UpdateTiles(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands) override {
        static_cast<Derived*>(this)->UpdateTilesImpl(frameState, commands);
    }

    virtual void DrawTiles(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands) override {
        static_cast<Derived*>(this)->DrawTilesImpl(frameState, commands);
    }

    virtual void LoadTiles(flint::rendering::gl::CommandBuffer* commands) override {
        static_cast<Derived*>(this)->LoadTilesImpl(commands);
    }

    virtual void UnloadTiles(flint::rendering::gl::CommandBuffer* commands) override {
        static_cast<Derived*>(this)->UnloadTilesImpl(commands);
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
