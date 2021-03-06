#pragma once

#include "GL.h"

namespace flint {
namespace viewport {

class Window {
public:
    Window() = delete;
    Window(const char* name, int width, int height);
    ~Window();
    uint64_t GetFrameNumber() const;
    bool ShouldClose() const;
    void Close();
    void SwapBuffers();
    GLFWwindow* GetGLFWWindow() const;
    void FrameLoop(void (*callback)(void*));

private:
    GLFWwindow* glfwWindow = nullptr;
    uint64_t frameNumber = 0;
    bool shouldClose = false;
};

}

}
