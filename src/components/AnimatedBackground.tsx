"use client";

import { useEffect, useRef } from "react";

// Stripe-style WebGL mesh gradient — GPU-accelerated, buttery smooth
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // WebGL setup
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) return;

    let animId: number;
    let time = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = Math.max(window.innerHeight, 900);
      gl.viewport(0, 0, width, height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Vertex shader
    const vertSrc = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader — Stripe-style mesh gradient with noise
    const fragSrc = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      // Simplex noise helpers
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 0.15;

        // Multiple noise layers for mesh gradient
        float n1 = snoise(vec2(uv.x * 1.5 + t * 0.3, uv.y * 1.2 + t * 0.2));
        float n2 = snoise(vec2(uv.x * 2.0 - t * 0.2, uv.y * 1.8 + t * 0.15));
        float n3 = snoise(vec2(uv.x * 1.0 + t * 0.1, uv.y * 2.5 - t * 0.1));
        float n4 = snoise(vec2(uv.x * 3.0 + t * 0.25, uv.y * 0.8 + t * 0.3));

        // Blue palette colors
        vec3 c1 = vec3(0.94, 0.97, 1.0);    // #f0f7ff — light blue-white
        vec3 c2 = vec3(0.85, 0.92, 1.0);    // #d9ebff — soft blue
        vec3 c3 = vec3(0.65, 0.82, 1.0);    // #a6d1ff — medium blue
        vec3 c4 = vec3(0.37, 0.55, 0.95);   // #5e8cf2 — vivid blue
        vec3 c5 = vec3(0.25, 0.45, 0.90);   // #4073e5 — deep blue

        // Mix colors based on noise
        float blend1 = smoothstep(-0.3, 0.8, n1);
        float blend2 = smoothstep(-0.5, 0.6, n2);
        float blend3 = smoothstep(-0.4, 0.5, n3);
        float blend4 = smoothstep(-0.6, 0.4, n4);

        vec3 color = mix(c1, c2, blend1 * 0.6);
        color = mix(color, c3, blend2 * 0.35);
        color = mix(color, c4, blend3 * 0.15);
        color = mix(color, c5, blend4 * 0.08);

        // Subtle diagonal light streak (Stripe signature)
        float streak = smoothstep(0.3, 0.5, snoise(vec2(uv.x * 0.5 + uv.y * 2.0 + t * 0.4, uv.y * 0.3)));
        color = mix(color, vec3(0.98, 0.99, 1.0), streak * 0.12);

        // Top-left to bottom-right light flow
        float flow = smoothstep(0.0, 1.0, uv.x + uv.y + snoise(vec2(uv.x * 2.0 + t, uv.y * 2.0)) * 0.2);
        color = mix(color, vec3(0.92, 0.96, 1.0), flow * 0.08);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const compileShader = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const vert = compileShader(gl.VERTEX_SHADER, vertSrc);
    const frag = compileShader(gl.FRAGMENT_SHADER, fragSrc);
    const program = gl.createProgram()!;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");

    const render = () => {
      time += 0.016;
      gl.uniform1f(uTime, time);
      gl.uniform2f(uRes, width, height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
