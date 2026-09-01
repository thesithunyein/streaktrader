"use client";

import { useEffect, useRef } from "react";

// Moving waves background — WebGL simplex noise waves in blue palette
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    const vertSrc = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;      // Fragment shader — animated flowing waves matching logo blue #2563eb
      const fragSrc = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
            + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
            dot(x12.zw,x12.zw)), 0.0);
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
          float t = u_time * 0.4;

          // Logo blue gradient background: #2563eb to #3b82f6
          // Logo = white S on bright blue. Match that blue.
          vec3 blueLight = vec3(0.42, 0.60, 0.95);  // #6b99f2 — lighter blue top
          vec3 blueMain = vec3(0.30, 0.50, 0.93);   // #4d80ed — mid blue
          vec3 blueDeep = vec3(0.22, 0.42, 0.90);   // #396be5 — deeper blue bottom

          // Base gradient from top to bottom
          vec3 base = mix(blueLight, mix(blueMain, blueDeep, uv.y), uv.y * 0.7);

          // Wave layers — lighter/darker variations within the blue
          // Wave 1: lighter wave on top
          float wave1_y = 0.25
            + sin(uv.x * 2.0 + t * 0.5) * 0.05
            + sin(uv.x * 3.5 - t * 0.3) * 0.025
            + snoise(vec2(uv.x * 1.2 + t * 0.15, 0.5)) * 0.04;
          float wave1 = smoothstep(wave1_y + 0.04, wave1_y - 0.04, uv.y);
          vec3 wave1Color = vec3(0.50, 0.68, 0.97);  // lighter blue wave
          base = mix(base, wave1Color, wave1 * 0.3);

          // Wave 2
          float wave2_y = 0.40
            + sin(uv.x * 2.5 - t * 0.4) * 0.05
            + sin(uv.x * 4.0 + t * 0.25) * 0.025
            + snoise(vec2(uv.x * 1.5 - t * 0.12, 1.0)) * 0.035;
          float wave2 = smoothstep(wave2_y + 0.035, wave2_y - 0.035, uv.y);
          vec3 wave2Color = vec3(0.38, 0.56, 0.94);  // slightly different blue
          base = mix(base, wave2Color, wave2 * 0.25);

          // Wave 3: darker wave
          float wave3_y = 0.55
            + sin(uv.x * 1.8 + t * 0.35) * 0.06
            + sin(uv.x * 5.0 - t * 0.2) * 0.025
            + snoise(vec2(uv.x * 1.0 + t * 0.08, 2.0)) * 0.045;
          float wave3 = smoothstep(wave3_y + 0.03, wave3_y - 0.03, uv.y);
          vec3 wave3Color = vec3(0.25, 0.44, 0.88);  // deeper blue
          base = mix(base, wave3Color, wave3 * 0.3);

          // Wave 4
          float wave4_y = 0.70
            + sin(uv.x * 2.2 - t * 0.3) * 0.04
            + sin(uv.x * 3.0 + t * 0.18) * 0.02
            + snoise(vec2(uv.x * 0.8 + t * 0.06, 3.0)) * 0.035;
          float wave4 = smoothstep(wave4_y + 0.025, wave4_y - 0.025, uv.y);
          vec3 wave4Color = vec3(0.35, 0.54, 0.93);  // mid-blue
          base = mix(base, wave4Color, wave4 * 0.25);

          // Wave 5: bottom — light streak
          float wave5_y = 0.85
            + sin(uv.x * 2.6 + t * 0.4) * 0.035
            + sin(uv.x * 4.0 - t * 0.25) * 0.015
            + snoise(vec2(uv.x * 1.4 - t * 0.1, 4.0)) * 0.03;
          float wave5 = smoothstep(wave5_y + 0.02, wave5_y - 0.02, uv.y);
          vec3 wave5Color = vec3(0.48, 0.66, 0.97);  // lighter blue streak
          base = mix(base, wave5Color, wave5 * 0.2);

          // Subtle white crest highlights along waves — like light reflections
          float crest1 = smoothstep(0.005, 0.0, abs(uv.y - wave1_y)) * 0.08;
          float crest2 = smoothstep(0.004, 0.0, abs(uv.y - wave3_y)) * 0.06;
          base += vec3(crest1 + crest2);

          // Top-right soft glow — like light source
          float glow = 1.0 - length((uv - vec2(0.75, 0.1)) * vec2(1.5, 2.0));
          glow = max(0.0, glow);
          base += vec3(0.05, 0.07, 0.12) * glow;

          gl_FragColor = vec4(base, 1.0);
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
