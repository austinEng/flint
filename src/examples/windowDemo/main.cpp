
#include <cstdlib>
#include <cmath>
#include <flint/core/Math.h>
#include <flint_viewport/Window.h>

using namespace flint;

static float frequency = 1.0f;

static void resizeCallback(GLFWwindow* window, int width, int height) {
    glViewport(0, 0, width, height);
}

static void frame(void* ptr) {
    viewport::Window* window = reinterpret_cast<viewport::Window*>(ptr);

    glfwPollEvents();

    float r = static_cast<float>(std::sin(static_cast<double>(window->GetFrameNumber()) * 2 * kPI * frequency / 60) * 0.5f + 0.5);
    float g = static_cast<float>(std::sin(static_cast<double>(window->GetFrameNumber()) * 2 * kPI * frequency / 60 + 2 * kPI / 3) * 0.5f + 0.5);
    float b = static_cast<float>(std::sin(static_cast<double>(window->GetFrameNumber()) * 2 * kPI * frequency / 60 + 2 * 2 * kPI / 3) * 0.5f + 0.5);

    glClearColor(r, g, b, 1.f);
    glClear(GL_COLOR_BUFFER_BIT);

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

    viewport::Window window("Window Demo", width, height);
    glViewport(0, 0, width, height);
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
