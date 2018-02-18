#pragma once

#include <flint/rendering/CommandIterator.h>
#include "Debug.h"

template <typename T>
struct CommandPrinter {
    static void Print(flint::rendering::CommandIterator* iterator);
};
// void PrintCommands(flint::rendering::CommandIterator* iterator);