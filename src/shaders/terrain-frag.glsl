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
in vec4 fs_LightVec1;
in vec4 fs_LightVec2;
in vec4 fs_LightVec3;

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
    // float diffuseTerm1 = dot(normalize(fs_Nor), normalize(fs_LightVec1));
    // float diffuseTerm2 = dot(normalize(fs_Nor), normalize(fs_LightVec2));
    float diffuseTerm3 = dot(normalize(fs_Nor), normalize(fs_LightVec3));
    // Avoid negative lighting values
    // diffuseTerm1 = clamp(diffuseTerm1, 0.0, 1.0);
    // diffuseTerm2 = clamp(diffuseTerm2, 0.0, 1.0);
    diffuseTerm3 = clamp(diffuseTerm3, 0.0, 1.0);

    float ambientTerm = 0.2;

    // float lightIntensity1 = diffuseTerm1 + ambientTerm;
    // float lightIntensity2 = diffuseTerm2 + ambientTerm;
    float lightIntensity = diffuseTerm3 + ambientTerm;
    float specularIntensity = max(pow(dot(normalize(fs_LightVec3), normalize(fs_Nor)), 30.0), 0.0);
    //float lightIntensity = ((lightIntensity2 + lightIntensity3) / 2.0);
    if (u_Mode == 0.0) {
        out_Col = vec4(fs_Col.xyz * lightIntensity, 1.0);
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
        vec3 s = vec3(square_wave(fs_Pos.y, 2.0, 5.0));
        if (length(s) == 0.0) {
            float d = fs_Pos.y;
            out_Col = vec4(0.0, 0.5 * sin(mod(u_Time, 200.0) * 0.02 * d / 5.0) + 0.2, 0.5 * (sin(mod(u_Time, 200.0) * 0.02 * d / 5.0)) + 0.2, 1.0);
        }
        else {
            vec3 b = clamp(s + 0.2, 0.0, 1.0);
            out_Col = vec4(b * lightIntensity + specularIntensity, 1.0);
        }
    }
}
