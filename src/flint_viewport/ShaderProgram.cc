#include <string>
#include <stdio.h>
#include "ShaderProgram.h"

namespace flint {
namespace viewport {

ShaderProgram::ShaderProgram() : program(0) {

}

ShaderProgram::~ShaderProgram() {
    glDeleteProgram(program);
}

GLuint ShaderProgram::GetGLProgram() const {
    return program;
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
