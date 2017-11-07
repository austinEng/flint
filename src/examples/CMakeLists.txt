list(APPEND EXAMPLE_LINK_LIBRARIES
    flint
    flint_viewport
)

function(BuildDemo EXAMPLE_NAME)
    file(GLOB SOURCES ${EXAMPLE_NAME}/*.cpp ${EXAMPLE_NAME}/*.h)
    add_executable(${EXAMPLE_NAME} ${SOURCES})
    target_link_libraries(${EXAMPLE_NAME} ${EXAMPLE_LINK_LIBRARIES})
	InternalTarget("examples" ${EXAMPLE_NAME})
endfunction()

BuildDemo(windowDemo)
