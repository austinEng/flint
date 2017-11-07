include(ExternalProject)

ExternalProject_Add(googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG release-1.8.0
    CMAKE_ARGS -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}
)

add_library(gtest STATIC IMPORTED GLOBAL)
set_target_properties(gtest PROPERTIES IMPORTED_LOCATION ${CMAKE_BINARY_DIR}/lib/${CMAKE_STATIC_LIBRARY_PREFIX}gtest${CMAKE_STATIC_LIBRARY_SUFFIX})

if (WIN32)
    add_compile_options(-MTd)
endif()

add_executable(flint_tests
  ${CMAKE_CURRENT_SOURCE_DIR}/intersection/AxisAlignedBox.cc
  ${CMAKE_CURRENT_SOURCE_DIR}/main.cc
)
add_dependencies(flint_tests googletest)
target_link_libraries(flint_tests flint gtest)

InternalTarget("test" flint_tests)
