import { useEffect, useRef } from "react";

export function useRenderer(shaderSource, setUniforms) {
  const canvasRef = useRef(null);

  useEffect(function initWebGL() {
    const canvas = canvasRef.current;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    const renderer = createRenderer(gl, shaderSource, setUniforms);

    requestAnimationFrame(renderer);
  });

  return { canvasRef };
}

function createRenderer(gl, source, setUniforms, start = Date.now()) {
  const buffer = gl.createBuffer();
  const P = compileProgram(gl, source);
  const bufferData = new Float32Array(
    // prevent weird prettier formatting
    "-1,-1,1,-1,-1,1,-1,1,1,-1,1,1".split(",").map(x => parseInt(x, 10))
  );

  return function render() {
    setUniforms(gl, start, P);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    let loc = gl.getAttribLocation(P, "pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  };
}

function compileProgram(gl, source) {
  let prog = gl.createProgram();
  let vertexShader = loadShader(
    gl,
    gl.VERTEX_SHADER,
    "attribute vec2 pos; void main() { gl_Position = vec4(pos, 0, 1); }"
  );
  let fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, source);

  gl.attachShader(prog, vertexShader);
  gl.attachShader(prog, fragmentShader);
  gl.linkProgram(prog);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    throw new Error("kaputt");
  }

  gl.useProgram(prog);

  return prog;
}

function loadShader(gl, shaderType, src) {
  let shader = gl.createShader(shaderType);

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }

  return shader;
}
