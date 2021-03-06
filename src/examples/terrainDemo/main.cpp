#include <iostream>
#include <list>
#include <vector>
#include <flint/core/FrameState.h>
#include <flint_viewport/Window.h>
#include <flint_viewport/CameraControls.h>
#include <flint_viewport/Renderer.h>
#include <flint_viewport/Shader.h>
#include <flint_viewport/ShaderProgram.h>
#include <steel/rendering/gl/Commands.h>
#include <steel/rendering/gl/CommandBuffer.h>
#include <steel/tileset/TerrainTileset.h>
#include "../workers/terrainGenerator/module.h"

using namespace flint;
using namespace steel;
using namespace steel::rendering;
using namespace steel::rendering::gl;

static bool traverseMainThread = false;

static core::FrameState frameState;
static viewport::CameraControls<float>* cameraControls;
static threading::Worker<TerrainGenerator>* terrainGenerator = nullptr;
static flint::viewport::Renderer renderer(&frameState);
static CommandBlock* terrainCommands = nullptr;
static std::list<std::pair<CommandBlock*, std::vector<uint8_t>>> commandQueue;

extern tileset::TerrainTileset* InitTerrainTileset();
static tileset::TerrainTileset* terrainTileset = nullptr;
static CommandBuffer* commandBuffer = nullptr;

static bool freeze = false;
static bool _freeze = freeze;
static bool autoCamera = true;
static bool showBoundingBoxes = false;
static bool _showBoundingBoxes = showBoundingBoxes;
static bool showTerrain = true;
static bool _showTerrain = showTerrain;
static bool drawWireframe = false;
static bool _drawWireframe = drawWireframe;

static void resizeCallback(GLFWwindow* window, int width, int height) {
    glViewport(0, 0, width, height);
    frameState.width = width;
    frameState.height = height;
    frameState.camera.SetAspectRatio(static_cast<float>(width) / static_cast<float>(height));
}

static void frame(void* ptr) {
    viewport::Window* window = reinterpret_cast<viewport::Window*>(ptr);

    glfwPollEvents();

    if (autoCamera) {
        frameState.camera.Rotate(-.5f * 3.14159f / 180.f, 0);
        auto cameraForward = frameState.camera.GetForward();
        cameraForward[1] = 0.f;
        cameraForward.normalize();
        frameState.camera.MoveGlobal(cameraForward * 300.f);

        auto cameraPos0 = frameState.camera.GetPosition();
        auto cameraPos1 = cameraPos0 +  50.f * cameraForward;
        auto cameraPos2 = cameraPos0 + 100.f * cameraForward;
        auto cameraPos3 = cameraPos0 + 150.f * cameraForward;

        auto sample0 = terrainTileset->SampleTerrain(cameraPos0[0], cameraPos0[2], 0);
        auto sample1 = terrainTileset->SampleTerrain(cameraPos1[0], cameraPos1[2], 0);
        auto sample2 = terrainTileset->SampleTerrain(cameraPos2[0], cameraPos2[2], 0);
        auto sample3 = terrainTileset->SampleTerrain(cameraPos3[0], cameraPos3[2], 0);

        float newHeight = std::max(std::max(std::max(sample0.height, sample1.height), sample2.height), sample3.height) + 5000.f;

        constexpr float falloff = 0.95f;
        frameState.camera.SetPosition({ cameraPos0[0], cameraPos0[1] * falloff + newHeight * (1.f - falloff), cameraPos0[2] });
    }

    if (freeze != _freeze) {
        freeze = _freeze;
        terrainGenerator->Call<&TerrainGenerator::UpdateFreeze>(&freeze, sizeof(freeze));
    }

    if (showBoundingBoxes != _showBoundingBoxes) {
        showBoundingBoxes = _showBoundingBoxes;
        terrainGenerator->Call<&TerrainGenerator::UpdateShowBoundingBoxes>(&showBoundingBoxes, sizeof(showBoundingBoxes));
    }

    if (showTerrain != _showTerrain) {
        showTerrain = _showTerrain;
        terrainGenerator->Call<&TerrainGenerator::UpdateShowTerrain>(&showTerrain, sizeof(showTerrain));
    }

    if (drawWireframe != _drawWireframe) {
        drawWireframe = _drawWireframe;
        terrainGenerator->Call<&TerrainGenerator::UpdateDrawWireframe>(&drawWireframe, sizeof(drawWireframe));
    }

    if (traverseMainThread) {
        frameState.camera.ComputeCullingVolume();

        commandBuffer->Reset();
        terrainTileset->Update(frameState, commandBuffer);
        terrainTileset->Draw(frameState, commandBuffer);

        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        renderer.ExecuteCommands(commandBuffer->Allocator()->GetBlocks());

    } else {
        while (commandQueue.size() > 0) {
            auto* commands = commandQueue.front().first;
            renderer.ExecuteCommands(commands);
            commandQueue.pop_front();
        }

        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        if (terrainCommands) {
            renderer.ExecuteCommands(terrainCommands);
        }

        static bool generating = false;
        if (!generating) {
            generating = true;
            terrainGenerator->Call<&TerrainGenerator::Update>(&frameState, sizeof(core::FrameState), nullptr, [](void* data, int size, void* arg) {
                static std::vector<uint8_t> dest[2];
                static uint32_t d = 0;

                if (data) {
                    uint8_t* bytes = reinterpret_cast<uint8_t*>(data);
                    auto* response = reinterpret_cast<TerrainGenerator::UpdateResponse*>(bytes);
                    auto* resourceCommandsData = bytes + response->serializedResourceCommandsStart;
                    auto* drawCommandsData = bytes + response->serializedDrawCommandsStart;

                    std::vector<uint8_t> resourceCommandsBuffer(response->serializedResourceCommandsSize);
                    memcpy(&resourceCommandsBuffer[0], resourceCommandsData, response->serializedResourceCommandsSize);
                    auto* resourceCommands = CommandBlock::Deserialize(&resourceCommandsBuffer[0], response->serializedResourceCommandsSize);
                    commandQueue.emplace_back(resourceCommands, std::move(resourceCommandsBuffer));

                    dest[d].resize(response->serializedDrawCommandsSize);
                    std::copy(drawCommandsData, drawCommandsData + response->serializedDrawCommandsSize, dest[d].begin());
                    terrainCommands = CommandBlock::Deserialize(&dest[d][0], response->serializedDrawCommandsSize);
                    d = 1 - d;
                }
                generating = false;
            });
        }
    }

    window->SwapBuffers();

    frameState.frameNumber++;
}

int main(int argc, char** argv) {
    int width, height;
    if (argc < 3) {
        width = 1200;
        height = 800;
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

    frameState.camera.SetNearFar(0.1f, 40000.0f);
    frameState.camera.SetAltitude(static_cast<float>(kPI/12.0));
    frameState.camera.SetAzimuth(static_cast<float>(kPI/6.0));
    frameState.camera.SetDistance(0.01);
    frameState.camera.SetAspectRatio(static_cast<float>(width) / static_cast<float>(height));
    frameState.camera.LookAt({ 0, 0, 0 });

    viewport::CameraControls<float> controls(frameState.camera, window.GetGLFWWindow());
    controls.SetCurrent();
    cameraControls = &controls;

    commandBuffer = new CommandBuffer();

    terrainTileset = InitTerrainTileset();
    terrainGenerator = new threading::Worker<TerrainGenerator>();

    window.FrameLoop(frame);

    return 0;
}

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>

// Define JavaScript bindings
extern "C" {
    EMSCRIPTEN_KEEPALIVE
    void updateFreeze(unsigned int value) {
        _freeze = static_cast<bool>(value);
    }

    EMSCRIPTEN_KEEPALIVE
    void updateAutoCamera(unsigned int value) {
        autoCamera = static_cast<bool>(value);
    }

    EMSCRIPTEN_KEEPALIVE
    void updateShowBoundingBoxes(unsigned int value) {
        _showBoundingBoxes = static_cast<bool>(value);
    }

    EMSCRIPTEN_KEEPALIVE
    void updateShowTerrain(unsigned int value) {
        _showTerrain = static_cast<bool>(value);
    }

    EMSCRIPTEN_KEEPALIVE
    void updateDrawWireframe(unsigned int value) {
        _drawWireframe = static_cast<bool>(value);
    }

    EMSCRIPTEN_KEEPALIVE
    void updateTraverseMainThread(unsigned int value) {
        traverseMainThread = static_cast<bool>(value);
    }
}

#endif
