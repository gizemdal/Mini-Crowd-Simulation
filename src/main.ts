import {vec2, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Plane from './geometry/Plane';
import Mesh from './geometry/Mesh';
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
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
};

let square: Square;
let plane : Plane;
let wPressed: boolean;
let aPressed: boolean;
let sPressed: boolean;
let dPressed: boolean;
let planePos: vec2;
let time = 0.0;

let agent: Mesh;
let simulation: Simulation; // simulation instance
let obj0: string = readTextFile('../obj_files/cylinder.obj');

function loadScene() {
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  plane = new Plane(vec3.fromValues(0,0,0), vec2.fromValues(1000,1000), 20);
  plane.create();
  let center = vec3.fromValues(0.0, 0.0, 0.0);
  agent = new Mesh(obj0, center); // the agent instance
  agent.create();
  simulation = new Simulation(1000, plane.scale, 0);

  wPressed = false;
  aPressed = false;
  sPressed = false;
  dPressed = false;
  planePos = vec2.fromValues(0,0);
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
    colorsArray.push(1.0);
    colorsArray.push(1.0);
    colorsArray.push(1.0);
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

function main() {
  window.addEventListener('keypress', function (e) {
    // console.log(e.key);
    switch(e.key) {
      case 'w':
      wPressed = true;
      break;
      case 'a':
      aPressed = true;
      break;
      case 's':
      sPressed = true;
      break;
      case 'd':
      dPressed = true;
      break;
    }
  }, false);

  window.addEventListener('keyup', function (e) {
    switch(e.key) {
      case 'w':
      wPressed = false;
      break;
      case 'a':
      aPressed = false;
      break;
      case 's':
      sPressed = false;
      break;
      case 'd':
      dPressed = false;
      break;
    }
  }, false);

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

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

  // Initial call to instanced rendering
  instanceRendering();

  const camera = new Camera(vec3.fromValues(0, 30, -20), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(164.0 / 255.0, 233.0 / 255.0, 1.0, 1);
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

  function processKeyPresses() {
    let velocity: vec2 = vec2.fromValues(0,0);
    if(wPressed) {
      velocity[1] += 1.0;
    }
    if(aPressed) {
      velocity[0] += 1.0;
    }
    if(sPressed) {
      velocity[1] -= 1.0;
    }
    if(dPressed) {
      velocity[0] -= 1.0;
    }
    let newPos: vec2 = vec2.fromValues(0,0);
    vec2.add(newPos, velocity, planePos);
    lambert.setPlanePos(newPos);
    planePos = newPos;
  }

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    processKeyPresses();
    renderer.render(camera, lambert, [
      plane,
    ], time, 0);
    renderer.render(camera, flat, [
      square,
    ], time, 0);
    renderer.render(camera, instanced, [
      agent,
    ], time, 1);
    simulation.simulationStep(); // simulation step
    instanceRendering();
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
