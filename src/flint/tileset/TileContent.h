#pragma once
#include <vector>
#include <flint/core/FrameState.h>
#include <flint/rendering/gl/CommandBuffer.h>

namespace flint {
namespace tileset {

class TileContentBase {
public:
    virtual void Create() = 0;
    virtual void Destroy() = 0;
    virtual bool IsEmpty() const = 0;
    virtual bool IsReady() const = 0;

    virtual void Update(const flint::core::FrameState &frameState,
                        flint::rendering::gl::CommandBuffer* commands) = 0;
    virtual void Commit() = 0;

    virtual ~TileContentBase() {

    }
};

template <typename Derived>
class TileContent : public TileContentBase {
public:
    virtual void Create() override {
        static_cast<Derived*>(this)->CreateImpl();
    }

    virtual void Destroy() override {
        static_cast<Derived*>(this)->DestroyImpl();
    }

    virtual bool IsEmpty() const override {
        return static_cast<const Derived*>(this)->IsEmptyImpl();
    }

    virtual bool IsReady() const override {
        return static_cast<const Derived*>(this)->IsReadyImpl();
    }

    virtual void Update(const flint::core::FrameState &frameState,
                        flint::rendering::gl::CommandBuffer* commands) override {
        static_cast<Derived*>(this)->UpdateImpl(frameState, commands);
    }

    virtual void Commit() override {
        static_cast<Derived*>(this)->CommitImpl();
    }

    virtual ~TileContent() {

    }
};

}
}
