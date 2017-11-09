include(ExternalProject)

ExternalProject_Add(googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG release-1.8.0
    CMAKE_ARGS -DCMAKE_INSTALL_PREFIX=${PROJECT_BINARY_DIR}
)

add_library(gtest STATIC IMPORTED GLOBAL)
set_target_properties(gtest PROPERTIES IMPORTED_LOCATION ${PROJECT_BINARY_DIR}/lib/${CMAKE_STATIC_LIBRARY_PREFIX}gtest${CMAKE_STATIC_LIBRARY_SUFFIX})

if (WIN32)
    add_compile_options(-MTd)
endif()

add_executable(flint_tests
    ${CMAKE_CURRENT_SOURCE_DIR}/intersection/AxisAlignedBox.cc
    ${CMAKE_CURRENT_SOURCE_DIR}/main.cc
)
add_dependencies(flint_tests googletest)
target_link_libraries(flint_tests flint gtest)

install(TARGETS flint_tests EXPORT flint_tests DESTINATION "bin")
if (EMSCRIPTEN)
    if (WASM)
        install(FILES ${CMAKE_CURRENT_BINARY_DIR}/flint_tests.wasm DESTINATION "bin")
    else()
        install(FILES ${CMAKE_CURRENT_BINARY_DIR}/flint_tests.js.mem DESTINATION "bin")
    endif()
endif()

InternalTarget("test" flint_tests)
