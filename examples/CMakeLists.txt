
function(BuildDemo EXAMPLE_NAME)
    set(EXAMPLE_LINK_LIBRARIES flint flint_viewport)
    file(GLOB SOURCES ${EXAMPLE_NAME}/*.cpp ${EXAMPLE_NAME}/*.h)
    add_executable(${EXAMPLE_NAME} ${SOURCES})
    target_link_libraries(${EXAMPLE_NAME} ${EXAMPLE_LINK_LIBRARIES})
    InternalTarget("examples" ${EXAMPLE_NAME})

    install(TARGETS ${EXAMPLE_NAME} EXPORT ${EXAMPLE_NAME} DESTINATION "bin/${CMAKE_BUILD_TYPE}")
endfunction()

BuildDemo(windowDemo)
