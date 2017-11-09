project(flint CXX)
cmake_minimum_required(VERSION 2.8.6)
list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")

include(ExternalGitProject)
include(EmscriptenHelpers)
include(Folders)

option(BUILD_EXAMPLES "Build examples" ON)
option(BUILD_TESTS "Build tests" ON)
option(BUILD_WASM "Build examples targeting Web Assembly" ON)
option(BUILD_JS "Build examples targeting asm.js" ON)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if (BUILD_JS OR BUILD_WASM)
    ConfigureEmscriptenToolchain()
endif()

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
    add_compile_options(-Wall -g -ggdb)
  endif()

  if (CMAKE_BUILD_TYPE MATCHES "Rel")
    add_compile_options(-O3 -march=native -ffast-math)
  endif()

  if (CMAKE_BUILD_TYPE MATCHES "Info")
    add_compile_options(-fopt-info-vec-optimized -fopt-info-inline-optimized -ftree-vectorizer-verbose=2)
  endif()
endif()

if (BUILD_JS)
    ExternalProject_Add(flint_js
        SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}
        BINARY_DIR ${CMAKE_CURRENT_BINARY_DIR}/js
        CONFIGURE_COMMAND ${CMAKE_COMMAND} ${CMAKE_CURRENT_SOURCE_DIR}
            -G ${EMSCRIPTEN_GENERATOR}
            -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE}
            -DEMSCRIPTEN=1
            -DWASM=0
            -DBUILD_JS:BOOL=OFF
            -DBUILD_WASM:BOOL=OFF
            -DBUILD_EXAMPLES:BOOL=${BUILD_EXAMPLES}
            -DEP_PREFIX:PATH=${PROJECT_BINARY_DIR}
            -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}
            -DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE}
        BUILD_COMMAND mingw32-make
    )
endif()

if (BUILD_WASM)
    ExternalProject_Add(flint_wasm
        SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}
        BINARY_DIR ${CMAKE_CURRENT_BINARY_DIR}/wasm
        CONFIGURE_COMMAND ${CMAKE_COMMAND} ${CMAKE_CURRENT_SOURCE_DIR}
            -G ${EMSCRIPTEN_GENERATOR}
            -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE}
            -DEMSCRIPTEN=1
            -DWASM=1
            -DBUILD_JS:BOOL=OFF
            -DBUILD_WASM:BOOL=OFF
            -DBUILD_EXAMPLES:BOOL=${BUILD_EXAMPLES}
            -DEP_PREFIX:PATH=${PROJECT_BINARY_DIR}
            -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}
            -DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE}
        BUILD_COMMAND mingw32-make
    )
endif()

if (EMSCRIPTEN)
    ConfigureEmscriptenToolchain()

    message(STATUS "Emscripten root: ${EMSCRIPTEN_ROOT_PATH}")

    set(EMSCRIPTEN_FLAGS "-s ASSERTIONS=1 -s USE_WEBGL2=1 -s FULL_ES3=1 -s USE_GLFW=3 -s NO_EXIT_RUNTIME=1 -s MODULARIZE=1")

    if (WASM)
        set(EMSCRIPTEN_FLAGS "${EMSCRIPTEN_FLAGS} -s WASM=1")
    else()
        set(EMSCRIPTEN_FLAGS "${EMSCRIPTEN_FLAGS} -s ALLOW_MEMORY_GROWTH=1 --memory-init-file 1")
    endif()

    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${EMSCRIPTEN_FLAGS}")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} ${EMSCRIPTEN_FLAGS}")

    add_subdirectory(src/flint)
    add_subdirectory(src/flint_viewport)

    if (BUILD_TESTS)
      add_subdirectory(src/test)
    endif()

    if (BUILD_EXAMPLES)
      add_subdirectory(src/examples)
    endif()
else()
    set(EP_SUFFIX "native")
    add_subdirectory(src/flint ${CMAKE_CURRENT_BINARY_DIR}/native/src/flint)
    add_subdirectory(src/flint_viewport ${CMAKE_CURRENT_BINARY_DIR}/native/src/flint_viewport)

    if (BUILD_TESTS)
      add_subdirectory(src/test ${CMAKE_CURRENT_BINARY_DIR}/native/src/test)
    endif()

    if (BUILD_EXAMPLES)
      add_subdirectory(src/examples ${CMAKE_CURRENT_BINARY_DIR}/native/src/examples)
    endif()
endif()
