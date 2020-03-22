import React from "react";

import { useRenderer } from "./Renderer";

function DemoEffect() {
  const { canvasRef } = useRenderer(
    `
  #ifdef GL_ES
  precision mediump float;
  #endif
  
  uniform float time;
  uniform vec2 res;
  
  const float PI = acos(-1.0);
  const float PI2 = PI * 2.0;
  
  vec2 k_scope(vec2 p, float s, float offset) {
    float ma = abs(mod(atan(p.y, p.x), PI2 / s) - PI / s) + offset;
    return vec2(cos(ma), sin(ma)) * length(p);
  }
  
  void main( void ) {
    vec2 p = (gl_FragCoord.xy - 0.5 * res.xy) / res.y;
    float k = 0.03;
    float kt = k * time;
    p = k_scope(p * 1.4, 6.0, kt*PI2*0.12);
    float px = 4.0 * p.x / PI2;
    float py = 8.0 * p.y / PI2;
    float ang = atan(cos(p.x), p.y);
    float modifier = tan((px - py + kt) * PI2);
    float c = (modifier * 8.0 * tan(16.0 * px + ang + kt * PI) + 
               modifier * 16.0 * tan(6.0 * py + ang + kt * PI));
    vec3 col = vec3(c);
    
    col *= 2.0 - 0.5;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
  `,
    function setUniforms(gl, start, prog) {
      let time = (11.75 * (Date.now() - start)) / 1000.0;

      gl.uniform1f(gl.getUniformLocation(prog, "time"), time);
      gl.uniform2fv(gl.getUniformLocation(prog, "res"), [
        gl.canvas.width,
        gl.canvas.height
      ]);
    }
  );

  return <canvas ref={canvasRef}></canvas>;
}

export default DemoEffect;
