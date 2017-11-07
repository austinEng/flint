project(flint CXX)
cmake_minimum_required(VERSION 2.8.6)

list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")

option(BUILD_NATIVE "Target native platform" ON)
option(BUILD_WASM "Target Web Assmembly" ON)
option(BUILD_JS "Target asm.js" ON)

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

if (BUILD_NATIVE)
    add_subdirectory(src/flint ${CMAKE_CURRENT_BINARY_DIR}/native/src/flint)
    add_subdirectory(src/flint_viewport ${CMAKE_CURRENT_BINARY_DIR}/native/src/flint_viewport)
    add_subdirectory(src/examples ${CMAKE_CURRENT_BINARY_DIR}/native/src/examples)
    add_subdirectory(test ${CMAKE_CURRENT_BINARY_DIR}/native/test)
endif()

if (BUILD_WEB)
    add_subdirectory(src/flint)
    add_subdirectory(src/flint_viewport)
    add_subdirectory(src/examples)
    add_subdirectory(test)
endif()

include(ExternalProject)

if (BUILD_JS)
    ExternalProject_Add(flint_js
        SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}
        BINARY_DIR ${CMAKE_CURRENT_BINARY_DIR}/js
        CMAKE_ARGS
          -DBUILD_WEB:BOOL=ON
          -DUSE_WASM=0
          -DBUILD_NATIVE:BOOL=OFF
          -DBUILD_JS:BOOL=OFF
          -DBUILD_WASM:BOOL=OFF
          -DEP_PREFIX:PATH=${PROJECT_BINARY_DIR}
        INSTALL_COMMAND ""
    )
endif()

if (BUILD_WASM)
    ExternalProject_Add(flint_wasm
        SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}
        BINARY_DIR ${CMAKE_CURRENT_BINARY_DIR}/wasm
        CMAKE_ARGS
          -DBUILD_WEB:BOOL=ON
          -DUSE_WASM=1
          -DBUILD_NATIVE:BOOL=OFF
          -DBUILD_JS:BOOL=OFF
          -DBUILD_WASM:BOOL=OFF
          -DEP_PREFIX:PATH=${PROJECT_BINARY_DIR}
        INSTALL_COMMAND ""
    )
endif()
