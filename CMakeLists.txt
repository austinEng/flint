project(flint CXX)
cmake_minimum_required(VERSION 2.8.6)

list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")

option(BUILD_EXAMPLES "Build examples" ON)
option(BUILD_NATIVE "Build examples targeting native platform" ON)
option(BUILD_WASM "Build examples targeting Web Assembly" ON)
option(BUILD_JS "Build examples targeting asm.js" ON)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if (EMSCRIPTEN OR BUILD_JS OR BUILD_WASM)
    set(CMAKE_TOOLCHAIN_FILE $ENV{EMSCRIPTEN_ROOT}/cmake/Modules/Platform/Emscripten.cmake)
    if (EXISTS ${CMAKE_TOOLCHAIN_FILE})
        message(STATUS "Found Emscripten toolchain: ${CMAKE_TOOLCHAIN_FILE}")
    else()
        message(FATAL_ERROR "Could not find Emscripten toolchain")
    endif()

    if (WIN32)
        set(EMSCRIPTEN_GENERATOR "MinGW Makefiles")
    else()
        set(EMSCRIPTEN_GENERATOR "Unix Makefiles")
    endif()
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

# Enable the creation of folders for Visual Studio projects
set_property(GLOBAL PROPERTY USE_FOLDERS ON)

function(ExternalTarget folder target)
  set_property(TARGET ${target} PROPERTY FOLDER ${folder})
endfunction(ExternalTarget)

function(InternalTarget folder target)
  ExternalTarget("${folder}" ${target})
  if (MSVC)
    get_target_property(targetSources ${target} SOURCES)
    foreach(sourceFile IN ITEMS ${targetSources})
      if (IS_ABSOLUTE "${sourceFile}")
        file(RELATIVE_PATH sourceFile "${CMAKE_CURRENT_SOURCE_DIR}" "${sourceFile}")
      endif()
      get_filename_component(sourceDir "${sourceFile}" PATH)
      string(REPLACE "/" "\\" sourceDir "${sourceDir}")
      source_group("${sourceDir}" FILES "${sourceFile}")
    endforeach()
  endif()
endfunction(InternalTarget)

if (WIN32)
    # By default, ExternalProject finds the wrong git
    find_package(Git REQUIRED)
    set(GIT_EXECUTABLE "C:/Program Files/Git/cmd/git.exe")
endif()

if (NOT DEFINED EP_PREFIX)
    set(EP_PREFIX ${PROJECT_BINARY_DIR})
endif()

include (ExternalProject)

if (BUILD_JS)
    ExternalProject_Add(flint_js
        SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}
        BINARY_DIR ${CMAKE_CURRENT_BINARY_DIR}/js
        CONFIGURE_COMMAND ${CMAKE_COMMAND} ${CMAKE_CURRENT_SOURCE_DIR}
            -G ${EMSCRIPTEN_GENERATOR}
            -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE}
            -DBUILD_WEB:BOOL=ON
            -DUSE_WASM=0
            -DBUILD_NATIVE:BOOL=OFF
            -DBUILD_JS:BOOL=OFF
            -DBUILD_WASM:BOOL=OFF
            -DBUILD_EXAMPLES:BOOL=${BUILD_EXAMPLES}
            -DEP_PREFIX:PATH=${PROJECT_BINARY_DIR}
            -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}
            -DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE}
            -DEMSCRIPTEN=1
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
            -DBUILD_WEB:BOOL=ON
            -DUSE_WASM=1
            -DBUILD_NATIVE:BOOL=OFF
            -DBUILD_JS:BOOL=OFF
            -DBUILD_WASM:BOOL=OFF
            -DBUILD_EXAMPLES:BOOL=${BUILD_EXAMPLES}
            -DEP_PREFIX:PATH=${PROJECT_BINARY_DIR}
            -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}
            -DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE}
            -DEMSCRIPTEN=1
        BUILD_COMMAND mingw32-make
    )
endif()

if(BUILD_WEB)
    message(STATUS "Emscripten root: ${EMSCRIPTEN_ROOT_PATH}")

    set(EMSCRIPTEN_FLAGS "-s ASSERTIONS=1 -s USE_WEBGL2=1 -s FULL_ES3=1 -s USE_GLFW=3 -s NO_EXIT_RUNTIME=1 -s MODULARIZE=1")

    if (USE_WASM)
        set(EP_SUFFIX "wasm")
        set(EMSCRIPTEN_FLAGS "${EMSCRIPTEN_FLAGS} -s WASM=1")
    else()
        set(EP_SUFFIX "js")
        set(EMSCRIPTEN_FLAGS "${EMSCRIPTEN_FLAGS} -s ALLOW_MEMORY_GROWTH=1 --memory-init-file 1")
    endif()

    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${EMSCRIPTEN_FLAGS}")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} ${EMSCRIPTEN_FLAGS}")

    add_subdirectory(src/flint)
    add_subdirectory(src/flint_viewport)
    add_subdirectory(src/test)

    if (BUILD_EXAMPLES)
      add_subdirectory(examples)
    endif()
else()
    set(EP_SUFFIX "native")
    add_subdirectory(src/flint ${CMAKE_CURRENT_BINARY_DIR}/native/src/flint)
    add_subdirectory(src/flint_viewport ${CMAKE_CURRENT_BINARY_DIR}/native/src/flint_viewport)
    add_subdirectory(src/test ${CMAKE_CURRENT_BINARY_DIR}/native/src/test)

    if (BUILD_EXAMPLES)
      add_subdirectory(examples ${CMAKE_CURRENT_BINARY_DIR}/native/examples)
    endif()
endif()
