
#include <flint/geometry/SphereBuffer.h>
#include "module.h"

using namespace flint::geometry;

threading::WorkerBase::WorkerResponse CreateGeometry::createSphereBuffer(void* data, int size, void* arg) {
    SphereBuffer<3>::CreateArgs* args = reinterpret_cast<SphereBuffer<3>::CreateArgs*>(data);
    SphereBuffer<3>::Create(args);

    printf("Created icosphere with %d vertices\n", args->buffer->GetPositions().size());

    return { data, size };
}
