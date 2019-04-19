import {vec3, vec2} from 'gl-matrix';
import {normalize} from 'gl-vec3';
import Agent from './Agent';

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

export default class Simulation {

	agents: Agent[]; // store all the created agents here
	numAgents: number; // number of agents to generate
	dimensions: vec2; // dimensions of the plane
	locationMap: number[][]; // data structure to store cell occupation
	densityMap: number[][]; // data structure to store number of agent intersection per cell
	height: number; // simulation height
	dest: vec3 = vec3.fromValues(0, 0, 0); // destination of the crowd (for milestone only)

	constructor(n: number, d: vec2, h: number) {
		this.agents = [];
		this.locationMap = new Array(d[0]).fill(0).map(() => new Array(d[1]).fill(0));
		this.densityMap = new Array(d[0]).fill(0).map(() => new Array(d[1]).fill(0));
		this.numAgents = n;
		this.dimensions = d;
		this.height = h;

		this.initializeSimulation();
	}

	// Setup the agents in random locations and the density map
	initializeSimulation() {
		// Create numAgents amount of agents and place them randomly
		for (var i = 0; i < this.numAgents; i++) {
			// generate random starting position until it's valid
			var x = 0;
			var z = 0;
			while (true) {
				x = getRandomInt(this.dimensions[0]);
				z = getRandomInt(this.dimensions[1]);
				// found valid location
				if (this.locationMap[x][z] == 0) {
					break;
				}
			}
			// create an Agent at this location
			var posA = vec3.fromValues(x - this.dimensions[0] / 2, 
									   this.height, 
									   z - this.dimensions[1] / 2);
			var dirA = vec3.fromValues(0, 0, 1); // start all agents looking forward
			var colA = vec3.fromValues(1, 0, 0); // make all agents initially red
			var newA = new Agent(posA, dirA, colA);
			// fill the locationMap with agent's id
			this.locationMap[x][z] = newA.getId();
			// put the agent to the list of agents
			this.agents.push(newA);
		}
	}

	// Fill the density map for coloring (must be called after picking agent locations)
	fillDensityMap(r: number) {
		for (let a of this.agents) {
			var posA = a.getPos(); // agent's position
			// look at the neighboring pixels at a radius = r
			for (var i = posA[0] - r; i <= posA[0] + r; i++) {
				for (var j = posA[1] - r; j <= posA[1] + r; j++) {
					if (i < 0 || j < 0 || i >= this.dimensions[0] || j >= this.dimensions[1]) {
						continue;
					}
					// if cell is not visited yet, mark it for uni-coloring
					var val = this.locationMap[i][j];
					if (val == 0) {
						this.densityMap[i][j] = 1;
					} else if (val == -1) {
						// if the cell is marked for multiple agent intersection, leave it
						continue;
					} else {
						// if this cell is occupied by another agent, mark it to be white
						this.densityMap[i][j] = -1;
					}
				}
			}
		}
	}

	// Simulate the crowd by one tick towards given destination point
	simulationStep() {
		// first calculate potential final position coordinates, create a "potential" locationMap
		//var potentialMap = Object.assign([], this.locationMap);
		for (let a of this.agents) {
			//console.log(a.getId() + " " + a.getPos());
			//console.log(this.locationMap);
			var currPos = a.getPos(); // current position of the agent
			var dir = vec3.fromValues(this.dest[0] - currPos[0],
									  this.dest[1] - currPos[1],
									  this.dest[2] - currPos[2]);
			dir = normalize(dir, dir);
			var potentialPos = vec3.fromValues(currPos[0] + Math.sign(dir[0])*Math.round(Math.abs(dir[0])),
											   currPos[1] + Math.sign(dir[1])*Math.round(Math.abs(dir[1])),
											   currPos[2] + Math.sign(dir[2])*Math.round(Math.abs(dir[2])));
			var newX = Math.ceil(potentialPos[0] + this.dimensions[0] / 2); // new x-location in locationMap
			var newZ = Math.ceil(potentialPos[2] + this.dimensions[1] / 2); // new z-location in locationMap
			var oldX = Math.ceil(currPos[0] + this.dimensions[0] / 2); // old x-location in locationMap
			var oldZ = Math.ceil(currPos[2] + this.dimensions[1] / 2); // old z-location in locationMap
			// if the potential position is available, move the agent there
			if (this.locationMap[newX][newZ] == 0) {
				a.pos = potentialPos;
				this.locationMap[newX][newZ] = a.getId();
				// free the old occupied location
				this.locationMap[oldX][oldZ] = 0;
			} else if (this.locationMap[newX][newZ+Math.sign(dir[2])] == 0) { //Check out of bounds
				a.pos = vec3.fromValues(potentialPos[0], potentialPos[1], potentialPos[2] + Math.sign(dir[2]));
				this.locationMap[newX][newZ+Math.sign(dir[2])] = a.getId();
				// free the old occupied location
				this.locationMap[oldX][oldZ] = 0;
			} else if (this.locationMap[newX+Math.sign(dir[0])][newZ] == 0) { //Check out of bounds
				a.pos = vec3.fromValues(potentialPos[0] + Math.sign(dir[0]), potentialPos[1], potentialPos[2]);
				this.locationMap[newX+Math.sign(dir[0])][newZ] = a.getId();
				// free the old occupied location
				this.locationMap[oldX][oldZ] = 0;
			} else if (this.locationMap[oldX][newZ+Math.sign(dir[2])] == 0) { //Check out of bounds
				a.pos = vec3.fromValues(currPos[0], potentialPos[1], potentialPos[2] + Math.sign(dir[2]));
				this.locationMap[oldX][newZ+Math.sign(dir[2])] = a.getId();
				// free the old occupied location
				this.locationMap[oldX][oldZ] = 0;
			} else if (this.locationMap[newX+Math.sign(dir[0])][oldZ] == 0) { //Check out of bounds
				a.pos = vec3.fromValues(potentialPos[0] + Math.sign(dir[0]), potentialPos[1], currPos[2]);
				this.locationMap[newX+Math.sign(dir[0])][oldZ] = a.getId();
				// free the old occupied location
				this.locationMap[oldX][oldZ] = 0;
			}
		}
	}

	// change the goal destination of the crowd (for this milestone, this applies to whole crowd)
	changeDestination(dest: vec3) {
		this.dest = dest;
	}

	// Get the agent array
	getAgents() {
		return this.agents;
	}

};