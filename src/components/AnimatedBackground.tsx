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

          // Logo blue = #2563eb = rgb(37,99,235)
          // Header text = #0f172a (dark navy)
          // Background: very light blue-white, waves gradate to logo blue
          vec3 skyTop = vec3(0.97, 0.98, 1.0);      // #f8faff — near white
          vec3 skyMid = vec3(0.94, 0.96, 1.0);      // #f0f5ff
          vec3 skyBot = vec3(0.90, 0.94, 1.0);      // #e6f0ff
          vec3 base = mix(skyTop, mix(skyMid, skyBot, uv.y), uv.y);

          // Wave layers — colors go from soft → logo blue
          // Wave 1: lightest, highest
          float wave1_y = 0.40
            + sin(uv.x * 2.5 + t * 0.6) * 0.06
            + sin(uv.x * 4.0 - t * 0.4) * 0.03
            + snoise(vec2(uv.x * 1.5 + t * 0.2, 0.5)) * 0.05;
          float wave1 = smoothstep(wave1_y + 0.025, wave1_y - 0.025, uv.y);
          vec3 wave1Color = vec3(0.88, 0.93, 1.0);   // #e0edff
          base = mix(base, wave1Color, wave1 * 0.45);

          // Wave 2: slightly deeper
          float wave2_y = 0.50
            + sin(uv.x * 3.0 - t * 0.5) * 0.05
            + sin(uv.x * 5.0 + t * 0.3) * 0.025
            + snoise(vec2(uv.x * 2.0 - t * 0.15, 1.0)) * 0.04;
          float wave2 = smoothstep(wave2_y + 0.018, wave2_y - 0.018, uv.y);
          vec3 wave2Color = vec3(0.80, 0.88, 0.99);   // #cce0fc
          base = mix(base, wave2Color, wave2 * 0.4);

          // Wave 3: medium blue
          float wave3_y = 0.60
            + sin(uv.x * 2.0 + t * 0.35) * 0.07
            + sin(uv.x * 6.0 - t * 0.25) * 0.02
            + snoise(vec2(uv.x * 1.2 + t * 0.1, 2.0)) * 0.06;
          float wave3 = smoothstep(wave3_y + 0.014, wave3_y - 0.014, uv.y);
          vec3 wave3Color = vec3(0.70, 0.83, 0.98);   // #b3d4fa
          base = mix(base, wave3Color, wave3 * 0.38);

          // Wave 4: approaching logo blue
          float wave4_y = 0.70
            + sin(uv.x * 1.8 - t * 0.3) * 0.08
            + sin(uv.x * 3.5 + t * 0.2) * 0.03
            + snoise(vec2(uv.x * 0.8 + t * 0.08, 3.0)) * 0.05;
          float wave4 = smoothstep(wave4_y + 0.01, wave4_y - 0.01, uv.y);
          vec3 wave4Color = vec3(0.55, 0.74, 0.96);   // #8cbdf4
          base = mix(base, wave4Color, wave4 * 0.35);

          // Wave 5: logo blue tint — #2563eb mix
          float wave5_y = 0.80
            + sin(uv.x * 2.2 + t * 0.45) * 0.05
            + sin(uv.x * 4.5 - t * 0.35) * 0.025
            + snoise(vec2(uv.x * 1.6 - t * 0.12, 4.0)) * 0.04;
          float wave5 = smoothstep(wave5_y + 0.008, wave5_y - 0.008, uv.y);
          vec3 wave5Color = vec3(0.37, 0.55, 0.95);   // #5e8cf2 — close to logo blue
          base = mix(base, wave5Color, wave5 * 0.3);

          // Wave 6: bottom, closest to logo blue
          float wave6_y = 0.88
            + sin(uv.x * 2.8 - t * 0.28) * 0.04
            + sin(uv.x * 5.0 + t * 0.22) * 0.02
            + snoise(vec2(uv.x * 2.0 + t * 0.1, 5.0)) * 0.03;
          float wave6 = smoothstep(wave6_y + 0.005, wave6_y - 0.005, uv.y);
          vec3 wave6Color = vec3(0.28, 0.48, 0.92);   // #487aeb — logo blue zone
          base = mix(base, wave6Color, wave6 * 0.25);

          // Subtle white crest highlights — like light on wave peaks
          float crest1 = smoothstep(0.004, 0.0, abs(uv.y - wave1_y)) * 0.12;
          float crest2 = smoothstep(0.003, 0.0, abs(uv.y - wave2_y)) * 0.08;
          float crest3 = smoothstep(0.002, 0.0, abs(uv.y - wave3_y)) * 0.05;
          base += vec3(crest1 + crest2 + crest3);

          // Top-center glow — subtle light source
          float glow = 1.0 - length((uv - vec2(0.5, 0.12)) * vec2(1.2, 1.8));
          glow = max(0.0, glow);
          base += vec3(0.02, 0.04, 0.07) * glow;

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
