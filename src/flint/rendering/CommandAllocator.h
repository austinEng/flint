// https://github.com/google/nxt-standalone/blob/master/src/backend/CommandAllocator.h

#pragma once
#include <stdint.h>
#include <vector>
#include <flint/core/Math.h>
#include <flint/debug/Print.h>
#include "CommandIterator.h"
#include "CommandBlock.h"

namespace flint {
namespace rendering {

class CommandIterator;
class CommandAllocator {
public:
    CommandAllocator();
    ~CommandAllocator();

    CommandAllocator(const CommandAllocator&) = delete;
    CommandAllocator& operator=(const CommandAllocator&) = delete;

    void Initialize();
    bool Serialize(uint8_t** data, size_t* size) const {
        if (!blocks) {
            *data = nullptr;
            *size = 0;
            return false;
        }

        blocks->Serialize(data, size);
        return true;
    }

    template <typename T, typename E>
    T* Allocate(E id) {
        static_assert(sizeof(E) == sizeof(uint32_t), "");
        static_assert(alignof(E) == alignof(uint32_t), "");

        if (!currentPtr) {
            Initialize();
        }

        uint32_t* idAlloc = reinterpret_cast<uint32_t*>(currentPtr);
        uint8_t* commandAlloc = static_cast<uint8_t*>(core::Align<alignof(T)>(currentPtr + sizeof(uint32_t)));
        uint8_t* nextPtr = core::Align<alignof(uint32_t)>(commandAlloc + sizeof(T));

        if (nextPtr + sizeof(uint32_t) > endPtr) {
            *idAlloc = CommandBlock::EndOfBlock;

            if (!GetNewBlock(static_cast<size_t>(nextPtr - currentPtr) + sizeof(uint32_t) + alignof(uint32_t))) {
                return nullptr;
            }
            return Allocate<T>(id);
        }

        *idAlloc = static_cast<uint32_t>(id);
        currentPtr = nextPtr;
        *reinterpret_cast<uint32_t*>(currentPtr) = CommandBlock::EndOfBlock;
        return reinterpret_cast<T*>(commandAlloc);
    }

    template <typename T>
    T* AllocateData(size_t count) {
        if (!currentPtr) {
            Initialize();
        }

        uint32_t* idAlloc = reinterpret_cast<uint32_t*>(currentPtr);
        uint8_t* commandAlloc = core::Align<alignof(T)>(currentPtr + sizeof(uint32_t));
        uint8_t* nextPtr = core::Align<alignof(uint32_t)>(commandAlloc + sizeof(T) * count);

        if (nextPtr + sizeof(uint32_t) > endPtr) {
            *idAlloc = CommandBlock::EndOfBlock;

            if (!GetNewBlock(static_cast<size_t>(nextPtr - currentPtr) + sizeof(uint32_t) + alignof(uint32_t))) {
                return nullptr;
            }
            return AllocateData<T>(count);
        }

        *idAlloc = CommandBlock::CommandData;
        currentPtr = nextPtr;
        *reinterpret_cast<uint32_t*>(currentPtr) = CommandBlock::EndOfBlock;
        return reinterpret_cast<T*>(commandAlloc);
    }

    CommandBlock* AcquireBlocks();
    void Reset();

private:
    friend CommandIterator;

    CommandBlock* blocks = nullptr;
    size_t lastAllocationSize;

    CommandBlock* currentBlock = nullptr;
    uint8_t* currentPtr = nullptr;
    uint8_t* endPtr = nullptr;

    bool GetNewBlock(size_t minimumSize);
};

}
}
