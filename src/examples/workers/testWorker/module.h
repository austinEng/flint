#pragma once

#include <threading/Worker.h>

struct TestModule {
    static const char* GetName() {
        return "TestModule";
    }

    static threading::WorkerBase::WorkerResponse test(void* data, int size, void* arg);
    static threading::WorkerBase::WorkerResponse test2(void* data, int size, void* arg);
};

#ifdef __EMSCRIPTEN__
EXPORT_WORKER_FUNCTION(TestModule, test)
EXPORT_WORKER_FUNCTION(TestModule, test2)
#endif
