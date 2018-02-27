#pragma once

#include <steel/rendering/gl/CommandBuffer.h>
#include <steel/rendering/gl/SerialCounted.h>
#include <steel/rendering/gl/Objects.h>

namespace steel {
namespace shader {

class WireProgram {
private:
    WireProgram();
    rendering::gl::SerialCounted<rendering::gl::ShaderProgram> program;
public:
    static WireProgram& GetInstance() {
        static WireProgram instance;
        return instance;
    }

    void Create(steel::rendering::gl::CommandBuffer* commands);
    void Use(steel::rendering::gl::CommandBuffer* commands);
    WireProgram(const WireProgram&) = delete;
    WireProgram& operator=(const WireProgram&) = delete;

    bool created = false;
};

}
}
