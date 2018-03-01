#include <steel/tileset/TerrainTileset.h>

steel::tileset::TerrainTileset* InitTerrainTileset() {
    return new steel::tileset::TerrainTileset(steel::tileset::TerrainTilesetGenerationMode::GPU);
}
