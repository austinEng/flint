#include <vector>
#include <random>
#include "TerrainTileContent.h"

namespace flint {
namespace tileset {

using namespace flint::rendering::gl;

namespace {
    // http://www.iquilezles.org/www/articles/morenoise/morenoise.htm
    float rand2D(const Eigen::Matrix<float, 2, 1> &v) {
        double f = std::sin(static_cast<double>(v[0]) * 12.9898 + static_cast<double>(v[1]) * 78.233) * 43758.5453;
        return static_cast<float>(f - std::floor(f));
    }

    // returns 3D value noise and its 3 derivatives
    Eigen::Matrix<float, 3, 1> noised(const Eigen::Matrix<float, 2, 1> &x) {
        Eigen::Matrix<float, 2, 1> p = x.array().floor().matrix();
        Eigen::Array<float, 2, 1> w = x - p;

        Eigen::Matrix<float, 2, 1> u = w*w*w*(w*(w*6.0 - 15.0) + 10.0);
        Eigen::Matrix<float, 2, 1> du = 30.0*w*w*(w*(w - 2.0) + 1.0);

        float a = rand2D(p + Eigen::Matrix<float, 2, 1>(0, 0));
        float b = rand2D(p + Eigen::Matrix<float, 2, 1>(1, 0));
        float c = rand2D(p + Eigen::Matrix<float, 2, 1>(0, 1));
        float d = rand2D(p + Eigen::Matrix<float, 2, 1>(1, 1));

        float k0 = a;
        float k1 = b - a;
        float k2 = c - a;
        float k4 = a - b - c + d;

        Eigen::Array<float, 2, 1> deriv = 2.0 * du.array() * Eigen::Array<float, 2, 1>(k1 + k4*u[1], k2 + k4 * u[0]);
        return Eigen::Matrix<float, 3, 1>(deriv[0], deriv[1], -1.0+2.0*(k0 + k1*u[0] + k2*u[1] + k4*u[0]*u[1]));
    }

    Eigen::Matrix<float, 3, 1> fbm(float f, float s, float b, Eigen::Matrix<float,2, 1> p, uint32_t octaves) {
        float denom = 1.0 - s;
        float a = 0.0;
        auto d = Eigen::Matrix<float, 2, 1>(0.f, 0.f);
        Eigen::Matrix<float, 2, 2> m, m2, m2i;

        m << 1.0, 0.0,
             0.0, 1.0;

        m2 << 0.8, 0.6,
             -0.6, 0.8;

        m2i << 0.8,-0.6,
               0.6, 0.8;

        for (uint32_t i = 0; i < octaves; i++) {
            Eigen::Matrix<float, 3, 1> n = noised(p);
            a += b*denom*n[2];
            d += b*denom*m*n.topRows(2);
            b *= s;
            p = f*m2*p;
            m = f*m2i*m;
        }
        return Eigen::Matrix<float, 3, 1>(d[0], d[1], a);
    }

    // return smoothstep and its derivative
    Eigen::Matrix<float, 2, 1> smoothstepd(float a, float b, float x) {
        if (x<a) return Eigen::Matrix<float, 2, 1>(0.0, 0.0);
        if (x>b) return Eigen::Matrix<float, 2, 1>(1.0, 0.0);
        float ir = 1.0 / (b - a);
        x = (x - a) * ir;
        return Eigen::Matrix<float, 2, 1>(x*x*(3.0 - 2.0*x), 6.0*x*(1.0 - x)*ir);
    }

    Eigen::Matrix<float, 3, 1> terrain(Eigen::Matrix<float, 2, 1> p, uint32_t depth) {
        constexpr float scale = 1.0 / TERRAIN_ROOT_SIZE;
        uint32_t octaves = (depth + 1) * TERRAIN_SUBDIVISION_LEVEL;
        constexpr float amp = 5000.f;

        Eigen::Matrix<float, 3, 1> cliffBase = fbm(1.9f, 0.55f, 0.5f, p * scale, octaves > 6 ? 6 : octaves);
        Eigen::Matrix<float, 3, 1> fbmNoise = fbm(1.9f, 0.4, 1.0f, p * scale, octaves);

        const float cliffFac = 0.1f;
        Eigen::Matrix<float, 2, 1> cliffs = smoothstepd(-0.08f, -0.01f, cliffBase[2]);
        fbmNoise[2] = fbmNoise[2] + cliffFac*cliffs[0];
        fbmNoise.topRows(2) = fbmNoise.topRows(2) + cliffFac*cliffs[1]* cliffBase.topRows(2);
        
        fbmNoise[2] *= amp;
        fbmNoise.topRows(2) *= amp*scale;
        return fbmNoise;
    }
}

namespace {
    const std::string vertexShader = std::string("") +
R"(#version 300 es
precision highp float;

layout(location = 0) in vec3 position;
layout(location = 1) in vec3 normal;
layout(location = 2) in vec3 color;
uniform mat4 viewProj;

out vec3 fs_color;
out vec3 fs_norm;
out vec3 fs_pos;

void main() {
    fs_color = color;
    fs_norm = normal;
    fs_pos = position;
    gl_Position = viewProj * vec4(position, 1.0);
}
)";

    const std::string fragmentShader =
R"(#version 300 es
precision highp float;

in vec3 fs_color;
in vec3 fs_norm;
in vec3 fs_pos;
out vec4 outColor;

const vec3 lightDir1 = normalize(vec3(1, 0.5, 0));
const vec3 lightDir2 = normalize(vec3(0, 1, 1));
const vec3 lightDir3 = normalize(vec3(-1, 5, -1));

void main() {
    float lightingTerm = clamp(
        0.8 * max(0.0, dot(fs_norm, lightDir1)) +
        0.3 * max(0.0, dot(fs_norm, lightDir2)) +
        0.1 * max(0.0, dot(fs_norm, lightDir3)),
    0.0, 1.0);
    outColor = vec4(fs_norm, 1.0);
    outColor = vec4(lightingTerm * fs_color, 1.0);
}
)";
}

TerrainTileContentShaderProgram::TerrainTileContentShaderProgram() : created(false) {
    vertexShaderId = static_cast<uint32_t>(rand() % UINT32_MAX);
    fragmentShaderId = static_cast<uint32_t>(rand() % UINT32_MAX);
    programId = static_cast<uint32_t>(rand() % UINT32_MAX);
}

void TerrainTileContentShaderProgram::Create(flint::rendering::gl::CommandBuffer* commands) {
    if (!created) {
        created = true;

        commands->Record<CommandType::CreateShader>(CreateShaderCmd{ vertexShaderId, ShaderType::VERTEX_SHADER, vertexShader.size() });
        commands->RecordData<char>(vertexShader.data(), vertexShader.size());
        commands->Record<CommandType::CreateShader>(CreateShaderCmd{ fragmentShaderId, ShaderType::FRAGMENT_SHADER, fragmentShader.size() });
        commands->RecordData<char>(fragmentShader.data(), fragmentShader.size());
        commands->Record<CommandType::CreateProgram>(CreateProgramCmd{ programId, 2 });
        uint32_t shaders[] = { vertexShaderId, fragmentShaderId };
        commands->RecordData<uint32_t>(shaders, 2);
        commands->Record<CommandType::DeleteShader>(DeleteShaderCmd{ vertexShaderId });
        commands->Record<CommandType::DeleteShader>(DeleteShaderCmd{ fragmentShaderId });
    }
}

void TerrainTileContentShaderProgram::Use(flint::rendering::gl::CommandBuffer* commands) {
    commands->Record<CommandType::UseProgram>(UseProgramCmd{ programId });
}


TerrainTileContent::TerrainTileContent(TerrainTile* tile) : tile(tile), ready(false) {
}

void TerrainTileContent::CreateImpl(flint::rendering::gl::CommandBuffer* commands) {
    TerrainTileContentShaderProgram::GetInstance().Create(commands);

    assert(tile->boundingVolume.hasValue());
    
    auto min = tile->boundingVolume->min();
    auto max = tile->boundingVolume->max();
    auto diag = max - min;

    constexpr uint32_t indexCount = 6 * core::constPow(4, TERRAIN_SUBDIVISION_LEVEL);
    constexpr uint32_t length = core::constPow(2, TERRAIN_SUBDIVISION_LEVEL) + 1;
    constexpr uint32_t vertexCount = core::constPow(length, 2);
    constexpr float stepSize = core::constPow(0.5f, TERRAIN_SUBDIVISION_LEVEL);

    this->indexCount = indexCount;
    this->bboxIndexCount = 24;

    std::vector<uint32_t> indices(indexCount + 2 * this->bboxIndexCount);
    std::vector<std::array<float, 3>> positions(vertexCount + 16);
    std::vector<std::array<float, 3>> normals(vertexCount + 16);
    std::vector<std::array<float, 3>> colors(vertexCount + 16);

    for (uint32_t j = 0; j < length; ++j) {
        for (uint32_t i = 0; i < length; ++i) {
            uint32_t index = j * length + i;
            positions[index][0] = min[0] + stepSize * i * diag[0];
            positions[index][2] = min[2] + stepSize * j * diag[2];
            auto noise = terrain({ positions[index][0], positions[index][2] }, tile->index.depth);
            positions[index][1] = noise[2];
            Eigen::Array<float, 3, 1> p{ positions[index][0], positions[index][1], positions[index][2] };
            if (contentBoundingVolume) {
                contentBoundingVolume->Merge(p);
            } else {
                contentBoundingVolume.set(core::AxisAlignedBox<3, float>(p, p));
            }

            auto normal = Eigen::Matrix<float, 3, 1>(-noise[0], 1.f, -noise[1]).normalized();
            normals[index][0] = normal[0];
            normals[index][1] = normal[1];
            normals[index][2] = normal[2];

            colors[index][0] = 0.8f;
            colors[index][1] = 0.8f;
            colors[index][2] = 0.8f;
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

    min = contentBoundingVolume->min();
    max = contentBoundingVolume->max();
    positions[vertexCount + 0] = { min[0], min[1], min[2] };
    positions[vertexCount + 1] = { min[0], min[1], max[2] };
    positions[vertexCount + 2] = { min[0], max[1], min[2] };
    positions[vertexCount + 3] = { min[0], max[1], max[2] };
    positions[vertexCount + 4] = { max[0], min[1], min[2] };
    positions[vertexCount + 5] = { max[0], min[1], max[2] };
    positions[vertexCount + 6] = { max[0], max[1], min[2] };
    positions[vertexCount + 7] = { max[0], max[1], max[2] };
    for (uint32_t i = 0; i < 8; ++i) normals[vertexCount + i] = { 0.f, 1.f, 0.f };
    for (uint32_t i = 0; i < 8; ++i) colors[vertexCount + i] = { 0.f, 0.f, 1.f };
    for (uint32_t i = 0; i < 8; ++i) indices[indexCount + i] = (vertexCount + i);
    for (uint32_t i = 0; i < 8; ++i) indices[indexCount + i + 8] = (vertexCount + (2 * (i / 4) + i / 2 + 2 * (i % 2)));
    for (uint32_t i = 0; i < 8; ++i) indices[indexCount + i + 16] = (vertexCount + (i / 2 + 4 * (i % 2)));

    min = tile->boundingVolume->min();
    max = tile->boundingVolume->max();
    positions[vertexCount + 8 + 0] = { min[0], min[1], min[2] };
    positions[vertexCount + 8 + 1] = { min[0], min[1], max[2] };
    positions[vertexCount + 8 + 2] = { min[0], max[1], min[2] };
    positions[vertexCount + 8 + 3] = { min[0], max[1], max[2] };
    positions[vertexCount + 8 + 4] = { max[0], min[1], min[2] };
    positions[vertexCount + 8 + 5] = { max[0], min[1], max[2] };
    positions[vertexCount + 8 + 6] = { max[0], max[1], min[2] };
    positions[vertexCount + 8 + 7] = { max[0], max[1], max[2] };
    for (uint32_t i = 0; i < 8; ++i) normals[vertexCount + 8 + i] = { 0.f, 1.f, 0.f };
    for (uint32_t i = 0; i < 8; ++i) colors[vertexCount + 8 + i] = { 1.f, 0.f, 0.f };
    for (uint32_t i = 0; i < 8; ++i) indices[indexCount + this->bboxIndexCount + i] = (vertexCount + 8 + i);
    for (uint32_t i = 0; i < 8; ++i) indices[indexCount + this->bboxIndexCount + i + 8] = (vertexCount + 8 + (2 * (i / 4) + i / 2 + 2 * (i % 2)));
    for (uint32_t i = 0; i < 8; ++i) indices[indexCount + this->bboxIndexCount + i + 16] = (vertexCount + 8 + (i / 2 + 4 * (i % 2)));

    rendering::gl::SerialCounted<rendering::gl::Buffer> indexBuffer(new rendering::gl::Buffer{
        BufferUsage::STATIC_DRAW,
        BufferTarget::ELEMENT_ARRAY_BUFFER,
        indices.data(),
        indices.size(),
    });

    rendering::gl::SerialCounted<rendering::gl::Buffer> positionBuffer(new rendering::gl::Buffer{
        BufferUsage::STATIC_DRAW,
        BufferTarget::ARRAY_BUFFER,
        positions.data(),
        3 * positions.size(),
    });

    rendering::gl::SerialCounted<rendering::gl::Buffer> normalBuffer(new rendering::gl::Buffer{
        BufferUsage::STATIC_DRAW,
        BufferTarget::ARRAY_BUFFER,
        normals.data(),
        3 * normals.size(),
    });

    rendering::gl::SerialCounted<rendering::gl::Buffer> colorBuffer(new rendering::gl::Buffer{
        BufferUsage::STATIC_DRAW,
        BufferTarget::ARRAY_BUFFER,
        colors.data(),
        3 * colors.size(),
    });

    vertexArray.Create();

    commands->Record<CommandType::CreateVertexArray>(CreateVertexArrayCmd{ vertexArray });
    commands->Record<CommandType::BindVertexArray>(BindVertexArrayCmd{ vertexArray });

    indexBuffer->CreateAndUpload<uint32_t>(commands, indexBuffer);

    positionBuffer->CreateAndUpload<float>(commands, positionBuffer);
    commands->Record<CommandType::VertexAttribPointer>(VertexAttribPointerCmd{ 0, 3, ComponentDatatype::FLOAT, false, 0, 0 });
    commands->Record<CommandType::EnableVertexAttribArray>(EnableVertexAttribArrayCmd{ 0 });

    normalBuffer->CreateAndUpload<float>(commands, normalBuffer);
    commands->Record<CommandType::VertexAttribPointer>(VertexAttribPointerCmd{ 1, 3, ComponentDatatype::FLOAT, false, 0, 0 });
    commands->Record<CommandType::EnableVertexAttribArray>(EnableVertexAttribArrayCmd{ 1 });

    colorBuffer->CreateAndUpload<float>(commands, colorBuffer);
    commands->Record<CommandType::VertexAttribPointer>(VertexAttribPointerCmd{ 2, 3, ComponentDatatype::FLOAT, false, 0, 0 });
    commands->Record<CommandType::EnableVertexAttribArray>(EnableVertexAttribArrayCmd{ 2 });

    commands->Record<CommandType::BindVertexArray>(BindVertexArrayCmd{ 0 });

    commands->Record<CommandType::DeleteBuffer>(DeleteBufferCmd{ indexBuffer });
    commands->Record<CommandType::DeleteBuffer>(DeleteBufferCmd{ positionBuffer });
    commands->Record<CommandType::DeleteBuffer>(DeleteBufferCmd{ normalBuffer });
    commands->Record<CommandType::DeleteBuffer>(DeleteBufferCmd{ colorBuffer });

    ready = true;
}

void TerrainTileContent::DestroyImpl(flint::rendering::gl::CommandBuffer* commands) {
    if (ready) {
        commands->Record<CommandType::DeleteVertexArray>(DeleteVertexArrayCmd{ vertexArray });
        vertexArray.Release();
        ready = false;
    }
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

void TerrainTileContent::UpdateImpl(const flint::core::FrameState &frameState) {

}

void TerrainTileContent::DrawImpl(const flint::core::FrameState &frameState, flint::rendering::gl::CommandBuffer* commands) {
    if (!IsEmpty() && IsReady()) {
        commands->Record<CommandType::BindVertexArray>(BindVertexArrayCmd{ vertexArray });
        commands->Record<CommandType::DrawElements>(DrawElementsCmd{ DrawMode::TRIANGLES, indexCount, IndexDatatype::UNSIGNED_INT, 0 });
        commands->Record<CommandType::DrawElements>(DrawElementsCmd{ DrawMode::LINES, 2 * bboxIndexCount, IndexDatatype::UNSIGNED_INT, indexCount * sizeof(uint32_t) });
    }
}

}
}
