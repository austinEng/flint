// https://github.com/AnalyticalGraphicsInc/cesium/blob/master/Source/Core/CullingVolume.js

#pragma once
#include <array>
#include <stdint.h>
#include "AxisAlignedBox.h"

namespace flint {
namespace core {

using PlaneMask = uint32_t;
constexpr PlaneMask CullingMaskInside = 0x00000000;
constexpr PlaneMask CullingMaskOutside = 0xffffffff;
constexpr PlaneMask CullingMaskIndeterminate = 0x7fffffff;

template <int D, unsigned int N, typename T>
class CullingVolume {
    std::array<Eigen::Matrix<T, D + 1, 1>, N> planes;

public:

    CullingVolume(const std::array<Eigen::Matrix<T, 4, 1>, N> &planes) : planes(planes) {

    }

    PlaneMask ComputeVisibility(const AxisAlignedBox<D, T> &box, PlaneMask parentMask = CullingMaskIndeterminate) const {
        if (parentMask == CullingMaskInside || parentMask == CullingMaskOutside) {
            // parent is completely outside or completely inside, so this child is as well.
            return parentMask;
        }

        PlaneMask mask = CullingMaskInside;

        for (uint32_t k = 0; k < N; ++k) {
            uint32_t flag = (k < 31) ? (1 << k) : 0;
            if (k < 31 && (parentMask & flag) == 0) {
                // boundingVolume is known to be INSIDE this plane.
                continue;
            }

            auto diag = box.max() - box.min();
            auto center = ((box.max() + box.min()) * 0.5).matrix().eval();
            auto h = (diag * 0.5f).eval();
            T planeDistance = planes[k][D];
            auto planeNormal = planes[k].template topRows<D>().eval();
            auto e = planeNormal.array().abs().matrix().dot(h.matrix());
            auto s = center.dot(planeNormal) + planeDistance;

            if (s - e > 0) {
                // inside
            } else if (s + e < 0) {
                // outside
                return CullingMaskOutside;
            } else {
                // intersecting
                mask |= flag;
            }
        }

        return mask;
    }
};

}
}
