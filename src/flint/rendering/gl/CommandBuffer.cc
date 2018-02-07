#include <assert.h>
#include "CommandBuffer.h"

namespace flint {
namespace rendering {
namespace gl {

CommandBuffer::CommandBuffer()
  : allocator(new rendering::CommandAllocator()), owner(true) {

}

CommandBuffer::CommandBuffer(CommandAllocator* allocator)
  : allocator(allocator), owner(false) {

}

CommandBuffer::~CommandBuffer() {
    if (owner && allocator) {
        delete allocator;
    }
}

const CommandAllocator& CommandBuffer::Allocator() const {
    assert(allocator);
    return *allocator;
}

void CommandBuffer::Reset() {
    assert(allocator);
    allocator->Reset();
}

}
}
}
