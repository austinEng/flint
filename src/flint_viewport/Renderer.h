#pragma once
#include <map>
#include <flint/rendering/CommandBlock.h>
#include "GL.h"

namespace flint {
namespace viewport {

class Renderer {
public:
    Renderer();
    ~Renderer();

    void ExecuteCommands(const rendering::CommandBlock* commands);
private:
    std::map<uint32_t, GLuint> bufferMap;
};

}
}
