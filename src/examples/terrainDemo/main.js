import { createStatsAndGUI, setCanvasToWindowSize } from '../utils';

export function main(TerrainDemo, workers) {
  const canvas = document.getElementById('canvas');
  canvas.addEventListener("webglcontextlost", function(e) {
    alert('WebGL context lost. You will need to reload the page.'); e.preventDefault();
  }, false);

  const params = {
    showBoundingBoxes: false,
    drawWireframe: false,
    traverseMainThread: false,
  };

  const terrainDemoModule = new TerrainDemo({
    canvas,
    arguments: [window.innerWidth.toString(), window.innerHeight.toString()],
    onRuntimeInitialized() {
      setCanvasToWindowSize(terrainDemoModule);
      moduleBindings.updateShowBoundingBoxes(params.showBoundingBoxes);
      moduleBindings.updateDrawWireframe(params.drawWireframe);
      moduleBindings.updateTraverseMainThread(params.traverseMainThread);
    },
    getWorkerURL(moduleName) {
      return workers[moduleName];
    },
  });

  const moduleBindings = {
    updateShowBoundingBoxes: terrainDemoModule.cwrap('updateShowBoundingBoxes', 'number', ['number']),
    updateDrawWireframe: terrainDemoModule.cwrap('updateDrawWireframe', 'number', ['number']),
    updateTraverseMainThread: terrainDemoModule.cwrap('updateTraverseMainThread', 'number', ['number']),
  };

  const gui = createStatsAndGUI();
  gui.add(params, 'showBoundingBoxes').onChange(moduleBindings.updateShowBoundingBoxes);
  gui.add(params, 'drawWireframe').onChange(moduleBindings.updateDrawWireframe);
  gui.add(params, 'traverseMainThread').onChange(moduleBindings.updateTraverseMainThread);

}
