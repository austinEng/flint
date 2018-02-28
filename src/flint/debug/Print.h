#pragma once

#include <stdio.h>
#include <type_traits>
#include <utility>

#include "Debug.h"

template <typename... Args>
typename std::enable_if<sizeof...(Args)==0, void>::type debugPrint(const char* format, Args&&... args) {
  if (DEBUG) {
    fputs(format, stderr);
  }
}

template <typename... Args>
typename std::enable_if<sizeof...(Args)!=0, void>::type debugPrint(const char* format, Args&&... args) {
  if (DEBUG) {
    fprintf(stderr, format, std::forward<Args>(args)...);
  }
}
