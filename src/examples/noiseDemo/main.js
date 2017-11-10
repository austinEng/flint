import NoiseDemo from 'src/examples/noiseDemo';
import { createStatsAndGUI, setCanvasToWindowSize } from '../utils';

const canvas = document.getElementById('canvas');
canvas.addEventListener("webglcontextlost", function(e) {
  alert('WebGL context lost. You will need to reload the page.'); e.preventDefault();
}, false);

const params = {
  noise0: 2.0,
  noise1: 0.1,
};

const noiseDemoModule = new NoiseDemo({
  canvas: canvas,
  arguments: [window.innerWidth.toString(), window.innerHeight.toString()],
  onRuntimeInitialized: function() {
    moduleBindings.updateSmallNoiseStrength(params.noise0);
    moduleBindings.updateLargeNoiseStrength(params.noise1);
    setCanvasToWindowSize(canvas);
  },
});

const moduleBindings = {
  updateSmallNoiseStrength: noiseDemoModule.cwrap('updateSmallNoiseStrength', 'number', ['number']),
  updateLargeNoiseStrength: noiseDemoModule.cwrap('updateLargeNoiseStrength', 'number', ['number']),
};

const gui = createStatsAndGUI();
gui.add(params, 'noise0', 0, 5).onChange(moduleBindings.updateSmallNoiseStrength);
gui.add(params, 'noise1', 0, 1).onChange(moduleBindings.updateLargeNoiseStrength);
