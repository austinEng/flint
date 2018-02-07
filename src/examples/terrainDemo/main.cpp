#include <iostream>
#include <flint/core/FrameState.h>
#include <flint_viewport/Window.h>
#include <flint_viewport/CameraControls.h>
#include <flint_viewport/Renderer.h>
#include <flint_viewport/Shader.h>
#include <flint_viewport/ShaderProgram.h>
#include <flint/rendering/gl/Commands.h>
#include <flint/rendering/gl/CommandBuffer.h>
#include "../workers/terrainGenerator/module.h"

using namespace flint;
using namespace flint::rendering::gl;

static core::FrameState frameState;
static viewport::CameraControls<float>* cameraControls;
static threading::Worker<TerrainGenerator> terrainGenerator;
static flint::viewport::Renderer renderer;
static flint::rendering::CommandBlock* terrainCommands = nullptr;

static viewport::ShaderProgram shaderProgram;
static GLint viewProjLocation;

static void resizeCallback(GLFWwindow* window, int width, int height) {
    glViewport(0, 0, width, height);
    frameState.width = width;
    frameState.height = height;
    frameState.camera.SetAspectRatio(static_cast<float>(width) / static_cast<float>(height));
}

static void frame(void* ptr) {
    viewport::Window* window = reinterpret_cast<viewport::Window*>(ptr);

    glfwPollEvents();

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glUseProgram(shaderProgram.GetGLProgram());
    glUniformMatrix4fv(viewProjLocation, 1, false, frameState.camera.GetViewProjection().data());

    if (terrainCommands) {
        renderer.ExecuteCommands(terrainCommands);
    }

    window->SwapBuffers();

    frameState.camera.Move({ 0, 0, 1 });

    static bool generating = false;
    if (!generating) {
        generating = true;
        terrainGenerator.Call<&TerrainGenerator::Update>(&frameState, sizeof(core::FrameState), nullptr, [](void* data, int size, void* arg) {
            static std::vector<uint8_t> dest[2];
            static uint32_t d = 0;

            if (data) {
                uint8_t* bytes = reinterpret_cast<uint8_t*>(data);
                dest[d].resize(size);
                std::copy(bytes, bytes + size, dest[d].begin());
                terrainCommands = flint::rendering::CommandBlock::Deserialize(&dest[d][0], size);
                d = 1 - d;
            }
            generating = false;
        });
    }
}

int main(int argc, char** argv) {
    int width, height;
    if (argc < 3) {
        width = 800;
        height = 600;
    } else {
        width = atoi(argv[1]);
        height = atoi(argv[2]);
    }

    frameState.width = width;
    frameState.height = height;

    viewport::Window window("Terrain Demo", width, height);
    glfwSetWindowSizeCallback(window.GetGLFWWindow(), resizeCallback);

    glViewport(0, 0, width, height);
    glClearColor(0.f, 0.f, 0.f, 1.f);
    glEnable(GL_DEPTH_TEST);

    viewport::Shader vertexShader, fragmentShader;
    vertexShader.Load(R"(#version 300 es
        precision highp float;

        layout(location = 0) in vec3 position;
        uniform mat4 viewProj;

        void main() {
            gl_Position = viewProj * vec4(position, 1.0);
        }
    )", GL_VERTEX_SHADER);

    fragmentShader.Load(R"(#version 300 es
        precision highp float;

        out vec4 outColor;

        void main() {
            outColor = vec4(0.8, 0.8, 0.8, 1.0);
        }
    )", GL_FRAGMENT_SHADER);

    shaderProgram.Create(vertexShader, fragmentShader);
    viewProjLocation = glGetUniformLocation(shaderProgram.GetGLProgram(), "viewProj");

    frameState.camera.SetAltitude(0);
    frameState.camera.SetAzimuth(0);
    frameState.camera.SetDistance(-100);
    frameState.camera.SetAspectRatio(static_cast<float>(width) / static_cast<float>(height));
    frameState.camera.LookAt({ 0, 0, 0 });
    frameState.camera.Move({ 0, 100, 0 });

    viewport::CameraControls<float> controls(frameState.camera, window.GetGLFWWindow());
    controls.SetCurrent();
    cameraControls = &controls;

    window.FrameLoop(frame);

    return 0;
}
