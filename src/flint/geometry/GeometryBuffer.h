
#pragma once

#include <Eigen/Dense>
#include <vector>

namespace flint {
namespace geometry {

class GeometryBuffer {
public:
    using Index = unsigned int;
    using Triangle = Eigen::Array<unsigned int, 3, 1>;
    using TriangleList = std::vector<Triangle>;

    template <typename T>
    using VertexList = std::vector<T>;
};

}
}
