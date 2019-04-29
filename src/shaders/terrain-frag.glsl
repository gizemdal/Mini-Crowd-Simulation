#version 300 es
precision highp float;

uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane
uniform vec2 u_Dimensions; // Dimensions of the plane
uniform float u_Time;
uniform float u_Mode;
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;
in float fs_Type;

in float fs_Sine;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

// vec2 random2(vec2 p) {
//     return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
// }

float random (vec2 p) {
    return fract(sin(dot(p.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float square_wave(float x, float freq, float amplitude) {
    return abs(float(int(floor(x * freq)) % 2) * amplitude);
}

float noise (vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float fbm (vec2 p, int octaves) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < octaves; ++i) {
        v += a * noise(p);
        p= rot * p * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main()
{
    // float t = clamp(smoothstep(40.0, 50.0, length(fs_Pos)), 0.0, 1.0); // Distance fog
    // out_Col = vec4(mix(vec3(0.5 * (fs_Sine + 1.0)), vec3(164.0 / 255.0, 233.0 / 255.0, 1.0), t), 1.0);

    // float x = (fs_Pos.x + 50.0) * 0.2; // scaled x coordinate of UV
    // float y = (fs_Pos.z + 50.0) * 0.2; // scaled y coordinate of UV
    // int cellX = int(x); // lower-left X coordinate in which the point lies
    // int cellY = int(y); // lower-left Y coordinate in which the point lies
    // vec2 randomPoint = random2(vec2(cellX, cellY)); // random point in the cell that our point belongs to
    // randomPoint += vec2(cellX, cellY); // add randomPoint with cell coordinates to make our random point fall into given cell
    // vec2 closest = randomPoint; // keep track of closest random point to our current pixel
    // bool oops = false;
    // for (int i = cellY - 1; i <= cellY + 1; i++) {
    //     // skip the coordinate if out of bounds
    //     if (i < 0 || i > int(u_Dimensions.y)) {
    //         continue;
    //         // oops = true;
    //         // break;
    //     }
    //     for (int j = cellX - 1; j <= cellX + 1; j++) {
    //         // skip the coordinate if out of bounds
    //         if (j < 0 || j > int(u_Dimensions.x)) {
    //             continue;
    //             // oops = true;
    //             // break;
    //         }
    //         vec2 rand = random2(vec2(j, i)); // find the random point in neighbor pixel
    //         rand += vec2(j, i); // add randomPoint with cell coordinates to make our random point fall into given cell
    //         float distance = sqrt(pow(x - rand.x, 2.0) + pow(y - rand.y, 2.0)); // calculate distance
    //         if (distance < sqrt(pow(x - closest.x, 2.0) + pow(y - closest.y, 2.0))) {
    //             closest = rand;
    //         }
    //     }
    // }
    // if (oops) {
    // 	out_Col = vec4(1.0, 0.0, 0.0, 1.0);
    // } else {
    // 	//diffuseColor = texture(u_RenderedTexture, vec2(closest.x / 75.0, closest.y / 50.0)).rgb; // get the color from closest point coordinates
    // 	float difference = sqrt(pow(x - (closest.x - 0.25), 2.0) + pow(y - (closest.y - 0.25), 2.0)); // calculate the distance between pixel and closest point
    // 	float colX = clamp(difference, 0.0, 1.0); // r value
    // 	float colY = clamp(difference, 0.0, 1.0); // g value
    // 	float colZ = clamp(difference, 0.0, 1.0); // b value
    // 	out_Col = vec4(colX, colY, colZ, 1.0);
    // }
    if (u_Mode == 0.0) {
        out_Col = fs_Col;
    } 
    if (u_Mode == 1.0) {
        //out_Col = fs_Col;
        float c = 0.6 * fbm(vec2(fs_Pos.x*0.05, fs_Pos.z*0.05), 3);
        out_Col = vec4(vec3(c), 1.0);
    } 
    if (u_Mode == 2.0) {
        float t = u_Time * 0.5;
        vec2 st = gl_FragCoord.xy/u_Dimensions.xy*3.;
        vec3 color = vec3(0.0);

        vec2 q = vec2(0.);
        q.x = fbm( st + 0.00*t, 2);
        q.y = fbm( st + vec2(1.0), 2);

        vec2 r = vec2(0.);
        r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*t, 2 );
        r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*t, 2);

        float f = fbm(st+r, 5);

        color = mix(vec3(0.101961,0.619608,0.666667),
                    vec3(0.666667,0.666667,0.498039),
                    clamp((f*f)*4.0,0.0,1.0));

        color = mix(color,
                    vec3(0,0,0.164706),
                    clamp(length(q),0.0,1.0));

        color = mix(color,
                    vec3(0.666667,1,1),
                    clamp(length(r.x),0.0,1.0));

        out_Col = vec4((f*f*f+.6*f*f+.5*f)*color.x, (f*f*f+.6*f*f+.5*f)*color.y,(f*f*f+.6*f*f+.5*f)*color.z,1.);

    }
    if (fs_Type == 3.0) {
        out_Col = vec4(vec3(square_wave(fs_Pos.y, 2.0, 5.0)), 1.0);
    }
}
