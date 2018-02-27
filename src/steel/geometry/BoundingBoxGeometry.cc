#include <vector>
#include <stdint.h>
#include "BoundingBoxGeometry.h"

namespace steel {
namespace geometry {

using namespace steel::rendering::gl;

BoundingBoxGeometry::BoundingBoxGeometry() : created(false) {

}

void BoundingBoxGeometry::Create(steel::rendering::gl::CommandBuffer* commands) {
    if (!created) {
        created = true;

        std::vector<uint32_t> indices(24);
        std::vector<std::array<float, 3>> positions(8);

        positions[0] = { 0.f, 0.f, 0.f };
        positions[1] = { 0.f, 0.f, 1.f };
        positions[2] = { 0.f, 1.f, 0.f };
        positions[3] = { 0.f, 1.f, 1.f };
        positions[4] = { 1.f, 0.f, 0.f };
        positions[5] = { 1.f, 0.f, 1.f };
        positions[6] = { 1.f, 1.f, 0.f };
        positions[7] = { 1.f, 1.f, 1.f };

        for (uint32_t i = 0; i < 8; ++i) indices[i] = i;
        for (uint32_t i = 0; i < 8; ++i) indices[i + 8] = (2 * (i / 4) + i / 2 + 2 * (i % 2));
        for (uint32_t i = 0; i < 8; ++i) indices[i + 16] = (i / 2 + 4 * (i % 2));

        rendering::gl::SerialCounted<rendering::gl::Buffer> indexBuffer(new rendering::gl::Buffer{
            BufferUsage::STATIC_DRAW,
            BufferTarget::ELEMENT_ARRAY_BUFFER,
            indices.data(),
            indices.size(),
        });

        rendering::gl::SerialCounted<rendering::gl::Buffer> positionBuffer(new rendering::gl::Buffer{
            BufferUsage::STATIC_DRAW,
            BufferTarget::ARRAY_BUFFER,
            positions.data(),
            3 * positions.size(),
        });

        vertexArray.Create();

        commands->Record<CommandType::CreateVertexArray>(CreateVertexArrayCmd{ vertexArray });
        commands->Record<CommandType::BindVertexArray>(BindVertexArrayCmd{ vertexArray });

        indexBuffer->CreateAndUpload<uint32_t>(commands, indexBuffer);

        positionBuffer->CreateAndUpload<float>(commands, positionBuffer);
        commands->Record<CommandType::VertexAttribPointer>(VertexAttribPointerCmd{ 0, 3, ComponentDatatype::FLOAT, false, 0, 0 });
        commands->Record<CommandType::EnableVertexAttribArray>(EnableVertexAttribArrayCmd{ 0 });

        commands->Record<CommandType::BindVertexArray>(BindVertexArrayCmd{ 0 });

        commands->Record<CommandType::DeleteBuffer>(DeleteBufferCmd{ indexBuffer });
    }
}

void BoundingBoxGeometry::Draw(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands) {
    commands->Record<CommandType::BindVertexArray>(BindVertexArrayCmd{ vertexArray });
    commands->Record<CommandType::DrawElements>(DrawElementsCmd{ DrawMode::LINES, 24, IndexDatatype::UNSIGNED_INT, 0 });
}

}
}
