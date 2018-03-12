include(CMakeParseArguments)

function (ListToString result delim)
    if (${ARGC} GREATER 2)
        list(GET ARGV 2 temp)
        set(empty "")
        set(temp ${empty}"${temp}")
        math(EXPR N "${ARGC}-1")
        if (NOT N LESS 3)
            foreach(IDX RANGE 3 ${N})
                list(GET ARGV ${IDX} STR)
                set(temp ${temp}${delim}"${STR}")
            endforeach()
        endif()
    endif()
    set(${result} "${temp}" PARENT_SCOPE)
endfunction()

function(BuildDemo)
    set( _OPTIONS_ARGS )
    set( _ONE_VALUE_ARGS NAME)
    set( _MULTI_VALUE_ARGS SOURCES LINK_LIBRARIES WORKERS EXPORTED_FUNCTIONS EXTRA_EXPORTED_RUNTIME_METHODS)

    cmake_parse_arguments(_BUILDDEMO "${_OPTIONS_ARGS}" "${_ONE_VALUE_ARGS}" "${_MULTI_VALUE_ARGS}" ${ARGN})

    ListToString(EXPORTED_FUNCTIONS ", " ${_BUILDDEMO_EXPORTED_FUNCTIONS})
    ListToString(EXTRA_EXPORTED_RUNTIME_METHODS ", " ${_BUILDDEMO_EXTRA_EXPORTED_RUNTIME_METHODS})

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
        set_target_properties(${_BUILDDEMO_NAME} PROPERTIES COMPILE_FLAGS "-s EXPORTED_FUNCTIONS='[${EXPORTED_FUNCTIONS}]' -s EXTRA_EXPORTED_RUNTIME_METHODS='[${EXTRA_EXPORTED_RUNTIME_METHODS}]'")

        if (WASM)
            install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${_BUILDDEMO_NAME}.wasm DESTINATION "bin")
        else()
            install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${_BUILDDEMO_NAME}.js.mem DESTINATION "bin")
        endif()
    endif()

    add_dependencies(flint_examples ${_BUILDDEMO_NAME})
endfunction()

if (EMSCRIPTEN)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${EMSCRIPTEN_MODULE_FLAGS}")
endif()

BuildDemo(
    NAME windowDemo
    SOURCES windowDemo/main.cpp
    LINK_LIBRARIES flint flint_viewport
    EXPORTED_FUNCTIONS _main
    EXTRA_EXPORTED_RUNTIME_METHODS cwrap
)

BuildDemo(
    NAME noiseDemo
    SOURCES noiseDemo/main.cpp
    LINK_LIBRARIES flint flint_viewport
    WORKERS createGeometry
    EXPORTED_FUNCTIONS _main
    EXTRA_EXPORTED_RUNTIME_METHODS cwrap UTF8ToString
)

BuildDemo(
    NAME terrainDemoCPU
    SOURCES terrainDemo/main.cpp terrainDemo/cpu.cpp
    LINK_LIBRARIES flint steel flint_viewport
    WORKERS terrainGeneratorCPU
    EXPORTED_FUNCTIONS _main
    EXTRA_EXPORTED_RUNTIME_METHODS UTF8ToString
)

BuildDemo(
    NAME terrainDemoGPU
    SOURCES terrainDemo/main.cpp terrainDemo/gpu.cpp
    LINK_LIBRARIES flint steel flint_viewport
    WORKERS terrainGeneratorGPU
    EXPORTED_FUNCTIONS _main
    EXTRA_EXPORTED_RUNTIME_METHODS UTF8ToString
)
