
#include <flint/geometry/SphereBuffer.h>
#include "module.h"

using namespace flint::geometry;

threading::WorkerBase::WorkerResponse CreateGeometry::createSphereBuffer(void* data, int size, void* arg) {
    SphereBuffer<3>::CreateArgs* args = reinterpret_cast<SphereBuffer<3>::CreateArgs*>(data);
    GeometryBuffer buffer = SphereBuffer<3>::Create(args);
    return { const_cast<void*>(reinterpret_cast<const void*>(buffer.GetBuffer())), static_cast<int>(buffer.ByteLength()) };
}

WORKER_MAIN(CreateGeometry, {
    return 0;
})