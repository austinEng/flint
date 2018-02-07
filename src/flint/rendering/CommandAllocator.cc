#include <algorithm>
#include "CommandAllocator.h"

namespace flint {
namespace rendering {

CommandAllocator::CommandAllocator() : blocks(nullptr), lastAllocationSize(2048) {
}

CommandAllocator::~CommandAllocator() {
    delete blocks;
}

void CommandAllocator::Initialize() {
    lastAllocationSize = 2048;
    Reset();
}

CommandBlock* CommandAllocator::AcquireBlocks() {
    CommandBlock* ret = blocks;
    blocks = nullptr;
    currentBlock = nullptr;
    currentPtr = nullptr;
    endPtr = nullptr;
    return ret;
}

bool CommandAllocator::GetNewBlock(size_t minimumSize) {
    if (currentBlock->nextBlock == nullptr) {
        // Allocate blocks doubling sizes each time, to a maximum of 16k (or at least minimumSize).
        lastAllocationSize = std::max(minimumSize, std::min(lastAllocationSize * 2, size_t(16384)));

        currentBlock->nextBlock = new CommandBlock {
            lastAllocationSize,
            reinterpret_cast<uint8_t*>(malloc(lastAllocationSize)),
        };

        if (currentBlock->nextBlock->data == nullptr) {
            return false;
        }
    }

    currentBlock = currentBlock->nextBlock;
    currentPtr = core::Align<alignof(uint32_t)>(currentBlock->data);
    endPtr = currentPtr + currentBlock->size;
    *reinterpret_cast<uint32_t*>(currentPtr) = CommandBlock::EndOfBlock;

    return true;
}

void CommandAllocator::Reset() {
    if (!blocks) {
        blocks = new CommandBlock{
            lastAllocationSize,
            reinterpret_cast<uint8_t*>(malloc(lastAllocationSize)),
        };
    }
    currentBlock = blocks;
    currentPtr = currentBlock->data;
    endPtr = currentPtr + currentBlock->size;

    CommandBlock* cur = blocks;
    while (cur != nullptr) {
        *reinterpret_cast<uint32_t*>(cur->data) = CommandBlock::EndOfBlock;
        cur = cur->nextBlock;
    }
}

}
}
