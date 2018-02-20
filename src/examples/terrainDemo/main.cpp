#include <iostream>
#include <list>
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
static flint::viewport::Renderer renderer(&frameState);
static flint::rendering::CommandBlock* terrainCommands = nullptr;
static std::list<std::pair<flint::rendering::CommandBlock*, std::vector<uint8_t>>> commandQueue;

static void resizeCallback(GLFWwindow* window, int width, int height) {
    glViewport(0, 0, width, height);
    frameState.width = width;
    frameState.height = height;
    frameState.camera.SetAspectRatio(static_cast<float>(width) / static_cast<float>(height));
}

static void frame(void* ptr) {
    viewport::Window* window = reinterpret_cast<viewport::Window*>(ptr);

    glfwPollEvents();

    while (commandQueue.size() > 0) {
        auto* commands = commandQueue.front().first;
        renderer.ExecuteCommands(commands);
        commandQueue.pop_front();
    }

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    if (terrainCommands) {
        renderer.ExecuteCommands(terrainCommands);
    }

    window->SwapBuffers();

    frameState.camera.Move({ 0, 0, 5 });

    static bool generating = false;
    if (!generating) {
        generating = true;
        terrainGenerator.Call<&TerrainGenerator::Update>(&frameState, sizeof(core::FrameState), nullptr, [](void* data, int size, void* arg) {
            using namespace flint::rendering;
            using namespace flint::rendering::gl;

            static std::vector<uint8_t> dest[2];
            static uint32_t d = 0;

            if (data) {
                uint8_t* bytes = reinterpret_cast<uint8_t*>(data);
                auto* response = reinterpret_cast<TerrainGenerator::UpdateResponse*>(bytes);
                auto* resourceCommandsData = bytes + response->serializedResourceCommandsStart;
                auto* drawCommandsData = bytes + response->serializedDrawCommandsStart;

                // Resources are immediately modified
                //auto* resourceCommands = CommandBlock::Deserialize(resourceCommandsData, response->serializedResourceCommandsSize);
                //renderer.ExecuteCommands(resourceCommands);
                
                std::vector<uint8_t> resourceCommandsBuffer(response->serializedResourceCommandsSize);
                memcpy(&resourceCommandsBuffer[0], resourceCommandsData, response->serializedResourceCommandsSize);
                auto* resourceCommands = CommandBlock::Deserialize(&resourceCommandsBuffer[0], response->serializedResourceCommandsSize);
                commandQueue.emplace_back(resourceCommands, std::move(resourceCommandsBuffer));

                //auto& resourceCommandsBuffer = commandQueue.back().second;
                //std::copy(resourceCommandsData, resourceCommandsData + response->serializedResourceCommandsSize, commandQueue.back().second.begin());
                
                //commandQueue.back().first = CommandBlock::Deserialize(&resourceCommandsBuffer[0], response->serializedResourceCommandsSize);
                
                // auto* resourceCommands = reinterpret_cast<CommandBlock*>(bytes + response->serializedResourceCommandsStart);
                // auto* drawCommands = reinterpret_cast<CommandBlock*>(bytes + response->serializedDrawCommandsStart);

                // auto* commands = CommandBlock::Deserialize(reinterpret_cast<uint8_t*>(data), size);
                
                
                dest[d].resize(response->serializedDrawCommandsSize);
                std::copy(drawCommandsData, drawCommandsData + response->serializedDrawCommandsSize, dest[d].begin());
                terrainCommands = flint::rendering::CommandBlock::Deserialize(&dest[d][0], response->serializedDrawCommandsSize);
                d = 1 - d;
            }
            generating = false;
        });
    }

    frameState.frameNumber++;
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

    frameState.camera.SetNearFar(0.1, 20000.0f);
    frameState.camera.SetAltitude(0);
    frameState.camera.SetAzimuth(static_cast<float>(kPI/6.0));
    frameState.camera.SetDistance(100);
    frameState.camera.SetAspectRatio(static_cast<float>(width) / static_cast<float>(height));
    frameState.camera.LookAt({ 0, 0, 0 });
    frameState.camera.Move({ 0, 10, 0 });

    viewport::CameraControls<float> controls(frameState.camera, window.GetGLFWWindow());
    controls.SetCurrent();
    cameraControls = &controls;

    window.FrameLoop(frame);

    return 0;
}
