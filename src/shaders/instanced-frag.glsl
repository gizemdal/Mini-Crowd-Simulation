#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_LightVec1;
in vec4 fs_LightVec2;
in vec4 fs_LightVec3;

uniform float u_Time;

out vec4 out_Col;

float square_wave(float x, float freq, float amplitude) {
	return abs(float(int(floor(x * freq)) % 2) * amplitude);
}

void main()
{
	out_Col = fs_Col;
}
