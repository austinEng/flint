#include <assert.h>
#include <cstring>
#include <stdlib.h>
#include <flint/core/Math.h>
#include <flint/debug/Print.h>
#include "CommandBlock.h"

namespace flint {
namespace rendering {

CommandBlock::~CommandBlock() {
    delete data;
    delete nextBlock;
}

CommandBlock* CommandBlock::Deserialize(uint8_t* data, size_t size) {
    uint8_t* ptr = data;
    CommandBlock* firstBlock = reinterpret_cast<CommandBlock*>(ptr);
    CommandBlock* current = firstBlock;

    while (current != nullptr) {
        current->data = data + reinterpret_cast<size_t>(current->data);

        if (current->nextBlock != nullptr) {
            ptr += sizeof(CommandBlock);
            current->nextBlock = reinterpret_cast<CommandBlock*>(ptr);
        }

        current = current->nextBlock;
    }

    return firstBlock;
}

void CommandBlock::Serialize(uint8_t** data, size_t* size) const {
    const CommandBlock* current;

    current = this;
    uint8_t* blockPtr = 0;
    uint8_t* dataPtr = 0;
    while (current != nullptr) {
        blockPtr += sizeof(CommandBlock);
        dataPtr += current->size;
        current = current->nextBlock;
    }

    size_t blockSize = reinterpret_cast<size_t>(blockPtr);
    size_t dataSize = reinterpret_cast<size_t>(dataPtr);
    size_t totalSize = blockSize + dataSize;

    *size = totalSize;
    *data = reinterpret_cast<uint8_t*>(malloc(totalSize));

    blockPtr = *data;
    dataPtr = *data + blockSize;
    uint8_t* endPtr = *data + totalSize;
    current = this;

    while (current != nullptr) {
        assert(blockPtr + sizeof(CommandBlock) <= endPtr);
        memcpy(blockPtr, current, sizeof(CommandBlock));

        assert(dataPtr + current->size <= endPtr);
        memcpy(dataPtr, current->data, current->size);

        // store the data ptr as the offset from the start (for deserialization)
        CommandBlock* blk = reinterpret_cast<CommandBlock*>(blockPtr);
        blk->data = reinterpret_cast<uint8_t*>(dataPtr - *data);

        blockPtr += sizeof(CommandBlock);
        dataPtr += current->size;

        current = current->nextBlock;
    }
}

}
}
