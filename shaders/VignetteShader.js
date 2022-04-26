/**
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.0 },
    darkness: { value: 1.0 },
    color: { value: [1, 0, 0] },
  },

  vertexShader: /* glsl */ `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */ `

		uniform float offset;
		uniform float darkness;
		uniform vec3 color;
		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
 		   return (base * blend * opacity + base * (1.0 - opacity));
		}

		void main() {

			// Eskil's vignette			

			vec4 texel = texture2D( tDiffuse, vUv );
			vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );
			// gl_FragColor = vec4( mix( texel.rgb, color, dot( uv, uv )*darkness ), texel.a );
			gl_FragColor = vec4( blendMultiply( texel.rgb, color, dot( uv, uv )*darkness ), texel.a );
			

		}`,
};

export { VignetteShader };
