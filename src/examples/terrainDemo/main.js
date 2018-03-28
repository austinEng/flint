import { createStatsAndGUI, setCanvasToWindowSize } from '../utils';

export function main(TerrainDemo, workers) {
  const canvas = document.getElementById('canvas');
  canvas.addEventListener("webglcontextlost", function(e) {
    alert('WebGL context lost. You will need to reload the page.'); e.preventDefault();
  }, false);

  const params = {
    freeze: false,
    autoCamera: true,
    showBoundingBoxes: false,
    showTerrain: true,
    drawWireframe: false,
    traverseMainThread: false,
  };

  const terrainDemoModule = new TerrainDemo({
    canvas,
    arguments: [window.innerWidth.toString(), window.innerHeight.toString()],
    onRuntimeInitialized() {
      setCanvasToWindowSize(terrainDemoModule);
      moduleBindings.updateFreeze(params.freeze);
      moduleBindings.updateAutoCamera(params.autoCamera);
      moduleBindings.updateShowBoundingBoxes(params.showBoundingBoxes);
      moduleBindings.updateShowTerrain(params.showTerrain);
      moduleBindings.updateDrawWireframe(params.drawWireframe);
      moduleBindings.updateTraverseMainThread(params.traverseMainThread);
    },
    getWorkerURL(moduleName) {
      return workers[moduleName];
    },
  });

  const moduleBindings = {
    updateFreeze: terrainDemoModule.cwrap('updateFreeze', 'number', ['number']),
    updateAutoCamera: terrainDemoModule.cwrap('updateAutoCamera', 'number', ['number']),
    updateShowBoundingBoxes: terrainDemoModule.cwrap('updateShowBoundingBoxes', 'number', ['number']),
    updateShowTerrain: terrainDemoModule.cwrap('updateShowTerrain', 'number', ['number']),
    updateDrawWireframe: terrainDemoModule.cwrap('updateDrawWireframe', 'number', ['number']),
    updateTraverseMainThread: terrainDemoModule.cwrap('updateTraverseMainThread', 'number', ['number']),
  };

  const gui = createStatsAndGUI();
  gui.add(params, 'freeze').onChange(moduleBindings.updateFreeze);
  gui.add(params, 'autoCamera').onChange(moduleBindings.updateAutoCamera);
  gui.add(params, 'showBoundingBoxes').onChange(moduleBindings.updateShowBoundingBoxes);
  gui.add(params, 'showTerrain').onChange(moduleBindings.updateShowTerrain);
  gui.add(params, 'drawWireframe').onChange(moduleBindings.updateDrawWireframe);
  gui.add(params, 'traverseMainThread').onChange(moduleBindings.updateTraverseMainThread);

}
