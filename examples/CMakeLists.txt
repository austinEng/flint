include (ExternalProject)

if (BUILD_NATIVE)
    ExternalProject_Add(flint_native
        SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../
        BINARY_DIR ${CMAKE_CURRENT_BINARY_DIR}/native
        CMAKE_ARGS
            -DBUILD_WEB:BOOL=OFF
            -DBUILD_EXAMPLES:BOOL=OFF
            -DEP_PREFIX:PATH=${PROJECT_BINARY_DIR}
            -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}
    )
endif()

if (BUILD_JS)
    ExternalProject_Add(flint_js
    SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../
    BINARY_DIR ${CMAKE_CURRENT_BINARY_DIR}/native
    CMAKE_ARGS
        -DBUILD_WEB:BOOL=ON
        -DUSE_WASM=0
        -DBUILD_WASM:BOOL=OFF
        -DEP_PREFIX:PATH=${PROJECT_BINARY_DIR}
        -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}
    )
endif()

if (BUILD_WASM)
    ExternalProject_Add(flint_wasm
    SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../
    BINARY_DIR ${CMAKE_CURRENT_BINARY_DIR}/native
    CMAKE_ARGS
        -DBUILD_WEB:BOOL=ON
        -DUSE_WASM=1
        -DBUILD_EXAMPLES:BOOL=OFF
        -DEP_PREFIX:PATH=${PROJECT_BINARY_DIR}
        -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}
    )
endif()

function(BuildDemo EXAMPLE_NAME)
    if (BUILD_NATIVE)
        set(EXAMPLE_LINK_LIBRARIES flint flint_viewport)

        file(GLOB SOURCES ${EXAMPLE_NAME}/*.cpp ${EXAMPLE_NAME}/*.h)
        add_executable(${EXAMPLE_NAME}_native ${SOURCES})
        add_dependencies(${EXAMPLE_NAME}_native flint_native)
        target_link_libraries(${EXAMPLE_NAME}_native ${EXAMPLE_LINK_LIBRARIES})
        InternalTarget("examples" ${EXAMPLE_NAME}_native)
    endif()
endfunction()

BuildDemo(windowDemo)
