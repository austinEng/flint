
#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#include <chrono>
#include <thread>
#endif

#include <stdio.h>
#include <stdlib.h>

#include <flint/System.h>
#include "Window.h"

static void printError(int error, const char* message) {
    fprintf(stderr, "Error: %s\n", message);
}

namespace flint {
namespace viewport {

Window::Window(const char* name, int width, int height) {
    glfwSetErrorCallback(printError);
    if (!glfwInit()) {
        fputs("Failed to initialize GLFW", stderr);
        flint::Exit(EXIT_FAILURE);
    }

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);

    glfwWindow = glfwCreateWindow(width, height, name, nullptr, nullptr);

    if (!glfwWindow) {
        fputs("Failed to create GLFW window", stderr);
        glfwTerminate();
        flint::Exit(EXIT_FAILURE);
    }

    glfwMakeContextCurrent(glfwWindow);

#ifndef __EMSCRIPTEN__
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        fputs("Failed to initialize OpenGL context", stderr);
        flint::Exit(EXIT_FAILURE);
    }
#endif
}

Window::~Window() {
    if (glfwWindow) {
        glfwDestroyWindow(glfwWindow);
    }
    glfwTerminate();
}

uint64_t Window::GetFrameNumber() const {
    return frameNumber;
}

bool Window::ShouldClose() const {
    return shouldClose;
}

void Window::Close() {
    shouldClose = true;
}

void Window::SwapBuffers() {
    glfwSwapBuffers(glfwWindow);
    frameNumber++;
}

GLFWwindow* Window::GetGLFWWindow() const {
    return glfwWindow;
}

void Window::FrameLoop(void(*callback)(void*)) {
#ifdef __EMSCRIPTEN__
    emscripten_set_main_loop_arg(callback, this, 0, 0);
#else
    while (!glfwWindowShouldClose(glfwWindow) && !shouldClose) {
        using namespace std::chrono;
        auto t0 = high_resolution_clock::now();
        glfwPollEvents();
        callback(this);
        SwapBuffers();
        auto t1 = high_resolution_clock::now();
        auto ms = duration_cast<milliseconds>(t1 - t0);
        auto remaining = ms >= milliseconds(16) ? milliseconds(0) : milliseconds(16) - ms;
        std::this_thread::sleep_for(remaining);
    }
#endif
}

}
}
