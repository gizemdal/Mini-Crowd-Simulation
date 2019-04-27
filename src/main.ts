import {vec2, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Plane from './geometry/Plane';
import Mesh from './geometry/Mesh';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import Simulation from './Simulation';
import Agent from './Agent';
import {setGL} from './globals';
import {readTextFile} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Load Scene': loadScene, // A function pointer, essentially
  buildingDensity: 5,
  eventKeyword: 'food',
  eventXCoor: 0,
  eventYCoor: 0,
  eventScope: 10,
  eventName: 'default',
  'Add Event': addEvent,
  eventToRemove: 'default',
  'Remove Event': removeEvent,
};

let square: Square;
let plane : Plane;
let planePos: vec2;
let prevBuildingDensity: number = 5;
let prevX: number = 0;
let prevY: number = 0;

let time = 0.0;

let agent: Mesh; // agent instance
let simulation: Simulation; // simulation instance
let cube: Mesh; // cube for buildings
let pentagon: Mesh; // pentagon for buildings
let hexagon: Mesh; // hexagon for buildings
let dimensions: vec2 = vec2.fromValues(150, 150);

// Marker for event adding
let marker: Cube;

// Object files
let obj0: string = readTextFile('../obj_files/cylinder.obj');
let obj1: string = readTextFile('../obj_files/cube.obj');
let obj2: string = readTextFile('../obj_files/pentagon.obj');
let obj3: string = readTextFile('../obj_files/hex.obj');


function loadScene() {
  // Background
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();

  // Terrain
  plane = new Plane(vec3.fromValues(0,-3,0), dimensions, 20);
  plane.create();

  // Instances
  let center = vec3.fromValues(0.0, 0.0, 0.0);
  agent = new Mesh(obj0, center); // the agent instance
  agent.create();

  cube = new Mesh(obj1, center);
  cube.create();

  pentagon = new Mesh(obj2, center);
  pentagon.create();

  hexagon = new Mesh(obj3, center);
  hexagon.create();

  // Marker for event adding
  marker = new Cube(vec3.fromValues(controls.eventXCoor, 0, controls.eventYCoor));
  marker.create();

  simulation = new Simulation(75, plane.scale, 0, controls.buildingDensity * 5);
  planePos = vec2.fromValues(0,0);

  // Initial call to instanced rendering
  instanceRendering();

  // Initial call to building rendering
  createBuildings();

  // Initial call to marker creation
  setMarker();
}

function addEvent() {
  if (!simulation.doesEventExist(controls.eventName)) {
    simulation.addEvent(vec3.fromValues(controls.eventXCoor, 0, controls.eventYCoor),
     controls.eventKeyword, controls.eventName, controls.eventScope);
  }
}

function removeEvent() {
  if (simulation.events.length > 0 && simulation.doesEventExist(controls.eventToRemove)) {
    simulation.removeEvent(controls.eventToRemove);
  }
}

function instanceRendering() {
  // generate the agents
  let agents = simulation.getAgents();
  let t0Array = []; // col0 array for agent
  let t1Array = []; // col1 array for agent
  let t2Array = []; // col2 array for agent
  let t3Array = []; // col2 array for agent
  let colorsArray = []; // colors array for agent
  let n: number = agents.length; // number of agent instances
  for(let i = 0; i < n; i++) {
    var a = agents[i];
    a.computeMatrix();
    var mat = a.transMat;
    t0Array.push(mat[0]);
    t0Array.push(mat[1]);
    t0Array.push(mat[2]);
    t0Array.push(mat[3]);
    t1Array.push(mat[4]);
    t1Array.push(mat[5]);
    t1Array.push(mat[6]);
    t1Array.push(mat[7]);
    t2Array.push(mat[8]);
    t2Array.push(mat[9]);
    t2Array.push(mat[10]);
    t2Array.push(mat[11]);
    t3Array.push(mat[12]);
    t3Array.push(mat[13]);
    t3Array.push(mat[14]);
    t3Array.push(mat[15]);
    colorsArray.push(a.col[0]);
    colorsArray.push(a.col[1]);
    colorsArray.push(a.col[2]);
    colorsArray.push(1.0); // Alpha channel
  }

  let t0: Float32Array = new Float32Array(t0Array);
  let t1: Float32Array = new Float32Array(t1Array);
  let t2: Float32Array = new Float32Array(t2Array);
  let t3: Float32Array = new Float32Array(t3Array);
  let colors: Float32Array = new Float32Array(colorsArray);
  agent.setInstanceVBOs(t0, t1, t2, t3, colors);
  agent.setNumInstances(n);
}

function createBuildings() {
  let buildingIdx = simulation.getBuildingIndices();
  let buildingMat = simulation.getBuildingMatrices();

  let t0CArray = []; // col0 array for cube
  let t1CArray = []; // col1 array for cube
  let t2CArray = []; // col2 array for cube
  let t3CArray = []; // col2 array for cube
  let colorsCArray = []; // colors array for cube

  let t0PArray = []; // col0 array for pentagon
  let t1PArray = []; // col1 array for pentagon
  let t2PArray = []; // col2 array for pentagon
  let t3PArray = []; // col2 array for pentagon
  let colorsPArray = []; // colors array for pentagon

  let t0HArray = []; // col0 array for hexagon
  let t1HArray = []; // col1 array for hexagon
  let t2HArray = []; // col2 array for hextagon
  let t3HArray = []; // col2 array for hexagon
  let colorsHArray = []; // colors array for hexagon

  let numC = 0; // number of cubes
  let numP = 0; // number of pentagons
  let numH = 0; // number of hexagons

  // cube = 0, pentagon = 1, hexagon = 2

  for (var i = 0; i < buildingIdx.length; i++) {
    var mat = buildingMat[i];
    if (buildingIdx[i] == 0) {
      t0CArray.push(mat[0]);
      t0CArray.push(mat[1]);
      t0CArray.push(mat[2]);
      t0CArray.push(mat[3]);
      t1CArray.push(mat[4]);
      t1CArray.push(mat[5]);
      t1CArray.push(mat[6]);
      t1CArray.push(mat[7]);
      t2CArray.push(mat[8]);
      t2CArray.push(mat[9]);
      t2CArray.push(mat[10]);
      t2CArray.push(mat[11]);
      t3CArray.push(mat[12]);
      t3CArray.push(mat[13]);
      t3CArray.push(mat[14]);
      t3CArray.push(mat[15]);
      colorsCArray.push(1.0);
      colorsCArray.push(0.0);
      colorsCArray.push(1.0);
      colorsCArray.push(1.0);
      numC++;
    } else if (buildingIdx[i] == 1) {
        t0PArray.push(mat[0]);
        t0PArray.push(mat[1]);
        t0PArray.push(mat[2]);
        t0PArray.push(mat[3]);
        t1PArray.push(mat[4]);
        t1PArray.push(mat[5]);
        t1PArray.push(mat[6]);
        t1PArray.push(mat[7]);
        t2PArray.push(mat[8]);
        t2PArray.push(mat[9]);
        t2PArray.push(mat[10]);
        t2PArray.push(mat[11]);
        t3PArray.push(mat[12]);
        t3PArray.push(mat[13]);
        t3PArray.push(mat[14]);
        t3PArray.push(mat[15]);
        colorsPArray.push(0.0);
        colorsPArray.push(0.0);
        colorsPArray.push(1.0);
        colorsPArray.push(1.0);
        numP++;
    } else if (buildingIdx[i] == 2) {
        t0HArray.push(mat[0]);
        t0HArray.push(mat[1]);
        t0HArray.push(mat[2]);
        t0HArray.push(mat[3]);
        t1HArray.push(mat[4]);
        t1HArray.push(mat[5]);
        t1HArray.push(mat[6]);
        t1HArray.push(mat[7]);
        t2HArray.push(mat[8]);
        t2HArray.push(mat[9]);
        t2HArray.push(mat[10]);
        t2HArray.push(mat[11]);
        t3HArray.push(mat[12]);
        t3HArray.push(mat[13]);
        t3HArray.push(mat[14]);
        t3HArray.push(mat[15]);
        colorsHArray.push(1.0);
        colorsHArray.push(1.0);
        colorsHArray.push(0.0);
        colorsHArray.push(1.0);
        numH++;
    }
  }

  // create cube instances
  let t0Cube: Float32Array = new Float32Array(t0CArray);
  let t1Cube: Float32Array = new Float32Array(t1CArray);
  let t2Cube: Float32Array = new Float32Array(t2CArray);
  let t3Cube: Float32Array = new Float32Array(t3CArray);
  let colCube: Float32Array = new Float32Array(colorsCArray);
  cube.setInstanceVBOs(t0Cube, t1Cube, t2Cube, t3Cube, colCube);
  cube.setNumInstances(numC);

  // create pentagon instances
  let t0Pen: Float32Array = new Float32Array(t0PArray);
  let t1Pen: Float32Array = new Float32Array(t1PArray);
  let t2Pen: Float32Array = new Float32Array(t2PArray);
  let t3Pen: Float32Array = new Float32Array(t3PArray);
  let colPen: Float32Array = new Float32Array(colorsPArray);
  pentagon.setInstanceVBOs(t0Pen, t1Pen, t2Pen, t3Pen, colPen);
  pentagon.setNumInstances(numP);  

  // create hex instances
  let t0Hex: Float32Array = new Float32Array(t0HArray);
  let t1Hex: Float32Array = new Float32Array(t1HArray);
  let t2Hex: Float32Array = new Float32Array(t2HArray);
  let t3Hex: Float32Array = new Float32Array(t3HArray);
  let colHex: Float32Array = new Float32Array(colorsHArray);
  hexagon.setInstanceVBOs(t0Hex, t1Hex, t2Hex, t3Hex, colHex);
  hexagon.setNumInstances(numH);
}

function setMarker() {
  let t0Array = [1, 0, 0, 0]; // col0 array
  let t1Array = [0, 1, 0, 0]; // col1 array
  let t2Array = [0, 0, 1, 0]; // col2 array
  let t3Array = [controls.eventXCoor, 0, controls.eventYCoor, 1]; // col2 array
  let colorsArray = [0, 1, 0, 1]; // colors array
  let t0: Float32Array = new Float32Array(t0Array);
  let t1: Float32Array = new Float32Array(t1Array);
  let t2: Float32Array = new Float32Array(t2Array);
  let t3: Float32Array = new Float32Array(t3Array);
  let colors: Float32Array = new Float32Array(colorsArray);
  marker.setInstanceVBOs(t0, t1, t2, t3, colors);
  marker.setNumInstances(1);
}

function main() {

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Load Scene');
  gui.add(controls, 'buildingDensity', 0, 7).step(1);
  var eventAdd = gui.addFolder('Add Event');
  eventAdd.add(controls, 'eventKeyword', [ 'food', 'concert', 'sports', 'protest', 'exposition' ]);
  eventAdd.add(controls, 'eventXCoor', - dimensions[0] / 2, dimensions[0] / 2).step(0.1);
  eventAdd.add(controls, 'eventYCoor', - dimensions[1] / 2, dimensions[1] / 2).step(0.1);
  eventAdd.add(controls, 'eventScope', 5, 100).step(5);
  eventAdd.add(controls, 'eventName');
  eventAdd.add(controls, 'Add Event');
  var eventRemove = gui.addFolder('Remove Event');
  eventRemove.add(controls, 'eventToRemove');
  eventRemove.add(controls, 'Remove Event');
  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 30, -20), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  //renderer.setClearColor(164.0 / 255.0, 233.0 / 255.0, 1.0, 1);
  renderer.setClearColor(0.0, 0.0, 0.0, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/terrain-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/terrain-frag.glsl')),
  ]);
  lambert.setDimensions(plane.scale);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const instanced = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    instanceRendering();
    renderer.clear();
    lambert.setMode(1.0);
    if (controls.buildingDensity != prevBuildingDensity) {
      prevBuildingDensity = controls.buildingDensity;
      loadScene();
    }
    if (controls.eventXCoor != prevX) {
      prevX = controls.eventXCoor;
      setMarker();
    }
    if (controls.eventYCoor != prevY) {
      prevY = controls.eventYCoor;
      setMarker();
    }
    renderer.render(camera, lambert, [
      plane,
    ], time, 0);
    lambert.setMode(2.0);
    renderer.render(camera, lambert, [
      square,
    ], time, 0);
    lambert.setMode(0.0);
    renderer.render(camera, lambert, [
      agent, cube, pentagon, hexagon, marker,
    ], time, 1);
    simulation.simulationStep(10); // simulation step
    stats.end();
    // Tell the browser to call `tick` again whenever it renders a new frame
    time += 1.0;
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(vec2.fromValues(window.innerWidth, window.innerHeight));
  // Start the render loop
  tick();
}

main();
