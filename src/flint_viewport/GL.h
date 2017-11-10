#pragma once

#ifdef __EMSCRIPTEN__
#define GLFW_INCLUDE_ES3
#else
#include <glad/glad.h>
#endif
#include <GLFW/glfw3.h>
