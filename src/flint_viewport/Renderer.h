#pragma once
#include <map>
#include <flint/rendering/CommandBlock.h>
#include <flint/core/FrameState.h>
#include "GL.h"
#include "Shader.h"
#include "ShaderProgram.h"

namespace flint {
namespace viewport {

class Renderer {
public:
    Renderer(flint::core::FrameState* frameState);
    ~Renderer();

    void ExecuteCommands(const rendering::CommandBlock* commands);
private:
    flint::core::FrameState* frameState;
    uint32_t currentProgramId = 0;
    std::map<uint32_t, GLuint> vaoMap;
    std::map<uint32_t, GLuint> bufferMap;
    std::map<uint32_t, Shader> shaderMap;
    std::map<uint32_t, ShaderProgram> programMap;
    std::map<uint32_t, std::map<std::string, int>> locationMap;

    int GetUniformLocation(const char* name);
};

}
}
