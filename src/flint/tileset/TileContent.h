#pragma once
#include <vector>
#include <flint/core/FrameState.h>
#include <flint/rendering/gl/CommandBuffer.h>

namespace flint {
namespace tileset {

class TileContentBase {
public:
    flint::core::Optional<flint::core::AxisAlignedBox<3, float>> contentBoundingVolume;

    virtual void Create(flint::rendering::gl::CommandBuffer* commands) = 0;
    virtual void Destroy(flint::rendering::gl::CommandBuffer* commands) = 0;
    virtual bool IsEmpty() const = 0;
    virtual bool IsReady() const = 0;

    virtual void Update(const flint::core::FrameState &frameState) = 0;

    virtual void Draw(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands) = 0;

    virtual ~TileContentBase() {

    }
};

template <typename Derived>
class TileContent : public TileContentBase {
public:
    virtual void Create(flint::rendering::gl::CommandBuffer* commands) override {
        static_cast<Derived*>(this)->CreateImpl(commands);
    }

    virtual void Destroy(flint::rendering::gl::CommandBuffer* commands) override {
        static_cast<Derived*>(this)->DestroyImpl(commands);
    }

    virtual bool IsEmpty() const override {
        return static_cast<const Derived*>(this)->IsEmptyImpl();
    }

    virtual bool IsReady() const override {
        return static_cast<const Derived*>(this)->IsReadyImpl();
    }

    virtual void Update(const flint::core::FrameState &frameState) override {
        static_cast<Derived*>(this)->UpdateImpl(frameState);
    }

    virtual void Draw(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands) override {
        static_cast<Derived*>(this)->DrawImpl(frameState, commands);
    }

    virtual ~TileContent() {

    }
};

}
}
