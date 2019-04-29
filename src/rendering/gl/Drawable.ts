import {gl} from '../../globals';

abstract class Drawable {
  count: number = 0;

  bufIdx: WebGLBuffer;
  bufPos: WebGLBuffer;
  bufNor: WebGLBuffer;
  bufCol: WebGLBuffer;
  bufT0: WebGLBuffer;
  bufT1: WebGLBuffer;
  bufT2: WebGLBuffer;
  bufT3: WebGLBuffer;
  bufUV: WebGLBuffer;
  bufType: WebGLBuffer;

  idxBound: boolean = false;
  posBound: boolean = false;
  norBound: boolean = false;
  colBound: boolean = false;
  t0Bound: boolean = false;
  t1Bound: boolean = false;
  t2Bound: boolean = false;
  t3Bound: boolean = false;
  uvBound: boolean = false;
  typeBound: boolean = false;

  numInstances: number = 0; // How many instances of this Drawable the shader program should draw
  
  abstract create() : void;

  destroy() {
    gl.deleteBuffer(this.bufIdx);
    gl.deleteBuffer(this.bufPos);
    gl.deleteBuffer(this.bufNor);
    gl.deleteBuffer(this.bufCol);
    gl.deleteBuffer(this.bufT0);
    gl.deleteBuffer(this.bufT1);
    gl.deleteBuffer(this.bufT2);
    gl.deleteBuffer(this.bufT3);
    gl.deleteBuffer(this.bufUV);
    gl.deleteBuffer(this.bufType);
  }

  generateIdx() {
    this.idxBound = true;
    this.bufIdx = gl.createBuffer();
  }

  generatePos() {
    this.posBound = true;
    this.bufPos = gl.createBuffer();
  }

  generateNor() {
    this.norBound = true;
    this.bufNor = gl.createBuffer();
  }

  generateCol() {
    this.colBound = true;
    this.bufCol = gl.createBuffer();
  }

  generateT0() {
    this.t0Bound = true;
    this.bufT0 = gl.createBuffer();
  }

  generateT1() {
    this.t1Bound = true;
    this.bufT1 = gl.createBuffer();
  }

  generateT2() {
    this.t2Bound = true;
    this.bufT2 = gl.createBuffer();
  }

  generateT3() {
    this.t3Bound = true;
    this.bufT3 = gl.createBuffer();
  }

  generateUV() {
    this.uvBound = true;
    this.bufUV = gl.createBuffer();
  }

  generateType() {
    this.typeBound = true;
    this.bufType = gl.createBuffer();
  }

  bindIdx(): boolean {
    if (this.idxBound) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    }
    return this.idxBound;
  }

  bindPos(): boolean {
    if (this.posBound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    }
    return this.posBound;
  }

  bindNor(): boolean {
    if (this.norBound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    }
    return this.norBound;
  }

  bindCol(): boolean {
    if (this.colBound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    }
    return this.colBound;
  }

  bindT0(): boolean {
    if (this.t0Bound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufT0);
    }
    return this.t0Bound;
  }

  bindT1(): boolean {
    if (this.t1Bound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufT1);
    }
    return this.t1Bound;
  }

  bindT2(): boolean {
    if (this.t2Bound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufT2);
    }
    return this.t2Bound;
  }

  bindT3(): boolean {
    if (this.t3Bound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufT3);
    }
    return this.t3Bound;
  }

  bindUV(): boolean {
    if (this.uvBound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    }
    return this.uvBound;
  }

  bindType(): boolean {
    if (this.typeBound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufType);
    }
    return this.typeBound;
  }

  elemCount(): number {
    return this.count;
  }

  drawMode(): GLenum {
    return gl.TRIANGLES;
  }

  setNumInstances(num: number) {
    this.numInstances = num;
  }
};

export default Drawable;
