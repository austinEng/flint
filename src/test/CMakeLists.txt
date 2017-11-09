include(ExternalGitProject)

ExternalGitProject(
    NAME googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG release-1.8.0
)

add_library(gtest STATIC IMPORTED GLOBAL)
set_target_properties(gtest PROPERTIES IMPORTED_LOCATION ${EP_PREFIX}/lib/${CMAKE_STATIC_LIBRARY_PREFIX}gtest${CMAKE_STATIC_LIBRARY_SUFFIX})

if (WIN32)
    add_compile_options(-MTd)
endif()

if (EMSCRIPTEN)
    if (WASM)
        set(TARGET_NAME flint_tests_wasm)
    else()
        set(TARGET_NAME flint_tests_js)
    endif()
else()
    set(TARGET_NAME flint_tests_native)
endif()

add_executable(${TARGET_NAME}
    ${CMAKE_CURRENT_SOURCE_DIR}/intersection/AxisAlignedBox.cc
    ${CMAKE_CURRENT_SOURCE_DIR}/main.cc
)
add_dependencies(${TARGET_NAME} googletest)
target_link_libraries(${TARGET_NAME} flint gtest)

install(TARGETS ${TARGET_NAME} EXPORT ${TARGET_NAME} DESTINATION "bin")
if (EMSCRIPTEN)
    if (WASM)
        install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${TARGET_NAME}.wasm DESTINATION "bin")
    else()
        install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${TARGET_NAME}.js.mem DESTINATION "bin")
    endif()
endif()

InternalTarget("test" ${TARGET_NAME})
