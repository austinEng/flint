#include <string>
#include "WireProgram.h"

namespace steel {
namespace shader {

namespace {
    const std::string vertexShader =
R"(#version 300 es
precision highp float;

layout(location = 0) in vec3 position;
uniform mat4 viewProj;
uniform mat4 modelMatrix;

void main() {
    gl_Position = viewProj * modelMatrix * vec4(position, 1.0);
}
)";

    const std::string fragmentShader =
R"(#version 300 es
precision highp float;

uniform vec4 color;
out vec4 outColor;

void main() {
    outColor = color;
}
)";
}

using namespace steel::rendering::gl;

WireProgram::WireProgram() : created(false) {
}

void WireProgram::Create(steel::rendering::gl::CommandBuffer* commands) {
    if (!created) {
        created = true;

        rendering::gl::SerialCounted<rendering::gl::Shader> vertexShaderId(new rendering::gl::Shader);
        rendering::gl::SerialCounted<rendering::gl::Shader> fragmentShaderId(new rendering::gl::Shader);
        program.Create();

        commands->Record<CommandType::CreateShader>(CreateShaderCmd{ vertexShaderId, ShaderType::VERTEX_SHADER, vertexShader.size() });
        commands->RecordData<char>(vertexShader.data(), vertexShader.size());
        commands->Record<CommandType::CreateShader>(CreateShaderCmd{ fragmentShaderId, ShaderType::FRAGMENT_SHADER, fragmentShader.size() });
        commands->RecordData<char>(fragmentShader.data(), fragmentShader.size());
        commands->Record<CommandType::CreateProgram>(CreateProgramCmd{ program, 2 });
        uint32_t shaders[] = { vertexShaderId, fragmentShaderId };
        commands->RecordData<uint32_t>(shaders, 2);
        commands->Record<CommandType::DeleteShader>(DeleteShaderCmd{ vertexShaderId });
        commands->Record<CommandType::DeleteShader>(DeleteShaderCmd{ fragmentShaderId });
    }
}

void WireProgram::Use(steel::rendering::gl::CommandBuffer* commands) {
    commands->Record<CommandType::UseProgram>(UseProgramCmd{ program });
}

}
}
