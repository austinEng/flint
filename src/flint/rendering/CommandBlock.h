#pragma once
#include <stdint.h>
#include <stdlib.h>

namespace flint {
namespace rendering {

struct CommandBlock {
    static constexpr uint32_t EndOfBlock = ((uint32_t)-1);
    static constexpr uint32_t CommandData = ((uint32_t)-2);

    size_t size;
    uint8_t* data;
    CommandBlock* nextBlock = nullptr;
    ~CommandBlock();

    static CommandBlock* Deserialize(uint8_t* data, size_t size);
    void Serialize(uint8_t** data, size_t* size) const;
};

}
}
