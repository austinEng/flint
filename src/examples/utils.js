import Stats from 'stats-js';
import DAT from 'dat-gui';

export function createStatsAndGUI() {
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

  const gui = new DAT.GUI();

  return gui;
}

export function setCanvasToWindowSize(canvas) {
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);

  // Strange, but for some reason the size doesn't get initialized immediately
  (function initializeSize() {
    resizeCanvas();
    process.nextTick(function() {
      if (window.innerWidth !== parseInt(canvas.getAttribute('width'))) {
        setTimeout(initializeSize, 100);
      }
    });
  })();
}
