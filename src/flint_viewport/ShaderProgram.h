
#pragma once

#include "GL.h"
#include "Shader.h"

namespace flint {
namespace viewport {

class ShaderProgram {
public:
    ShaderProgram();
    ShaderProgram(const ShaderProgram&) = delete;
    ShaderProgram& operator=(const ShaderProgram&) = delete;
    ShaderProgram(ShaderProgram&& other);
    ShaderProgram& operator=(ShaderProgram&& other);
    ~ShaderProgram();

    bool Create(Shader** shaders, uint32_t count);

    template <typename... Shaders>
    bool Create(Shaders&&... shader) {
        this->~ShaderProgram();
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