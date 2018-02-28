
#pragma once
#include <Eigen/Dense>
#include <vector>

namespace flint {
namespace geometry {

class GeometryBuffer {
public:
    using Index = unsigned int;
    using Triangle = Eigen::Array<unsigned int, 3, 1>;
    using TriangleList = std::vector<Triangle>;

    template <unsigned int D, typename T>
    using Vertex = Eigen::Array<T, D, 1>;

    template <typename T>
    using VertexList = std::vector<T>;

    char* buffer = nullptr;
    struct Info {
        bool owner;
        unsigned int byteLength;
        unsigned int indexCount;
        unsigned int vertexCount;
        unsigned int indexOffset;
        unsigned int positionOffset;
        unsigned int normalOffset;
        unsigned int uvOffset;
    };

    GeometryBuffer() : buffer(nullptr) {
    }

    GeometryBuffer(unsigned int byteLength) : buffer(new char[sizeof(Info) + byteLength]) {
        info().byteLength = sizeof(Info) + byteLength;
        info().owner = true;
    }

    GeometryBuffer(char* buffer) : buffer(buffer) {
        info().owner = false;
    }

    GeometryBuffer(const GeometryBuffer&) = delete;
    GeometryBuffer& operator=(const GeometryBuffer&) = delete;

    GeometryBuffer(GeometryBuffer&& other) {
        buffer = other.buffer;
        other.buffer = nullptr;
    }

    GeometryBuffer& operator=(GeometryBuffer&& other) {
        std::swap(buffer, other.buffer);
        return *this;
    }

    ~GeometryBuffer() {
        if (buffer && info().owner) {
            delete[] buffer;
        }
    }

    const char* bufferStart() const {
        return buffer + sizeof(Info);
    }

    char* bufferStart() {
        return buffer + sizeof(Info);
    }

    const Info& info() const {
        return *reinterpret_cast<const Info*>(buffer);
    }

    Info& info() {
        return *reinterpret_cast<Info*>(buffer);
    }

    const char* GetBuffer() const {
        return buffer;
    }

    unsigned int ByteLength() const {
        return info().byteLength;
    }

    unsigned int GetIndexCount() const {
        return info().indexCount;
    }

    unsigned int GetVertexCount() const {
        return info().vertexCount;
    }

    template <typename T = Index>
    T* GetIndexBuffer() {
        return reinterpret_cast<T*>(bufferStart() + info().indexOffset);
    }

    template <typename T>
    T* GetPositionBuffer() {
        return reinterpret_cast<T*>(bufferStart() + info().positionOffset);
    }

    template <typename T>
    T* GetNormalBuffer() {
        return reinterpret_cast<T*>(bufferStart() + info().normalOffset);
    }

    template <typename T>
    T* GetUVBuffer() {
        return reinterpret_cast<T*>(bufferStart() + info().uvOffset);
    }

    template <typename T = Index>
    const T* GetIndexBuffer() const {
        return reinterpret_cast<const T*>(bufferStart() + info().indexOffset);
    }

    template <typename T>
    const T* GetPositionBuffer() const {
        return reinterpret_cast<const T*>(bufferStart() + info().positionOffset);
    }

    template <typename T>
    const T* GetNormalBuffer() const {
        return reinterpret_cast<const T*>(bufferStart() + info().normalOffset);
    }

    template <typename T>
    const T* GetUVBuffer() const {
        return reinterpret_cast<const T*>(bufferStart() + info().uvOffset);
    }
};

}
}
