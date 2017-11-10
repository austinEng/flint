import NoiseDemo from 'src/examples/noiseDemo';
import { createStatsAndGUI, setCanvasToWindowSize } from '../utils';

const canvas = document.getElementById('canvas');
canvas.addEventListener("webglcontextlost", function(e) {
  alert('WebGL context lost. You will need to reload the page.'); e.preventDefault();
}, false);

const params = {
  frequency: 1,
};

const noiseDemoModule = new NoiseDemo({
  canvas: canvas,
  arguments: [window.innerWidth.toString(), window.innerHeight.toString()],
  onRuntimeInitialized: function() {
    moduleBindings.updateFrequency(params.frequency);
    setCanvasToWindowSize(canvas);
  },
});

const moduleBindings = {
  updateFrequency: noiseDemoModule.cwrap('updateFrequency', 'number', ['number'])
};

const gui = createStatsAndGUI();
gui.add(params, 'frequency', 0, 1).onChange(moduleBindings.updateFrequency);
