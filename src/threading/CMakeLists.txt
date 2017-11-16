file(GLOB_RECURSE SOURCES *.cc)
file(GLOB_RECURSE HEADERS *.h)

add_library(threading ${SOURCES} ${HEADERS})
set_target_properties(threading PROPERTIES LINKER_LANGUAGE CXX)

set(INCLUDE_DEST "include/threading")
set(LIB_DEST "lib/${CMAKE_BUILD_TYPE}")

target_include_directories(threading PUBLIC
  $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/src>
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
  $<BUILD_INTERFACE:${CMAKE_BINARY_DIR}/include>
  $<BUILD_INTERFACE:${EP_PREFIX}/include>
  $<BUILD_INTERFACE:${EIGEN_INCLUDE_DIR}>
  $<INSTALL_INTERFACE:$<INSTALL_PREFIX>/${INCLUDE_DEST}>
)

install(TARGETS threading EXPORT threading DESTINATION ${LIB_DEST})
install(FILES ${HEADERS} DESTINATION ${INCLUDE_DEST})

InternalTarget("src" threading)
