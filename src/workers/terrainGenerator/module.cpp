#include <flint/core/FrameState.h>
#include <flint/core/AxisAlignedBox.h>
#include <steel/tileset/Tileset.h>
#include <steel/tileset/TerrainTileset.h>
#include <steel/rendering/gl/Commands.h>
#include <steel/rendering/gl/CommandBuffer.h>
#include "module.h"
#include <iostream>
#include <vector>

using namespace flint;
using namespace steel;
using namespace steel::rendering;
using namespace steel::rendering::gl;

static core::FrameState frameState;
static tileset::TerrainTileset* terrainTileset;

static uint8_t* serializedResourceCommands = nullptr;
static uint8_t* serializedDrawCommands = nullptr;
static size_t serializedCommandsSize = 0;
static CommandBuffer* resourceCommandBuffer = nullptr;
static CommandBuffer* drawCommandBuffer = nullptr;
static std::vector<uint8_t> updateResponseBuffer;

static void UpdateTileset() {

}

threading::WorkerBase::WorkerResponse TerrainGenerator::Update(void* data, int size, void* arg) {
    assert(size == sizeof(core::FrameState));
    if (!resourceCommandBuffer || !drawCommandBuffer) {
        return { nullptr, 0 };
    }

    frameState = *reinterpret_cast<core::FrameState*>(data);
    frameState.camera.ComputeCullingVolume();

    resourceCommandBuffer->Reset();
    drawCommandBuffer->Reset();
    terrainTileset->Update(frameState, resourceCommandBuffer);
    terrainTileset->Draw(frameState, drawCommandBuffer);

    delete serializedResourceCommands;
    delete serializedDrawCommands;

    size_t serializedResourceCommandsSize, serializedDrawCommandsSize;
    resourceCommandBuffer->Allocator()->Serialize(&serializedResourceCommands, &serializedResourceCommandsSize);
    drawCommandBuffer->Allocator()->Serialize(&serializedDrawCommands, &serializedDrawCommandsSize);

    uint8_t* ptr = 0;
    ptr = core::Align<alignof(std::max_align_t)>(ptr + sizeof(UpdateResponse));
    uint8_t* serializedResourceCommandsStart = ptr;
    ptr = core::Align<alignof(std::max_align_t)>(ptr + serializedResourceCommandsSize);
    uint8_t* serializedDrawCommandsStart = ptr;
    ptr = ptr + serializedDrawCommandsSize;

    updateResponseBuffer.resize(reinterpret_cast<size_t>(ptr));
    auto* response = reinterpret_cast<UpdateResponse*>(updateResponseBuffer.data());
    response->serializedResourceCommandsStart = reinterpret_cast<size_t>(serializedResourceCommandsStart);
    response->serializedDrawCommandsStart = reinterpret_cast<size_t>(serializedDrawCommandsStart);
    response->serializedResourceCommandsSize = serializedResourceCommandsSize;
    response->serializedDrawCommandsSize = serializedDrawCommandsSize;
    memcpy(&updateResponseBuffer[response->serializedResourceCommandsStart], serializedResourceCommands, serializedResourceCommandsSize);
    memcpy(&updateResponseBuffer[response->serializedDrawCommandsStart], serializedDrawCommands, serializedDrawCommandsSize);

    return { updateResponseBuffer.data(), static_cast<int>(updateResponseBuffer.size()) };
}

WORKER_MAIN(TerrainGenerator, {
    terrainTileset = new tileset::TerrainTileset();
    resourceCommandBuffer = new CommandBuffer();
    drawCommandBuffer = new CommandBuffer();
    worker->SetLoop(UpdateTileset, 30);
    return 0;
})
