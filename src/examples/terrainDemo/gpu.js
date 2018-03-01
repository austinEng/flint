import TerrainDemo from 'examples/terrainDemoGPU';
import { main } from './main';

main(TerrainDemo, {
  TerrainGenerator: require('workers/terrainGeneratorGPU'),
});
