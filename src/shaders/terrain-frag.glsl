#version 300 es
precision highp float;

uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane
uniform vec2 u_Dimensions; // Dimensions of the plane
in vec3 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;

in float fs_Sine;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

vec2 random2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

void main()
{
    // float t = clamp(smoothstep(40.0, 50.0, length(fs_Pos)), 0.0, 1.0); // Distance fog
    // out_Col = vec4(mix(vec3(0.5 * (fs_Sine + 1.0)), vec3(164.0 / 255.0, 233.0 / 255.0, 1.0), t), 1.0);

    float x = (fs_Pos.x + 50.0) * 0.2; // scaled x coordinate of UV
    float y = (fs_Pos.z + 50.0) * 0.2; // scaled y coordinate of UV
    int cellX = int(x); // lower-left X coordinate in which the point lies
    int cellY = int(y); // lower-left Y coordinate in which the point lies
    vec2 randomPoint = random2(vec2(cellX, cellY)); // random point in the cell that our point belongs to
    randomPoint += vec2(cellX, cellY); // add randomPoint with cell coordinates to make our random point fall into given cell
    vec2 closest = randomPoint; // keep track of closest random point to our current pixel
    bool oops = false;
    for (int i = cellY - 1; i <= cellY + 1; i++) {
        // skip the coordinate if out of bounds
        if (i < 0 || i > int(u_Dimensions.y)) {
            continue;
            // oops = true;
            // break;
        }
        for (int j = cellX - 1; j <= cellX + 1; j++) {
            // skip the coordinate if out of bounds
            if (j < 0 || j > int(u_Dimensions.x)) {
                continue;
                // oops = true;
                // break;
            }
            vec2 rand = random2(vec2(j, i)); // find the random point in neighbor pixel
            rand += vec2(j, i); // add randomPoint with cell coordinates to make our random point fall into given cell
            float distance = sqrt(pow(x - rand.x, 2.0) + pow(y - rand.y, 2.0)); // calculate distance
            if (distance < sqrt(pow(x - closest.x, 2.0) + pow(y - closest.y, 2.0))) {
                closest = rand;
            }
        }
    }
    if (oops) {
    	out_Col = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
    	//diffuseColor = texture(u_RenderedTexture, vec2(closest.x / 75.0, closest.y / 50.0)).rgb; // get the color from closest point coordinates
    	float difference = sqrt(pow(x - (closest.x - 0.25), 2.0) + pow(y - (closest.y - 0.25), 2.0)); // calculate the distance between pixel and closest point
    	float colX = clamp(difference, 0.0, 1.0); // r value
    	float colY = clamp(difference, 0.0, 1.0); // g value
    	float colZ = clamp(difference, 0.0, 1.0); // b value
    	out_Col = vec4(colX, colY, colZ, 1.0);
    }

}
