#pragma once

#include <flint/core/FrameState.h>
#include <steel/rendering/gl/CommandBuffer.h>
#include <steel/rendering/gl/SerialCounted.h>
#include <steel/rendering/gl/Objects.h>

namespace steel {
namespace geometry {

class BoundingBoxGeometry {
public:
    static BoundingBoxGeometry& GetInstance() {
        static BoundingBoxGeometry instance;
        return instance;
    }

    void Create(steel::rendering::gl::CommandBuffer* commands);
    void Draw(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands);
    BoundingBoxGeometry(const BoundingBoxGeometry&) = delete;
    BoundingBoxGeometry& operator=(const BoundingBoxGeometry&) = delete;

    bool created = false;

private:
    BoundingBoxGeometry();
    rendering::gl::SerialCounted<rendering::gl::VertexArray> vertexArray;
};

}
}
