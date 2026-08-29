import React, { useEffect, useRef } from 'react';
import { ColorTheme, ShaderSettings } from '../types';

interface EtherealShaderCanvasProps {
  theme: ColorTheme;
  settings: ShaderSettings;
  className?: string;
  onCanvasClick?: () => void;
}

export const EtherealShaderCanvas: React.FC<EtherealShaderCanvasProps> = ({
  theme,
  settings,
  className = '',
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // References to keep current props inside the animation loop without re-compiling WebGL
  const themeRef = useRef(theme);
  const settingsRef = useRef(settings);

  useEffect(() => {
    themeRef.current = theme;
    settingsRef.current = settings;
  }, [theme, settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || window.innerWidth || 1280;
      const h = canvas.clientHeight || window.innerHeight || 720;
      const targetW = Math.floor(w * dpr);
      const targetH = Math.floor(h * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    }

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
    if (ro) ro.observe(canvas);
    syncSize();

    const gl = canvas.getContext('webgl', { antialias: true, alpha: false, preserveDrawingBuffer: false }) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform float u_speed;
      uniform float u_waveScale;
      uniform float u_glowIntensity;
      uniform float u_mouseInfluence;

      void main() {
          vec2 uv = v_texCoord;
          
          // Normalized mouse ripple
          vec2 normMouse = u_mouse / u_resolution;
          float distToMouse = distance(uv, normMouse);
          float mouseWave = sin(distToMouse * 12.0 - u_time * 2.5) * exp(-distToMouse * 4.0) * (u_mouseInfluence * 0.12);
          
          // Multi-layered peaceful ethereal movement
          float t = u_time * u_speed;
          float scale = u_waveScale;
          
          float noise1 = sin(uv.x * (3.0 * scale) + t * 0.2 + mouseWave) * cos(uv.y * (2.0 * scale) + t * 0.3);
          float noise2 = cos((uv.x + uv.y) * (2.0 * scale) - t * 0.15) * sin(uv.x * (1.5 * scale) + t * 0.25);
          float noise = (noise1 * 0.7 + noise2 * 0.3) + mouseWave;
          
          vec3 color1 = u_color1;
          vec3 color2 = u_color2;
          vec3 color3 = u_color3;
          
          vec3 finalColor = mix(color1, color2, clamp(uv.y + noise * 0.18, 0.0, 1.0));
          finalColor = mix(finalColor, color3, clamp(noise * (0.06 * u_glowIntensity) + (1.0 - uv.y) * 0.06 * u_glowIntensity, 0.0, 1.0));
          
          gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function compileShader(type: number, src: string): WebGLShader | null {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = compileShader(gl.VERTEX_SHADER, vsSource);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertShader || !fragShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uColor1 = gl.getUniformLocation(prog, 'u_color1');
    const uColor2 = gl.getUniformLocation(prog, 'u_color2');
    const uColor3 = gl.getUniformLocation(prog, 'u_color3');
    const uSpeed = gl.getUniformLocation(prog, 'u_speed');
    const uWaveScale = gl.getUniformLocation(prog, 'u_waveScale');
    const uGlowIntensity = gl.getUniformLocation(prog, 'u_glowIntensity');
    const uMouseInfluence = gl.getUniformLocation(prog, 'u_mouseInfluence');

    const currentMouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const targetMouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        targetMouse.x = nx * canvas.width;
        targetMouse.y = ny * canvas.height;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        if (rect.width && rect.height) {
          const nx = (touch.clientX - rect.left) / rect.width;
          const ny = 1.0 - (touch.clientY - rect.top) / rect.height;
          targetMouse.x = nx * canvas.width;
          targetMouse.y = ny * canvas.height;
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let isRunning = true;

    function render(timestamp: number) {
      if (!isRunning || !gl || !canvas) return;

      // Smooth mouse interpolation
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05;

      gl.viewport(0, 0, canvas.width, canvas.height);

      const currentTheme = themeRef.current;
      const currentSettings = settingsRef.current;

      if (uTime) gl.uniform1f(uTime, timestamp * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, currentMouse.x, currentMouse.y);

      if (uColor1) gl.uniform3fv(uColor1, currentTheme.color1);
      if (uColor2) gl.uniform3fv(uColor2, currentTheme.color2);
      if (uColor3) gl.uniform3fv(uColor3, currentTheme.color3);

      if (uSpeed) gl.uniform1f(uSpeed, currentSettings.speed);
      if (uWaveScale) gl.uniform1f(uWaveScale, currentSettings.waveScale);
      if (uGlowIntensity) gl.uniform1f(uGlowIntensity, currentSettings.glowIntensity);
      if (uMouseInfluence) gl.uniform1f(uMouseInfluence, currentSettings.mouseInfluence);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animFrameRef.current = requestAnimationFrame(render);
    }

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (ro) ro.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);

      try {
        if (gl && prog) {
          gl.deleteProgram(prog);
          if (vertShader) gl.deleteShader(vertShader);
          if (fragShader) gl.deleteShader(fragShader);
          if (buf) gl.deleteBuffer(buf);
        }
      } catch {
        // cleanup
      }
    };
  }, []);

  return (
    <div
      id="ethereal-shader-container"
      className={`fixed inset-0 w-full h-full overflow-hidden ${className}`}
      onClick={onCanvasClick}
    >
      <canvas
        ref={canvasRef}
        id="shader-canvas-ANIMATION_1"
        className="block w-full h-full cursor-default select-none"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
};
