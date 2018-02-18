#pragma once
#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#include <emscripten/html5.h>
#endif
#include "GL.h"
#include <array>
#include <functional>
#include "flint/core/Camera.h"

namespace flint {
namespace viewport {

template <typename T>
class CameraControls {
    private:
        static core::Camera<T>* currentCamera;

#ifdef __EMSCRIPTEN__
        static int mouseButtonCallback(int eventType, const EmscriptenMouseEvent* e, void *userData) {
            return 1;
        }

        static int cursorPosCallback(int eventType, const EmscriptenMouseEvent* e, void *userData) {
            static double oldX, oldY;
            float dX = static_cast<float>(e->canvasX - oldX);
            float dY = static_cast<float>(e->canvasY - oldY);
            oldX = e->canvasX;
            oldY = e->canvasY;

            if ((e->buttons & 4) == 4 || (e->buttons & 3) == 3) {
                currentCamera->Pan(-dX * 0.002f, dY * 0.002f);
            } else if ((e->buttons & 1) == 1) {
                currentCamera->Rotate(dX * -0.01f, dY * 0.01f);
            } else if ((e->buttons & 2) == 2) {
                currentCamera->Move({ 0, 0, dY * 0.2f });
            }
            return 0;
        }

        static int scrollCallback(int eventType, const EmscriptenWheelEvent* e, void *userData) {
            currentCamera->Zoom(static_cast<float>(e->deltaY) * -0.0025f);
            return 0;
        }

        static void SetCallbacks(GLFWwindow* window) {
            emscripten_set_mousedown_callback(0, 0, 1, &CameraControls::mouseButtonCallback);
            emscripten_set_mousemove_callback(0, 0, 1, &CameraControls::cursorPosCallback);
            emscripten_set_wheel_callback(0, 0, 1, &CameraControls::scrollCallback);
            EM_ASM(
              Module.canvas.addEventListener('contextmenu', function(e) {
                e.preventDefault();
              }, false);
            );
        }
#else
        static std::array<bool, GLFW_MOUSE_BUTTON_LAST + 1> buttons;

        static void mouseButtonCallback(GLFWwindow*, int button, int action, int) {
            buttons[button] = (action == GLFW_PRESS);
        }

        static void cursorPosCallback(GLFWwindow*, double mouseX, double mouseY) {
            static double oldX, oldY;
            float dX = static_cast<float>(mouseX - oldX);
            float dY = static_cast<float>(mouseY - oldY);
            oldX = mouseX;
            oldY = mouseY;

            if (buttons[2] || (buttons[0] && buttons[1])) {
                currentCamera->Pan(-dX * 0.002f, dY * 0.002f);
            } else if (buttons[0]) {
                currentCamera->Rotate(dX * -0.01f, dY * 0.01f);
            } else if (buttons[1]) {
                currentCamera->Move({ 0, 0, dY * 0.2f });
            }
        }

        static void scrollCallback(GLFWwindow*, double, double yOffset) {
            currentCamera->Zoom(static_cast<float>(yOffset) * 0.04f);
        }

        static void SetCallbacks(GLFWwindow* window) {
            glfwSetMouseButtonCallback(window, &CameraControls::mouseButtonCallback);
            glfwSetCursorPosCallback(window, &CameraControls::cursorPosCallback);
            glfwSetScrollCallback(window, &CameraControls::scrollCallback);
        }
#endif
        core::Camera<T>& camera;
        GLFWwindow* window;

    public:
        CameraControls(core::Camera<T>& camera, GLFWwindow* window) : camera(camera), window(window) {
        }

        void SetCurrent() {
            currentCamera = &camera;
            SetCallbacks(window);
        }
};

#ifdef __EMSCRIPTEN__
#else
template <typename T>
std::array<bool, GLFW_MOUSE_BUTTON_LAST + 1> CameraControls<T>::buttons = { 0 };
#endif

template <typename T>
core::Camera<T>* CameraControls<T>::currentCamera = nullptr;

}
}
