#version 300 es


uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;
uniform mat4 u_ViewProj;
uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane
uniform float u_Mode;

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;
in vec4 vs_T0; // first column of transform matrix
in vec4 vs_T1; // second column of transform matrix
in vec4 vs_T2; // third column of transform matrix
in vec4 vs_T3; // fourth column of transform matrix
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.
in float vs_Type;

out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_Col;
out float fs_Type;

out vec4 fs_LightVec1; 
out vec4 fs_LightVec2;
out vec4 fs_LightVec3;

vec3 lightPos1 = vec3(0.0, 100.0, 0.0);
vec3 lightPos2 = vec3(30.0, 200.0, -50.0);
vec3 lightPos3 = vec3(80.0, 50.0, -20.0);

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}

float random (vec2 p) {
    return fract(sin(dot(p.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
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
  fs_Type = vs_Type;
  if (u_Mode == 0.0) { // instances
  	mat4 T = mat4(vs_T0, vs_T1, vs_T2, vs_T3);
  	if (vs_Nor.x != 0.0 || vs_Nor.y != 0.0 || vs_Nor.z != 0.0) {
  		fs_Nor = T * vs_Nor; // normalize(vec4(transpose(inverse(T)) * vs_Nor)); 
  	} else {
  		fs_Nor = vec4(0.0, 0.0, 0.0, 0.0);
  	}
  	vec4 modelposition = T * vs_Pos;
  	fs_Col = vs_Col;
  	fs_Pos = modelposition;
    fs_LightVec1 = vec4(lightPos1, 1.0) - modelposition;
    fs_LightVec2 = vec4(lightPos2, 1.0) - modelposition;
    fs_LightVec3 = vec4(lightPos3, 1.0);
  	gl_Position = u_ViewProj * modelposition;
  } else if (u_Mode == 1.0) { // plane
  	fs_Pos = vs_Pos;
  	fs_Col = vec4(1.0);
  	vec4 modelposition = vec4(vs_Pos.x, vs_Pos.y * sin(fbm(vec2(vs_Pos.xz), 2)), vs_Pos.z, 1.0);
  	modelposition = u_Model * modelposition;
    fs_LightVec1 = vec4(lightPos1, 1.0) - modelposition;
    fs_LightVec2 = vec4(lightPos2, 1.0) - modelposition;
    fs_LightVec3 = vec4(lightPos3, 1.0);
  	gl_Position = u_ViewProj * modelposition;
  } else if (u_Mode == 2.0) { // background
    gl_Position = vs_Pos;
  }
}
