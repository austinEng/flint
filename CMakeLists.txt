project(flint CXX)
cmake_minimum_required(VERSION 2.8.6)
list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")

include(Folders)

option(BUILD_EXAMPLES "Build examples" ON)
option(BUILD_TESTS "Build tests" ON)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if (MSVC)
  add_definitions(-DNOMINMAX -DWIN32_LEAN_AND_MEAN)

  if (CMAKE_BUILD_TYPE MATCHES "Deb")
    add_compile_options(-Wall)
  endif()

  if (CMAKE_BUILD_TYPE MATCHES "Rel")
    add_compile_options(-Ox -Qpar)
  endif()

  if (CMAKE_BUILD_TYPE MATCHES "Info")
    add_compile_options(-Qpar-report=2)
  endif()
else()
  if (CMAKE_BUILD_TYPE MATCHES "Deb")
    add_compile_options(-Wall -g)
  endif()

  if (CMAKE_BUILD_TYPE MATCHES "Rel")
    if (NOT EMSCRIPTEN)
      add_compile_options(-march=native)
    endif()
  endif()

  if (CMAKE_BUILD_TYPE MATCHES "Info")
    if (NOT EMSCRIPTEN)
      add_compile_options(-fopt-info-vec-optimized -fopt-info-inline-optimized -ftree-vectorizer-verbose=2)
    endif()
  endif()
endif()

if (EMSCRIPTEN)
    set(EMSCRIPTEN_MODULE_FLAGS "-s MODULARIZE=1")
    set(EMSCRIPTEN_WORKER_FLAGS "-s BUILD_AS_WORKER=1 -s MODULARIZE=0")

    set(EMSCRIPTEN_FLAGS "-s USE_WEBGL2=1 -s FULL_ES3=1 -s USE_GLFW=3 -s NO_EXIT_RUNTIME=1")

    if (CMAKE_BUILD_TYPE MATCHES "Deb")
      set(EMSCRIPTEN_FLAGS "${EMSCRIPTEN_FLAGS} -s DEMANGLE_SUPPORT=1 -s ASSERTIONS=2 -s SAFE_HEAP=1 -s STACK_OVERFLOW_CHECK=2")
      add_compile_options(-g4)
    endif()

    if (WASM)
        if (CMAKE_BUILD_TYPE MATCHES "Rel")
          add_compile_options(-O3 -ffast-math)
        endif()
        set(EMSCRIPTEN_FLAGS "${EMSCRIPTEN_FLAGS} -s ALLOW_MEMORY_GROWTH=1 -s WASM=1")
    else()
        if (CMAKE_BUILD_TYPE MATCHES "Rel")
          add_compile_options(-O1)
          set(EMSCRIPTEN_FLAGS "${EMSCRIPTEN_FLAGS} --llvm-opts 2 -s ASSERTIONS=2 -s SAFE_HEAP=1 -g")
        endif()
        set(EMSCRIPTEN_FLAGS "${EMSCRIPTEN_FLAGS} -s ALLOW_MEMORY_GROWTH=1 -s EMULATE_FUNCTION_POINTER_CASTS=1 --memory-init-file 1")
    endif()

    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${EMSCRIPTEN_FLAGS}")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} ${EMSCRIPTEN_FLAGS}")
endif()

add_subdirectory(src/threading)
add_subdirectory(src/flint)
add_subdirectory(src/steel)
add_subdirectory(src/flint_viewport)

if (BUILD_TESTS AND NOT EMSCRIPTEN)
    add_subdirectory(src/test)
endif()

if (BUILD_EXAMPLES)
    add_custom_target(flint_examples ALL)
    add_subdirectory(src/workers)
    add_subdirectory(src/examples)
endif()
