function(BuildWorker MODULE_NAME)
    file(GLOB SOURCES ${MODULE_NAME}/*.cpp ${MODULE_NAME}/*.h)

    if (EMSCRIPTEN)
        add_executable(${MODULE_NAME} ${SOURCES})
        install(TARGETS ${MODULE_NAME} EXPORT ${MODULE_NAME} DESTINATION "bin")
    else()
        add_library(${MODULE_NAME} ${SOURCES})
        target_link_libraries(${MODULE_NAME} threading flint)
    endif()
    InternalTarget("workers" ${MODULE_NAME})
endfunction()

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${EMSCRIPTEN_WORKER_FLAGS}")

BuildWorker(createGeometry)
target_link_libraries(createGeometry threading flint)

BuildWorker(terrainGenerator)
target_link_libraries(terrainGenerator threading flint steel flint_viewport)
