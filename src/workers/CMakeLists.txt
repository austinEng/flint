include(CMakeParseArguments)

macro(BuildWorker)
    set( _OPTIONS_ARGS )
    set( _ONE_VALUE_ARGS NAME)
    set( _MULTI_VALUE_ARGS SOURCES LINK_LIBRARIES )

    cmake_parse_arguments(_BUILDWORKER "${_OPTIONS_ARGS}" "${_ONE_VALUE_ARGS}" "${_MULTI_VALUE_ARGS}" ${ARGN})

    if (EMSCRIPTEN)
        add_executable(${_BUILDWORKER_NAME} ${_BUILDWORKER_SOURCES})
        install(TARGETS ${_BUILDWORKER_NAME} EXPORT ${_BUILDWORKER_NAME} DESTINATION "bin")
    else()
        add_library(${_BUILDWORKER_NAME} ${_BUILDWORKER_SOURCES})
    endif()
    target_link_libraries(${_BUILDWORKER_NAME} ${_BUILDWORKER_LINK_LIBRARIES})
    InternalTarget("workers" ${_BUILDWORKER_NAME})
endmacro()

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${EMSCRIPTEN_WORKER_FLAGS}")

BuildWorker(
    NAME createGeometry
    SOURCES createGeometry/module.cpp
    LINK_LIBRARIES threading flint
)

BuildWorker(
    NAME terrainGeneratorCPU
    SOURCES terrainGenerator/module.cpp terrainGenerator/cpu.cpp
    LINK_LIBRARIES threading flint steel flint_viewport
)

BuildWorker(
    NAME terrainGeneratorGPU
    SOURCES terrainGenerator/module.cpp terrainGenerator/gpu.cpp
    LINK_LIBRARIES threading flint steel flint_viewport
)
