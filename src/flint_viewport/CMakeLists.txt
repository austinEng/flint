include(ExternalProject)

if(NOT EMSCRIPTEN)
    ExternalProject_Add(GLFW
        GIT_REPOSITORY https://github.com/glfw/glfw.git
        GIT_TAG 3.2.1
        CMAKE_ARGS
        -DGLFW_BUILD_EXAMPLES:BOOL=OFF
        -DGLFW_BUILD_TESTS:BOOL=OFF
        -DGLFW_BUILD_DOCS:BOOL=OFF
        CMAKE_ARGS -DCMAKE_INSTALL_PREFIX=${PROJECT_BINARY_DIR}
    )

    add_library(glfw STATIC IMPORTED GLOBAL)
    set_target_properties(glfw PROPERTIES IMPORTED_LOCATION ${PROJECT_BINARY_DIR}/lib/${CMAKE_STATIC_LIBRARY_PREFIX}glfw3${CMAKE_STATIC_LIBRARY_SUFFIX})
    set(GLFW_INCLUDE_DIR ${PROJECT_BINARY_DIR}/include)

    find_package(OpenGL REQUIRED)
    if(NOT OpenGL_FOUND)
        message(ERROR "OpenGL not found")
    endif()

    ExternalProject_Add(GLAD
        GIT_REPOSITORY https://github.com/Dav1dde/glad.git
        GIT_TAG v0.1.14a0
        CMAKE_ARGS -DGLAD_INSTALL:BOOL=ON -DCMAKE_INSTALL_PREFIX=${PROJECT_BINARY_DIR}
    )

    add_library(glad STATIC IMPORTED GLOBAL)
    set_target_properties(glad PROPERTIES IMPORTED_LOCATION ${PROJECT_BINARY_DIR}/lib/${CMAKE_STATIC_LIBRARY_PREFIX}glad${CMAKE_STATIC_LIBRARY_SUFFIX})

    list(APPEND FLINT_VIEWPORT_LINK_LIBRARIES glfw glad ${OPENGL_LIBRARIES})
    list(APPEND FLINT_VIEWPORT_DEPENDENCIES GLFW GLAD)

    if(UNIX AND NOT APPLE)
        find_package(X11 REQUIRED)
        if(NOT X11_FOUND)
            message(ERROR "x11 not found")
        endif()

        list(APPEND FLINT_VIEWPORT_LINK_LIBRARIES
            ${X11_LIBRARIES}
            ${X11_Xxf86vm_LIB}
            ${X11_Xcursor_LIB}
            ${X11_Xrandr_LIB}
            ${X11_Xi_LIB}
            ${X11_Xinerama_LIB}
        )
    endif()
endif()

file(GLOB_RECURSE SOURCES *.cc)
file(GLOB_RECURSE HEADERS *.h)

add_library(flint_viewport ${SOURCES} ${HEADERS})
set_target_properties(flint_viewport PROPERTIES LINKER_LANGUAGE CXX)
if (FLINT_VIEWPORT_DEPENDENCIES)
    add_dependencies(flint_viewport ${FLINT_VIEWPORT_DEPENDENCIES})
endif()
add_dependencies(flint_viewport flint)
target_link_libraries(flint_viewport flint ${FLINT_VIEWPORT_LINK_LIBRARIES})

set(INCLUDE_DEST "include/flint_viewport")
set(LIB_DEST "lib/${CMAKE_BUILD_TYPE}")

target_include_directories(flint_viewport SYSTEM PUBLIC
    $<BUILD_INTERFACE:${EP_PREFIX}/include>
    $<BUILD_INTERFACE:${EIGEN_INCLUDE_DIR}>
    $<BUILD_INTERFACE:${CMAKE_BINARY_DIR}/include>
)

target_include_directories(flint_viewport PUBLIC
    $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/src>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
    $<INSTALL_INTERFACE:$<INSTALL_PREFIX>/${INCLUDE_DEST}>
)

install(TARGETS flint_viewport EXPORT flint_viewport DESTINATION ${LIB_DEST})
install(FILES ${HEADERS} DESTINATION ${INCLUDE_DEST})

InternalTarget("src" flint_viewport)
