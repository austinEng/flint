#include <vector>
#include "TerrainTileContent.h"

namespace flint {
namespace tileset {

using namespace flint::rendering::gl;

TerrainTileContent::TerrainTileContent(TerrainTile* tile) : tile(tile), ready(false) {

}

void TerrainTileContent::CreateImpl() {
    float size = static_cast<float>(std::pow(0.5f, tile->index.depth) * TERRAIN_ROOT_SIZE);
    Eigen::Array<float, 3, 1> base(
        size * tile->index.i,
        size * tile->index.j,
        size * tile->index.k
    );
    
    constexpr uint32_t subdivisions = 6;
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
            positions[index][0] = base[0] + stepSize * i * size;
            positions[index][1] = base[1];
            positions[index][2] = base[2] + stepSize * j * size;

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


    ready = true;
}

void TerrainTileContent::DestroyImpl() {

}

bool TerrainTileContent::IsEmptyImpl() const {
    if (!tile->parent) {
        return tile->index.j != 0;
    }

    bool parentContentReady = tile->parent->ContentReady() && tile->parent->HasRendererableContent();
    return !parentContentReady;
}

bool TerrainTileContent::IsReadyImpl() const {
    return ready;
}

void TerrainTileContent::UpdateImpl(const flint::core::FrameState &frameState,
                                    flint::rendering::gl::CommandBuffer* commands) {
    if (!IsEmpty() && IsReady()) {
        if (!committed) {
            (*commands)
                .Record<CommandType::CreateBuffer>(CreateBufferCmd{ indexBufferId })
                .Record<CommandType::BindBuffer>(BindBufferCmd{ indexBufferId, BufferTarget::ELEMENT_ARRAY_BUFFER })
                .Record<CommandType::BufferData>(BufferDataCmd{ BufferTarget::ELEMENT_ARRAY_BUFFER, static_cast<uint32_t>(indices.size() * sizeof(uint32_t)), BufferUsage::STATIC_DRAW })
                .RecordData<uint32_t>(indices.data(), indices.size())

                .Record<CommandType::CreateBuffer>(CreateBufferCmd{ positionBufferId })
                .Record<CommandType::BindBuffer>(BindBufferCmd{ positionBufferId, BufferTarget::ARRAY_BUFFER })
                .Record<CommandType::BufferData>(BufferDataCmd{ BufferTarget::ARRAY_BUFFER, static_cast<uint32_t>(positions.size() * 3 * sizeof(float)), BufferUsage::STATIC_DRAW })
                .RecordData<float>(&positions[0][0], 3 * positions.size())

                .Record<CommandType::CreateBuffer>(CreateBufferCmd{ normalBufferId })
                .Record<CommandType::BindBuffer>(BindBufferCmd{ normalBufferId, BufferTarget::ARRAY_BUFFER })
                .Record<CommandType::BufferData>(BufferDataCmd{ BufferTarget::ARRAY_BUFFER, static_cast<uint32_t>(normals.size() * 3 * sizeof(float)), BufferUsage::STATIC_DRAW })
                .RecordData<float>(&normals[0][0], 3 * normals.size())
                ;
        }

        (*commands)
            .Record<CommandType::BindBuffer>(BindBufferCmd{ positionBufferId, BufferTarget::ARRAY_BUFFER })
            .Record<CommandType::EnableVertexAttribArray>(EnableVertexAttribArrayCmd{ 0 })
            .Record<CommandType::VertexAttribPointer>(VertexAttribPointerCmd{ 0, 3, ComponentDatatype::FLOAT, false, 0, 0 })

            .Record<CommandType::BindBuffer>(BindBufferCmd{ indexBufferId, BufferTarget::ELEMENT_ARRAY_BUFFER })
            .Record<CommandType::DrawElements>(DrawElementsCmd{ DrawMode::LINES, static_cast<uint32_t>(indices.size()), IndexDatatype::UNSIGNED_INT, 0 })

            .Record<CommandType::DisableVertexAttribArray>(DisableVertexAttribArrayCmd{ 0 })
            ;
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
