#pragma once
#include "Camera.h"

namespace flint {
namespace core {

struct FrameState {
    Camera<float> camera;
    unsigned int width;
    unsigned int height;
    uint64_t frameNumber = 0;
};

}
}
