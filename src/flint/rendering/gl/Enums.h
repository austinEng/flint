#pragma once

namespace flint {
namespace rendering {
namespace gl {

enum class BufferUsage {
    STATIC_DRAW,
};

enum class BufferTarget {
    ARRAY_BUFFER,
    ELEMENT_ARRAY_BUFFER,
};

enum class DrawMode {
    POINTS,
    LINES,
    TRIANGLES,
};

enum class IndexDatatype {
    UNSIGNED_BYTE,
    UNSIGNED_SHORT,
    UNSIGNED_INT,
};

enum class ShaderType {
    VERTEX_SHADER,
    FRAGMENT_SHADER,
};

enum class ComponentDatatype {
    FLOAT,
};

enum ClearBit {
    COLOR_BUFFER_BIT = 1 << 0,
    DEPTH_BUFFER_BIT = 1 << 1,
    STENCIL_BUFFER_BIT = 1 << 2,
};

}
}
}
