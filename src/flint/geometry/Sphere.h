
#pragma once

#include <numeric>
#include <Eigen/Dense>
#include "Geometry.h"

namespace flint {
namespace geometry {

class SphereBase { };

template <unsigned int D, typename T = precision_t>
class Sphere : public Geometry<D, T>, SphereBase {

    protected:
        Eigen::Matrix<T, D, 1> center;
        T radius;

    public:

        Sphere(const Eigen::Matrix<T, D, 1> &center, T radius) : center(center), radius(radius) {
        }

        const Eigen::Matrix<T, D, 1>& getCenter() const {
            return center;
        }

        T getRadius() const {
            return radius;
        }

        core::Optional<core::AxisAlignedBox<D, T>> getAxisAlignedBound() const override {
            core::Optional<core::AxisAlignedBox<D, T>> bound;
            bound.set(core::AxisAlignedBox<D, T>(center.array() - radius, center.array() + radius));
            return bound;
        }

        core::Optional<Eigen::Matrix<T, D, 1>> getCentroid() const override {
            core::Optional<Eigen::Matrix<T, D, 1>> centroid;
            centroid.set(center);
            return centroid;
        }

        virtual ~Sphere() {

        }
};

}
}
