
#pragma once

#include "Ray.h"

namespace flint {
namespace intersection {

enum IntersectionOptions {
    Nearest = 1 << 0,
    Farthest = 1 << 1,
    Count = 1 << 2,
};

template <int N, IntersectionOptions Options>
struct IntersectionInfoGroup : public Eigen::Matrix<float, N, (Options & IntersectionOptions::Nearest) + (Options & IntersectionOptions::Farthest) + 1> {

    using Base = Eigen::Matrix<float, N, (Options & IntersectionOptions::Nearest) + (Options & IntersectionOptions::Farthest) + 1>;

    static constexpr unsigned int kNearIndex = 0;
    static constexpr unsigned int kFarIndex = kNearIndex + (Options & IntersectionOptions::Nearest);
    static constexpr unsigned int kCountIndex = kFarIndex + (Options & IntersectionOptions::Farthest);
    static constexpr unsigned int kColumns = kCountIndex + 1;

    IntersectionInfoGroup() : Base(Base::Zero()) { }
    IntersectionInfoGroup(unsigned int size) : Base(Base::Zero(size, 1)) {
    }
};

template <typename Ray, IntersectionOptions _Options>
struct IntersectBase {
    static constexpr IntersectionOptions Options = _Options;

    template <int N>
    using IntersectionInfoGroup = intersection::IntersectionInfoGroup<N, Options>;
};

}
}
