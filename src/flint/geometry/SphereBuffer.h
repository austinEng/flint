#pragma once

#include <array>
#include <vector>
#include "GeometryBuffer.h"
#include "Sphere.h"

namespace flint {
namespace geometry {

template <unsigned int D, typename T = precision_t>
class SphereBufferBase : public GeometryBuffer {
protected:
    TriangleList triangles;
    VertexList<std::array<T, D>> positions;
    VertexList<std::array<T, D>> normals;
    VertexList<std::array<T, 2>> uvs;
};

template <unsigned int D, typename T = precision_t>
class SphereBuffer {};

template <typename T>
class SphereBuffer<2, T> : public SphereBufferBase<2, T> {
public:
    static SphereBuffer Create(const Sphere<2, T> &sphere) {
        SphereBuffer buffer;
        return buffer;
    }
};

template <typename T>
class SphereBuffer<3, T> : SphereBufferBase<3, T> {
public:
    static SphereBuffer Create(const Sphere<3, T> &sphere) {
        SphereBuffer buffer;
        return buffer;
    }
};

}
}
