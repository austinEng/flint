
#pragma once

#include <array>
#include <vector>

namespace flint {
namespace geometry {

class GeometryBuffer {
public:
    using Index = unsigned int;
    using Triangle = std::array<Index, 3>;
    using TriangleList = std::vector<Triangle>;

    template <typename T>
    using VertexList = std::vector<T>;
};

}
}
