#include <cstdlib>
#include <cmath>
#include <flint/core/Math.h>
#include <flint_viewport/Window.h>

using namespace flint;

static float frequency = 0.01f;

static void resizeCallback(GLFWwindow* window, int width, int height) {
    glViewport(0, 0, width, height);
}

static void frame(void* ptr) {
    viewport::Window* window = reinterpret_cast<viewport::Window*>(ptr);
    float r = static_cast<float>(std::sin(static_cast<double>(window->GetFrameNumber()) * 2 * kPI * frequency) * 0.5f + 0.5);
    float g = static_cast<float>(std::sin(static_cast<double>(window->GetFrameNumber()) * 2 * kPI * frequency + 2 * kPI / 3) * 0.5f + 0.5);
    float b = static_cast<float>(std::sin(static_cast<double>(window->GetFrameNumber()) * 2 * kPI * frequency + 2 * 2 * kPI / 3) * 0.5f + 0.5);

    glClearColor(r, g, b, 1.f);
    glClear(GL_COLOR_BUFFER_BIT);
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

    viewport::Window window("Window Test", width, height);
    glfwSetWindowSizeCallback(window.GetGLFWWindow(), resizeCallback);
    {
        int width, height;
        glfwGetFramebufferSize(window.GetGLFWWindow(), &width, &height);
        resizeCallback(window.GetGLFWWindow(), width, height);
    }
    window.FrameLoop(frame);

    return 0;
}
