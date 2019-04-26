import {vec3, mat4} from 'gl-matrix';
import {rotateY, scale} from 'gl-mat4';
import {dot, length, angle, normalize, rotateZ} from 'gl-vec3';

let idCount: number = 1; // generate a unique id for each agent

export default class Agent {
	id: number; // agent id: unique per agent
	pos: vec3; // agent's current position
	col: vec3; // agent color (based on goals/decisions)
	transMat: mat4; // agent's transformation matrix
	dest: vec3; // agent's destination
	interests: string[]; // agent's interests
	markerId: number; // index of the marker where the agent exists
	minDist: number; // minimum distance to destination

	constructor(pos: vec3, col:vec3, mId: number) {
		this.id = idCount;
		idCount++; // increment the id counter
		this.pos = pos;
		this.col = col;
		this.markerId = mId;
		this.dest = vec3.fromValues(0, 0, 0); // default destination
		this.interests = []; // start off with no event preference
		this.minDist = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2]);
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

	// Change the destination of the agent
	changeDest(newDest: vec3) {
		this.dest = newDest;
		var destM = vec3.fromValues(this.dest[0] - this.pos[0],
							        this.dest[1] - this.pos[1],
							        this.dest[2] - this.pos[2]);
		this.minDist = Math.sqrt(destM[0] * destM[0] + destM[1] * destM[1] + destM[2] * destM[2]);
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

	// Add an interest keyword (if it doesn't exist)
	addInterest(key: string) {
		var idx = this.interests.indexOf(key);
		if (idx != -1) {
			return -1; // key already exists!!!
		}
		this.interests.push(key);
		return 1; // success!
	}

	// Remove an interest keyword
	removeInterest(key: string) {
		var idx = this.interests.indexOf(key);
		if (idx == -1) {
			return -1; // key doesn't exist!!!
		}
		var last = this.interests.length - 1;
		if (idx == last) {
			this.interests.pop();
			return 1; // success
		} else {
			var newArr = this.interests.slice(0, idx);
			newArr.concat(this.interests.slice(idx + 1, last + 1));
			this.interests = newArr;
			return 1; // success
		}
	}

};