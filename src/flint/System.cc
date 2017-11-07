#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#endif

#include <cstdlib>
#include "System.h"

namespace flint {

void Exit(int status) {
    #ifdef __EMSCRIPTEN__
        emscripten_force_exit(status);
    #else
        exit(status);
    #endif
}

}
