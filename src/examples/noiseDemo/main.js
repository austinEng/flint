import NoiseDemo from 'examples/noiseDemo';
import { createStatsAndGUI, setCanvasToWindowSize } from '../utils';

const canvas = document.getElementById('canvas');
canvas.addEventListener("webglcontextlost", function(e) {
  alert('WebGL context lost. You will need to reload the page.'); e.preventDefault();
}, false);

const params = {
  noise0: 2.0,
  noise1: 0.1,
  drawMode: 0,
  subdivisions: 6,
  enableWorkers: true,
};


const workers = {
  CreateGeometry: require('workers/createGeometry'),
};

const noiseDemoModule = new NoiseDemo({
  canvas: canvas,
  arguments: [window.innerWidth.toString(), window.innerHeight.toString()],
  onRuntimeInitialized() {
    moduleBindings.updateSmallNoiseStrength(params.noise0);
    moduleBindings.updateLargeNoiseStrength(params.noise1);
    moduleBindings.updateDrawMode(params.drawMode);
    setCanvasToWindowSize(noiseDemoModule);
  },
  getWorkerURL(moduleName) {
    return workers[moduleName];
  },
});

const moduleBindings = {
  updateSmallNoiseStrength: noiseDemoModule.cwrap('updateSmallNoiseStrength', 'number', ['number']),
  updateLargeNoiseStrength: noiseDemoModule.cwrap('updateLargeNoiseStrength', 'number', ['number']),
  updateDrawMode: noiseDemoModule.cwrap('updateDrawMode', 'number', ['number']),
  updateSubdivisions: noiseDemoModule.cwrap('updateSubdivisions', 'number', ['number']),
  updateEnableWorkers: noiseDemoModule.cwrap('updateEnableWorkers', 'number', ['number']),
};

const gui = createStatsAndGUI();
gui.add(params, 'noise0', 0, 5).onChange(moduleBindings.updateSmallNoiseStrength);
gui.add(params, 'noise1', 0, 1).onChange(moduleBindings.updateLargeNoiseStrength);
gui.add(params, 'drawMode', 0, 1).step(1).onChange(moduleBindings.updateDrawMode);
gui.add(params, 'subdivisions', 0, 8).step(1).onChange(moduleBindings.updateSubdivisions);
gui.add(params, 'enableWorkers').onChange(moduleBindings.updateEnableWorkers);
