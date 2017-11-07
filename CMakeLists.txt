project(flint CXX)
cmake_minimum_required(VERSION 2.8.6)

list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")

option(BUILD_EXAMPLES "Build examples" ON)
option(BUILD_NATIVE "Build examples targeting native platform" ON)
option(BUILD_WASM "Build examples targeting Web Assembly" ON)
option(BUILD_JS "Build examples targeting asm.js" ON)

include(CheckCXXCompilerFlag)
CHECK_CXX_COMPILER_FLAG("-std=c++14" COMPILER_SUPPORTS_CXX14)
if (COMPILER_SUPPORTS_CXX14)
  add_compile_options(-std=c++14)
else()
  message(FATAL_ERROR "The compiler ${CMAKE_CXX_COMPILER} has no C++14 support. Please use a different C++ compiler.")
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
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wfatal-errors")

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

if(BUILD_WEB)
    if (USE_WASM)
        set(EP_SUFFIX "wasm")
    else()
        set(EP_SUFFIX "js")
    endif()

    if (NOT ENV{EMSCRIPTEN_ROOT})
        message(FATAL_ERROR "Could not find Emscripten root path")
    endif()

    set(CMAKE_C_COMPILER   ENV{EMSCRIPTEN_ROOT}/emcc        CACHE PATH "C compiler")
    set(CMAKE_CXX_COMPILER ENV{EMSCRIPTEN_ROOT}/em++        CACHE PATH "C++ compiler")
    set(CMAKE_AR           ENV{EMSCRIPTEN_ROOT}/emar        CACHE PATH "archive")
    set(CMAKE_RANLIB       ENV{EMSCRIPTEN_ROOT}/emranlib    CACHE PATH "ranlib")
    set(CMAKE_LINKER       ENV{EMSCRIPTEN_ROOT}/emlink.py   CACHE PATH "linker")
else()
    set(EP_SUFFIX "native")
endif()

add_subdirectory(src)

if (BUILD_EXAMPLES)
    add_subdirectory(examples)
endif()
