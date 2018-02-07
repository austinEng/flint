
function(BuildDemo EXAMPLE_NAME)
    set(EXAMPLE_LINK_LIBRARIES threading flint flint_viewport)
    file(GLOB SOURCES ${EXAMPLE_NAME}/*.cpp ${EXAMPLE_NAME}/*.h)

    add_executable(${EXAMPLE_NAME} ${SOURCES})
    target_link_libraries(${EXAMPLE_NAME} ${EXAMPLE_LINK_LIBRARIES})
    InternalTarget("examples" ${EXAMPLE_NAME})

    install(TARGETS ${EXAMPLE_NAME} EXPORT ${EXAMPLE_NAME} DESTINATION "bin")
    if (EMSCRIPTEN)
        set_target_properties(${EXAMPLE_NAME} PROPERTIES COMPILE_FLAGS ${EMSCRIPTEN_MODULE_FLAGS})
        if (WASM)
            install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${EXAMPLE_NAME}.wasm DESTINATION "bin")
        else()
            install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${EXAMPLE_NAME}.js.mem DESTINATION "bin")
        endif()
    endif()

    add_dependencies(flint_examples ${EXAMPLE_NAME})
endfunction()

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${EMSCRIPTEN_MODULE_FLAGS}")
BuildDemo(windowDemo)
BuildDemo(noiseDemo)
BuildDemo(terrainDemo)

add_dependencies(noiseDemo createGeometry)
add_dependencies(terrainDemo terrainGenerator)

if (NOT EMSCRIPTEN)
    target_link_libraries(noiseDemo createGeometry)
    target_link_libraries(terrainDemo terrainGenerator)
endif()
