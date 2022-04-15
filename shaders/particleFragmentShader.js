const particleFragmentShader = /*glsl*/ `

uniform vec3 rimColor;
varying vec3 vColor;
varying float dist;

void main() {
  
  if (distance(gl_PointCoord, vec2(0.5)) > .4) discard;
  float c = (sin(gl_PointCoord.x * 3.141592) + sin(gl_PointCoord.y * 3.141592)) / 2.;
  vec3 s = mix(rimColor, vColor, c);  
  
  float d = (dist - 20.) / 60.;
  float alpha = -d*d + 1.;

    gl_FragColor = vec4(vColor, c );
}`;
export default particleFragmentShader;
