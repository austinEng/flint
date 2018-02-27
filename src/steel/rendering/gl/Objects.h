#pragma once
#include "CommandBuffer.h"
#include "Enums.h"

namespace steel {
namespace rendering {
namespace gl {

struct VertexArray {};
struct Buffer {
    BufferUsage usage;
    BufferTarget target;
    const void* data;
    size_t size;

    template <typename T>
    void CreateAndUpload(CommandBuffer* commands, uint32_t id) {
        commands->Record<CommandType::CreateBuffer>(CreateBufferCmd{ id });
        commands->Record<CommandType::BindBuffer>(BindBufferCmd{ id, target });
        commands->Record<CommandType::BufferData>(BufferDataCmd{ target, usage , static_cast<uint32_t>(size * sizeof(T)) });
        commands->RecordData<T>(data, size);
    }
};

}
}
}
