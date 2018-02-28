#pragma once
#include "GL.h"

namespace flint {
namespace viewport {

class Shader {
public:
    Shader();
    Shader(const Shader&) = delete;
    Shader& operator=(const Shader&) = delete;
    Shader(Shader&& other);
    Shader& operator=(Shader&& other);
    ~Shader();
    bool Load(const char* src, GLenum type, size_t length = 0);
    GLuint GetGLShader() const;

private:
    GLuint shader = 0;
};

}
}
