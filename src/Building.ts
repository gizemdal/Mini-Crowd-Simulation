import {vec3, vec2, mat4} from 'gl-matrix';

// This class represents the buildings in the city
export default class Building {

	pos: vec3; // position of the building
	height: number; // height of the building
	instances: number[]; // instance indices that this building will contain
	transforms: mat4[]; // transform matrices for this building
	remainingHeight: number;

	constructor(pos: vec3, height: number) {
		this.pos = pos;
		this.height = height;
		this.remainingHeight = height; // initially equal to height, will decrease later
		this.instances = []; // initially empty
		this.transforms = []; // initially empty
	}

	rebuild() {
		this.instances = [];
		this.transforms = [];
	}

	// Add a floor to the building
	addFloor(i: number, m: mat4) {
		this.instances.push(i);
		this.transforms.push(m);
		this.remainingHeight -= 2.0;
	}

	// Check if the building has reached the floor
	hasReachedFloor() {
		return this.remainingHeight < 0.0;
	}


};