import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy, OnChanges, SimpleChanges,
} from '@angular/core';
import * as THREE from 'three';

/* -------------------------------------------------------------
   Shader source – must be defined **inside** the component file
   ------------------------------------------------------------- */
const MAX_COLORS = 8 as const;

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const frag = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

  vec3 col = vec3(0.0);
  float a = 1.0;

  if (uColorCount > 0) {
    vec2 s = q;
    vec3 sumCol = vec3(0.0);
    float cover = 0.0;
    for (int i = 0; i < MAX_COLORS; ++i) {
      if (i >= uColorCount) break;
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float m = mix(m0, m1, kMix);
      float w = 1.0 - exp(-6.0 / exp(6.0 * m));
      sumCol += uColors[i] * w;
      cover = max(cover, w);
    }
    col = clamp(sumCol, 0.0, 1.0);
    a = uTransparent > 0 ? cover : 1.0;
  } else {
    vec2 s = q;
    for (int k = 0; k < 3; ++k) {
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float m = mix(m0, m1, kMix);
      col[k] = 1.0 - exp(-6.0 / exp(6.0 * m));
    }
    a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
  }

  if (uNoise > 0.0001) {
    float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
  }

  vec3 rgb = (uTransparent > 0) ? col * a : col;
  gl_FragColor = vec4(rgb, a);
}
`;

@Component({
  selector: 'app-color-bends',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #container class="color-bends-container"></div>`,
  styles: [`
    .color-bends-container {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class ColorBendsComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;

  @Input() rotation = 30;
  @Input() speed = 0.3;
  @Input() colors: string[] = ['#ff5c7a', '#8a5cff', '#00ffd1'];
  @Input() transparent = true;
  @Input() autoRotate = 0;
  @Input() scale = 1.2;
  @Input() frequency = 1.4;
  @Input() warpStrength = 1.2;
  @Input() mouseInfluence = 0.8;
  @Input() parallax = 0.6;
  @Input() noise = 0.08;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private material!: THREE.ShaderMaterial;
  private animationId!: number;
  private resizeObserver!: ResizeObserver;

  /* ----------------------------------------------------------- */
  ngAfterViewInit() {
    this.initThreeJS();
    this.startAnimation();
    this.setupResizeObserver();
    this.setupMouseListener();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['colors'] && this.material) {
      this.updateColors();
    }
  }
  ngOnDestroy() { this.stopAnimation(); this.cleanup(); }

  private initThreeJS() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    this.material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uCanvas: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uSpeed: { value: this.speed },
        uRot: { value: new THREE.Vector2(1, 0) },
        uColorCount: { value: 0 },
        uColors: { value: Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0)) },
        uTransparent: { value: this.transparent ? 1 : 0 },
        uScale: { value: this.scale },
        uFrequency: { value: this.frequency },
        uWarpStrength: { value: this.warpStrength },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: this.mouseInfluence },
        uParallax: { value: this.parallax },
        uNoise: { value: this.noise }
      },
      transparent: true,
      premultipliedAlpha: true
    });

    this.updateColors();

    const mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(mesh);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, this.transparent ? 0 : 1);
    this.container.nativeElement.appendChild(this.renderer.domElement);
  }

  private updateColors() {
    const colorsArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0));
    const validColors = this.colors.filter(Boolean).slice(0, MAX_COLORS);

    validColors.forEach((hex, i) => {
      const h = hex.replace('#', '');
      const v = h.length === 3
        ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
        : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      colorsArray[i].set(v[0] / 255, v[1] / 255, v[2] / 255);
    });

    this.material.uniforms['uColors'].value = colorsArray;
    this.material.uniforms['uColorCount'].value = validColors.length;
  }

  private startAnimation() {
    const clock = new THREE.Clock();
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      this.material.uniforms['uTime'].value = elapsed;

      const deg = (this.rotation % 360) + this.autoRotate * elapsed;
      const rad = (deg * Math.PI) / 180;
      const c = Math.cos(rad);
      const s = Math.sin(rad);
      (this.material.uniforms['uRot'].value as THREE.Vector2).set(c, s);

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = this.container.nativeElement;
      this.renderer.setSize(clientWidth, clientHeight);
      this.material.uniforms['uCanvas'].value.set(clientWidth, clientHeight);
    });
    this.resizeObserver.observe(this.container.nativeElement);
  }

  private setupMouseListener() {
    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerCurrent = new THREE.Vector2(0, 0);

    const handle = (e: PointerEvent) => {
      const rect = this.container.nativeElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerTarget.set(x, y);
      pointerCurrent.lerp(pointerTarget, 0.1);
      this.material.uniforms['uPointer'].value.copy(pointerCurrent);
    };

    this.container.nativeElement.addEventListener('pointermove', handle);
  }

  private stopAnimation() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  private cleanup() {
    this.stopAnimation();
    this.resizeObserver?.disconnect();
    this.material.dispose();
    this.renderer.dispose();
  }
}
