include(ExternalGitProject)

ExternalGitProject(
    NAME eigen
    GIT_REPOSITORY https://github.com/RLovelett/eigen.git
    GIT_TAG 3.3.4
    CONFIGURE_COMMAND ${CMAKE_COMMAND} -E echo "Skipping configure"
    BUILD_COMMAND ${CMAKE_COMMAND} -E echo "Skipping build"
    INSTALL_COMMAND ${CMAKE_COMMAND} -E echo "Skipping install"
)
set(EIGEN_INCLUDE_DIR ${EP_PREFIX}/third_party/src/eigen)

ExternalGitProject(
    NAME tinyobjloader
    GIT_REPOSITORY https://github.com/syoyo/tinyobjloader.git
    GIT_TAG v1.0.6
)

file(GLOB_RECURSE SOURCES *.cc)
file(GLOB_RECURSE HEADERS *.h)

add_library(flint ${SOURCES} ${HEADERS})
set_target_properties(flint PROPERTIES LINKER_LANGUAGE CXX)
add_dependencies(flint eigen tinyobjloader)

set(INCLUDE_DEST "include/flint")
set(LIB_DEST "lib/${CMAKE_BUILD_TYPE}")

target_include_directories(flint PUBLIC
  $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/src>
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
  $<BUILD_INTERFACE:${CMAKE_BINARY_DIR}/include>
  $<BUILD_INTERFACE:${EP_PREFIX}/include>
  $<BUILD_INTERFACE:${EIGEN_INCLUDE_DIR}>
  $<INSTALL_INTERFACE:$<INSTALL_PREFIX>/${INCLUDE_DEST}>
)

install(TARGETS flint EXPORT flint DESTINATION ${LIB_DEST})
install(FILES ${HEADERS} DESTINATION ${INCLUDE_DEST})

InternalTarget("src" flint)
