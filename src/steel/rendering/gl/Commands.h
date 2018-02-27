#pragma once
#include <stdint.h>
#include <flint/debug/Print.h>
#include "Enums.h"

namespace steel {
namespace rendering {
namespace gl {

enum class CommandType {
    Clear,
    CreateVertexArray,
    BindVertexArray,
    DeleteVertexArray,
    CreateBuffer,
    BindBuffer,
    BufferData,
    DeleteBuffer,
    CreateShader,
    DeleteShader,
    CreateProgram,
    DeleteProgram,
    UseProgram,
    Uniform1ui,
    Uniform1f,
    UniformMatrix4fv,
    Uniform4fv,
    EnableVertexAttribArray,
    DisableVertexAttribArray,
    VertexAttribPointer,
    DrawElements,
    DrawArrays,
};

struct ClearCmd {
    uint32_t clearBits;
};

struct CreateVertexArrayCmd {
    uint32_t vaoId;
};

struct BindVertexArrayCmd {
    uint32_t vaoId;
};

struct DeleteVertexArrayCmd {
    uint32_t vaoId;
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
    BufferUsage usage;
    size_t size;
    // const void* data;
};

struct DeleteBufferCmd {
    uint32_t bufferId;
};

struct CreateShaderCmd {
    uint32_t shaderId;
    ShaderType type;
    size_t size;
    // const char* source;
};

struct DeleteShaderCmd {
    uint32_t shaderId;
};

struct CreateProgramCmd {
    uint32_t programId;
    uint32_t count;
    // uint32_t* shaders;
};

struct DeleteProgramCmd {
    uint32_t programId;
};

struct UseProgramCmd {
    uint32_t programId;
};

struct Uniform1uiCmd {
    char location[64];
    uint32_t value;
};

struct Uniform1fCmd {
    char location[64];
    float value;
};

struct UniformMatrix4fvCmd {
    char location[64];
    uint32_t count;
    bool transpose;
    // float* values;
};

struct Uniform4fvCmd {
    char location[64];
    uint32_t count;
    // float* values;
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
    uint32_t count;
    size_t start;
};

static void PrintCommandType(CommandType c) {
    switch (c) {
    case CommandType::Clear: printf("Clear\n"); break;
    case CommandType::CreateVertexArray: printf("CreateVertexArray\n"); break;
    case CommandType::BindVertexArray: printf("BindVertexArray\n"); break;
    case CommandType::DeleteVertexArray: printf("DeleteVertexArray\n"); break;
    case CommandType::CreateBuffer: printf("CreateBuffer\n"); break;
    case CommandType::BindBuffer: printf("BindBuffer\n"); break;
    case CommandType::BufferData: printf("BufferData\n"); break;
    case CommandType::DeleteBuffer: printf("DeleteBuffer\n"); break;
    case CommandType::CreateShader: printf("CreateShader\n"); break;
    case CommandType::DeleteShader: printf("DeleteShader\n"); break;
    case CommandType::CreateProgram: printf("CreateProgram\n"); break;
    case CommandType::DeleteProgram: printf("DeleteProgram\n"); break;
    case CommandType::UseProgram: printf("UseProgram\n"); break;
    case CommandType::Uniform1ui: printf("Uniform1ui\n"); break;
    case CommandType::Uniform1f: printf("Uniform1f\n"); break;
    case CommandType::UniformMatrix4fv: printf("UniformMatrix4fv\n"); break;
    case CommandType::Uniform4fv: printf("Uniform4fv\n"); break;
    case CommandType::EnableVertexAttribArray: printf("EnableVertexAttribArray\n"); break;
    case CommandType::DisableVertexAttribArray: printf("DisableVertexAttribArray\n"); break;
    case CommandType::VertexAttribPointer: printf("VertexAttribPointer\n"); break;
    case CommandType::DrawElements: printf("DrawElements\n"); break;
    case CommandType::DrawArrays: printf("DrawArrays\n"); break;
    }
}

}

}
}
