
#include "module.h"

threading::WorkerBase::WorkerResponse TestModule::test(void* data, int size, void* arg) {
    return { data, size };
}

threading::WorkerBase::WorkerResponse TestModule::test2(void* data, int size, void* arg) {
    return { data, size };
}
