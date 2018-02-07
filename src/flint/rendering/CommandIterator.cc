#include <flint/core/Math.h>
#include <flint/debug/Print.h>
#include "CommandIterator.h"

namespace flint {
namespace rendering {

CommandIterator::CommandIterator() {
    Reset();
}

CommandIterator::~CommandIterator() {
    if (owner) {
        delete blocks;
    }
}

CommandIterator::CommandIterator(CommandIterator&& other) {
    std::swap(blocks, other.blocks);
    std::swap(owner, other.owner);
    other.Reset();
    Reset();
}

CommandIterator& CommandIterator::operator=(CommandIterator&& other) {
    std::swap(blocks, other.blocks);
    std::swap(owner, other.owner);
    other.Reset();
    Reset();
    return *this;
}

CommandIterator::CommandIterator(CommandAllocator&& allocator)
  : blocks(allocator.AcquireBlocks()), owner(true) {
    Reset();
}

CommandIterator& CommandIterator::operator=(CommandAllocator&& allocator) {
    blocks = allocator.AcquireBlocks();
    owner = true;
    Reset();
    return *this;
}

CommandIterator::CommandIterator(uint8_t* data, size_t size)
  : CommandIterator(CommandBlock::Deserialize(data, size)) {
}

CommandIterator::CommandIterator(const CommandBlock* blocks)
  : blocks(blocks), owner(false) {
    Reset();
}

void CommandIterator::Reset() {
    currentBlock = blocks;

    if (blocks == nullptr) {
        currentPtr = nullptr;
    } else {
        currentPtr = currentBlock->data;
    }
}

bool CommandIterator::NextCommandId(uint32_t* commandId) {
    if (!currentPtr) {
        return false;
    }

    uint8_t* idPtr = core::Align<alignof(uint32_t)>(currentPtr);
    uint32_t id = *reinterpret_cast<uint32_t*>(idPtr);
    *commandId = id;

    if (id == CommandBlock::EndOfBlock) {
        currentBlock = currentBlock->nextBlock;
        if (currentBlock == nullptr) {
            Reset();
            return false;
        }
        currentPtr = currentBlock->data;
        return NextCommandId(commandId);
    }

    currentPtr = idPtr + sizeof(uint32_t);
    return true;
}

}
}
