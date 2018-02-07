#pragma once
#include "Camera.h"

namespace flint {
namespace core {

struct FrameState {
    unsigned int width;
    unsigned int height;
    Camera<float> camera;
};

}
}
