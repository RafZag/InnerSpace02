/* eslint-disable */
const particleFragmentShader = /*glsl*/ `

uniform vec3 rimColor;
uniform vec3 partColor;
// varying vec3 vColor;
varying float dist;

void main() {

  if (distance(gl_PointCoord, vec2(0.5)) > .4) discard;
  float c = (sin(gl_PointCoord.x * 3.141592) + sin(gl_PointCoord.y * 3.141592)) / 2.;
  vec3 s = mix(rimColor, partColor, c);

  float d = (dist - 20.) / 80.;
  float alpha = 1.- d*d ;

    gl_FragColor = vec4(s, alpha );
}`;
export default particleFragmentShader;
