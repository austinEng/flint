
#pragma once

#include "FixedPolygon.h"

namespace flint {
namespace geometry {

template <unsigned int D, typename T = precision_t>
class Quad : public FixedPolygon<4, D, T> {
    public:
        Quad(const std::array<Eigen::Matrix<T, D, 1>, 4> &points) : FixedPolygon<4, D, T>(points) {

        }
};

}
}
