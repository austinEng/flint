#pragma once
#include <stdint.h>
#include "Enums.h"

namespace flint {
namespace rendering {
namespace gl {

enum class CommandType {
    Clear,
    CreateBuffer,
    BindBuffer,
    BufferData,
    CreateProgram,
    UseProgram,
    Uniform1f,
    UniformMatrix4fv,
    EnableVertexAttribArray,
    DisableVertexAttribArray,
    VertexAttribPointer,
    DrawElements,
    DrawArrays,
};

struct ClearCmd {
    uint32_t clearBits;
};

struct CreateBufferCmd {
    uint32_t bufferId;
};

struct BindBufferCmd {
    uint32_t bufferId;
    BufferTarget target;
};

struct BufferDataCmd {
    BufferTarget target;
    size_t size;
    BufferUsage usage;
    // const void* data;
};

struct CreateShaderCmd {
    uint32_t shaderId;
    ShaderType type;
    uint32_t size;
    // const char* source;
};

struct CreateProgramCmd {
    uint32_t programId;
    uint32_t count;
    // uint32_t* shaders;
};

struct UseProgramCmd {
    uint32_t programId;
};

struct Uniform1fCmd {
    int32_t location;
    float value;
};

struct UniformMatrix4fvCmd {
    int32_t location;
    uint32_t count;
    bool transpose;
};

struct EnableVertexAttribArrayCmd {
    int32_t location;
};

struct DisableVertexAttribArrayCmd {
    int32_t location;
};

struct VertexAttribPointerCmd {
    int32_t location;
    uint32_t size;
    ComponentDatatype type;
    bool normalized;
    uint32_t stride;
    size_t offset;
};

struct DrawElementsCmd {
    DrawMode mode;
    uint32_t count;
    IndexDatatype type;
    size_t offset;
};

struct DrawArraysCmd {
    DrawMode mode;
    size_t start;
    uint32_t count;
};

}
}
}
