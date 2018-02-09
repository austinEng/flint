#include <vector>
#include "TerrainTileContent.h"

namespace flint {
namespace tileset {

using namespace flint::rendering::gl;

namespace {
    template <typename T>
    double noise3D(T x, T y, T z) {
        double f = std::sin((Eigen::Matrix<T, 3, 1> {x, y, z}).dot(Eigen::Matrix<T, 3, 1> { 12.989, 78.233, 157 }) * 43758.5453);
        return f - std::floor(f);
    }

    template <typename T>
    double smoothNoise3D(T x, T y, T z) {
        // 8
        double far = (
            noise3D(x - 1, y - 1, z - 1) +
            noise3D(x - 1, y - 1, z + 1) +
            noise3D(x - 1, y + 1, z - 1) +
            noise3D(x - 1, y + 1, z + 1) +
            noise3D(x + 1, y - 1, z - 1) +
            noise3D(x + 1, y - 1, z + 1) +
            noise3D(x + 1, y + 1, z - 1) +
            noise3D(x + 1, y + 1, z + 1)
        );

        // 27
        double mid = (
            noise3D(x - T(1), y - T(1), z - T(1)) +
            noise3D(x - T(1), y - T(1), z - T(0)) +
            noise3D(x - T(1), y - T(1), z + T(1)) +
            noise3D(x - T(1), y - T(0), z - T(1)) +
            noise3D(x - T(1), y - T(0), z - T(0)) +
            noise3D(x - T(1), y - T(0), z + T(1)) +
            noise3D(x - T(1), y + T(1), z - T(1)) +
            noise3D(x - T(1), y + T(1), z - T(0)) +
            noise3D(x - T(1), y + T(1), z + T(1)) +
            noise3D(x - T(0), y - T(1), z - T(1)) +
            noise3D(x - T(0), y - T(1), z - T(0)) +
            noise3D(x - T(0), y - T(1), z + T(1)) +
            noise3D(x - T(0), y - T(0), z - T(1)) +
            noise3D(x - T(0), y - T(0), z - T(0)) +
            noise3D(x - T(0), y - T(0), z + T(1)) +
            noise3D(x - T(0), y + T(1), z - T(1)) +
            noise3D(x - T(0), y + T(1), z - T(0)) +
            noise3D(x - T(0), y + T(1), z + T(1)) +
            noise3D(x + T(1), y - T(1), z - T(1)) +
            noise3D(x + T(1), y - T(1), z - T(0)) +
            noise3D(x + T(1), y - T(1), z + T(1)) +
            noise3D(x + T(1), y - T(0), z - T(1)) +
            noise3D(x + T(1), y - T(0), z - T(0)) +
            noise3D(x + T(1), y - T(0), z + T(1)) +
            noise3D(x + T(1), y + T(1), z - T(1)) +
            noise3D(x + T(1), y + T(1), z - T(0)) +
            noise3D(x + T(1), y + T(1), z + T(1))
        );

        // 6
        double near = (
            noise3D(x + T(0), y + T(0), z - T(1)) +
            noise3D(x + T(0), y + T(0), z + T(1)) +
            noise3D(x + T(0), y - T(0), z + T(0)) +
            noise3D(x + T(0), y + T(0), z + T(0)) +
            noise3D(x - T(0), y + T(0), z + T(0)) +
            noise3D(x + T(1), y + T(0), z + T(0))
        );

        // 1
        double self = noise3D(x, y, z);
        
        constexpr double counts[4] = { 8.0, 27.0, 6.0, 1.0 };
        constexpr double weights[4] = { 64.0, 32.0, 16.0, 8.0 };
        constexpr double influences[4] = { counts[0] / weights[0], counts[1] / weights[1], counts[2] / weights[2], counts[3] / weights[3] };
        constexpr double denom = influences[0] + influences[1] + influences[2] + influences[3];
        constexpr double normalized[4] = { influences[0] / denom / counts[0], influences[1] / denom / counts[1], influences[2] / denom / counts[2], influences[3] / denom / counts[3] };

        return far * normalized[0] + mid * normalized[1] + near * normalized[2] + self * normalized[3];
    }

    template <typename T1, typename T2>
    double cosineInterpolate(T1 a, T1 b, T2 t) {
        double t_cos = t = (1.0 - std::cos(t * kPI)) * 0.5;
        return a * (1.0 - t) + b * t_cos;
    }

    template <typename T>
    double interpolateNoise3D(T x, T y, T z) {
        T xi = std::floor(x);
        T yi = std::floor(y);
        T zi = std::floor(z);
        T xf = x - xi;
        T yf = y - yi;
        T zf = z - zi;

        double p1 = smoothNoise3D(xi + T(0), yi + T(0), zi + T(0));
        double p2 = smoothNoise3D(xi + T(0), yi + T(0), zi + T(1));
        double p3 = smoothNoise3D(xi + T(0), yi + T(1), zi + T(0));
        double p4 = smoothNoise3D(xi + T(0), yi + T(1), zi + T(1));
        double p5 = smoothNoise3D(xi + T(1), yi + T(0), zi + T(0));
        double p6 = smoothNoise3D(xi + T(1), yi + T(0), zi + T(1));
        double p7 = smoothNoise3D(xi + T(1), yi + T(1), zi + T(0));
        double p8 = smoothNoise3D(xi + T(1), yi + T(1), zi + T(1));

        double i1 = cosineInterpolate(p1, p2, xf);
        double i2 = cosineInterpolate(p3, p4, xf);
        double i3 = cosineInterpolate(p5, p6, xf);
        double i4 = cosineInterpolate(p7, p8, xf);

        double j1 = cosineInterpolate(i1, i2, yf);
        double j2 = cosineInterpolate(i3, i4, yf);

        double k1 = cosineInterpolate(j1, j2, zf);

        return k1;
    }

    double multiOctaveNoise(float x, float y, float z, float persistence, uint32_t octaves, float wavelength, float amplitude) {
        float total = 0.f;
        for (uint32_t i = 0; i < octaves; ++i) {
            double f = std::pow(1 / persistence, i) / wavelength;
            double a = std::pow(persistence, i) * amplitude;
            total += a * interpolateNoise3D(x * f, y * f, z * f);
        }
        return total;
    }
}

TerrainTileContent::TerrainTileContent(TerrainTile* tile) : tile(tile), ready(false) {

}

void TerrainTileContent::CreateImpl() {   
    assert(tile->boundingVolume.hasValue());
    auto min = tile->boundingVolume->min();
    auto max = tile->boundingVolume->max();
    auto diag = max - min;

    constexpr uint32_t subdivisions = 4;
    constexpr uint32_t indexCount = 6 * core::constPow(4, subdivisions);
    constexpr uint32_t length = core::constPow(2, subdivisions) + 1;
    constexpr uint32_t vertexCount = core::constPow(length, 2);
    constexpr float stepSize = core::constPow(0.5f, subdivisions);

    indices.resize(indexCount);
    positions.resize(vertexCount);
    normals.resize(vertexCount);

    for (uint32_t j = 0; j < length; ++j) {
        for (uint32_t i = 0; i < length; ++i) {
            uint32_t index = j * length + i;
            positions[index][0] = min[0] + stepSize * i * diag[0];
            positions[index][2] = min[2] + stepSize * j * diag[2];
            positions[index][1] = multiOctaveNoise(positions[index][0], 0.f, positions[index][2], 0.5f, 8, 500.f, 200.f);

            normals[index][0] = 0.f;
            normals[index][1] = 1.f;
            normals[index][2] = 0.f;
        }
    }   

    for (uint32_t j = 0; j < length - 1; ++j) {
        for (uint32_t i = 0; i < length - 1; ++i) {
            uint32_t vertexIndex = j * length + i;
            uint32_t index = j * (length - 1) + i;

            indices[6 * index + 0] = vertexIndex;
            indices[6 * index + 1] = vertexIndex + 1;
            indices[6 * index + 2] = vertexIndex + 1 + length;
            indices[6 * index + 3] = vertexIndex;
            indices[6 * index + 4] = vertexIndex + 1 + length;
            indices[6 * index + 5] = vertexIndex + length;
        }
    }

    indexBufferId = static_cast<uint32_t>(rand());
    positionBufferId = static_cast<uint32_t>(rand());
    normalBufferId = static_cast<uint32_t>(rand());

    contentBoundingVolume.set(flint::core::AxisAlignedBox<3, float> (
        { positions[0][0], positions[0][1], positions[0][2] },
        { positions[0][0], positions[0][1], positions[0][2] }
    ));

    for (const auto& p : positions) {
        contentBoundingVolume->Merge({ p[0], p[1], p[2] });
    }

    ready = true;
}

void TerrainTileContent::DestroyImpl() {

}

bool TerrainTileContent::IsEmptyImpl() const {
    if (!tile->parent) {
        return tile->index.j != 0;
    }

    bool parentContentReady = tile->parent->ContentReady() && tile->parent->HasRendererableContent();
    if (!parentContentReady) {
        return true;
    }
    
    assert(tile->parent->content->contentBoundingVolume.hasValue());
    assert(tile->boundingVolume.hasValue());
    const auto& a = *tile->parent->content->contentBoundingVolume;
    const auto& b = *tile->boundingVolume;
    bool intersectsParentContent = (
        (std::abs(a.min(0) - b.min(0)) * 2 <= (a.Extent(0) + b.Extent(0))) &&
        (std::abs(a.min(1) - b.min(1)) * 2 <= (a.Extent(1) + b.Extent(1))) &&
        (std::abs(a.min(2) - b.min(2)) * 2 <= (a.Extent(2) + b.Extent(2)))
    );

    return !intersectsParentContent;
}

bool TerrainTileContent::IsReadyImpl() const {
    return ready;
}

void TerrainTileContent::UpdateImpl(const flint::core::FrameState &frameState,
                                    flint::rendering::gl::CommandBuffer* commands) {
    if (!IsEmpty() && IsReady()) {
        if (!committed) {
            commands->Record<CommandType::CreateBuffer>(CreateBufferCmd{ indexBufferId });
            commands->Record<CommandType::BindBuffer>(BindBufferCmd{ indexBufferId, BufferTarget::ELEMENT_ARRAY_BUFFER });
            commands->Record<CommandType::BufferData>(BufferDataCmd{ BufferTarget::ELEMENT_ARRAY_BUFFER, BufferUsage::STATIC_DRAW , static_cast<uint32_t>(indices.size() * sizeof(uint32_t)) });
            commands->RecordData<uint32_t>(indices.data(), indices.size());

            commands->Record<CommandType::CreateBuffer>(CreateBufferCmd{ positionBufferId });
            commands->Record<CommandType::BindBuffer>(BindBufferCmd{ positionBufferId, BufferTarget::ARRAY_BUFFER });
            commands->Record<CommandType::BufferData>(BufferDataCmd{ BufferTarget::ARRAY_BUFFER, BufferUsage::STATIC_DRAW, static_cast<uint32_t>(positions.size() * 3 * sizeof(float)) });
            commands->RecordData<float>(&positions[0][0], 3 * positions.size());

            commands->Record<CommandType::CreateBuffer>(CreateBufferCmd{ normalBufferId });
            commands->Record<CommandType::BindBuffer>(BindBufferCmd{ normalBufferId, BufferTarget::ARRAY_BUFFER });
            commands->Record<CommandType::BufferData>(BufferDataCmd{ BufferTarget::ARRAY_BUFFER, BufferUsage::STATIC_DRAW, static_cast<uint32_t>(normals.size() * 3 * sizeof(float)) });
            commands->RecordData<float>(&normals[0][0], 3 * normals.size());
        }

        commands->Record<CommandType::BindBuffer>(BindBufferCmd{ positionBufferId, BufferTarget::ARRAY_BUFFER });
        commands->Record<CommandType::EnableVertexAttribArray>(EnableVertexAttribArrayCmd{ 0 });
        commands->Record<CommandType::VertexAttribPointer>(VertexAttribPointerCmd{ 0, 3, ComponentDatatype::FLOAT, false, 0, 0 });

        commands->Record<CommandType::BindBuffer>(BindBufferCmd{ indexBufferId, BufferTarget::ELEMENT_ARRAY_BUFFER });
        commands->Record<CommandType::DrawElements>(DrawElementsCmd{ DrawMode::LINES, static_cast<uint32_t>(indices.size()), IndexDatatype::UNSIGNED_INT, 0 });

        commands->Record<CommandType::DisableVertexAttribArray>(DisableVertexAttribArrayCmd{ 0 });
    }
}

void TerrainTileContent::CommitImpl() {
    committed = true;
}

TerrainTileContent::~TerrainTileContent() {
    this->Destroy();
}

}
}
