import {vec3, vec2} from 'gl-matrix';

// This class represents the markers where agents can be found
export default class Marker {

	pos: vec3; // position of the marker
	agent: number; // id of the agent contained by this marker (-1 if not occupied)

	constructor(pos: vec3) {
		this.pos = pos;
		this.agent = -1; // initially unoccupied
	}

};