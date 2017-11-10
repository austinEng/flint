
#include <cstdlib>
#include <cmath>
#include <flint/core/Math.h>
#include <flint/geometry/Sphere.h>
#include <flint/geometry/SphereBuffer.h>
#include <flint_viewport/Window.h>

using namespace flint;

static float frequency = 1.0f;

static void resizeCallback(GLFWwindow* window, int width, int height) {
    glViewport(0, 0, width, height);
}

static void frame(void* ptr) {
    viewport::Window* window = reinterpret_cast<viewport::Window*>(ptr);

    glfwPollEvents();

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    window->SwapBuffers();
}

int main(int argc, char** argv) {
    int width, height;
    if (argc < 3) {
        width = 800;
        height = 600;
    } else {
        width = atoi(argv[1]);
        height = atoi(argv[2]);
    }

    viewport::Window window("Noise Demo", width, height);
    glViewport(0, 0, width, height);
    
    auto sphereBuffer = geometry::SphereBuffer<3>::Create(geometry::Sphere<3>({ 0, 0, 0 }, 10));
    // auto indices = sphere.CreateIndexBuffer();
    // auto positions = sphere.CreatePositionBuffer();

    glClearColor(0.f, 0.f, 0.f, 1.f);
    window.FrameLoop(frame);

    return 0;
}

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>

// Define JavaScript bindings
extern "C" {
    EMSCRIPTEN_KEEPALIVE
    void updateFrequency(float _frequency) {
        frequency = _frequency;
    }
}

#endif
