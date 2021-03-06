#pragma once
#include <array>
#include <memory>
#include <threading/Worker.h>

struct TerrainGenerator {
    static const char* GetName() {
        return "TerrainGenerator";
    }

    struct UpdateResponse {
        size_t serializedResourceCommandsStart;
        size_t serializedDrawCommandsStart;
        size_t serializedResourceCommandsSize;
        size_t serializedDrawCommandsSize;
    };

    static threading::WorkerBase::WorkerResponse Update(void* data, int size, void* arg);
    static threading::WorkerBase::WorkerResponse UpdateFreeze(void* data, int size, void* arg);
    static threading::WorkerBase::WorkerResponse UpdateShowBoundingBoxes(void* data, int size, void* arg);
    static threading::WorkerBase::WorkerResponse UpdateShowTerrain(void* data, int size, void* arg);
    static threading::WorkerBase::WorkerResponse UpdateDrawWireframe(void* data, int size, void* arg);

    static int Main(int argc, char** argv, threading::Worker<TerrainGenerator>* worker = nullptr);
};

#ifdef __EMSCRIPTEN__
EXPORT_WORKER_FUNCTION(TerrainGenerator, Update)
EXPORT_WORKER_FUNCTION(TerrainGenerator, UpdateFreeze)
EXPORT_WORKER_FUNCTION(TerrainGenerator, UpdateShowBoundingBoxes)
EXPORT_WORKER_FUNCTION(TerrainGenerator, UpdateShowTerrain)
EXPORT_WORKER_FUNCTION(TerrainGenerator, UpdateDrawWireframe)
#endif
