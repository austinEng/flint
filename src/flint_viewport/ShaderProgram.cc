#include <string>
#include <stdio.h>
#include "ShaderProgram.h"

namespace flint {
namespace viewport {

ShaderProgram::ShaderProgram() : program(0) {

}

ShaderProgram::ShaderProgram(ShaderProgram&& other) {
    program = other.program;
    other.program = 0;
}

ShaderProgram& ShaderProgram::operator=(ShaderProgram&& other) {
    if (this != &other) {
        program = other.program;
        other.program = 0;
    }
    return *this;
}

ShaderProgram::~ShaderProgram() {
    if (program != 0) {
        glDeleteProgram(program);
    }
    program = 0;
}

GLuint ShaderProgram::GetGLProgram() const {
    return program;
}

bool ShaderProgram::Create(Shader** shaders, uint32_t count) {
    this->~ShaderProgram();
    program = glCreateProgram();
    if (!program) {
        return false;
    }
    for (uint32_t i = 0; i < count; ++i) {
        AttachShader(*shaders[i]);
    }
    return LinkProgram();
}

void ShaderProgram::AttachShader(const Shader& shader) {
    glAttachShader(program, shader.GetGLShader());
}

bool ShaderProgram::LinkProgram() {
    GLint linked;
    glLinkProgram(program);
    glGetProgramiv(program, GL_LINK_STATUS, &linked);
    if (!linked) {
        GLint infoLen = 0;
        glGetProgramiv(program, GL_INFO_LOG_LENGTH, &infoLen);

        if (infoLen > 1) {
            std::string info;
            info.resize(infoLen);
            glGetProgramInfoLog(program, infoLen, NULL, &info[0]);
            fprintf(stderr, "Error linking program:\n%s\n", info.data());
        }
        glDeleteProgram(program);
        program = 0;
        return false;
    }
    return true;
}

}
}
