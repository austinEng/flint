#pragma once
#include <array>
#include <memory>
#include <threading/Worker.h>

struct CreateGeometry {
    static const char* GetName() {
        return "CreateGeometry";
    }

    static threading::WorkerBase::WorkerResponse createSphereBuffer(void* data, int size, void* arg);
};

#ifdef __EMSCRIPTEN__
EXPORT_WORKER_FUNCTION(CreateGeometry, createSphereBuffer)
#endif
