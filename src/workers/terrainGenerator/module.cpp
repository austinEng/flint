#include <flint/core/FrameState.h>
#include <flint/core/AxisAlignedBox.h>
#include <flint/tileset/Tileset.h>
#include <flint/tileset/TerrainTileset.h>
#include <flint/rendering/gl/Commands.h>
#include <flint/rendering/gl/CommandBuffer.h>
#include "module.h"
#include <iostream>
#include <vector>

using namespace flint;
using namespace flint::rendering;
using namespace flint::rendering::gl;

static core::FrameState frameState;
static tileset::TerrainTileset* terrainTileset;

static uint8_t* serializedCommands = nullptr;
static size_t serializedCommandsSize = 0;
static bool commandsUpdated = false;
static CommandBuffer* commandBuffer = nullptr;

static void UpdateTileset() {
    if (!commandBuffer) {
        return;
    }

    commandBuffer->Reset();
    frameState.camera.ComputeCullingVolume();
    terrainTileset->Update(frameState, commandBuffer);
    terrainTileset->Draw(frameState, commandBuffer);

    delete serializedCommands;
    commandBuffer->Allocator()->Serialize(&serializedCommands, &serializedCommandsSize);
    commandsUpdated = true;
}

threading::WorkerBase::WorkerResponse TerrainGenerator::Update(void* data, int size, void* arg) {
    assert(size == sizeof(core::FrameState));
    frameState = *reinterpret_cast<core::FrameState*>(data);

    if (commandsUpdated) {
        commandsUpdated = false;
        terrainTileset->Commit();
        return { serializedCommands, static_cast<int>(serializedCommandsSize) };
    } else {
        return { nullptr, 0 };
    }
}

WORKER_MAIN(TerrainGenerator, {
    terrainTileset = new tileset::TerrainTileset();
    commandBuffer = new CommandBuffer();
    worker->SetLoop(UpdateTileset, 90);
    return 0;
})
