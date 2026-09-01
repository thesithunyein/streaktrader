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

          // Logo blue = #2563eb
          // Clean white background, very subtle blue waves only in bottom half
          vec3 base = vec3(0.98, 0.99, 1.0);  // #fafcff — nearly white

          // Only show waves in the lower 60% — keep top clean for text
          float yMask = smoothstep(0.35, 0.55, uv.y);  // fades in from 35%-55% down

          // Wave 1: top wave, very subtle
          float wave1_y = 0.55
            + sin(uv.x * 2.0 + t * 0.5) * 0.04
            + sin(uv.x * 3.5 - t * 0.3) * 0.02
            + snoise(vec2(uv.x * 1.2 + t * 0.15, 0.5)) * 0.03;
          float wave1 = smoothstep(wave1_y + 0.03, wave1_y - 0.03, uv.y);
          vec3 wave1Color = vec3(0.93, 0.96, 1.0);  // very faint blue tint
          base = mix(base, wave1Color, wave1 * 0.3 * yMask);

          // Wave 2
          float wave2_y = 0.63
            + sin(uv.x * 2.5 - t * 0.4) * 0.04
            + sin(uv.x * 4.0 + t * 0.25) * 0.02
            + snoise(vec2(uv.x * 1.5 - t * 0.12, 1.0)) * 0.03;
          float wave2 = smoothstep(wave2_y + 0.025, wave2_y - 0.025, uv.y);
          vec3 wave2Color = vec3(0.88, 0.93, 1.0);  // #e0edff
          base = mix(base, wave2Color, wave2 * 0.35 * yMask);

          // Wave 3
          float wave3_y = 0.72
            + sin(uv.x * 1.8 + t * 0.35) * 0.05
            + sin(uv.x * 5.0 - t * 0.2) * 0.02
            + snoise(vec2(uv.x * 1.0 + t * 0.08, 2.0)) * 0.04;
          float wave3 = smoothstep(wave3_y + 0.02, wave3_y - 0.02, uv.y);
          vec3 wave3Color = vec3(0.80, 0.88, 0.99);  // soft blue
          base = mix(base, wave3Color, wave3 * 0.4 * yMask);

          // Wave 4: slightly deeper
          float wave4_y = 0.80
            + sin(uv.x * 2.2 - t * 0.3) * 0.04
            + sin(uv.x * 3.0 + t * 0.18) * 0.02
            + snoise(vec2(uv.x * 0.8 + t * 0.06, 3.0)) * 0.03;
          float wave4 = smoothstep(wave4_y + 0.015, wave4_y - 0.015, uv.y);
          vec3 wave4Color = vec3(0.70, 0.82, 0.98);  // #b3d1fa
          base = mix(base, wave4Color, wave4 * 0.4 * yMask);

          // Wave 5: bottom — hint of logo blue
          float wave5_y = 0.88
            + sin(uv.x * 2.6 + t * 0.4) * 0.03
            + sin(uv.x * 4.0 - t * 0.25) * 0.015
            + snoise(vec2(uv.x * 1.4 - t * 0.1, 4.0)) * 0.025;
          float wave5 = smoothstep(wave5_y + 0.01, wave5_y - 0.01, uv.y);
          vec3 wave5Color = vec3(0.55, 0.72, 0.96);  // #8cb8f4
          base = mix(base, wave5Color, wave5 * 0.35 * yMask);

          // Very subtle white crest lines
          float crest1 = smoothstep(0.006, 0.0, abs(uv.y - wave1_y)) * 0.06;
          float crest2 = smoothstep(0.005, 0.0, abs(uv.y - wave2_y)) * 0.04;
          base += vec3(crest1 + crest2) * yMask;

          // Soft top-left to bottom-right light gradient
          float lightGrad = (uv.x * 0.3 + uv.y * 0.7);
          base = mix(base, base + vec3(0.01, 0.015, 0.03), lightGrad);

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
