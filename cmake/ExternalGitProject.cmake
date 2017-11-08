
include(CMakeParseArguments)
include(ExternalProject)

function(ExternalGitProject)
    cmake_parse_arguments(
      THIRD_PARTY # prefix of output variables
      "" # list of names of the boolean arguments (only defined ones will be true)
      "NAME;GIT_TAG;GIT_REPOSITORY;UPDATE_COMMAND;CONFIGURE_COMMAND;BUILD_COMMAND;INSTALL_COMMAND" # list of names of mono-valued arguments
      "CMAKE_ARGS" # list of names of multi-valued arguments (output variables are lists)
      ${ARGN} # arguments of the function to parse, here we take the all original ones
    )

    # if (DEFINED ${THIRD_PARTY_UPDATE_COMMAND})
    #   set(UPDATE_COMMAND ${THIRD_PARTY_UPDATE_COMMAND})
    #   message(STATUS "UPDATE COMMAND IS ${UPDATE_COMMAND}.")
    # endif()

    ExternalProject_Add(${THIRD_PARTY_NAME}
      PREFIX ${EP_PREFIX}/third_party
      STAMP_DIR ${EP_PREFIX}/third_party/src/${THIRD_PARTY_NAME}-stamp/${EP_SUFFIX}
      BINARY_DIR ${EP_PREFIX}/third_party/src/${THIRD_PARTY_NAME}-build/${EP_SUFFIX}
      GIT_REPOSITORY ${THIRD_PARTY_GIT_REPOSITORY}
      GIT_TAG ${THIRD_PARTY_GIT_TAG}
      UPDATE_COMMAND ${THIRD_PARTY_UPDATE_COMMAND}
      CONFIGURE_COMMAND ${THIRD_PARTY_CONFIGURE_COMMAND}
      BUILD_COMMAND ${THIRD_PARTY_BUILD_COMMAND}
      INSTALL_COMMAND ${THIRD_PARTY_INSTALL_COMMAND}
      CMAKE_ARGS ${THIRD_PARTY_CMAKE_ARGS} -DCMAKE_INSTALL_PREFIX=${EP_PREFIX} -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE}
    )
endfunction()
