include(CMakeParseArguments)

macro(BuildDemo)
    set( _OPTIONS_ARGS )
    set( _ONE_VALUE_ARGS NAME)
    set( _MULTI_VALUE_ARGS SOURCES LINK_LIBRARIES WORKERS EXTRA_EXPORTED_RUNTIME_METHODS )

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

        list(LENGTH _BUILDDEMO_EXTRA_EXPORTED_RUNTIME_METHODS N)
        if (N GREATER 0)
            math(EXPR N ${N}-1)

            foreach(IDX RANGE 0 ${N})
                list(GET _BUILDDEMO_EXTRA_EXPORTED_RUNTIME_METHODS ${IDX} STR)
                if (${IDX} EQUAL 0)
                    set(temp "'${STR}'")
                else()
                    set(temp "${temp}, '${STR}'")
                endif()
            endforeach()

            set(EXTRA_EXPORT_FLAGS "-s \"EXTRA_EXPORTED_RUNTIME_METHODS=[${temp}]\"")
        endif()
        message(STATUS ${EXTRA_EXPORT_FLAGS})

        set_target_properties(${_BUILDDEMO_NAME} PROPERTIES COMPILE_FLAGS "${EMSCRIPTEN_MODULE_FLAGS} ${EXTRA_EXPORT_FLAGS}")
        if (WASM)
            install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${_BUILDDEMO_NAME}.wasm DESTINATION "bin")
        else()
            install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${_BUILDDEMO_NAME}.js.mem DESTINATION "bin")
        endif()
    endif()

    add_dependencies(flint_examples ${_BUILDDEMO_NAME})
endmacro()

BuildDemo(
    NAME windowDemo
    SOURCES windowDemo/main.cpp
    LINK_LIBRARIES flint flint_viewport
    EXTRA_EXPORTED_RUNTIME_METHODS cwrap
)

BuildDemo(
    NAME noiseDemo
    SOURCES noiseDemo/main.cpp
    LINK_LIBRARIES flint flint_viewport
    WORKERS createGeometry
    EXTRA_EXPORTED_RUNTIME_METHODS cwrap UTF8ToString
)

BuildDemo(
    NAME terrainDemoCPU
    SOURCES terrainDemo/main.cpp terrainDemo/cpu.cpp
    LINK_LIBRARIES flint steel flint_viewport
    WORKERS terrainGeneratorCPU
    EXTRA_EXPORTED_RUNTIME_METHODS UTF8ToString
)

BuildDemo(
    NAME terrainDemoGPU
    SOURCES terrainDemo/main.cpp terrainDemo/gpu.cpp
    LINK_LIBRARIES flint steel flint_viewport
    WORKERS terrainGeneratorGPU
    EXTRA_EXPORTED_RUNTIME_METHODS UTF8ToString
)
