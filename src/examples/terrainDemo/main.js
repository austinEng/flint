import TerrainDemo from 'examples/terrainDemo';

import { createStatsAndGUI, setCanvasToWindowSize } from '../utils';

const canvas = document.getElementById('canvas');
canvas.addEventListener("webglcontextlost", function(e) {
  alert('WebGL context lost. You will need to reload the page.'); e.preventDefault();
}, false);

const workers = {
  TerrainGenerator: require('workers/terrainGenerator'),
};

const terrainDemoModule = new TerrainDemo({
  canvas,
  arguments: [window.innerWidth.toString(), window.innerHeight.toString()],
  onRuntimeInitialized() {
    setCanvasToWindowSize(terrainDemoModule);
  },
  getWorkerURL(moduleName) {
    return workers[moduleName];
  },
});

const gui = createStatsAndGUI();
