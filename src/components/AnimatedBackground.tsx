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
    `;

    // Fragment shader — animated flowing waves
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

        // Layer 1: base gradient (light to slightly darker blue)
        vec3 skyTop = vec3(0.94, 0.97, 1.0);    // #f0f7ff
        vec3 skyBot = vec3(0.88, 0.93, 1.0);    // #e0edff
        vec3 base = mix(skyTop, skyBot, uv.y);

        // Wave layers — each one undulates at different speed/frequency
        // Wave 1: big slow wave (foreground, most opaque)
        float wave1_y = 0.42
          + sin(uv.x * 2.5 + t * 0.6) * 0.06
          + sin(uv.x * 4.0 - t * 0.4) * 0.03
          + snoise(vec2(uv.x * 1.5 + t * 0.2, 0.5)) * 0.05;
        float wave1 = smoothstep(wave1_y + 0.02, wave1_y - 0.02, uv.y);
        vec3 wave1Color = vec3(0.75, 0.87, 1.0);  // #c0deff
        base = mix(base, wave1Color, wave1 * 0.5);

        // Wave 2: medium wave
        float wave2_y = 0.52
          + sin(uv.x * 3.0 - t * 0.5) * 0.05
          + sin(uv.x * 5.0 + t * 0.3) * 0.025
          + snoise(vec2(uv.x * 2.0 - t * 0.15, 1.0)) * 0.04;
        float wave2 = smoothstep(wave2_y + 0.015, wave2_y - 0.015, uv.y);
        vec3 wave2Color = vec3(0.65, 0.82, 1.0);  // #a6d1ff
        base = mix(base, wave2Color, wave2 * 0.4);

        // Wave 3: back wave (subtlest)
        float wave3_y = 0.62
          + sin(uv.x * 2.0 + t * 0.35) * 0.07
          + sin(uv.x * 6.0 - t * 0.25) * 0.02
          + snoise(vec2(uv.x * 1.2 + t * 0.1, 2.0)) * 0.06;
        float wave3 = smoothstep(wave3_y + 0.01, wave3_y - 0.01, uv.y);
        vec3 wave3Color = vec3(0.55, 0.75, 0.98);  // #8cbffc
        base = mix(base, wave3Color, wave3 * 0.3);

        // Wave 4: deep back wave
        float wave4_y = 0.72
          + sin(uv.x * 1.8 - t * 0.3) * 0.08
          + sin(uv.x * 3.5 + t * 0.2) * 0.03
          + snoise(vec2(uv.x * 0.8 + t * 0.08, 3.0)) * 0.05;
        float wave4 = smoothstep(wave4_y + 0.008, wave4_y - 0.008, uv.y);
        vec3 wave4Color = vec3(0.45, 0.68, 0.95);  // #73aef2
        base = mix(base, wave4Color, wave4 * 0.25);

        // Wave 5: bottom wave
        float wave5_y = 0.82
          + sin(uv.x * 2.2 + t * 0.45) * 0.05
          + sin(uv.x * 4.5 - t * 0.35) * 0.025
          + snoise(vec2(uv.x * 1.6 - t * 0.12, 4.0)) * 0.04;
        float wave5 = smoothstep(wave5_y + 0.006, wave5_y - 0.006, uv.y);
        vec3 wave5Color = vec3(0.35, 0.58, 0.92);  // #5994eb
        base = mix(base, wave5Color, wave5 * 0.2);

        // Subtle foam/highlight lines along wave crests
        float crest1 = abs(uv.y - wave1_y) < 0.003 ? 0.08 : 0.0;
        float crest2 = abs(uv.y - wave2_y) < 0.002 ? 0.05 : 0.0;
        base += vec3(crest1 + crest2);

        // Top glow — soft radial light from center-top
        float glow = 1.0 - length((uv - vec2(0.5, 0.15)) * vec2(1.0, 1.5));
        glow = max(0.0, glow);
        base += vec3(0.03, 0.05, 0.08) * glow;

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
