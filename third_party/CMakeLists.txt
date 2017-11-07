
if (WIN32)
    # By default, ExternalProject finds the wrong git
    find_package(Git REQUIRED)
    set(GIT_EXECUTABLE "C:/Program Files/Git/cmd/git.exe")
endif()

set(EP_PREFIX third_party PARENT_SCOPE)
