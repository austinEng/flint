#pragma once
#include <memory>
#include <vector>
#include <Eigen/Dense>
#include <flint/core/Math.h>
#include "GeometryBuffer.h"
#include "Sphere.h"

namespace flint {
namespace geometry {

template <unsigned int D, typename T = precision_t>
class SphereBufferBase : public GeometryBuffer {

public:
    const TriangleList& GetTriangles() const {
        return triangles;
    }

    const VertexList<Eigen::Array<T, D, 1>>& GetPositions() const {
        return positions;
    }

    const VertexList<Eigen::Array<T, D, 1>>& GetNormals() const {
        return normals;
    }

    const VertexList<Eigen::Array<T, 2, 1>>& GetUVs() const {
        return uvs;
    }

protected:
    TriangleList triangles;
    VertexList<Eigen::Array<T, D, 1>> positions;
    VertexList<Eigen::Array<T, D, 1>> normals;
    VertexList<Eigen::Array<T, 2, 1>> uvs;
};

template <unsigned int D, typename T = precision_t>
class SphereBuffer {};

template <typename T>
class SphereBuffer<3, T> : public SphereBufferBase<3, T> {

public:
    struct CreateArgs {
        Sphere<3, T> sphere;
        int subdivisions;
        SphereBuffer* buffer;
        std::allocator<char> alloc;
        unsigned int bytes;
    };

    static CreateArgs* GetRequiredMemory(const Sphere<3, T> &sphere, unsigned int subdivisions) {
        unsigned int bytes = (
            sizeof(CreateArgs) +
            sizeof(SphereBuffer) +
            20 * core::constPow(4, subdivisions) * sizeof(GeometryBuffer::Triangle) +
            12 * core::constPow(2, subdivisions) * sizeof(Eigen::Array<T, 3, 1>) +
            12 * core::constPow(2, subdivisions) * sizeof(Eigen::Array<T, 3, 1>)
        );

        std::allocator<char> alloc;
        char* ptr = alloc.allocate(bytes);
        CreateArgs* args = reinterpret_cast<CreateArgs*>(ptr);
        args->alloc = alloc;
        args->buffer = reinterpret_cast<SphereBuffer*>(ptr + sizeof(CreateArgs));
        args->subdivisions = subdivisions;
        args->sphere = sphere;
        args->bytes = bytes;

        return args;
    }

    // https://schneide.wordpress.com/2016/07/15/generating-an-icosphere-in-c/
    static void Create(CreateArgs* args) {
        static constexpr T X = static_cast<T>(.525731112119133606);
        static constexpr T Z = static_cast<T>(.850650808352039932);
        static constexpr T N = static_cast<T>(0);

        static const GeometryBuffer::VertexList<Eigen::Array<T, 3, 1>> kVertices = {
            { -X,N,Z },{ X,N,Z },{ -X,N,-Z },{ X,N,-Z },
            { N,Z,X },{ N,Z,-X },{ N,-Z,X },{ N,-Z,-X },
            { Z,X,N },{ -Z,X, N },{ Z,-X,N },{ -Z,-X, N }
        };

        static const GeometryBuffer::TriangleList kTriangles = {
            { 0,4,1 },{ 0,9,4 },{ 9,5,4 },{ 4,5,8 },{ 4,8,1 },
            { 8,10,1 },{ 8,3,10 },{ 5,3,8 },{ 5,2,3 },{ 2,7,3 },
            { 7,10,3 },{ 7,6,10 },{ 7,11,6 },{ 11,0,6 },{ 0,1,6 },
            { 6,1,10 },{ 9,0,11 },{ 9,11,2 },{ 9,2,5 },{ 7,2,11 }
        };

        GeometryBuffer::VertexList<Eigen::Array<T, 3, 1>> vertices = kVertices;
        GeometryBuffer::TriangleList triangles = kTriangles;
        GeometryBuffer::VertexList<Eigen::Array<T, 3, 1>> nextVertices;
        GeometryBuffer::TriangleList nextTriangles;

        for (unsigned int s = 0; s < args->subdivisions; ++s) {
            nextTriangles.clear();
            nextVertices.clear();
            nextTriangles.reserve(triangles.size() * 4);
            nextVertices.reserve(vertices.size() * 2);

            for (const auto& triangle : triangles) {
                unsigned int begin = static_cast<unsigned int>(nextVertices.size());
                nextVertices.push_back(vertices[triangle[0]]); // 0
                nextVertices.push_back(vertices[triangle[1]]); // 1
                nextVertices.push_back(vertices[triangle[2]]); // 2
                nextVertices.push_back((vertices[triangle[0]] + vertices[triangle[1]]).matrix().normalized()); // 3
                nextVertices.push_back((vertices[triangle[1]] + vertices[triangle[2]]).matrix().normalized()); // 4
                nextVertices.push_back((vertices[triangle[2]] + vertices[triangle[0]]).matrix().normalized()); // 5
                nextTriangles.emplace_back(begin + 0, begin + 3, begin + 5);
                nextTriangles.emplace_back(begin + 3, begin + 4, begin + 5);
                nextTriangles.emplace_back(begin + 3, begin + 1, begin + 4);
                nextTriangles.emplace_back(begin + 5, begin + 4, begin + 2);
            }

            std::swap(triangles, nextTriangles);
            std::swap(vertices, nextVertices);
        }

        SphereBuffer* sphereBuffer = new(args->buffer) SphereBuffer();
        sphereBuffer->triangles = std::vector<GeometryBuffer::Triangle>(triangles, args->alloc);
        sphereBuffer->normals = GeometryBuffer::VertexList<Eigen::Array<T, 3, 1>>(vertices, args->alloc);
        sphereBuffer->positions = GeometryBuffer::VertexList<Eigen::Array<T, 3, 1>>(vertices.size(), args->alloc);

        for (unsigned int i = 0; i < vertices.size(); ++i) {
            sphereBuffer->positions[i] = vertices[i] * args->sphere.getRadius() + args->sphere.getCenter();
        }
    }
};

}
}
