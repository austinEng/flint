
#pragma once

#include "GL.h"
#include "Shader.h"

namespace flint {
namespace viewport {

class ShaderProgram {
public:
    ShaderProgram();
    ~ShaderProgram();

    template <typename... Shaders>
    bool Create(Shaders&&... shader) {
        program = glCreateProgram();
        if (!program) {
            return false;
        }
        int unused[] = { 0, ((void)AttachShader(std::forward<Shaders>(shader)), 0) ... };
        return LinkProgram();
    }

    GLuint GetGLProgram() const;

private:
    void AttachShader(const Shader& shader);
    bool LinkProgram();

    GLuint program;
};

}
}