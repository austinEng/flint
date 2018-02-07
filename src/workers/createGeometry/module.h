#pragma once
#include <array>
#include <memory>
#include <threading/Worker.h>

struct CreateGeometry {
    static const char* GetName() {
        return "CreateGeometry";
    }

    static threading::WorkerBase::WorkerResponse createSphereBuffer(void* data, int size, void* arg);

    static int Main(int argc, char** argv, threading::Worker<CreateGeometry>* worker = nullptr);
};

#ifdef __EMSCRIPTEN__
EXPORT_WORKER_FUNCTION(CreateGeometry, createSphereBuffer)
#endif
