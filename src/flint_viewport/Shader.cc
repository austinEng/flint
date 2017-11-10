#include <stdio.h>
#include <string>
#include "Shader.h"

namespace flint {
namespace viewport {
    Shader::Shader() : shader(0) {

    }

    Shader::~Shader() {
        glDeleteShader(shader);
    }

    bool Shader::Load(const char* src, GLenum type) {
        shader = glCreateShader(type);
        if (!shader) {
            return false;
        }

        glShaderSource(shader, 1, &src, nullptr);
        glCompileShader(shader);

        GLint compiled;
        glGetShaderiv(shader, GL_COMPILE_STATUS, &compiled);
        if (!compiled) {
            GLint infoLen = 0;
            glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &infoLen);

            if (infoLen > 1) {
                std::string info;
                info.resize(infoLen);
                glGetShaderInfoLog(shader, infoLen, nullptr, &info[0]);
                fprintf(stderr, "Error compiling shader:\n%s\n", info.c_str());
            }
            glDeleteShader(shader);
            shader = 0;
            return false;
        }

        return true;
    }

    GLuint Shader::GetGLShader() const {
        return shader;
    }
}
}
