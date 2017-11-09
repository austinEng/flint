import WindowDemoJS from 'build/bin/windowDemo_js';
import WindowDemoWASM from 'build/bin/windowDemo_wasm';
import Stats from 'stats-js';
import DAT from 'dat-gui';

const canvas = document.getElementById('canvas');
canvas.addEventListener("webglcontextlost", function(e) {
  alert('WebGL context lost. You will need to reload the page.'); e.preventDefault();
}, false);

function resizeCanvas(width, height) {
  canvas.width = width;
  canvas.height = height;
}

window.addEventListener('resize', function(e) {
  resizeCanvas(window.innerWidth, window.innerHeight);
});

resizeCanvas(window.innerWidth, window.innerHeight);

const WindowDemo = window.location.hash === 'js' ? WindowDemoJS : WindowDemoWASM;
const windowDemoModule = new WindowDemo({
  canvas: canvas,
  arguments: [window.innerWidth.toString(), window.innerHeight.toString()],
});

const params = {
  frequency: 1,
};

const moduleBindings = {
  updateFrequency: windowDemoModule.cwrap('updateFrequency', 'number', ['number'])
};

const gui = new DAT.GUI();
gui.add(params, 'frequency', 0, 1).onChange(moduleBindings.updateFrequency);

const stats = new Stats();
stats.setMode(1);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

const _requestAnimationFrame = requestAnimationFrame;
stats.begin();
requestAnimationFrame = function(cb) {
  stats.end();
  _requestAnimationFrame(cb);
  stats.begin();
}
