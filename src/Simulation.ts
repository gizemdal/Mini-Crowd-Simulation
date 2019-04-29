import {vec3, vec2, mat4} from 'gl-matrix';
import {normalize, angle} from 'gl-vec3';
import Agent from './Agent';
import Event from './Event';
import Building from './Building';
import Marker from './Marker';

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

let eventKeywords = ['food', 'concert', 'sports', 'protest', 'exposition'];
let minHeight = 5; // minimum height for buildings
let maxHeight = 30; // maximum height for buildings
let rad = 5; // radius for building occupance

export default class Simulation {

	agents: Agent[]; // store all the created agents here
	numAgents: number; // number of agents to generate
	dimensions: vec2; // dimensions of the plane
	locationMap: number[][]; // data structure to store cell occupation: 0 = empty, -1 = building, other = occupied
	height: number; // simulation height
	events: Event[]; // current events happening in the city
	buildings: Building[]; // current buildings in the city
	markers: Marker[]; // markers in the simulation

	constructor(n: number, d: vec2, h: number, b: number) {
		this.agents = [];
		this.buildings = [];
		this.markers = [];
		this.events = [];
		this.locationMap = new Array(d[0]).fill(0).map(() => new Array(d[1]).fill(0));
		this.numAgents = n;
		this.dimensions = d;
		this.height = h;
		this.setupBuildings(b);
		this.initializeSimulation();
	}

	// Setup the buildings in the city (generate b amount of buildings)
	setupBuildings(b: number) {
		for (var i = 0; i < b; i++) {
			// pick a random building position
			var x = 0;
			var z = 0;
			while (true) {
				x = getRandomInt(this.dimensions[0] - 2*rad) + rad;
				z = getRandomInt(this.dimensions[1] - 2*rad) + rad;
				// found valid location
				if (this.locationMap[x][z] == 0) {
					break;
				}
			}
			var posB = vec3.fromValues(x - this.dimensions[0] / 2,
									   this.height,
									   z - this.dimensions[1] / 2);
			var newBuilding = new Building(posB, minHeight + getRandomInt(maxHeight - minHeight));
		    // push more matrices and meshes to make the building reach the floor
		    while (!newBuilding.hasReachedFloor()) {
		      var newT = mat4.fromValues(3.0, 0.0, 0.0, 0.0,
		                                0.0, 3.0, 0.0, 0.0,
		                                0.0, 0.0, 3.0, 0.0,
		                                newBuilding.pos[0], newBuilding.remainingHeight, newBuilding.pos[2], 1.0);
		      newBuilding.addFloor(getRandomInt(3), newT);
		    }
		    // add the building to the list of buildings
		    this.buildings.push(newBuilding);

		    // occupy the neighboring cells, as well as the center cell, for the building
		    for (var j = x - rad; j <= x + rad; j++) {
		    	for (var k = z - rad; k <= z + rad; k++) {
		    		if (j < 0 || j >= this.dimensions[0] ||
		    			k < 0 || k >= this.dimensions[1]) {
		    			continue;
		    		}
		    		this.locationMap[j][k] = -1; // occupy the grid cell
		    	}
		    }
		}
	}

	// Setup the agents in random marker locations
	initializeSimulation() {
		// Create numAgents * 100 markers
		for (var i = 0; i < this.numAgents * 100; i++) {
			// generate random marker position until it's valid
			var x = 0;
			var z = 0;
			while (true) {
				x = getRandomInt(this.dimensions[0] - 20) + 10;
				z = getRandomInt(this.dimensions[1] - 20) + 10;
				// found valid location
				if (this.locationMap[x][z] == 0) {
					break;
				}
			}
			// create a marker at this location
			var posM = vec3.fromValues(x - this.dimensions[0] / 2, 
									   this.height, 
									   z - this.dimensions[1] / 2);
			var newMarker = new Marker(posM);
			this.markers.push(newMarker);
		}
		// Create numAgents amount of agents and put them at random markers
		for (var i = 0; i < this.numAgents; i++) {
			var idx = 0;
			while (true) {
				idx = getRandomInt(this.markers.length);
				var marker = this.markers[idx];
				if (marker.agent == -1) {
					break;
				}
			}
			var posA = this.markers[idx].pos;
			var e = getRandomInt(eventKeywords.length);
			var colA = vec3.fromValues(Math.min(e*0.12 + (17 % e)*0.05, 1),
									   Math.min(e*0.15 + (7 % e)*0.04, 1),
									   Math.min(e*0.21 + (28 % e)*0.07, 1)); // make all agents initially red
			var newA = new Agent(posA, colA, idx);
			// give an arbitrary interest to the agent (picked from the list)
			newA.addInterest(eventKeywords[e]);
			newA.changeDest(this.markers[getRandomInt(this.markers.length)].pos);
			// associate this agent with the given marker
			this.markers[idx].agent = newA.getId();
			// fill the locationMap with agent's id
			this.locationMap[x][z] = newA.getId();
			// put the agent to the list of agents
			this.agents.push(newA);
		}
	}

	// Simulate the crowd by one tick towards given destination point
	simulationStep(rad: number) {
		for (var a = 0; a < this.agents.length; a++) {
			var maxWeight = -1; // keep track of largest weight
			var closestMarker = -1;	// keep track of the closest marker index
			for (var m = 0; m < this.markers.length; m++) {
				// check if the marker is occupied already
				if (this.markers[m].agent != -1) {
					continue;
				}
				// check if the marker is in the given search scope
				var vecM = vec3.fromValues(this.markers[m].pos[0] - this.agents[a].getPos()[0],
										   this.markers[m].pos[1] - this.agents[a].getPos()[1],
										   this.markers[m].pos[2] - this.agents[a].getPos()[2]);
				var lM = Math.sqrt(vecM[0] * vecM[0] +
								   vecM[1] * vecM[1] +
								   vecM[2] * vecM[2]);
				if (lM > rad) {
					continue;
				}
				// find the angle between the marker vector and the destination vector
				var destM = vec3.fromValues(this.agents[a].dest[0] - this.agents[a].getPos()[0],
											this.agents[a].dest[1] - this.agents[a].getPos()[1],
											this.agents[a].dest[2] - this.agents[a].getPos()[2]);

				var lDest = Math.sqrt(destM[0] * destM[0] +
								      destM[1] * destM[1] +
								      destM[2] * destM[2]);
				// vector between the marker and destination
				var destDist = vec3.fromValues(this.agents[a].dest[0] - this.markers[m].pos[0],
											   this.agents[a].dest[1] - this.markers[m].pos[1],
											   this.agents[a].dest[2] - this.markers[m].pos[2]);
				var ldestM = Math.sqrt(destDist[0] * destDist[0] +
								      destDist[1] * destDist[1] +
								      destDist[2] * destDist[2]);
				if (lDest <= ldestM) {
					continue;
				}
				var ang = angle(vecM, destM);

				// calculate the weight
				var w = Math.abs(1 + Math.cos(ang) / (1 + lM));
				if (w > maxWeight) {
					maxWeight = w;
					closestMarker = m;
				}
			}
			// If closest marker found, move the agent there
			if (closestMarker != -1) {
				// free the marker and the location where agent is currently located
				this.markers[this.agents[a].markerId].agent = -1;
				this.locationMap[this.markers[this.agents[a].markerId].pos[0] + this.dimensions[0] / 2][this.markers[this.agents[a].markerId].pos[2] + this.dimensions[1] / 2] = 0;
				// move the agent to the new marker
				this.agents[a].markerId = closestMarker;
				this.agents[a].pos = this.markers[closestMarker].pos;
				this.markers[closestMarker].agent = this.agents[a].getId();
				this.locationMap[this.markers[closestMarker].pos[0] + this.dimensions[0] / 2][this.markers[closestMarker].pos[2] + this.dimensions[1] / 2] = this.agents[a].getId();
			} else {
				// if no possible movement found and there is no event, assign a new destination
				if (this.events.length != 0 && this.agents[a].interests.length != 0) {
					if (this.agents[a].currentEvent == -1) {
						this.agents[a].changeDest(this.markers[getRandomInt(this.markers.length)].pos);
					}
				} else {
					this.agents[a].changeDest(this.markers[getRandomInt(this.markers.length)].pos);
				}
			}
		}
	}

	// Add an event to the city
	addEvent(pos: vec3, keyword: string, name: string, scope: number = 20) {
		if (this.locationMap[Math.floor(pos[0] + this.dimensions[0] / 2)]
			[Math.floor(pos[2] + this.dimensions[1] / 2)] != -1) {
			console.log('added!');
			var keys = [];
			keys.push(keyword);
			var newEvent = new Event(pos, scope, keys, name);
			this.events.push(newEvent);
			this.changeDestination(); // update the destinations
			return 1;
		} else {
			return -1; // unsuccesful!
		}
	}

	// Remove the event associated with the given id
	removeEvent(n: string) {
		var id = 0;
		for (let e of this.events) {
			if (e.name === n) {
				break;
			}
			id++;
		}
		this.events.splice(id, 1);
		this.changeDestination(); // update the destinations
	}

	// change the goal destination of the crowd
	changeDestination() {
		for (let a of this.agents) {
			var related = this.events.filter(event => a.interests.some(interest => event.keywords.indexOf(interest) >= 0));
			if (related.length != 0) {
				var rand = related[getRandomInt(related.length)];
				a.changeDest(rand.pos);
				a.updateCurrentEvent(rand.id);
			} else {
				a.updateCurrentEvent(-1); // agent has no events interested
			}
		}
	}

	// Check if an event already exists with a given name
	doesEventExist(n: string) {
		for (let e of this.events) {
			if (e.name === n) {
				return true;
			}
		}
		return false;
	}

	// Get the agent array
	getAgents() {
		return this.agents;
	}

	// Get the transformation matrices for the buildings
	getBuildingMatrices() {
		var matrices = [];
		for (var i = 0; i < this.buildings.length; i++) {
			var buildingTs = this.buildings[i].transforms;
			for (var j = 0; j < buildingTs.length; j++) {
				matrices.push(buildingTs[j]);
			}
		}
		return matrices;
	}

	// Get the indices for the buildings
	getBuildingIndices() {
		var indices = [];
		for (var i = 0; i < this.buildings.length; i++) {
			var buildingIs = this.buildings[i].instances;
			for (var j = 0; j < buildingIs.length; j++) {
				indices.push(buildingIs[j]);
			}
		}
		return indices;
	}

};