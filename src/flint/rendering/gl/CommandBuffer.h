#pragma once
#include <stdint.h>
#include "../CommandAllocator.h"
#include "Commands.h"
#include "Enums.h"

namespace flint {
namespace rendering {
namespace gl {

class CommandBuffer {
public:
    CommandBuffer();

    CommandBuffer(CommandAllocator* allocator);

    ~CommandBuffer();

    CommandBuffer(const CommandBuffer&) = delete;

    template <CommandType E, typename Cmd>
    CommandBuffer& Record(const Cmd& cmd) {
        *allocator->Allocate<Cmd>(E) = cmd;
        return *this;
    }

    template <typename T>
    CommandBuffer& RecordData(const T* data, size_t count = 1) {
        T* ptr = allocator->AllocateData<T>(count);
        memcpy(ptr, data, sizeof(T) * count);
        return *this;
    }

    const CommandAllocator& Allocator() const;
    void Reset();

private:
    CommandAllocator* allocator;
    bool owner;
};

}
}
}
