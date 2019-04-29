# Crowd Simulation
Final project for CIS566 (Procedural Computer Graphics) Milestone

Name: Gizem Dal

Pennkey: gizemdal

Live demo: https://gizemdal.github.io/crowd_simulation/

Resources: My main resources include my old implementations from previous assignments such as procedural sky and instanced rendering as well as lecture slides on Biocrowds. As I listed in previous assignment README files, _The Book of Shaders_ (https://thebookofshaders.com) has been a very helpful resource.

-----

## End Goal:
My end goal for this project is to build a "realistic" crowd simulation environment where agents move around based on not only location occupancy/vacancy but also personal goals and events happening around the city.

## Features and Techniques:
The simulation consists of a group of agents (the number set initially is 75), procedurally generated buildings and a terrain plane on which the simulation happens.

### Location Map:
When the simulation starts, a 2-D number array that represents the "location map" is created with the dimensions of the plane. All the grids are initially set to have the value 0, which indicates that the grid is vacant. This data structure is used later on in the program to check for agent movement validity and collision with the buildings/other agents.

### Building Generation:
The first step in the simulation is to generate the buildings of the city. The number of the buildings to be generated can be determined by the user by changing the building density coefficient from the GUI menu. Random locations to generate the buildings are picked (each selected position goes through a check whether the location is already occupied by another building and may go through re-selection) by using a getRandomInt() method that returns a random integer number between a given range. Once the building is put into the position, the neighboring cells inside a given radius are also marked occupied as occupied to avoid having intersecting buildings and agents colliding with buildings. The grids that are occupied by the buildings are marked in the location map by value -1. The meshes imported for the buildings include cube, pentagon and hexagon. All buildings are given a random height (within a predefined range of 5-15) and a while loop is used to start from the top of the building and add floors downwards until the building reaches the ground. The mesh to represent the floors is picked randomly among the three possible options (cube, pentagon and hexagon).

### Markers:
A marker is basically a location in the map where an agent can exist. I'm using markers in the simulation to make the agent movements more natural and realistic. After the buildings are generated, I create a large amount of markers (100 times larger than the number of agents in the simulation) and determine their locations in the plane randomly (each selected position goes through a check whether the position is already occupied by another building and may go through re-selection).

### Agents:
An agent is basically an cylindric object representing a "person" that has a position, a destination and interests. An agent's goal in the simulation is to reach its given destination. Movements of the agents happen by traveling through markers. When an agent is on a marker, in order to get closer to its destination, it picks the marker inside a given scope radius that will take it closer to its destination. This selection is calculated by a weight algorithm where the weight of an marker is caulated by 1 plus the cosine of the angle between destination and marker vectors (a destination vector is basically the vector between the destination and agent position points while a marker vector is the vector between the marker and agent position) divided by 1 plus the marker vector's length. The marker with the highest weight is selected as the agent's next position in the next simulation step (an additional check is made whether the selected marker is already occupied by another agent already). The most important feature that differentiates this crowd simulation from any other collision check based simulation is that agent's have interests that affect their destinations and movement decisions. 

-----

## Screenshots from Milestone:

### Far screenshot:

![](progress/far.png)

### Near screenshot:

![](progress/near.png)
