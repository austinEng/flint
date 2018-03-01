import TerrainDemo from 'examples/terrainDemoCPU';
import { main } from './main';

main(TerrainDemo, {
  TerrainGenerator: require('workers/terrainGeneratorCPU'),
});
