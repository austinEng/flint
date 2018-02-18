#include <assert.h>
#include <string>
#include <flint/rendering/CommandIterator.h>
#include <flint/rendering/gl/Commands.h>
#include <flint/rendering/gl/Enums.h>
#include <flint/debug/Print.h>
#include "Renderer.h"

using namespace flint::rendering;
using namespace flint::rendering::gl;

namespace flint {
namespace viewport {


Renderer::Renderer() {

}

Renderer::~Renderer() {

}

static GLenum GLBufferTarget(BufferTarget target) {
    switch (target) {
        case BufferTarget::ARRAY_BUFFER:
            return GL_ARRAY_BUFFER;
        case BufferTarget::ELEMENT_ARRAY_BUFFER:
            return GL_ELEMENT_ARRAY_BUFFER;
        default:
            assert(false);
            return 0;
    }
}

static GLenum GLBufferUsage(BufferUsage usage) {
    switch (usage) {
        case BufferUsage::STATIC_DRAW:
            return GL_STATIC_DRAW;
        default:
            assert(false);
            return 0;
    }
}

static GLenum GLComponentDatatype(ComponentDatatype datatype) {
    switch (datatype) {
        case ComponentDatatype::FLOAT:
            return GL_FLOAT;
        default:
            assert(false);
            return 0;
    }
}

static GLenum GLIndexDatatype(IndexDatatype datatype) {
    switch (datatype) {
        case IndexDatatype::UNSIGNED_BYTE:
            return GL_UNSIGNED_BYTE;
        case IndexDatatype::UNSIGNED_SHORT:
            return GL_UNSIGNED_SHORT;
        case IndexDatatype::UNSIGNED_INT:
            return GL_UNSIGNED_INT;
        default:
            assert(false);
            return 0;
    }
}

static GLenum GLDrawMode(DrawMode drawMode) {
    switch (drawMode) {
        case DrawMode::POINTS:
            return GL_POINTS;
        case DrawMode::LINES:
            return GL_LINES;
        case DrawMode::TRIANGLES:
            return GL_TRIANGLES;
        default:
            assert(false);
            return 0;
    }
}

static GLenum GLShaderType(ShaderType shaderType) {
    switch (shaderType) {
        case ShaderType::VERTEX_SHADER:
            return GL_VERTEX_SHADER;
        case ShaderType::FRAGMENT_SHADER:
            return GL_FRAGMENT_SHADER;
        default:
            assert(false);
            return 0;
    }
}

uint32_t Renderer::GetUniformLocation(const char* name) {
    auto& locations = locationMap.at(currentProgramId);
    auto it = locations.find(name);
    if (it == locations.end()) {
        uint32_t location = glGetUniformLocation(programMap.at(currentProgramId).GetGLProgram(), name);
        locations.emplace(name, location);
        return location;
    }
    return locations[name];
}

void Renderer::ExecuteCommands(const CommandBlock* commands) {
    CommandIterator iter(commands);

    CommandType c;
    while (iter.NextCommandId(&c)) {
        switch (c) {
            case CommandType::Clear: {
                auto* cmd = iter.NextCommand<ClearCmd>();
                glClear(
                    (cmd->clearBits & ClearBit::COLOR_BUFFER_BIT ? GL_COLOR_BUFFER_BIT : 0) |
                    (cmd->clearBits & ClearBit::DEPTH_BUFFER_BIT ? GL_DEPTH_BUFFER_BIT : 0) |
                    (cmd->clearBits & ClearBit::STENCIL_BUFFER_BIT ? GL_STENCIL_BUFFER_BIT : 0)
                );
                break;
            }
            case CommandType::CreateBuffer: {
                auto* cmd = iter.NextCommand<CreateBufferCmd>();
                GLuint buf;
                glGenBuffers(1, &buf);
                bufferMap.emplace(cmd->bufferId, buf);
                break;
            }
            case CommandType::BindBuffer: {
                auto* cmd = iter.NextCommand<BindBufferCmd>();
                glBindBuffer(GLBufferTarget(cmd->target), bufferMap.at(cmd->bufferId));
                break;
            }
            case CommandType::BufferData: {
                auto* cmd = iter.NextCommand<BufferDataCmd>();
                uint8_t* data = iter.NextData<uint8_t>(cmd->size);
                glBufferData(GLBufferTarget(cmd->target), cmd->size, data, GLBufferUsage(cmd->usage));
                break;
            }
            case CommandType::DeleteBuffer: {
                auto* cmd = iter.NextCommand<DeleteBufferCmd>();
                GLuint buf = bufferMap.at(cmd->bufferId);
                glDeleteBuffers(1, &buf);
                bufferMap.erase(cmd->bufferId);
                break;
            }
            case CommandType::CreateShader: {
                auto* cmd = iter.NextCommand<CreateShaderCmd>();
                const char* data = iter.NextData<char>(cmd->size);
                Shader shader;
                if (shader.Load(data, GLShaderType(cmd->type), cmd->size)) {
                    shaderMap.emplace(cmd->shaderId, std::move(shader));
                }
                break;
            }
            case CommandType::DeleteShader: {
                auto* cmd = iter.NextCommand<DeleteShaderCmd>();
                shaderMap.erase(cmd->shaderId);
                break;
            }
            case CommandType::CreateProgram: {
                auto* cmd = iter.NextCommand<CreateProgramCmd>();
                uint32_t* shaderIds = iter.NextData<uint32_t>(cmd->count);
                std::vector<Shader*> shaders(cmd->count);
                for (uint32_t i = 0; i < cmd->count; ++i) {
                    shaders[i] = &shaderMap.at(shaderIds[i]);
                }
                ShaderProgram program;
                if (program.Create(shaders.data(), cmd->count)) {
                    programMap.emplace(cmd->programId, std::move(program));
                    locationMap.emplace(cmd->programId, std::map<std::string, uint32_t>{});
                }
                break;
            }
            case CommandType::DeleteProgram: {
                auto* cmd = iter.NextCommand<DeleteProgramCmd>();
                programMap.erase(cmd->programId);
                locationMap.erase(cmd->programId);
                break;
            }
            case CommandType::UseProgram: {
                auto* cmd = iter.NextCommand<UseProgramCmd>();
                currentProgramId = cmd->programId;
                glUseProgram(programMap.at(currentProgramId).GetGLProgram());
                break;
            }
            case CommandType::Uniform1ui: {
                auto* cmd = iter.NextCommand<Uniform1uiCmd>();
                glUniform1ui(GetUniformLocation(cmd->location), cmd->value);
                break;
            }
            case CommandType::Uniform1f: {
                auto* cmd = iter.NextCommand<Uniform1fCmd>();
                break;
            }
            case CommandType::UniformMatrix4fv: {
                auto* cmd = iter.NextCommand<UniformMatrix4fvCmd>();
                const float* data = iter.NextData<float>(cmd->count * 16);
                glUniformMatrix4fv(GetUniformLocation(cmd->location), cmd->count, cmd->transpose, data);
                break;
            }
            case CommandType::EnableVertexAttribArray: {
                auto* cmd = iter.NextCommand<EnableVertexAttribArrayCmd>();
                glEnableVertexAttribArray(cmd->location);
                break;
            }
            case CommandType::DisableVertexAttribArray: {
                auto* cmd = iter.NextCommand<DisableVertexAttribArrayCmd>();
                glDisableVertexAttribArray(cmd->location);
                break;
            }
            case CommandType::VertexAttribPointer: {
                auto* cmd = iter.NextCommand<VertexAttribPointerCmd>();
                glVertexAttribPointer(cmd->location, cmd->size, GLComponentDatatype(cmd->type), cmd->normalized, cmd->stride, reinterpret_cast<const void*>(cmd->offset));
                break;
            }
            case CommandType::DrawElements: {
                auto* cmd = iter.NextCommand<DrawElementsCmd>();
                glDrawElements(GLDrawMode(cmd->mode), cmd->count, GLIndexDatatype(cmd->type), reinterpret_cast<const void*>(cmd->offset));
                break;
            }
            case CommandType::DrawArrays: {
                auto* cmd = iter.NextCommand<DrawArraysCmd>();
                break;
            }
        }
    }
}

}
}