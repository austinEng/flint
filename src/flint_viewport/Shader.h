#pragma once
#include "GL.h"

namespace flint {
namespace viewport {

class Shader {
public:
    Shader();
    ~Shader();
    bool Load(const char* src, GLenum type);
    GLuint GetGLShader() const;

private:
    GLuint shader;
};

}
}
