// https://github.com/google/nxt-standalone/blob/master/src/backend/CommandAllocator.h
#pragma once
#include <assert.h>
#include "CommandAllocator.h"
#include "CommandBlock.h"

namespace flint {
namespace rendering {

class CommandAllocator;
class CommandIterator {
public:
    CommandIterator();
    ~CommandIterator();

    CommandIterator(const CommandIterator&) = delete;
    CommandIterator& operator=(const CommandIterator&) = delete;

    CommandIterator(CommandIterator&& other);
    CommandIterator& operator=(CommandIterator&& other);

    CommandIterator(CommandAllocator&& allocator);
    CommandIterator& operator=(CommandAllocator&& allocator);

    CommandIterator(uint8_t* data, size_t size);

    CommandIterator(const CommandBlock* blocks);

    template <typename E>
    bool NextCommandId(E* commandId) {
        return NextCommandId(reinterpret_cast<uint32_t*>(commandId));
    }

    template <typename T>
    T* NextCommand() {
        uint8_t* commandPtr = core::Align<alignof(T)>(currentPtr);
        currentPtr = commandPtr + sizeof(T);
        assert(currentPtr <= currentBlock->data + currentBlock->size);
        return reinterpret_cast<T*>(commandPtr);
    }

    template <typename T>
    T* NextData(size_t count) {
        uint32_t id;
        bool hasId = NextCommandId(&id);
        assert(hasId);
        assert(id == CommandBlock::CommandData);

        uint8_t* commandPtr = core::Align<alignof(T)>(currentPtr);
        currentPtr = commandPtr + count * sizeof(T);
        assert(currentPtr <= currentBlock->data + currentBlock->size);
        return reinterpret_cast<T*>(commandPtr);
    }

    void Reset();

private:
    bool NextCommandId(uint32_t* commandId);

    const CommandBlock* blocks = nullptr;
    const CommandBlock* currentBlock = nullptr;
    uint8_t* currentPtr = nullptr;
    bool owner;
};

}
}
