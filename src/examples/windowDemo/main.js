import WindowDemo from 'examples/windowDemo';
import { createStatsAndGUI, setCanvasToWindowSize } from '../utils';

const canvas = document.getElementById('canvas');
canvas.addEventListener("webglcontextlost", function(e) {
  alert('WebGL context lost. You will need to reload the page.'); e.preventDefault();
}, false);

const params = {
  frequency: 1,
};

const windowDemoModule = new WindowDemo({
  canvas: canvas,
  arguments: [window.innerWidth.toString(), window.innerHeight.toString()],
  onRuntimeInitialized: function() {
    moduleBindings.updateFrequency(params.frequency);
    setCanvasToWindowSize(windowDemoModule);
  },
});

const moduleBindings = {
  updateFrequency: windowDemoModule.cwrap('updateFrequency', 'number', ['number'])
};

const gui = createStatsAndGUI();
gui.add(params, 'frequency', 0, 1).onChange(moduleBindings.updateFrequency);
