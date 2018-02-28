#include <stdio.h>
#include <string>
#include "Shader.h"

namespace flint {
namespace viewport {
    Shader::Shader() : shader(0) {

    }

    Shader::Shader(Shader&& other) {
        shader = other.shader;
        other.shader = 0;
    }

    Shader& Shader::operator=(Shader&& other) {
        if (this != &other) {
            shader = other.shader;
            other.shader = 0;
        }
        return *this;
    }

    Shader::~Shader() {
        if (shader != 0) {
            glDeleteShader(shader);
        }
        shader = 0;
    }

    bool Shader::Load(const char* src, GLenum type, size_t length) {
        // delete shader if one exists here
        this->~Shader();

        shader = glCreateShader(type);
        if (!shader) {
            return false;
        }

        GLint len = static_cast<GLint>(length);
        glShaderSource(shader, 1, &src, len == 0 ? nullptr : &len);
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
