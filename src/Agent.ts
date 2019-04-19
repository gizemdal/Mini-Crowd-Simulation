import {vec3, mat4} from 'gl-matrix';
import {rotateY, scale} from 'gl-mat4';
import {dot, length, angle, normalize, rotateZ} from 'gl-vec3';

let idCount: number = 1; // generate a unique id for each agent

export default class Agent {
	id: number; // agent id: unique per agent
	pos: vec3; // agent's current position
	dir: vec3; // agent's current direction
	col: vec3; // agent color (based on goals/decisions)
	transMat: mat4; // agent's transformation matrix

	constructor(pos: vec3, dir: vec3, col:vec3) {
		this.id = idCount;
		idCount++; // increment the id counter
		this.pos = pos;
		this.dir = dir;
		this.col = col;
	}

	// Compare two Agent instances by id
	equals(other: Agent) {
		return this.id == other.id;
	}

	// return agent's id
	getId() {
		return this.id;
	}

	// return agent's position
	getPos() {
		return this.pos;
	}

	// Change the color of the agent
	changeCol(newCol: vec3) {
		this.col = newCol;
	}

	// Calculate the corresponding transformation matrix for instanced rendering
	computeMatrix() {
	    var trans = mat4.fromValues(1.0, 0.0, 0.0, 0.0,
	                                0.0, 2.0, 0.0, 0.0,
	                                0.0, 0.0, 1.0, 0.0,
	                                this.pos[0], this.pos[1], this.pos[2], 1.0);
		this.transMat = scale(trans, trans, vec3.fromValues(1.0, 1.0, 1.0));
	}

	// Calculate the distance between two agents
	distanceTo(other: Agent) {
		return Math.sqrt(Math.pow(this.pos[0] - other.pos[0], 2) +
						 Math.pow(this.pos[1] - other.pos[1], 2) +
						 Math.pow(this.pos[2] - other.pos[2], 2));
	}

};