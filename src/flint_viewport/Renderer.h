#pragma once
#include <map>
#include <flint/rendering/CommandBlock.h>
#include "GL.h"
#include "Shader.h"
#include "ShaderProgram.h"

namespace flint {
namespace viewport {

class Renderer {
public:
    Renderer();
    ~Renderer();

    void ExecuteCommands(const rendering::CommandBlock* commands);
private:
    uint32_t currentProgramId = 0;
    std::map<uint32_t, GLuint> bufferMap;
    std::map<uint32_t, Shader> shaderMap;
    std::map<uint32_t, ShaderProgram> programMap;
    std::map<uint32_t, std::map<std::string, uint32_t>> locationMap;

    uint32_t GetUniformLocation(const char* name);
};

}
}
