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
vec3 lightPos3 = vec3(20.0, 50.0, -80.0);

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}

void main()
{
  fs_Type = vs_Type;
  if (u_Mode == 0.0) { // instances
  	mat4 T = mat4(vs_T0, vs_T1, vs_T2, vs_T3);
  	if (vs_Nor.x != 0.0 || vs_Nor.y != 0.0 || vs_Nor.z != 0.0) {
  		fs_Nor = normalize(vec4(transpose(inverse(T)) * vs_Nor)); 
  	} else {
  		fs_Nor = vec4(0.0, 0.0, 0.0, 0.0);
  	}
  	vec4 modelposition = T * vs_Pos;
  	fs_Col = vs_Col;
  	fs_Pos = modelposition;
    fs_LightVec1 = vec4(lightPos1, 1.0) - modelposition;
    fs_LightVec2 = vec4(lightPos2, 1.0) - modelposition;
    fs_LightVec3 = vec4(lightPos3, 1.0) - modelposition;
  	gl_Position = u_ViewProj * modelposition;
  } else if (u_Mode == 1.0) {// } else { // plane
  	fs_Pos = vs_Pos;
  	fs_Col = vec4(1.0);
  	vec4 modelposition = vec4(vs_Pos.x, vs_Pos.y, vs_Pos.z, 1.0);
  	modelposition = u_Model * modelposition;
    fs_LightVec1 = vec4(lightPos1, 1.0) - modelposition;
    fs_LightVec2 = vec4(lightPos2, 1.0) - modelposition;
    fs_LightVec3 = vec4(lightPos3, 1.0) - modelposition;
  	gl_Position = u_ViewProj * modelposition;
  } else if (u_Mode == 2.0) { // background
    gl_Position = vs_Pos;
  }
}
