file(GLOB_RECURSE SOURCES *.cc)
file(GLOB_RECURSE HEADERS *.h)

if (TERRAIN_SHADER_OFFSETS)
  add_definitions(-DTERRAIN_SHADER_OFFSETS)
endif()

add_library(steel ${SOURCES} ${HEADERS})
set_target_properties(steel PROPERTIES LINKER_LANGUAGE CXX)
target_link_libraries(steel flint)

set(INCLUDE_DEST "include/steel")
set(LIB_DEST "lib/${CMAKE_BUILD_TYPE}")

target_include_directories(steel PUBLIC
  $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/src>
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
  $<INSTALL_INTERFACE:$<INSTALL_PREFIX>/${INCLUDE_DEST}>
)

install(TARGETS steel EXPORT steel DESTINATION ${LIB_DEST})
install(FILES ${HEADERS} DESTINATION ${INCLUDE_DEST})

InternalTarget("src" steel)
