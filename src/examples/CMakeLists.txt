include(CMakeParseArguments)

macro(BuildDemo)
    set( _OPTIONS_ARGS )
    set( _ONE_VALUE_ARGS NAME)
    set( _MULTI_VALUE_ARGS SOURCES LINK_LIBRARIES WORKERS )

    cmake_parse_arguments(_BUILDDEMO "${_OPTIONS_ARGS}" "${_ONE_VALUE_ARGS}" "${_MULTI_VALUE_ARGS}" ${ARGN})

    add_executable(${_BUILDDEMO_NAME} ${_BUILDDEMO_SOURCES})
    InternalTarget("examples" ${_BUILDDEMO_NAME})

    if (_BUILDDEMO_LINK_LIBRARIES)
        target_link_libraries(${_BUILDDEMO_NAME} ${_BUILDDEMO_LINK_LIBRARIES})
    endif()


    if (_BUILDDEMO_WORKERS)
        if (EMSCRIPTEN)
            add_dependencies(${_BUILDDEMO_NAME} ${_BUILDDEMO_WORKERS})
        else()
            target_link_libraries(${_BUILDDEMO_NAME} ${_BUILDDEMO_WORKERS})
        endif()
    endif()

    install(TARGETS ${_BUILDDEMO_NAME} EXPORT ${_BUILDDEMO_NAME} DESTINATION "bin")
    if (EMSCRIPTEN)
        set_target_properties(${_BUILDDEMO_NAME} PROPERTIES COMPILE_FLAGS ${EMSCRIPTEN_MODULE_FLAGS})
        if (WASM)
            install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${_BUILDDEMO_NAME}.wasm DESTINATION "bin")
        else()
            install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${_BUILDDEMO_NAME}.js.mem DESTINATION "bin")
        endif()
    endif()

    add_dependencies(flint_examples ${_BUILDDEMO_NAME})
endmacro()

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${EMSCRIPTEN_MODULE_FLAGS}")

BuildDemo(
    NAME windowDemo
    SOURCES windowDemo/main.cpp
    LINK_LIBRARIES flint flint_viewport
)

BuildDemo(
    NAME noiseDemo
    SOURCES noiseDemo/main.cpp
    LINK_LIBRARIES flint flint_viewport
    WORKERS createGeometry
)

BuildDemo(
    NAME terrainDemoCPU
    SOURCES terrainDemo/main.cpp terrainDemo/cpu.cpp
    LINK_LIBRARIES flint steel flint_viewport
    WORKERS terrainGeneratorCPU
)

BuildDemo(
    NAME terrainDemoGPU
    SOURCES terrainDemo/main.cpp terrainDemo/gpu.cpp
    LINK_LIBRARIES flint steel flint_viewport
    WORKERS terrainGeneratorGPU
)
