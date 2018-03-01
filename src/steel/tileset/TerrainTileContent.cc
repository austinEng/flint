#include <vector>
#include <random>
#include <steel/geometry/BoundingBoxGeometry.h>
#include <steel/shader/WireProgram.h>
#include "TerrainTileset.h"
#include "TerrainTileContent.h"

namespace steel {
namespace tileset {

using namespace flint;
using namespace steel::rendering::gl;

static constexpr uint32_t indexCount = 6 * core::constPow(4, TERRAIN_SUBDIVISION_LEVEL);
static constexpr uint32_t bboxIndexCount = 24;
static constexpr uint32_t vertexLength = core::constPow(2, TERRAIN_SUBDIVISION_LEVEL) + 1;
static constexpr uint32_t vertexCount = core::constPow(vertexLength, 2);
static constexpr float vertexStepSize = core::constPow(0.5f, TERRAIN_SUBDIVISION_LEVEL);
static constexpr float terrainScale = 1.f / 5000.f;
static constexpr float terrainAmplitude = 5000.f;

namespace {
    // http://www.iquilezles.org/www/articles/morenoise/morenoise.htm
    float rand2D(const Eigen::Matrix<float, 2, 1> &v) {
        double f = std::sin(static_cast<double>(v[0]) * 12.9898 + static_cast<double>(v[1]) * 78.233) * 43758.5453;
        return static_cast<float>(f - std::floor(f));
    }

    float wangHash(uint32_t u, uint32_t v, uint32_t s) {
        uint32_t seed = (u * 1664525u + v) + s;
        seed = (seed ^ 61u) ^ (seed >> 16u);
        seed *= 9u;
        seed = seed ^ (seed >> 4u);
        seed *= 668265261u;
        seed = seed ^ (seed >> 15u);

        return static_cast<float>(seed) / 4294967296.f;
    }

    float wangHash(const Eigen::Matrix<float, 2, 1> &x) {
        uint32_t u = *reinterpret_cast<const uint32_t*>(&x[0]);
        uint32_t v = *reinterpret_cast<const uint32_t*>(&x[1]);
        return wangHash(u, v, 0);
    }

    // returns 3D value noise and its 3 derivatives
    Eigen::Matrix<float, 3, 1> noised(const Eigen::Matrix<float, 2, 1> &x) {
        Eigen::Matrix<float, 2, 1> p = x.array().floor().matrix();
        Eigen::Array<float, 2, 1> w = x - p;

        Eigen::Matrix<float, 2, 1> u = w*w*w*(w*(w*6.0 - 15.0) + 10.0);
        Eigen::Matrix<float, 2, 1> du = 30.0*w*w*(w*(w - 2.0) + 1.0);

        float a = wangHash(p + Eigen::Matrix<float, 2, 1>(0, 0));
        float b = wangHash(p + Eigen::Matrix<float, 2, 1>(1, 0));
        float c = wangHash(p + Eigen::Matrix<float, 2, 1>(0, 1));
        float d = wangHash(p + Eigen::Matrix<float, 2, 1>(1, 1));

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

        m2i = m2.transpose();

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
        uint32_t octaves = (depth + 1) * TERRAIN_SUBDIVISION_LEVEL;

        Eigen::Matrix<float, 3, 1> cliffBase = fbm(1.9f, 0.55f, 0.5f, p * terrainScale, octaves > 6 ? 6 : octaves);
        Eigen::Matrix<float, 3, 1> fbmNoise = fbm(1.9f, 0.4, 1.0f, p * terrainScale, octaves);

        const float cliffFac = 0.05f;
        Eigen::Matrix<float, 2, 1> cliffs = smoothstepd(-0.08f, -0.01f, cliffBase[2]);
        fbmNoise[2] = fbmNoise[2] + cliffFac*cliffs[0];
        fbmNoise.topRows(2) = fbmNoise.topRows(2) + cliffFac*cliffs[1]* cliffBase.topRows(2);

        fbmNoise[2] *= terrainAmplitude;
        fbmNoise.topRows(2) *= terrainAmplitude * terrainScale;
        return fbmNoise;
    }
}

namespace {

    const std::string vertexShader = std::string("") +
        R"(#version 300 es
precision highp float;
precision highp int;

layout(location = 0) in vec3 position;
layout(location = 1) in vec3 normal;
layout(location = 2) in vec3 color;
uniform mat4 viewProj;
uniform mat4 modelMatrix;
uniform uint depth;
uniform uint shaderOffsets;

out vec3 fs_color;
out vec3 fs_norm;
out vec3 fs_pos;

float wangHash(uint u, uint v, uint s) {
    uint seed = (u * 1664525u + v) + s;
    seed = (seed ^ 61u) ^ (seed >> 16u);
    seed *= 9u;
    seed = seed ^ (seed >> 4u);
    seed *= 668265261u;
    seed = seed ^ (seed >> 15u);

    return float(seed) / 4294967296.0;
}

float wangHash(vec2 x) {
    uint u = floatBitsToUint(x[0]);
    uint v = floatBitsToUint(x[1]);
    return wangHash(u, v, 0u);
}

vec3 noised(vec2 x) {
    vec2 p = floor(x);
    vec2 w = fract(x);

    vec2 u = w*w*w*(w*(w*6.0 - 15.0) + 10.0);
    vec2 du = 30.0*w*w*(w*(w - 2.0) + 1.0);

    float a = wangHash(p + vec2(0, 0));
    float b = wangHash(p + vec2(1, 0));
    float c = wangHash(p + vec2(0, 1));
    float d = wangHash(p + vec2(1, 1));

    float k0 = a;
    float k1 = b - a;
    float k2 = c - a;
    float k4 = a - b - c + d;

    vec2 deriv = 2.0 * du * vec2(k1 + k4*u[1], k2 + k4 * u[0]);
    return vec3(deriv[0], deriv[1], -1.0+2.0*(k0 + k1*u[0] + k2*u[1] + k4*u[0]*u[1]));
}

vec3 fbm(float f, float s, float b, vec2 p, int octaves) {
    float denom = 1.0 - s;
    float a = 0.0;
    vec2 d = vec2(0.0, 0.0);

    mat2 m = mat2(
        1.0, 0.0,
        0.0, 1.0
    );

    const mat2 m2 = transpose(mat2(
        0.8, 0.6,
       -0.6, 0.8
    ));

    const mat2 m2i = transpose(m2);

    for (int i = 0; i < octaves; i++) {
        vec3 n = noised(p);
        a += b*denom*n.z;
        d += b*denom*m*n.xy;
        b *= s;
        p = f*m2*p;
        m = f*m2i*m;
    }
    return vec3(d, a);
}

vec2 smoothstepd(float a, float b, float x) {
    if (x<a) return vec2(0.0, 0.0);
    if (x>b) return vec2(1.0, 0.0);
    float ir = 1.0 / (b - a);
    x = (x - a) * ir;
    return vec2(x*x*(3.0 - 2.0*x), 6.0*x*(1.0 - x)*ir);
}

vec3 terrain(vec2 p, uint d) {
    const float terrainScale = )" + std::to_string(terrainScale) + R"(;
    int octaves = (int(d) + 1) * )" + std::to_string(TERRAIN_SUBDIVISION_LEVEL) + R"(;
    const float terrainAmplitude = )" + std::to_string(terrainAmplitude) + R"(;

    vec3 cliffBase = fbm(1.9, 0.55, 0.5, p * terrainScale, octaves > 6 ? 6 : octaves);
    vec3 fbmNoise = fbm(1.9, 0.4, 1.0, p * terrainScale, octaves);

    const float cliffFac = 0.05;
    vec2 cliffs = smoothstepd(-0.08, -0.01, cliffBase[2]);
    fbmNoise.z = fbmNoise.z + cliffFac * cliffs[0];
    fbmNoise.xy = fbmNoise.xy + cliffFac * cliffs[1] * cliffBase.xy;

    fbmNoise.z *= terrainAmplitude;
    fbmNoise.xy *= terrainAmplitude * terrainScale;
    return fbmNoise;
}

void main() {
    if (shaderOffsets == 1u) {
        vec4 p = modelMatrix * vec4(position, 1.0);
        vec3 noise = terrain(p.xz, depth);
        vec3 terrain_position = vec3(p.x, noise[2], p.z);
        vec3 terrain_normal = normalize(vec3(-noise.x, 1.0, -noise.y));

        fs_color = vec3(0.2);
        fs_norm = terrain_normal;
        fs_pos = terrain_position;
        gl_Position = viewProj * vec4(terrain_position, 1.0);
    } else {
        fs_color = color;
        fs_norm = normal;
        fs_pos = position;
        gl_Position = viewProj * vec4(position, 1.0);
    }
}
)";

    const std::string fragmentShader =
        R"(#version 300 es
precision highp float;

in vec3 fs_color;
in vec3 fs_norm;
in vec3 fs_pos;
uniform vec3 cameraPosition;
uniform float screenSpaceError;

out vec4 outColor;

const float exposure = 1.0;
const vec3 ambientColor = 0.25 * normalize(vec3(0.5, 0.5, 1));
const vec3 sunColor = 2.0 * normalize(vec3(1.5, 0.7, 0.3));
const vec3 sunDirection = normalize(vec3(1, 2, 1));
const vec3 worldUp = normalize(vec3(0, 1, 0));
const vec3 fogColor = vec3(0, 0, 0);
const float fogDensity = 0.00005;

const float specularHardness = 2.0;
const vec3 specularColor = vec3(0.1);

void main() {
    vec3 color = fs_color;
    if (screenSpaceError > 20.0) {
        color = vec3(1.0, 0.2, 0.2);
    }

    vec3 cameraVec = cameraPosition - fs_pos;
    vec3 cameraDir = normalize(cameraVec);

    float sunDiffuseIntensity = max(0.0, dot(fs_norm, sunDirection));
    float sunSpecularIntensity = pow(max(0.0, dot(fs_norm, normalize(sunDirection + cameraDir))), specularHardness);

    vec3 ambientTerm = ambientColor * max(0.0, dot(fs_norm, worldUp)) * color;
    vec3 diffuseTerm = sunColor * sunDiffuseIntensity * color;
    vec3 specularTerm = sunColor * sunSpecularIntensity * specularColor;

    color = vec3(ambientTerm + diffuseTerm + specularTerm);

    color = 1.0 - exp(-color * exposure);
    color = pow(color, vec3(1.0 / 2.2));

    float fogDistance = length(cameraVec);
    color = mix(fogColor, color, exp(-pow(fogDistance * fogDensity, 2.0)));

    outColor = vec4(color, 1.0);
}
)";

}

TerrainTileContentShaderProgram::TerrainTileContentShaderProgram() : created(false) {
}

void TerrainTileContentShaderProgram::Create(steel::rendering::gl::CommandBuffer* commands) {
    if (!created) {
        created = true;

        rendering::gl::SerialCounted<rendering::gl::Shader> vertexShaderId(new rendering::gl::Shader);
        rendering::gl::SerialCounted<rendering::gl::Shader> fragmentShaderId(new rendering::gl::Shader);
        program.Create();

        commands->Record<CommandType::CreateShader>(CreateShaderCmd{ vertexShaderId, ShaderType::VERTEX_SHADER, vertexShader.size() });
        commands->RecordData<char>(vertexShader.data(), vertexShader.size());
        commands->Record<CommandType::CreateShader>(CreateShaderCmd{ fragmentShaderId, ShaderType::FRAGMENT_SHADER, fragmentShader.size() });
        commands->RecordData<char>(fragmentShader.data(), fragmentShader.size());
        commands->Record<CommandType::CreateProgram>(CreateProgramCmd{ program, 2 });
        uint32_t shaders[] = { vertexShaderId, fragmentShaderId };
        commands->RecordData<uint32_t>(shaders, 2);
        commands->Record<CommandType::DeleteShader>(DeleteShaderCmd{ vertexShaderId });
        commands->Record<CommandType::DeleteShader>(DeleteShaderCmd{ fragmentShaderId });
    }
}

void TerrainTileContentShaderProgram::Use(steel::rendering::gl::CommandBuffer* commands) {
    commands->Record<CommandType::UseProgram>(UseProgramCmd{ program });
}

TerrainTileContentGeometry::TerrainTileContentGeometry() : created(false) {
}

void TerrainTileContentGeometry::Create(CommandBuffer* commands) {
    if (!created) {
        created = true;

        std::vector<uint32_t> indices(indexCount);
        std::vector<std::array<float, 3>> positions(vertexCount);

        for (uint32_t j = 0; j < vertexLength; ++j) {
            for (uint32_t i = 0; i < vertexLength; ++i) {
                uint32_t index = j * vertexLength + i;
                positions[index][0] = vertexStepSize * i;
                positions[index][1] = 0.f;
                positions[index][2] = vertexStepSize * j;
            }
        }

        for (uint32_t j = 0; j < vertexLength - 1; ++j) {
            for (uint32_t i = 0; i < vertexLength - 1; ++i) {
                uint32_t vertexIndex = j * vertexLength + i;
                uint32_t index = j * (vertexLength - 1) + i;

                indices[6 * index + 0] = vertexIndex;
                indices[6 * index + 1] = vertexIndex + 1;
                indices[6 * index + 2] = vertexIndex + 1 + vertexLength;
                indices[6 * index + 3] = vertexIndex;
                indices[6 * index + 4] = vertexIndex + 1 + vertexLength;
                indices[6 * index + 5] = vertexIndex + vertexLength;
            }
        }

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

        vertexArray.Create();

        commands->Record<CommandType::CreateVertexArray>(CreateVertexArrayCmd{ vertexArray });
        commands->Record<CommandType::BindVertexArray>(BindVertexArrayCmd{ vertexArray });

        indexBuffer->CreateAndUpload<uint32_t>(commands, indexBuffer);

        positionBuffer->CreateAndUpload<float>(commands, positionBuffer);
        commands->Record<CommandType::VertexAttribPointer>(VertexAttribPointerCmd{ 0, 3, ComponentDatatype::FLOAT, false, 0, 0 });
        commands->Record<CommandType::EnableVertexAttribArray>(EnableVertexAttribArrayCmd{ 0 });

        commands->Record<CommandType::BindVertexArray>(BindVertexArrayCmd{ 0 });

        commands->Record<CommandType::DeleteBuffer>(DeleteBufferCmd{ indexBuffer });
        commands->Record<CommandType::DeleteBuffer>(DeleteBufferCmd{ positionBuffer });
    }
}

void TerrainTileContentGeometry::Draw(const flint::core::FrameState &frameState, CommandBuffer* commands) {
    commands->Record<CommandType::BindVertexArray>(BindVertexArrayCmd{ vertexArray });
    commands->Record<CommandType::DrawElements>(DrawElementsCmd{ DrawMode::TRIANGLES, indexCount, IndexDatatype::UNSIGNED_INT, 0 });
}

TerrainTileContent::TerrainTileContent(TerrainTile* tile)
  : tile(tile),
    ready(false),
    useShaderOffsets(reinterpret_cast<TerrainTileset*>(tile->tileset)->generationMode == TerrainTilesetGenerationMode::GPU) {

    if (useShaderOffsets) {
        assert(tile->boundingVolume);
        auto min = tile->boundingVolume->min();
        auto max = tile->boundingVolume->max();
        auto diag = max - min;

        modelMatrix <<
            diag[0], 0.f, 0.f, min[0],
            0.f, diag[1], 0.f, min[1],
            0.f, 0.f, diag[2], min[2],
            0.f, 0.f, 0.f, 1.f;
    }
}

TerrainTileContent::TerrainSample TerrainTileContent::SampleTerrain(float x, float z, uint32_t depth) {
    auto noise = terrain({ x, z }, depth);
    auto normal = Eigen::Matrix<float, 3, 1>(-noise[0], 1.f, -noise[1]).normalized();
    return { noise[2], normal };
}

float TerrainTileContent::GeometricError(uint32_t depth) {
    constexpr float fac = 0.4;
    float heightError = terrainAmplitude * core::constPow(fac, depth) / (1.f - fac);
    float tileSize = TERRAIN_ROOT_SIZE * core::constPow(0.5, depth);
    float tileArea = tileSize * tileSize;

    return heightError * tileArea / static_cast<float>(vertexCount);
}

void TerrainTileContent::CreateImpl(steel::rendering::gl::CommandBuffer* commands) {
    TerrainTileContentShaderProgram::GetInstance().Create(commands);
    steel::shader::WireProgram::GetInstance().Create(commands);
    steel::geometry::BoundingBoxGeometry::GetInstance().Create(commands);

    assert(tile->boundingVolume);
    auto min = tile->boundingVolume->min();
    auto max = tile->boundingVolume->max();
    auto diag = max - min;

    if (useShaderOffsets) {
        TerrainTileContentGeometry::GetInstance().Create(commands);
    } else {
        std::vector<uint32_t> indices(indexCount + bboxIndexCount);
        std::vector<std::array<float, 3>> positions(vertexCount);
        std::vector<std::array<float, 3>> normals(vertexCount);
        std::vector<std::array<float, 3>> colors(vertexCount);

        for (uint32_t j = 0; j < vertexLength; ++j) {
            for (uint32_t i = 0; i < vertexLength; ++i) {
                uint32_t index = j * vertexLength + i;
                positions[index][0] = min[0] + vertexStepSize * i * diag[0];
                positions[index][2] = min[2] + vertexStepSize * j * diag[2];

                auto sample = SampleTerrain(positions[index][0], positions[index][2], tile->index.depth);
                positions[index][1] = sample.height;
                Eigen::Array<float, 3, 1> p{ positions[index][0], positions[index][1], positions[index][2] };

                if (contentBoundingVolume) {
                    contentBoundingVolume->Merge(p);
                } else {
                    contentBoundingVolume.set(core::AxisAlignedBox<3, float>(p, p));
                }

                normals[index][0] = sample.normal[0];
                normals[index][1] = sample.normal[1];
                normals[index][2] = sample.normal[2];

                colors[index][0] = 0.8f;
                colors[index][1] = 0.8f;
                colors[index][2] = 0.8f;
            }
        }

        for (uint32_t j = 0; j < vertexLength - 1; ++j) {
            for (uint32_t i = 0; i < vertexLength - 1; ++i) {
                uint32_t vertexIndex = j * vertexLength + i;
                uint32_t index = j * (vertexLength - 1) + i;

                indices[6 * index + 0] = vertexIndex;
                indices[6 * index + 1] = vertexIndex + 1;
                indices[6 * index + 2] = vertexIndex + 1 + vertexLength;
                indices[6 * index + 3] = vertexIndex;
                indices[6 * index + 4] = vertexIndex + 1 + vertexLength;
                indices[6 * index + 5] = vertexIndex + vertexLength;
            }
        }

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
    }

    ready = true;
}

void TerrainTileContent::DestroyImpl(steel::rendering::gl::CommandBuffer* commands) {
    if (ready) {
        if (!useShaderOffsets) {
            commands->Record<CommandType::DeleteVertexArray>(DeleteVertexArrayCmd{ vertexArray });
            vertexArray.Release();
        }
        ready = false;
    }
}

bool TerrainTileContent::IsEmptyImpl() const {
    if (!tile->parent) {
        return false;
    }

    bool parentContentReady = tile->parent->ContentReady() && tile->parent->HasRendererableContent();
    return !parentContentReady;
}

bool TerrainTileContent::IsReadyImpl() const {
    return ready;
}

void TerrainTileContent::UpdateImpl(const flint::core::FrameState &frameState) {
    if (useShaderOffsets) {
        auto min = tile->boundingVolume->min();
        auto max = tile->boundingVolume->max();
        auto diag = max - min;

        static std::random_device rd;
        std::uniform_real_distribution<float> xdist(min[0], max[0]);
        std::uniform_real_distribution<float> zdist(min[2], max[2]);
        for (uint32_t i = 0; i < 5; ++i) {
            float x = xdist(rd);
            float z = zdist(rd);
            auto sample = SampleTerrain(x, z, tile->index.depth);
            Eigen::Array<float, 3, 1> p{ x, sample.height, z };
            if (contentBoundingVolume) {
                contentBoundingVolume->Merge(p);
            } else {
                contentBoundingVolume.set(core::AxisAlignedBox<3, float>(p, p));
            }
        }

        ready = TerrainTileContentGeometry::GetInstance().created;
    }
}

void TerrainTileContent::DrawImpl(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands) {
    if (!IsEmpty() && IsReady()) {
        commands->Record<CommandType::Uniform1ui>(Uniform1uiCmd{ "depth", tile->index.depth });
        commands->Record<CommandType::Uniform1f>(Uniform1fCmd{ "screenSpaceError", tile->screenSpaceError });
        if (useShaderOffsets) {
            commands->Record<CommandType::UniformMatrix4fv>(UniformMatrix4fvCmd{ "modelMatrix", 1, false });
            commands->RecordData<float>(modelMatrix.data(), 16);
            TerrainTileContentGeometry::GetInstance().Draw(frameState, commands);
        } else {
            commands->Record<CommandType::BindVertexArray>(BindVertexArrayCmd{ vertexArray });
            commands->Record<CommandType::DrawElements>(DrawElementsCmd{ DrawMode::TRIANGLES, indexCount, IndexDatatype::UNSIGNED_INT, 0 });
            commands->Record<CommandType::DrawElements>(DrawElementsCmd{ DrawMode::LINES, bboxIndexCount, IndexDatatype::UNSIGNED_INT, indexCount * sizeof(uint32_t) });
        }
    }
}

void TerrainTileContent::DrawBoundingBoxImpl(const flint::core::FrameState &frameState, steel::rendering::gl::CommandBuffer* commands) {
    auto bv = tile->getBoundingVolume();
    auto min = bv.min();
    auto max = bv.max();
    auto diag = max - min;

    Eigen::Matrix<float, 4, 4> modelMatrix;
    modelMatrix <<
        diag[0], 0.f, 0.f, min[0],
        0.f, diag[1], 0.f, min[1],
        0.f, 0.f, diag[2], min[2],
        0.f, 0.f, 0.f, 1.f;

    commands->Record<CommandType::UniformMatrix4fv>(UniformMatrix4fvCmd{ "modelMatrix", 1, false });
    commands->RecordData<float>(modelMatrix.data(), 16);

    static float color[4] = { 0.0, 0.0, 1.0, 1.0 };
    commands->Record<CommandType::Uniform4fv>(Uniform4fvCmd{ "color", 1 });
    commands->RecordData<float>(color, 4);

    steel::geometry::BoundingBoxGeometry::GetInstance().Draw(frameState, commands);
}

}
}
