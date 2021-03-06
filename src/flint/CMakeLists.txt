include(ExternalProject)

ExternalProject_Add(eigen
    GIT_REPOSITORY https://github.com/RLovelett/eigen.git
    GIT_TAG 3.3.4
    CONFIGURE_COMMAND ""
    BUILD_COMMAND ""
    INSTALL_COMMAND ""
    CMAKE_ARGS -DCMAKE_INSTALL_PREFIX=${PROJECT_BINARY_DIR}
)
set_target_properties(eigen PROPERTIES EXCLUDE_FROM_ALL TRUE)
set(EIGEN_INCLUDE_DIR ${CMAKE_CURRENT_BINARY_DIR}/eigen-prefix/src/eigen)

ExternalProject_Add(tinyobjloader
    GIT_REPOSITORY https://github.com/syoyo/tinyobjloader.git
    GIT_TAG v1.0.6
    CMAKE_ARGS -DCMAKE_INSTALL_PREFIX=${PROJECT_BINARY_DIR}
)
set_target_properties(tinyobjloader PROPERTIES EXCLUDE_FROM_ALL TRUE)

file(GLOB_RECURSE SOURCES *.cc)
file(GLOB_RECURSE HEADERS *.h)

add_library(flint ${SOURCES} ${HEADERS})
set_target_properties(flint PROPERTIES LINKER_LANGUAGE CXX)
add_dependencies(flint eigen tinyobjloader)

set(INCLUDE_DEST "include/flint")
set(LIB_DEST "lib/${CMAKE_BUILD_TYPE}")

target_include_directories(flint SYSTEM PUBLIC
  $<BUILD_INTERFACE:${EP_PREFIX}/include>
  $<BUILD_INTERFACE:${EIGEN_INCLUDE_DIR}>
  $<BUILD_INTERFACE:${CMAKE_BINARY_DIR}/include>
)

target_include_directories(flint PUBLIC
  $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/src>
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
  $<INSTALL_INTERFACE:$<INSTALL_PREFIX>/${INCLUDE_DEST}>
)

install(TARGETS flint EXPORT flint DESTINATION ${LIB_DEST})
install(FILES ${HEADERS} DESTINATION ${INCLUDE_DEST})

InternalTarget("src" flint)
