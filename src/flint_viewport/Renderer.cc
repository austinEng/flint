#include <assert.h>
#include <string>
#include <steel/rendering/CommandIterator.h>
#include <steel/rendering/gl/Commands.h>
#include <steel/rendering/gl/Enums.h>
#include <flint/debug/Print.h>
#include "Renderer.h"

using namespace steel::rendering;
using namespace steel::rendering::gl;

namespace flint {
namespace viewport {


Renderer::Renderer(flint::core::FrameState* frameState) : frameState(frameState) {
    vaoMap.emplace(0, 0);
    bufferMap.emplace(0, 0);
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

int Renderer::GetUniformLocation(const char* name) {
    auto& locations = locationMap.at(currentProgramId);
    auto it = locations.find(name);
    if (it == locations.end()) {
        int location = glGetUniformLocation(programMap.at(currentProgramId).GetGLProgram(), name);
        locations.emplace(name, location);
        return location;
    }
    return locations[name];
}

void Renderer::ExecuteCommands(const CommandBlock* commands) {
    CommandIterator iter(commands);

    CommandType c;
    while (iter.NextCommandId(&c)) {
        // PrintCommandType(c);
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
            case CommandType::CreateVertexArray: {
                auto* cmd = iter.NextCommand<CreateVertexArrayCmd>();
                GLuint vao;
                glGenVertexArrays(1, &vao);
                auto it = vaoMap.emplace(cmd->vaoId, vao);
                assert(it.second);
                break;
            }
            case CommandType::BindVertexArray: {
                auto* cmd = iter.NextCommand<BindVertexArrayCmd>();
                glBindVertexArray(vaoMap.at(cmd->vaoId));
                break;
            }
            case CommandType::DeleteVertexArray: {
                auto* cmd = iter.NextCommand<DeleteVertexArrayCmd>();
                GLuint vao = vaoMap.at(cmd->vaoId);
                glDeleteVertexArrays(1, &vao);
                break;
            }
            case CommandType::CreateBuffer: {
                auto* cmd = iter.NextCommand<CreateBufferCmd>();
                GLuint buf;
                glGenBuffers(1, &buf);
                auto it = bufferMap.emplace(cmd->bufferId, buf);
                assert(it.second);
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
                    auto it = shaderMap.emplace(cmd->shaderId, std::move(shader));
                    assert(it.second);
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
                    auto it = programMap.emplace(cmd->programId, std::move(program));
                    assert(it.second);
                    locationMap.emplace(cmd->programId, std::map<std::string, int>{});
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
                auto& locations = locationMap.at(currentProgramId);
                int location = GetUniformLocation("viewProj");
                if (location >= 0) {
                    glUniformMatrix4fv(location, 1, false, frameState->camera.GetViewProjection().data());
                }
                break;
            }
            case CommandType::Uniform1ui: {
                auto* cmd = iter.NextCommand<Uniform1uiCmd>();
                glUniform1ui(GetUniformLocation(cmd->location), cmd->value);
                break;
            }
            case CommandType::Uniform1f: {
                auto* cmd = iter.NextCommand<Uniform1fCmd>();
                glUniform1f(GetUniformLocation(cmd->location), cmd->value);
                break;
            }
            case CommandType::UniformMatrix4fv: {
                auto* cmd = iter.NextCommand<UniformMatrix4fvCmd>();
                const float* data = iter.NextData<float>(cmd->count * 16);
                glUniformMatrix4fv(GetUniformLocation(cmd->location), cmd->count, cmd->transpose, data);
                break;
            }
            case CommandType::Uniform4fv: {
                auto* cmd = iter.NextCommand<Uniform4fvCmd>();
                const float* data = iter.NextData<float>(cmd->count * 4);
                glUniform4fv(GetUniformLocation(cmd->location), cmd->count, data);
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
                glDrawArrays(GLDrawMode(cmd->mode), cmd->start, cmd->count);
                break;
            }
        }
    }
}

}
}
