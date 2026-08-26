import { useEffect, useRef } from 'react'

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision highp float;

uniform float u_time;
uniform vec2 u_res;
uniform float u_colorSpeed;
uniform float u_noiseScale;
uniform vec2 u_mouse;

#define PI 3.14159265359
#define TAU 6.28318530718

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float snoise(vec2 p) {
  float K = 0.366025403;
  float K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K);
  vec2 a = p - i + (i.x + i.y) * K2;
  vec2 o = (a.x < a.y) ? vec2(0.0, 1.0) : vec2(1.0, 0.0);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  float w1 = hash(i);
  float w2 = hash(i + o);
  float w3 = hash(i + 1.0);
  vec2 ww = vec2(w1, w2);
  vec2 d1 = a * a;
  vec2 d2 = b * b;
  vec2 d3 = c * c;
  float n1 = dot(ww, vec2(1.0 - d1.x - d1.y, d1.x));
  float n2 = dot(vec2(w2, w3), vec2(1.0 - d2.x - d2.y, d2.x));
  float n3 = dot(vec2(w3, w1), vec2(1.0 - d3.x - d3.y, d3.x));
  return 0.5 + 20.0 * dot(vec3(n1, n2, n3), vec3(0.3333333));
}

float fbm3(vec2 p, float t) {
  float val = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 3; i++) {
    val += amp * vnoise(p + t * 0.15);
    p *= 2.05 + float(i) * 0.1;
    t *= 1.15;
    amp *= 0.45;
  }
  return val;
}

float fbm4(vec2 p, float t) {
  float val = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    val += amp * vnoise(p + t * 0.15);
    p *= 2.05 + float(i) * 0.1;
    t *= 1.15;
    amp *= 0.4;
  }
  return val;
}

vec2 warpField(vec2 p, float t) {
  vec2 q;
  q.x = fbm3(p + t * 0.04, t);
  q.y = fbm3(p + vec2(5.2, 1.3) + t * 0.04, t + 1.7);
  vec2 r;
  r.x = fbm3(p + 2.0 * q + vec2(1.7, 9.2) + t * 0.06, t + 2.3);
  r.y = fbm3(p + 2.0 * q + vec2(8.3, 2.8) + t * 0.05, t + 3.1);
  return p + 1.5 * r;
}

vec2 distortUV(vec2 uv, float t) {
  float n1 = snoise(vec2(uv.x * 1.5, t * 0.06)) - 0.5;
  float n2 = snoise(vec2(uv.y * 1.5, t * 0.06 + 50.0)) - 0.5;
  return vec2(n1 * (0.5 + abs(uv.y - 0.5)), n2 * (0.5 + abs(uv.x - 0.5))) * 0.25;
}

float blobShape(vec2 p, float t) {
  float angle = atan(p.y, p.x);
  float radius = length(p);
  float deform = 0.0;
  deform += sin(angle * 2.0 + t * 0.3) * 0.07;
  deform += sin(angle * 3.0 - t * 0.25) * 0.05;
  deform += sin(t * 0.4) * 0.04;
  deform += cos(angle * 5.0 + t * 0.35) * 0.03;
  deform += sin(angle * 7.0 - t * 0.5 + 1.0) * 0.02;
  return radius - (0.28 + deform);
}

float metaballs(vec2 p, float t) {
  float energy = 0.0;
  vec2 centers[5];
  centers[0] = vec2(sin(t * 0.07) * 0.25, cos(t * 0.09) * 0.18);
  centers[1] = vec2(cos(t * 0.08 + 2.0) * 0.22, sin(t * 0.06 + 1.0) * 0.25);
  centers[2] = vec2(sin(t * 0.11 + 4.0) * 0.28, cos(t * 0.07 + 3.0) * 0.15);
  centers[3] = vec2(cos(t * 0.09 + 1.5) * 0.15, sin(t * 0.1 + 2.5) * 0.22);
  centers[4] = vec2(sin(t * 0.06 + 3.5) * 0.2, cos(t * 0.08 + 0.5) * 0.2);
  for (int i = 0; i < 5; i++) {
    float d = length(p - centers[i]);
    energy += 0.012 / (d * d + 0.002);
  }
  return energy - 0.9;
}

vec3 gradientColor(vec2 uv, float t, float field) {
  float colorPhase = t * u_colorSpeed * 0.12;
  vec2 warped = warpField(uv * u_noiseScale * 1.5, t * 0.3);
  float gradientPos = warped.x * 0.4 + warped.y * 0.3 + field * 0.3 + colorPhase * 0.2;
  float hue = fract(gradientPos + 0.75);
  float sat = 0.45 + smoothstep(0.0, 0.3, field) * 0.25;
  float light = 0.35 + smoothstep(0.0, 0.5, field) * 0.35;
  float c = cos(hue * TAU);
  float s = sin(hue * TAU);
  vec3 lightShift = vec3(0.5 + 0.4 * c, 0.5 + 0.35 * c * 0.3 + 0.2 * s, 0.55 + 0.4 * s);
  return mix(vec3(0.5), lightShift, sat) * light * 1.2;
}

float smileDist(vec2 p, float t) {
  p *= 3.0;
  float mouthWidth = 0.8 + sin(t * 0.5) * 0.1;
  float mouthY = -0.1 + sin(t * 0.3) * 0.05;
  float dx = clamp(p.x / mouthWidth, -1.0, 1.0);
  float curve = abs(dx) * abs(dx) * 0.5 - 0.3;
  float mouthD = abs(p.y - mouthY - curve) - 0.02;
  float leftEye = length(p - vec2(-0.25, 0.2)) - 0.15;
  float rightEye = length(p - vec2(0.25, 0.2)) - 0.15;
  return min(mouthD, min(leftEye, rightEye));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - u_res * 0.5) / min(u_res.x, u_res.y);
  float t = u_time;

  vec2 d = distortUV(uv, t);
  vec2 uvDistorted = uv + d;

  float mouseInfluence = 0.0;
  if (u_mouse.x >= 0.0) {
    vec2 mP = (u_mouse - u_res * 0.5) / min(u_res.x, u_res.y);
    float mDist = length(p - mP);
    mouseInfluence = exp(-mDist * mDist * 8.0);
  }

  float angle = t * 0.015;
  float ca = cos(angle);
  float sa = sin(angle);
  vec2 pR = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);

  float fieldVal = blobShape(pR, t);
  float energy = metaballs(p, t * 0.7);
  float blend = smoothstep(-0.15, 0.05, energy);
  float combined = mix(fieldVal, energy - 0.1, blend);

  float edgeW = 0.03 + 0.02 * fbm3(p * 2.0 + 100.0, t * 0.1);
  float field = smoothstep(edgeW, -edgeW, combined);

  vec3 col = gradientColor(uvDistorted, t, field);

  float amberMix = sin(t * 0.15 + fbm3(p * 1.5 + 50.0, t * 0.08) * TAU) * 0.5 + 0.5;
  col += vec3(0.15, 0.08, 0.0) * amberMix * smoothstep(0.0, 0.2, field) * 0.8;

  float core = smoothstep(0.15, 0.45, field);
  float innerGlow = smoothstep(0.0, 0.35, field) * 0.25;
  float centerGlow = exp(-length(pR) * length(pR) * 3.0) * 0.15;

  vec3 baseColor = vec3(0.45, 0.2, 0.55);
  vec3 glowTint = vec3(0.55, 0.3, 0.6);
  col += mix(baseColor, glowTint, smoothstep(0.0, 0.5, field)) * innerGlow;
  col += vec3(0.5, 0.3, 0.55) * centerGlow * (1.0 + mouseInfluence * 2.0);

  float inBounds = smoothstep(0.5, 0.45, max(abs(p.x), abs(p.y)));
  float smileField = 1.0 - smoothstep(0.0, 0.01, smileDist(p, t));
  float smileMask = inBounds * smileField * 0.3 * core;
  col = mix(col, vec3(0.5, 0.25, 0.6), smileMask);

  float orb = max(smoothstep(0.03, 0.0, length(pR) - 0.005) * core, smoothstep(0.04, 0.0, length(pR + 0.01) - 0.002) * core * 0.5);
  col += vec3(1.0, 0.95, 1.0) * orb * 0.5;

  col += vec3(0.15, 0.05, 0.2) * (vnoise(p * 3.0 + t * 0.05) * 0.08 + vnoise(p * 8.0 - t * 0.03) * 0.04);

  float alpha = field * 0.92 + smoothstep(0.0, 0.25, field) * 0.08 + innerGlow * 0.15 + orb * 0.5;

  float vignette = 1.0 - smoothstep(0.5, 1.5, length(p * vec2(0.8, 1.0)));
  alpha *= vignette;
  col *= 0.7 + vignette * 0.3;

  col = col / (1.0 + col * 0.15);

  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + fract(t * 0.1) * 100.0) * 43758.5453) - 0.5) * 0.012;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), clamp(alpha, 0.0, 1.0));
}
`

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

export default function FluidGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
    })
    if (!gl) return

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vs || !fs) return

    const program = createProgram(gl, vs, fs)
    if (!program) return

    gl.useProgram(program)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const aPos = gl.getAttribLocation(program, 'a_pos')
    const uTime = gl.getUniformLocation(program, 'u_time')
    const uRes = gl.getUniformLocation(program, 'u_res')
    const uColorSpeed = gl.getUniformLocation(program, 'u_colorSpeed')
    const uNoiseScale = gl.getUniformLocation(program, 'u_noiseScale')
    const uMouse = gl.getUniformLocation(program, 'u_mouse')

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    gl.uniform1f(uColorSpeed, 0.8)
    gl.uniform1f(uNoiseScale, 1.0)

    let mouseX = -1
    let mouseY = -1
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = rect.height - (e.clientY - rect.top)
    }

    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.touches[0].clientX - rect.left
      mouseY = rect.height - (e.touches[0].clientY - rect.top)
      e.preventDefault()
    }

    const handleMouseLeave = () => {
      mouseX = -1
      mouseY = -1
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('mouseleave', handleMouseLeave)

    function resize() {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = w + 'px'
      canvas!.style.height = h + 'px'
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
      gl!.uniform2f(uRes, canvas!.width, canvas!.height)
    }

    window.addEventListener('resize', resize)
    resize()

    function render(now: number) {
      gl!.uniform1f(uTime, now * 0.001)
      gl!.uniform2f(uMouse, mouseX * dpr, mouseY * dpr)
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    // Handle mobile fixed position
    const handleScroll = () => {
      if (containerRef.current && window.innerWidth < 768) {
        containerRef.current.style.transform = `translateY(${window.scrollY}px)`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', handleScroll)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden md:absolute"
      style={{ zIndex: 1 }}
    >
      <canvas
        ref={canvasRef}
        role="presentation"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: '#000000',
        }}
      />
    </div>
  )
}
