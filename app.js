/* ═══════════════════════════════════════════════════════════════
   LUMIÈRE NOËL · The Camera Tree
   Procedural 3D scene, physically swinging ornaments, CMOS reveals.
   Built with three.js r160 — no external assets, no post-processing.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const DATA = (window.CAMERA_DATA && window.CAMERA_DATA.products) || [];
  const TAU = Math.PI * 2;
  const UP = new THREE.Vector3(0, 1, 0);
  const DOWN = new THREE.Vector3(0, -1, 0);
  const $ = (sel) => document.querySelector(sel);

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
  const pad2 = (n) => String(n).padStart(2, '0');
  const isNarrow = () => window.innerWidth <= 900;

  /* ── Visual direction per product ─────────────────────────── */
  const VISUAL = {
    'sony-a1m2': { kind: 'camera', bodyW: 0.62, bodyH: 0.42, bodyD: 0.22, shell: '#111214', accent: '#f0803c', hump: true, mountR: 0.165, lensR: 0.13, lensL: 0.34, lensColor: '#0b0c0d', logo: 'α1 II', brandLabel: 'SONY' },
    'sony-a9m3': { kind: 'camera', bodyW: 0.62, bodyH: 0.42, bodyD: 0.22, shell: '#111214', accent: '#f0803c', hump: true, mountR: 0.165, lensR: 0.125, lensL: 0.32, lensColor: '#0b0c0d', logo: 'α9 III', brandLabel: 'SONY' },
    'sony-a7r6': { kind: 'camera', bodyW: 0.61, bodyH: 0.41, bodyD: 0.21, shell: '#141517', accent: '#f0803c', hump: true, mountR: 0.165, lensR: 0.12, lensL: 0.3, lensColor: '#0b0c0d', logo: 'α7R VI', brandLabel: 'SONY' },
    'sony-zve1': { kind: 'camera', bodyW: 0.56, bodyH: 0.37, bodyD: 0.18, shell: '#e9e5dc', accent: '#f0803c', hump: false, mountR: 0.155, lensR: 0.115, lensL: 0.27, lensColor: '#dcd7ca', logo: 'ZV-E1', brandLabel: 'SONY', white: true, screen: true },
    'nikon-z9': { kind: 'camera', bodyW: 0.67, bodyH: 0.55, bodyD: 0.25, shell: '#121416', accent: '#d9b94b', integrated: true, hump: true, mountR: 0.19, lensR: 0.14, lensL: 0.34, lensColor: '#0b0c0d', logo: 'Z 9', brandLabel: 'Nikon' },
    'nikon-z8': { kind: 'camera', bodyW: 0.63, bodyH: 0.46, bodyD: 0.23, shell: '#121416', accent: '#d9b94b', hump: true, mountR: 0.19, lensR: 0.135, lensL: 0.32, lensColor: '#0b0c0d', logo: 'Z 8', brandLabel: 'Nikon' },
    'nikon-d850': { kind: 'camera', bodyW: 0.66, bodyH: 0.46, bodyD: 0.25, shell: '#131416', accent: '#d9b94b', dslr: true, hump: true, mountR: 0.18, lensR: 0.135, lensL: 0.4, lensColor: '#0b0c0d', logo: 'D850', brandLabel: 'Nikon' },
    'nikon-d6': { kind: 'camera', bodyW: 0.68, bodyH: 0.56, bodyD: 0.27, shell: '#121416', accent: '#d9b94b', dslr: true, integrated: true, hump: true, mountR: 0.18, lensR: 0.135, lensL: 0.4, lensColor: '#0b0c0d', logo: 'D6', brandLabel: 'Nikon' },
    'canon-1dx3': { kind: 'camera', bodyW: 0.68, bodyH: 0.56, bodyD: 0.27, shell: '#121315', accent: '#e04b3f', dslr: true, integrated: true, hump: true, mountR: 0.18, lensR: 0.135, lensL: 0.4, lensColor: '#0b0c0d', logo: '1D X III', brandLabel: 'Canon' },
    'canon-5d4': { kind: 'camera', bodyW: 0.65, bodyH: 0.46, bodyD: 0.25, shell: '#131416', accent: '#e04b3f', dslr: true, hump: true, mountR: 0.18, lensR: 0.13, lensL: 0.38, lensColor: '#0b0c0d', logo: '5D IV', brandLabel: 'Canon' },
    'canon-r1': { kind: 'camera', bodyW: 0.68, bodyH: 0.55, bodyD: 0.25, shell: '#111315', accent: '#e04b3f', integrated: true, hump: true, mountR: 0.185, lensR: 0.14, lensL: 0.34, lensColor: '#0b0c0d', logo: 'EOS R1', brandLabel: 'Canon' },
    'canon-r52': { kind: 'camera', bodyW: 0.61, bodyH: 0.42, bodyD: 0.21, shell: '#111315', accent: '#e04b3f', hump: true, mountR: 0.185, lensR: 0.125, lensL: 0.3, lensColor: '#0b0c0d', logo: 'EOS R5 II', brandLabel: 'Canon' },
    'hasselblad-x2d2': { kind: 'camera', bodyW: 0.67, bodyH: 0.46, bodyD: 0.22, shell: '#3a3b38', accent: '#b9a98c', hump: false, mountR: 0.21, lensR: 0.16, lensL: 0.31, lensColor: '#161715', logo: 'X2D II', brandLabel: 'HASSELBLAD', leather: true },
    'hasselblad-907x': { kind: 'camera', bodyW: 0.64, bodyH: 0.35, bodyD: 0.2, shell: '#9b978b', accent: '#b9a98c', hump: false, mountR: 0.2, lensR: 0.145, lensL: 0.3, lensColor: '#191a18', logo: '907X', brandLabel: 'HASSELBLAD', silver: true, modular: true },
    'fujifilm-gfx100ii': { kind: 'camera', bodyW: 0.67, bodyH: 0.49, bodyD: 0.26, shell: '#141516', accent: '#d74945', hump: true, mountR: 0.205, lensR: 0.155, lensL: 0.35, lensColor: '#0b0c0d', logo: 'GFX100 II', brandLabel: 'FUJIFILM' },
    'sony-600f4': { kind: 'lens', length: 1.55, radius: 0.215, shell: '#d7d1c2', accent: '#f0803c', hood: true, tripod: true, label: 'FE 600mm F4 GM' },
    'sony-400f28': { kind: 'lens', length: 1.2, radius: 0.19, shell: '#d7d1c2', accent: '#f0803c', hood: true, tripod: true, label: 'FE 400mm F2.8 GM' },
    'nikon-800f63': { kind: 'lens', length: 1.62, radius: 0.2, shell: '#151617', accent: '#d9b94b', hood: true, tripod: true, label: 'Z 800mm f/6.3' },
    'canon-ef600f4': { kind: 'lens', length: 1.52, radius: 0.22, shell: '#ded8c8', accent: '#e04b3f', hood: true, tripod: true, label: 'EF 600mm f/4L' },
    'canon-rf1200f8': { kind: 'lens', length: 1.28, radius: 0.235, shell: '#ded8c8', accent: '#e04b3f', hood: true, tripod: true, label: 'RF 1200mm f/8L' },
    'hasselblad-xcd35100': { kind: 'lens', length: 0.78, radius: 0.155, shell: '#1a1b19', accent: '#b9a98c', hood: false, tripod: false, label: 'XCD 35-100mm E' }
  };

  /* Design details cross-checked against official product imagery.
     prism: flat | evf | dslr — mountStyle selects bayonet finish and badge system. */
  const CAMERA_STYLE = {
    'sony-a1m2': { style: 'sony', bodyD: 0.29, prism: 'evf', mountStyle: 'sony-e', mountMetal: '#b7b6ae', mountLabel: 'E', topPlate: 'black', screenStyle: 'tilt', gripColor: '#151617', frontTexture: true, accentMode: 'sony', lensBadge: 'G', mountR: 0.145 },
    'sony-a9m3': { style: 'sony', bodyD: 0.29, prism: 'evf', mountStyle: 'sony-e', mountMetal: '#b7b6ae', mountLabel: 'E', topPlate: 'black', screenStyle: 'tilt', gripColor: '#151617', frontTexture: true, accentMode: 'sony', lensBadge: 'G', mountR: 0.145 },
    'sony-a7r6': { style: 'sony', bodyW: 0.62, bodyH: 0.435, bodyD: 0.285, prism: 'evf', mountStyle: 'sony-e', mountMetal: '#b7b6ae', mountLabel: 'E', topPlate: 'black', screenStyle: 'tilt', gripColor: '#151617', frontTexture: true, accentMode: 'sony', lensBadge: 'G', mountR: 0.145 },
    'sony-zve1': { style: 'sony-vlog', bodyW: 0.56, bodyH: 0.34, bodyD: 0.23, prism: 'flat', mountStyle: 'sony-e', mountMetal: '#b7b6ae', mountLabel: 'E', topPlate: 'black', screenStyle: 'flip', gripColor: '#d9d4c7', frontTexture: false, accentMode: 'sony', lensBadge: 'G', lensColor: '#ded9cd', lensR: 0.11, lensL: 0.28, mountR: 0.135 },
    'nikon-z9': { style: 'nikon', bodyW: 0.69, bodyH: 0.64, bodyD: 0.35, prism: 'evf', mountStyle: 'nikon-z', mountMetal: '#242725', mountLabel: 'NIKKOR Z', topPlate: 'black', screenStyle: 'tilt', integrated: true, gripColor: '#151617', frontTexture: true, accentMode: 'nikon', lensBadge: 'S', mountR: 0.16, lensR: 0.145, lensL: 0.36 },
    'nikon-z8': { style: 'nikon', bodyW: 0.64, bodyH: 0.49, bodyD: 0.305, prism: 'evf', mountStyle: 'nikon-z', mountMetal: '#242725', mountLabel: 'NIKKOR Z', topPlate: 'black', screenStyle: 'tilt', gripColor: '#151617', frontTexture: true, accentMode: 'nikon', lensBadge: 'S', lensL: 0.33, mountR: 0.155 },
    'nikon-d850': { style: 'nikon-dslr', bodyW: 0.66, bodyH: 0.55, bodyD: 0.315, prism: 'dslr', mountStyle: 'nikon-f', mountMetal: '#b8b6ad', mountLabel: 'F', topPlate: 'black', screenStyle: 'fixed', gripColor: '#151617', frontTexture: true, accentMode: 'nikon', lensBadge: 'N', lensL: 0.42, lensR: 0.14, mountR: 0.13 },
    'nikon-d6': { style: 'nikon-dslr', bodyW: 0.68, bodyH: 0.65, bodyD: 0.35, prism: 'dslr', mountStyle: 'nikon-f', mountMetal: '#b8b6ad', mountLabel: 'F', topPlate: 'black', screenStyle: 'fixed', integrated: true, gripColor: '#151617', frontTexture: true, accentMode: 'nikon', lensBadge: 'N', lensL: 0.42, mountR: 0.13 },
    'canon-1dx3': { style: 'canon-dslr', bodyW: 0.69, bodyH: 0.65, bodyD: 0.35, prism: 'dslr', mountStyle: 'canon-ef', mountMetal: '#c3c0b5', mountLabel: 'EF', topPlate: 'black', screenStyle: 'fixed', integrated: true, gripColor: '#151617', frontTexture: true, accentMode: 'canon', lensBadge: 'L', lensL: 0.43, mountR: 0.15 },
    'canon-5d4': { style: 'canon-dslr', bodyW: 0.65, bodyH: 0.53, bodyD: 0.31, prism: 'dslr', mountStyle: 'canon-ef', mountMetal: '#c3c0b5', mountLabel: 'EF', topPlate: 'black', screenStyle: 'fixed', gripColor: '#151617', frontTexture: true, accentMode: 'canon', lensBadge: 'L', lensL: 0.4, mountR: 0.15 },
    'canon-r1': { style: 'canon-rf', bodyW: 0.70, bodyH: 0.65, bodyD: 0.35, prism: 'evf', mountStyle: 'canon-rf', mountMetal: '#c7c4b9', mountLabel: 'RF', topPlate: 'black', screenStyle: 'tilt', integrated: true, gripColor: '#151617', frontTexture: true, accentMode: 'canon', lensBadge: 'L', mountR: 0.155, lensL: 0.37 },
    'canon-r52': { style: 'canon-rf', bodyW: 0.63, bodyH: 0.47, bodyD: 0.305, prism: 'evf', mountStyle: 'canon-rf', mountMetal: '#c7c4b9', mountLabel: 'RF', topPlate: 'black', screenStyle: 'tilt', gripColor: '#151617', frontTexture: true, accentMode: 'canon', lensBadge: 'L', lensL: 0.32, mountR: 0.155 },
    'hasselblad-x2d2': { style: 'hasselblad-x', bodyW: 0.67, bodyH: 0.47, bodyD: 0.30, prism: 'flat', mountStyle: 'hasselblad-x', mountMetal: '#8f8a7a', mountLabel: 'XCD', topPlate: 'silver', screenStyle: 'large', gripColor: '#1a1b19', frontTexture: false, accentMode: 'hasselblad', accent: '#c8a45d', lensBadge: 'H', lensL: 0.47, lensR: 0.16, lensColor: '#151614', lensZoom: true, mountR: 0.18 },
    'hasselblad-907x': { style: 'hasselblad-907', bodyW: 0.66, bodyH: 0.40, bodyD: 0.29, prism: 'flat', mountStyle: 'hasselblad-x', mountMetal: '#b9b5a8', mountLabel: 'XCD', topPlate: 'silver', screenStyle: 'large', gripColor: '#35332d', frontTexture: false, accentMode: 'hasselblad', accent: '#c8a45d', lensBadge: 'H', lensL: 0.34, lensR: 0.15, lensColor: '#171816', mountR: 0.18 },
    'fujifilm-gfx100ii': { style: 'fuji', bodyW: 0.68, bodyH: 0.51, bodyD: 0.34, prism: 'evf', mountStyle: 'fuji-g', mountMetal: '#b9b6ab', mountLabel: 'G', topPlate: 'black', screenStyle: 'tilt', gripColor: '#151617', frontTexture: true, accentMode: 'fuji', lensBadge: 'GF', mountR: 0.195, lensL: 0.37, lensR: 0.16 }
  };
  for (const id in CAMERA_STYLE) {
    if (VISUAL[id]) Object.assign(VISUAL[id], CAMERA_STYLE[id]);
  }

  const LENS_STYLE = {
    'sony-600f4': { length: 1.4, radius: 0.23, mountMetal: '#b7b6ae', badgeText: 'G', badgeColor: '#f0803c', focusWidth: 0.2, bigRing: true, accentPlacement: 'rear', hoodAccent: false },
    'sony-400f28': { length: 1.08, radius: 0.205, mountMetal: '#b7b6ae', badgeText: 'G', badgeColor: '#f0803c', focusWidth: 0.19, bigRing: true, accentPlacement: 'rear', hoodAccent: false },
    'nikon-800f63': { length: 1.4, radius: 0.21, mountMetal: '#242725', badgeText: 'PF', badgeColor: '#d9b94b', focusWidth: 0.19, bigRing: true, darkTrim: true },
    'canon-ef600f4': { length: 1.32, radius: 0.235, mountMetal: '#c3c0b5', badgeText: 'L', badgeColor: '#e04b3f', focusWidth: 0.2, bigRing: true },
    'canon-rf1200f8': { length: 1.42, radius: 0.22, mountMetal: '#c7c4b9', badgeText: 'L', badgeColor: '#e04b3f', focusWidth: 0.18, bigRing: true },
    'hasselblad-xcd35100': { length: 0.62, radius: 0.175, mountMetal: '#8f8a7a', badgeText: 'H', badgeColor: '#c8a45d', focusWidth: 0.22, zoomRing: true, apertureRing: true, darkTrim: true, accentPlacement: 'rear', hoodAccent: false }
  };
  for (const id in LENS_STYLE) {
    if (VISUAL[id]) Object.assign(VISUAL[id], LENS_STYLE[id]);
  }

  /* ── Application state ───────────────────────────────────── */
  const state = {
    mode: 'index',                 // index | focusing | focus | returning
    selected: null,
    hovered: null,
    treeYaw: 0,
    treeSpin: 0.10,
    prevOmega: 0,
    omega: 0,
    alpha: 0,
    autoRotate: true,
    lastInteraction: performance.now(),
    dragging: false,
    dragMode: null,
    dragDistance: 0,
    dragOmega: 0,
    lastPointer: { x: 0, y: 0 },
    lastMoveTime: 0,
    pointerId: null,
    orbit: { yaw: 0.04, pitch: 0.15, dist: 18.8, targetY: 4.45 },
    focus: {
      trans: null,
      detailYaw: 0.34,
      detailEl: 0.14,
      dist: 1.7,
      baseDist: 1.7,
      startPos: new THREE.Vector3(),
      startTarget: new THREE.Vector3(),
      startFov: 38
    },
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    started: false,
    time: 0,
    lightFocus: 0
  };

  const els = {
    canvas: $('#world'),
    loader: $('#loader'),
    panel: $('#panel'),
    panelInner: $('#panelInner'),
    panelScroll: $('#panelScroll'),
    panelClose: $('#panelClose'),
    tooltip: $('#tooltip'),
    tooltipBrand: $('#tooltipBrand'),
    tooltipName: $('#tooltipName'),
    focusShade: $('#focusShade'),
    focusHudLabel: $('#focusHudLabel'),
    hint: $('#hint'),
    resetBtn: $('#resetBtn'),
    motionBtn: $('#motionBtn'),
    error: $('#webglError'),
    focusHud: $('#focusHud')
  };

  let renderer, scene, camera, clock;
  let treeGroup, treeScenery = null, treeLights = null, starGroup = null, snow = null, groundGlow = null;
  const env = {};
  let ornaments = [];
  let pickables = [];
  let raycaster, pointerNDC;
  let hoverRing = null;
  let introStart = 0;
  let tmpV = new THREE.Vector3();
  let tmpV2 = new THREE.Vector3();
  let tmpQ = new THREE.Quaternion();
  let ambientDust;

  /* ── Small utilities ─────────────────────────────────────── */

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(20261225);
  const rrange = (a, b) => a + rand() * (b - a);

  function canvasTexture(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    draw(ctx, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  let glowTex = null;
  function getGlowTexture() {
    if (glowTex) return glowTex;
    glowTex = canvasTexture(128, 128, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.12, 'rgba(255,247,220,0.96)');
      g.addColorStop(0.3, 'rgba(255,222,154,0.46)');
      g.addColorStop(0.62, 'rgba(255,190,100,0.10)');
      g.addColorStop(1, 'rgba(255,170,70,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
    return glowTex;
  }

  let leatherTex = null;
  function getLeatherTexture() {
    if (leatherTex) return leatherTex;
    leatherTex = canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#5a5a5a';
      ctx.fillRect(0, 0, w, h);
      const r = mulberry32(44);
      for (let i = 0; i < 9000; i++) {
        const x = r() * w, y = r() * h;
        const v = 28 + Math.floor(r() * 75);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 1.2, 1.2);
      }
      for (let i = 0; i < 18; i++) {
        ctx.strokeStyle = 'rgba(255,255,255,0.035)';
        ctx.beginPath();
        ctx.moveTo(0, i * 14);
        ctx.lineTo(w, i * 14 + 5);
        ctx.stroke();
      }
    });
    leatherTex.wrapS = leatherTex.wrapT = THREE.RepeatWrapping;
    leatherTex.repeat.set(2.5, 3.5);
    return leatherTex;
  }

  let ribTex = null;
  function getRibTexture() {
    if (ribTex) return ribTex;
    ribTex = canvasTexture(256, 64, (ctx, w, h) => {
      ctx.fillStyle = '#555';
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 5) {
        ctx.fillStyle = '#1b1b1b';
        ctx.fillRect(x, 0, 2, h);
        ctx.fillStyle = '#8a8a8a';
        ctx.fillRect(x + 2, 0, 1, h);
      }
    });
    ribTex.wrapS = ribTex.wrapT = THREE.RepeatWrapping;
    ribTex.repeat.set(1, 1);
    return ribTex;
  }

  function makeTextTexture(text, opts) {
    opts = opts || {};
    const w = 1024, h = 256;
    const color = opts.color || '#f3eee2';
    return canvasTexture(w, h, (ctx) => {
      ctx.clearRect(0, 0, w, h);
      let fs = opts.fontSize || 108;
      const fontFamily = opts.font || '"Segoe UI", Arial, sans-serif';
      const weight = opts.weight || 600;
      const style = opts.italic ? 'italic ' : '';
      const spacing = opts.spacing || 0;
      const setFont = (size) => {
        ctx.font = `${style}${weight} ${size}px ${fontFamily}`;
      };
      setFont(fs);
      // Auto-fit the glyph to a pleasing proportion of the label plane.
      // A 4:1 canvas otherwise makes a large wordmark look tiny once mapped.
      const fillX = opts.fillX || 0.9;
      const fillY = opts.fillY || 0.72;
      const measureWidth = (s) => {
        if (!spacing) return ctx.measureText(s).width;
        return s.split('').reduce((acc, ch) => acc + ctx.measureText(ch).width + spacing, 0) - spacing;
      };
      if (opts.fit !== false) {
        let metrics = ctx.measureText(text);
        let textW = measureWidth(text);
        let textH = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) || fs;
        let scale = Math.min((w * fillX) / Math.max(textW, 1), (h * fillY) / Math.max(textH, 1));
        fs = Math.max(18, Math.min(360, fs * scale));
        setFont(fs);
      }

      ctx.textAlign = opts.align || 'center';
      ctx.textBaseline = 'middle';
      if (opts.shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur = 7;
      }
      ctx.fillStyle = color;
      const x = opts.align === 'left' ? 24 : opts.align === 'right' ? w - 24 : w / 2;
      if (spacing) {
        const chars = text.split('');
        const widths = chars.map((ch) => ctx.measureText(ch).width + spacing);
        const total = widths.reduce((a, b) => a + b, 0) - spacing;
        let cx = opts.align === 'left' ? 24 : opts.align === 'right' ? w - 24 - total : (w - total) / 2;
        chars.forEach((ch, i) => {
          ctx.fillText(ch, cx, h / 2);
          cx += widths[i];
        });
      } else {
        ctx.fillText(text, x, h / 2);
      }
    });
  }

  function makeTextPlane(text, width, opts) {
    const texture = makeTextTexture(text, opts);
    const h = width * (opts && opts.ratio ? opts.ratio : 0.25);
    const geo = new THREE.PlaneGeometry(width, h);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      toneMapped: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 2;
    return mesh;
  }

  function roundedRectShape(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  function roundedBoxGeometry(w, h, d, r) {
    const shape = roundedRectShape(w, h, Math.min(r, Math.min(w, h) * 0.45));
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: d,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: Math.min(0.012, r * 0.35),
      bevelThickness: Math.min(0.012, d * 0.12),
      curveSegments: 6
    });
    geo.center();
    return geo;
  }

  function cylinder(radius, length, material, segments) {
    const geo = new THREE.CylinderGeometry(radius, radius, length, segments || 28, 1, false);
    const mesh = new THREE.Mesh(geo, material);
    return mesh;
  }

  function torus(radius, tube, material, seg) {
    return new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, seg || 40), material);
  }

  /* ── Scene bootstrap ─────────────────────────────────────── */

  function initScene() {
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: els.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false
      });
    } catch (err) {
      showWebGLError();
      return false;
    }
    if (!renderer || !renderer.getContext()) {
      showWebGLError();
      return false;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isNarrow() ? 2 : 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07110d, 0.0225);
    scene.environment = buildEnvironmentMap();

    camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.08, 120);

    raycaster = new THREE.Raycaster();
    pointerNDC = new THREE.Vector2();
    clock = new THREE.Clock();

    const ground = buildGround();
    scene.add(ground);

    buildEnvironmentDust();

    treeGroup = new THREE.Group();
    treeGroup.name = 'camera-tree';
    scene.add(treeGroup);
    buildTree(treeGroup);

    buildLights();
    layoutScene();
    introStart = performance.now();
    return true;
  }

  function showWebGLError() {
    if (els.loader) els.loader.classList.add('is-done');
    if (els.error) els.error.hidden = false;
  }

  function buildEnvironmentMap() {
    const tex = canvasTexture(1024, 512, (ctx, w, h) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#16251f');
      sky.addColorStop(0.42, '#0b1712');
      sky.addColorStop(0.72, '#070e0b');
      sky.addColorStop(1, '#030706');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      const warm = ctx.createRadialGradient(w * 0.25, h * 0.37, 4, w * 0.25, h * 0.37, w * 0.3);
      warm.addColorStop(0, 'rgba(255,226,170,0.9)');
      warm.addColorStop(0.16, 'rgba(255,208,140,0.36)');
      warm.addColorStop(1, 'rgba(255,190,100,0)');
      ctx.fillStyle = warm;
      ctx.fillRect(0, 0, w, h);

      const cool = ctx.createRadialGradient(w * 0.77, h * 0.46, 6, w * 0.77, h * 0.46, w * 0.32);
      cool.addColorStop(0, 'rgba(126,205,190,0.46)');
      cool.addColorStop(0.3, 'rgba(80,150,135,0.14)');
      cool.addColorStop(1, 'rgba(40,100,90,0)');
      ctx.fillStyle = cool;
      ctx.fillRect(0, 0, w, h);

      // soft studio boxes for lens and body highlights
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const boxes = [
        { x: 60, y: 80, w: 260, h: 120, a: 0.22, color: '#ffe7c0' },
        { x: 690, y: 150, w: 200, h: 80, a: 0.16, color: '#d9fff3' },
        { x: 470, y: 30, w: 180, h: 60, a: 0.13, color: '#fff6df' }
      ];
      for (const b of boxes) {
        const gg = ctx.createRadialGradient(b.x + b.w / 2, b.y + b.h / 2, 2, b.x + b.w / 2, b.y + b.h / 2, b.w * 0.65);
        gg.addColorStop(0, b.color + 'ff');
        gg.addColorStop(0.5, b.color + '55');
        gg.addColorStop(1, b.color + '00');
        ctx.globalAlpha = b.a;
        ctx.fillStyle = gg;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }
      ctx.restore();
    });
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const target = pmrem.fromEquirectangular(tex);
      pmrem.dispose();
      tex.dispose();
      return target.texture;
    } catch (e) {
      return tex;
    }
  }

  function buildLights() {
    const hemi = new THREE.HemisphereLight(0xaec9b8, 0x07100b, 0.76);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffe3ba, 2.35);
    key.position.set(6.5, 11.5, 7.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -7.5;
    key.shadow.camera.right = 7.5;
    key.shadow.camera.top = 9.5;
    key.shadow.camera.bottom = -2;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 32;
    key.shadow.bias = -0.0009;
    key.shadow.normalBias = 0.025;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x5ba894, 2.55);
    rim.position.set(-7, 6.5, -8);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(0xa8bfae, 0.9);
    fill.position.set(-3, 4, 9);
    scene.add(fill);

    const spot = new THREE.SpotLight(0xffd39a, 64, 32, Math.PI * 0.29, 0.78, 1.65);
    spot.position.set(1.6, 12.5, 8.5);
    spot.target.position.set(0, 5, 0);
    scene.add(spot);
    scene.add(spot.target);

    const innerWarm = new THREE.PointLight(0xffb76d, 7.2, 11, 2);
    innerWarm.position.set(0.7, 4.4, 1.2);
    scene.add(innerWarm);

    const innerCool = new THREE.PointLight(0x5eb7a0, 4.8, 10, 2);
    innerCool.position.set(-1.8, 6.2, -1.4);
    scene.add(innerCool);

    const focusFill = new THREE.DirectionalLight(0xf1f4ee, 0);
    focusFill.position.set(0, 6, 8);
    focusFill.target.position.set(0, 4.5, 0);
    focusFill.castShadow = false;
    scene.add(focusFill);
    scene.add(focusFill.target);

    Object.assign(env, { hemi, key, rim, fill, spot, innerWarm, innerCool, focusFill });

    // three small practicals nestled in the branches, hidden on close-up
    const branchLights = [];
    const lightSpots = [
      { a: 0.45, y: 3.15, r: 2.35, i: 2.9 },
      { a: 2.4, y: 4.65, r: 1.95, i: 2.4 },
      { a: 4.35, y: 6.0, r: 1.5, i: 2.0 }
    ];
    for (const s of lightSpots) {
      const pl = new THREE.PointLight(0xffc27f, s.i, 3.6, 2);
      pl.position.set(Math.sin(s.a) * s.r, s.y, Math.cos(s.a) * s.r);
      (treeScenery || scene).add(pl);
      branchLights.push(pl);
    }
    env.branchLights = branchLights;
  }

  function buildGround() {
    const g = new THREE.Group();

    const floorTex = canvasTexture(1024, 1024, (ctx, w, h) => {
      const bg = ctx.createRadialGradient(w * 0.48, h * 0.48, 10, w * 0.5, h * 0.5, w * 0.7);
      bg.addColorStop(0, '#16251f');
      bg.addColorStop(0.34, '#0c1712');
      bg.addColorStop(1, '#040806');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const r = mulberry32(77);
      for (let i = 0; i < 2200; i++) {
        const x = r() * w, y = r() * h;
        const a = r() * 0.06;
        ctx.fillStyle = `rgba(200,215,205,${a})`;
        ctx.fillRect(x, y, 1 + r() * 2, 1 + r() * 2);
      }
    });
    floorTex.wrapS = floorTex.wrapT = THREE.ClampToEdgeWrapping;

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      color: 0x8f9c94,
      roughness: 0.68,
      metalness: 0.32
    });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(22, 96), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.04;
    floor.receiveShadow = true;
    g.add(floor);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(4.42, 4.58, 0.24, 96),
      new THREE.MeshStandardMaterial({ color: 0x0b1410, roughness: 0.42, metalness: 0.55 })
    );
    platform.position.y = 0.08;
    platform.receiveShadow = true;
    platform.castShadow = true;
    g.add(platform);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(4.43, 0.012, 8, 128),
      new THREE.MeshBasicMaterial({ color: 0xc7ac7a, transparent: true, opacity: 0.52, toneMapped: false })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.205;
    g.add(ring);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.62, 0.004, 6, 128),
      new THREE.MeshBasicMaterial({ color: 0xc7ac7a, transparent: true, opacity: 0.18, toneMapped: false })
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.208;
    g.add(innerRing);

    groundGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color: 0xffc576,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    }));
    groundGlow.scale.set(9, 9, 1);
    groundGlow.position.set(0, 0.24, 0);
    groundGlow.material.rotation = 0;
    g.add(groundGlow);

    return g;
  }

  function buildEnvironmentDust() {
    const count = 620;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cA = new THREE.Color(0xe4ddd0), cB = new THREE.Color(0xa7c5b5), cC = new THREE.Color(0xd8b87a);
    for (let i = 0; i < count; i++) {
      const r = 22 + rand() * 28;
      const theta = rand() * TAU;
      const phi = Math.acos(rand() * 1.6 - 0.6);
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      positions[i * 3 + 1] = Math.cos(phi) * r * 0.55 + 5;
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
      const col = rand() < 0.18 ? cC : rand() < 0.45 ? cB : cA;
      colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.095,
      map: getGlowTexture(),
      transparent: true,
      opacity: 0.62,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      toneMapped: false
    });
    const points = new THREE.Points(geo, mat);
    points.name = 'star-dust';
    scene.add(points);

    // five soft bokeh orbs for depth
    const bokehColors = [0xd8b981, 0x92bbaa, 0xdac9a3, 0x6e9e8d];
    for (let i = 0; i < 14; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: getGlowTexture(),
        color: bokehColors[i % bokehColors.length],
        transparent: true,
        opacity: rrange(0.025, 0.075),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false
      }));
      const s = rrange(0.7, 3.2);
      sp.scale.set(s, s, 1);
      sp.position.set(rrange(-13, 12), rrange(0.5, 11), rrange(-12, -5));
      scene.add(sp);
    }

    // faint golden moon disc behind the tree
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color: 0xd9b77d,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    }));
    moon.scale.set(10, 10, 1);
    moon.position.set(-8.5, 9.3, -14);
    scene.add(moon);

    ambientDust = points;
  }

  function treeRadiusAt(y) {
    const t = clamp((y - 0.8) / (8.55 - 0.8), 0, 1);
    return 3.25 * Math.pow(1 - t, 1.05) + 0.11;
  }

  /* ── Procedural fir ──────────────────────────────────────── */

  function createFrondGeometry() {
    const positions = [];
    const pairs = 8;
    const planes = [0, 1.0472, 2.0944];
    for (const spin of planes) {
      const cos = Math.cos(spin), sin = Math.sin(spin);
      for (let i = 0; i < pairs; i++) {
        const t = i / (pairs - 1);
        const y = 0.04 + t * 0.82;
        const len = (0.15 + 0.21 * Math.sin(t * Math.PI * 0.9)) * (1.05 - t * 0.28);
        const baseW = 0.012;
        for (const side of [-1, 1]) {
          const tipY = y + len * 0.3 + (1 - t) * 0.035;
          const tipX = side * len;
          const tipZ = side * len * 0.26;
          const rx = tipX * cos - tipZ * sin;
          const rz = tipX * sin + tipZ * cos;
          const bx = 0, bz = 0.006;
          positions.push(
            bx, y - baseW, bz,
            bx, y + baseW, -bz,
            rx, tipY, rz
          );
        }
      }
      positions.push(-0.007, 0, 0, 0.007, 0, 0, 0, 0.92, 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    return geo;
  }

  function buildTree(root) {
    const rnd = mulberry32(90125);
    const height = 8.55;

    // trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.94, metalness: 0 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.24, height, 12), trunkMat);
    trunk.position.y = height / 2 + 0.16;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    root.add(trunk);

    // a dark inner cone gives the tree body
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x0a1d13, roughness: 1, metalness: 0, side: THREE.DoubleSide });
    const innerCone = new THREE.Mesh(new THREE.ConeGeometry(2.76, height - 0.85, 36, 12, true), innerMat);
    innerCone.position.y = height / 2 + 0.18;
    innerCone.receiveShadow = true;
    root.add(innerCone);

    // gather fronds + branches
    const fronds = [];
    const branches = [];
    const tiers = 19;
    const palettes = [0x0a2417, 0x0e2e1e, 0x123826, 0x17422d, 0x1c4b34, 0x23543c, 0x2a5c43, 0x31664c];
    const frost = new THREE.Color(0x829889);
    const tmpColor = new THREE.Color();

    for (let tier = 0; tier < tiers; tier++) {
      const t = (tier + 0.5) / tiers;
      const y = 0.9 + t * (height - 1.5);
      const radius = treeRadiusAt(y);
      const count = Math.round(10 + 30 * Math.pow(1 - t, 0.82));
      for (let b = 0; b < count; b++) {
        const angle = (b / count) * TAU + tier * 0.78 + rnd() * 0.24;
        const branchLen = radius * (0.7 + rnd() * 0.32);
        const startR = 0.06 + rnd() * 0.05;
        const droop = -0.36 - rnd() * 0.28;
        const dir = new THREE.Vector3(Math.sin(angle), droop * (0.9 + 0.2 * rnd()), Math.cos(angle)).normalize();
        const start = new THREE.Vector3(Math.sin(angle) * startR, y + rnd() * 0.06, Math.cos(angle) * startR);
        const end = start.clone().addScaledVector(dir, branchLen);

        branches.push({
          start,
          end,
          thick: 0.014 + (1 - t) * 0.012
        });

        const frondSpots = 3 + (rnd() < 0.45 ? 1 : 0);
        for (let f = 0; f < frondSpots; f++) {
          const along = 0.27 + (f / frondSpots) * 0.69 + rnd() * 0.08;
          const base = start.clone().addScaledVector(dir, branchLen * along);
          const fdir = new THREE.Vector3(
            Math.sin(angle + (rnd() - 0.5) * 0.65),
            -0.06 - rnd() * 0.3,
            Math.cos(angle + (rnd() - 0.5) * 0.65)
          ).normalize();
          const scale = (0.66 + (1 - t) * 0.55) * (0.72 + rnd() * 0.62);
          const colorIdx = clamp(Math.floor(t * 3.5 + rnd() * 4.2), 0, palettes.length - 1);
          tmpColor.setHex(palettes[colorIdx]);
          if (rnd() < 0.075 + (1 - t) * 0.025) tmpColor.lerp(frost, 0.28);
          fronds.push({
            pos: base,
            dir: fdir,
            roll: rnd() * TAU,
            scale,
            color: tmpColor.clone()
          });
        }
      }
    }

    // inner volume fill fronds
    for (let i = 0; i < 460; i++) {
      const y = 1.0 + rnd() * 7.1;
      const r = treeRadiusAt(y) * (0.45 + rnd() * 0.35);
      const a = rnd() * TAU;
      const color = new THREE.Color(palettes[Math.floor(rnd() * 4)]);
      fronds.push({
        pos: new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r),
        dir: new THREE.Vector3(Math.sin(a), -0.1 - rnd() * 0.45, Math.cos(a)).normalize(),
        roll: rnd() * TAU,
        scale: 0.5 + rnd() * 0.5,
        color
      });
    }

    const frondGeo = createFrondGeometry();
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.92,
      metalness: 0,
      side: THREE.DoubleSide,
      flatShading: false
    });
    const frondMesh = new THREE.InstancedMesh(frondGeo, frondMat, fronds.length);
    frondMesh.castShadow = true;
    frondMesh.receiveShadow = true;
    frondMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < fronds.length; i++) {
      const f = fronds[i];
      dummy.position.copy(f.pos);
      dummy.quaternion.setFromUnitVectors(UP, f.dir);
      dummy.rotateY(f.roll);
      dummy.scale.setScalar(f.scale);
      dummy.updateMatrix();
      frondMesh.setMatrixAt(i, dummy.matrix);
      frondMesh.setColorAt(i, f.color);
    }
    frondMesh.instanceMatrix.needsUpdate = true;
    if (frondMesh.instanceColor) frondMesh.instanceColor.needsUpdate = true;
    root.add(frondMesh);

    // branches
    const branchGeo = new THREE.CylinderGeometry(0.007, 0.02, 1, 5, 1, true);
    const branchMat = new THREE.MeshStandardMaterial({ color: 0x30251a, roughness: 0.94, metalness: 0 });
    const branchMesh = new THREE.InstancedMesh(branchGeo, branchMat, branches.length);
    branchMesh.castShadow = true;
    for (let i = 0; i < branches.length; i++) {
      const b = branches[i];
      const mid = b.start.clone().add(b.end).multiplyScalar(0.5);
      const dir = b.end.clone().sub(b.start);
      const len = dir.length();
      dummy.position.copy(mid);
      dummy.quaternion.setFromUnitVectors(UP, dir.normalize());
      dummy.scale.set(b.thick * 1.6, len, b.thick * 1.6);
      dummy.updateMatrix();
      branchMesh.setMatrixAt(i, dummy.matrix);
    }
    branchMesh.instanceMatrix.needsUpdate = true;
    root.add(branchMesh);

    // gold garland
    const garlandPoints = [];
    const turns = 5.4;
    for (let i = 0; i <= 760; i++) {
      const t = i / 760;
      const y = 1.05 + t * 7.2;
      const a = t * TAU * turns + 0.4;
      const r = treeRadiusAt(y) + 0.035;
      garlandPoints.push(new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r));
    }
    const garlandCurve = new THREE.CatmullRomCurve3(garlandPoints);
    const garlandMat = new THREE.MeshStandardMaterial({
      color: 0x9b804d,
      metalness: 0.9,
      roughness: 0.28,
      emissive: 0x251a08,
      emissiveIntensity: 0.4
    });
    const garland = new THREE.Mesh(new THREE.TubeGeometry(garlandCurve, 900, 0.0085, 4, false), garlandMat);
    garland.castShadow = false;
    root.add(garland);

    // beads at intervals
    const beadCount = 54;
    const beadGeo = new THREE.SphereGeometry(0.022, 6, 5);
    const beadMesh = new THREE.InstancedMesh(beadGeo, garlandMat, beadCount);
    for (let i = 0; i < beadCount; i++) {
      const t = (i + 0.5) / beadCount;
      const y = 1.05 + t * 7.2;
      const a = t * TAU * turns + 0.4;
      const r = treeRadiusAt(y) + 0.06;
      dummy.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      beadMesh.setMatrixAt(i, dummy.matrix);
    }
    beadMesh.instanceMatrix.needsUpdate = true;
    root.add(beadMesh);

    // fairy lights
    const bulbCount = 210;
    const bulbGeo = new THREE.SphereGeometry(0.026, 6, 5);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    const bulbs = new THREE.InstancedMesh(bulbGeo, bulbMat, bulbCount);
    const bulbColors = [new THREE.Color(0xffcf88), new THREE.Color(0xffe6b8), new THREE.Color(0xffb35f), new THREE.Color(0xb9d9c8)];
    const bulbPositions = new Float32Array(bulbCount * 3);
    const bulbColorArr = new Float32Array(bulbCount * 3);
    for (let i = 0; i < bulbCount; i++) {
      const t = i / bulbCount;
      const y = 1.0 + t * 7.35 + Math.sin(i * 1.7) * 0.12;
      const a = t * TAU * 7.2 + (i % 3) * 0.8;
      const r = treeRadiusAt(y) * (0.82 + (i % 5) * 0.032);
      const pos = new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r);
      dummy.position.copy(pos);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.7 + (i % 4) * 0.13);
      dummy.updateMatrix();
      bulbs.setMatrixAt(i, dummy.matrix);
      const c = bulbColors[i % bulbColors.length];
      bulbs.setColorAt(i, c);
      bulbPositions[i * 3] = pos.x;
      bulbPositions[i * 3 + 1] = pos.y;
      bulbPositions[i * 3 + 2] = pos.z;
      bulbColorArr[i * 3] = c.r;
      bulbColorArr[i * 3 + 1] = c.g;
      bulbColorArr[i * 3 + 2] = c.b;
    }
    bulbs.instanceMatrix.needsUpdate = true;
    if (bulbs.instanceColor) bulbs.instanceColor.needsUpdate = true;
    root.add(bulbs);

    const haloGeo = new THREE.BufferGeometry();
    haloGeo.setAttribute('position', new THREE.BufferAttribute(bulbPositions, 3));
    haloGeo.setAttribute('color', new THREE.BufferAttribute(bulbColorArr, 3));
    const haloMat = new THREE.PointsMaterial({
      size: 0.3,
      map: getGlowTexture(),
      transparent: true,
      opacity: 0.75,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      toneMapped: false
    });
    const halos = new THREE.Points(haloGeo, haloMat);
    halos.renderOrder = 4;
    root.add(halos);
    treeLights = halos;

    // frosted white tip points
    const frostCount = 180;
    const frostPos = new Float32Array(frostCount * 3);
    for (let i = 0; i < frostCount; i++) {
      const y = 1.2 + rnd() * 7;
      const a = rnd() * TAU;
      const r = treeRadiusAt(y) * (0.85 + rnd() * 0.2);
      frostPos[i * 3] = Math.sin(a) * r;
      frostPos[i * 3 + 1] = y;
      frostPos[i * 3 + 2] = Math.cos(a) * r;
    }
    const frostGeo = new THREE.BufferGeometry();
    frostGeo.setAttribute('position', new THREE.BufferAttribute(frostPos, 3));
    const frostMat = new THREE.PointsMaterial({
      size: 0.052,
      color: 0xd7e5dc,
      transparent: true,
      opacity: 0.6,
      map: getGlowTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    });
    root.add(new THREE.Points(frostGeo, frostMat));

    buildAlphaTopper(root, height);
    buildGifts(root);
    buildSnow();

    // gather all scenery under one group so the close-up can clear the stage
    treeScenery = new THREE.Group();
    treeScenery.name = 'tree-scenery';
    while (root.children.length) treeScenery.add(root.children[0]);
    root.add(treeScenery);
  }

  /* ── Sony α tree topper ──────────────────────────────────── */
  const SONY_ALPHA_PATH = 'M461.301,375.606c-54.594,3.9-66.78-22.911-77.504-54.107c-7.76-22.577-16.572-51.019-20.537-64.722 c25.092-38.525,54.172-84.785,97.474-153.167h-81.02c-14.407,22.585-28.633,45.455-42.716,67.828 c-4.021-11.261-9.559-23.384-15.997-33.691c-18.646-28.888-47.969-48.775-91.672-46.099 c-57.772,3.538-101.414,31.223-136.639,66.449c-32.298,32.297-63.803,79.468-67.385,132.898 C20.51,362.522,72.761,403.49,131.998,407.982c46.811,3.553,81.866-8.892,111.372-24.333c20.029-10.479,62.643-45.988,75.395-61.82 c9.467,43.891,33.892,85.949,88.917,85.949c34.102,0,55.702-18.718,67.317-33.188C470.829,374.912,466.298,375.249,461.301,375.606 z M198.448,349.021c-12.637,9.157-28.845,18.883-45.86,21.526c-42.312,6.57-60.968-26.281-58.025-70.193 c2.298-34.285,15.9-66.051,31.82-93.59c16.318-28.228,35.369-53.24,57.091-68.32c7.757-5.387,19.405-11.806,35.563-13.102 c38.884-3.123,53.195,38.948,63.09,74.201c4.62,16.549,7.731,33.377,9.232,42.227C280.269,258.045,245.85,314.676,198.448,349.021z';

  function parseAlphaSubpaths(d) {
    const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g) || [];
    let i = 0, cmd = '';
    let cx = 0, cy = 0, sx = 0, sy = 0;
    let sub = null;
    const subpaths = [];

    function begin(x, y) {
      if (sub && sub.points.length > 1) subpaths.push(sub);
      sub = { points: [new THREE.Vector2(x, y)], closed: false };
      sx = x; sy = y;
    }
    function add(x, y) {
      if (!sub) return;
      const p = new THREE.Vector2(x, y);
      const last = sub.points[sub.points.length - 1];
      if (!last || last.distanceToSquared(p) > 1e-6) sub.points.push(p);
    }
    function cubic(x1, y1, x2, y2, x, y, rel) {
      if (rel) { x1 += cx; y1 += cy; x2 += cx; y2 += cy; x += cx; y += cy; }
      const x0 = cx, y0 = cy;
      const steps = 13;
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        const u = 1 - t;
        const px = u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x;
        const py = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y;
        add(px, py);
      }
      cx = x; cy = y;
    }
    function quad(x1, y1, x, y, rel) {
      if (rel) { x1 += cx; y1 += cy; x += cx; y += cy; }
      const x0 = cx, y0 = cy;
      for (let k = 1; k <= 13; k++) {
        const t = k / 13, u = 1 - t;
        add(u * u * x0 + 2 * u * t * x1 + t * t * x, u * u * y0 + 2 * u * t * y1 + t * t * y);
      }
      cx = x; cy = y;
    }

    while (i < tokens.length) {
      const token = tokens[i];
      if (/^[a-zA-Z]$/.test(token)) {
        cmd = token;
        i++;
        if (cmd.toUpperCase() === 'Z') {
          if (sub) {
            add(sx, sy);
            sub.closed = true;
            if (sub.points.length > 1) subpaths.push(sub);
            sub = null;
          }
          cmd = '';
        }
        continue;
      }
      if (!cmd) { i++; continue; }
      const rel = cmd === cmd.toLowerCase();
      const C = cmd.toUpperCase();
      const n = () => Number(tokens[i++]);
      switch (C) {
        case 'M': {
          let x = n(), y = n();
          if (rel) { x += cx; y += cy; }
          begin(x, y);
          cx = x; cy = y;
          cmd = rel ? 'l' : 'L';
          break;
        }
        case 'L': {
          let x = n(), y = n();
          if (rel) { x += cx; y += cy; }
          add(x, y); cx = x; cy = y;
          break;
        }
        case 'H': {
          let x = n();
          if (rel) x += cx;
          add(x, cy); cx = x;
          break;
        }
        case 'V': {
          let y = n();
          if (rel) y += cy;
          add(cx, y); cy = y;
          break;
        }
        case 'C': {
          cubic(n(), n(), n(), n(), n(), n(), rel);
          break;
        }
        case 'S': {
          const x1 = 2 * cx - cx, y1 = 2 * cy - cy;
          cubic(x1, y1, n(), n(), n(), n(), rel);
          break;
        }
        case 'Q': {
          quad(n(), n(), n(), n(), rel);
          break;
        }
        case 'T': {
          quad(cx, cy, n(), n(), rel);
          break;
        }
        default:
          i++;
          break;
      }
    }
    if (sub && sub.points.length > 1) subpaths.push(sub);
    return subpaths;
  }

  function buildAlphaTopper(root, height) {
    const subpaths = parseAlphaSubpaths(SONY_ALPHA_PATH);
    if (!subpaths.length) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const s of subpaths) {
      for (const p of s.points) {
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      }
    }
    const targetHeight = 0.76;
    const scale = targetHeight / (maxY - minY);
    const cx0 = (minX + maxX) / 2;
    const cy0 = (minY + maxY) / 2;

    const converted = subpaths.map((s) => {
      const pts = [];
      for (const p of s.points) {
        const x = (p.x - cx0) * scale;
        const y = -(p.y - cy0) * scale;
        const last = pts[pts.length - 1];
        if (!last || Math.abs(last.x - x) + Math.abs(last.y - y) > 1e-5) {
          pts.push(new THREE.Vector2(x, y));
        }
      }
      const area = THREE.ShapeUtils.area(pts);
      return { pts, area };
    });
    converted.sort((a, b) => Math.abs(b.area) - Math.abs(a.area));
    const outer = converted[0];
    const shape = new THREE.Shape(outer.pts);
    for (let i = 1; i < converted.length; i++) {
      const h = converted[i];
      if (Math.abs(h.area) < 0.0001) continue;
      if (Math.sign(h.area) === Math.sign(outer.area)) h.pts.reverse();
      shape.holes.push(new THREE.Path(h.pts));
    }

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.013,
      bevelThickness: 0.013,
      steps: 1,
      curveSegments: 1
    });
    geo.center();

    starGroup = new THREE.Group();
    starGroup.position.y = height + 0.45;

    const goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xe8c27e,
      metalness: 0.9,
      roughness: 0.17,
      clearcoat: 0.65,
      clearcoatRoughness: 0.18,
      emissive: 0x5b350d,
      emissiveIntensity: 0.38,
      envMapIntensity: 1.05
    });
    const alphaMesh = new THREE.Mesh(geo, goldMat);
    alphaMesh.castShadow = true;
    alphaMesh.receiveShadow = true;
    starGroup.add(alphaMesh);

    // warm halo behind the glyph
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color: 0xffcf87,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    }));
    glow.scale.set(2.35, 2.35, 1);
    glow.position.z = -0.13;
    starGroup.add(glow);

    const light = new THREE.PointLight(0xffc578, 20, 11, 2);
    light.position.z = 0.2;
    starGroup.add(light);

    // little brass finial/stem mounting the α above the fir
    const stemMat = metalMaterial('#a98a52', 0.3, 0.9);
    const stem = cylinder(0.026, 0.2, stemMat, 12);
    stem.position.y = -0.5;
    starGroup.add(stem);
    const collar = torus(0.075, 0.022, stemMat, 28);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = -0.42;
    starGroup.add(collar);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.17, 0.13, 20), stemMat);
    base.position.y = -0.58;
    starGroup.add(base);

    starGroup.userData = { alpha: alphaMesh, goldMat, glow, light };
    root.add(starGroup);
  }


  function buildGifts(root) {
    const gifts = [
      { x: 2.75, z: 2.15, w: 0.86, h: 0.56, d: 0.7, color: 0x3b1e1b, rot: 0.28 },
      { x: -2.35, z: 2.75, w: 0.68, h: 0.48, d: 0.62, color: 0x1c3528, rot: -0.4 },
      { x: 3.15, z: -1.45, w: 0.58, h: 0.42, d: 0.56, color: 0x7e6c4f, rot: 0.65 }
    ];
    const gold = new THREE.MeshStandardMaterial({ color: 0xb99a5d, metalness: 0.85, roughness: 0.27 });
    const ribbonDark = new THREE.MeshStandardMaterial({ color: 0x5e1f1d, metalness: 0.2, roughness: 0.55 });
    for (const gift of gifts) {
      const g = new THREE.Group();
      const boxMat = new THREE.MeshStandardMaterial({ color: gift.color, roughness: 0.62, metalness: 0.06 });
      const box = new THREE.Mesh(new THREE.BoxGeometry(gift.w, gift.h, gift.d), boxMat);
      box.position.y = gift.h / 2 + 0.21;
      box.castShadow = true;
      box.receiveShadow = true;
      g.add(box);

      const ribbonW = 0.075;
      const rx = new THREE.Mesh(new THREE.BoxGeometry(gift.w + 0.012, ribbonW, gift.d + 0.012), gold);
      rx.position.y = box.position.y + gift.h * 0.24;
      g.add(rx);
      const rz = new THREE.Mesh(new THREE.BoxGeometry(ribbonW, gift.h + 0.015, gift.d + 0.012), gold);
      rz.position.y = box.position.y;
      g.add(rz);

      const bow = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 6, 18), gold);
      bow.position.set(0, box.position.y + gift.h / 2 + 0.01, 0);
      bow.rotation.x = Math.PI / 2;
      bow.castShadow = true;
      g.add(bow);

      const tag = makeTextPlane('NOËL', 0.25, { color: '#cfb887', font: 'serif', fontSize: 96, spacing: 10 });
      tag.position.set(0, box.position.y + 0.03, gift.d / 2 + 0.008);
      g.add(tag);

      g.position.set(gift.x, 0.18, gift.z);
      g.rotation.y = gift.rot;
      root.add(g);
    }
  }

  function buildSnow() {
    const count = 760;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const a = rand() * TAU;
      const r = Math.sqrt(rand()) * 8.2;
      positions[i * 3] = Math.sin(a) * r;
      positions[i * 3 + 1] = rand() * 13;
      positions[i * 3 + 2] = Math.cos(a) * r;
      speeds[i] = rrange(0.16, 0.44);
      phases[i] = rand() * TAU;
      c.setHSL(rrange(0.32, 0.45), rrange(0.08, 0.24), rrange(0.6, 0.82));
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.064,
      map: getGlowTexture(),
      transparent: true,
      opacity: 0.62,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      toneMapped: false
    });
    const points = new THREE.Points(geo, mat);
    points.renderOrder = 3;
    scene.add(points);
    snow = { points, positions, speeds, phases, count, geo };
  }

  function updateSnow(dt, time) {
    if (!snow) return;
    const pos = snow.positions;
    for (let i = 0; i < snow.count; i++) {
      pos[i * 3 + 1] -= snow.speeds[i] * dt;
      pos[i * 3] += Math.sin(time * 0.32 + snow.phases[i]) * 0.0025;
      pos[i * 3 + 2] += Math.cos(time * 0.27 + snow.phases[i]) * 0.0021;
      if (pos[i * 3 + 1] < -0.15) {
        pos[i * 3 + 1] = 12.5 + rand() * 1.5;
        const a = rand() * TAU;
        const r = Math.sqrt(rand()) * 8.2;
        pos[i * 3] = Math.sin(a) * r;
        pos[i * 3 + 2] = Math.cos(a) * r;
      }
    }
    snow.geo.attributes.position.needsUpdate = true;
  }

  function layoutScene() {
    if (!treeGroup) return;
    const narrow = window.innerWidth <= 900;
    treeGroup.position.x = narrow ? 0 : -1.16;
    state.orbit.targetY = narrow ? 4.85 : 4.45;
    if (narrow) {
      state.orbit.dist = Math.min(state.orbit.dist, 20);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     MATERIALS & MODEL MAKING
     ═══════════════════════════════════════════════════════════ */

  const matCache = new Map();
  function shellMaterial(hex) {
    const key = 'shell:' + hex;
    if (matCache.has(key)) return matCache.get(key);
    const col = new THREE.Color(hex);
    const mat = new THREE.MeshPhysicalMaterial({
      color: col,
      metalness: 0.32,
      roughness: 0.43,
      clearcoat: 0.48,
      clearcoatRoughness: 0.36,
      envMapIntensity: 0.55
    });
    matCache.set(key, mat);
    return mat;
  }
  function metalMaterial(hex, rough, metal) {
    const key = `metal:${hex}:${rough}:${metal}`;
    if (matCache.has(key)) return matCache.get(key);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex),
      metalness: metal === undefined ? 0.92 : metal,
      roughness: rough === undefined ? 0.24 : rough
    });
    matCache.set(key, mat);
    return mat;
  }
  let gripTex = null;
  function getGripTexture() {
    if (gripTex) return gripTex;
    gripTex = canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#7f7f7f';
      ctx.fillRect(0, 0, w, h);
      const step = 16;
      ctx.lineWidth = 2;
      for (let y = -step; y < h + step; y += step) {
        for (let x = -step; x < w + step; x += step) {
          ctx.strokeStyle = 'rgba(25,25,25,0.85)';
          ctx.beginPath();
          ctx.moveTo(x, y); ctx.lineTo(x + step, y + step); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + step, y); ctx.lineTo(x, y + step); ctx.stroke();
          ctx.strokeStyle = 'rgba(225,225,225,0.38)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + 1, y + 1); ctx.lineTo(x + step + 1, y + step + 1); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + step + 1, y + 1); ctx.lineTo(x + 1, y + step + 1); ctx.stroke();
          ctx.lineWidth = 2;
        }
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.11)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 4) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    });
    gripTex.wrapS = gripTex.wrapT = THREE.RepeatWrapping;
    gripTex.repeat.set(3.2, 4.4);
    return gripTex;
  }

  function leatherMaterial(hex) {
    const key = 'leather:' + hex;
    if (matCache.has(key)) return matCache.get(key);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex || '#141414'),
      roughness: 0.88,
      metalness: 0.02,
      bumpMap: getGripTexture(),
      bumpScale: 0.022
    });
    matCache.set(key, mat);
    return mat;
  }
  function accentMaterial(hex) {
    const key = 'accent:' + hex;
    if (matCache.has(key)) return matCache.get(key);
    const col = new THREE.Color(hex);
    const mat = new THREE.MeshStandardMaterial({
      color: col,
      metalness: 0.65,
      roughness: 0.27,
      emissive: col,
      emissiveIntensity: 0.15
    });
    matCache.set(key, mat);
    return mat;
  }
  function rubberMaterial(hex) {
    const key = 'rubber:' + (hex || 'x');
    if (matCache.has(key)) return matCache.get(key);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex || '#0b0c0c'),
      roughness: 0.82,
      metalness: 0.08,
      bumpMap: getRibTexture(),
      bumpScale: 0.004
    });
    matCache.set(key, mat);
    return mat;
  }

  const BLACK = new THREE.MeshStandardMaterial({ color: 0x080a09, roughness: 0.62, metalness: 0.35 });
  const DARK = new THREE.MeshStandardMaterial({ color: 0x141715, roughness: 0.5, metalness: 0.5 });
  const SCREEN_MAT = new THREE.MeshStandardMaterial({
    color: 0x091210,
    roughness: 0.18,
    metalness: 0.42,
    emissive: 0x0b201c,
    emissiveIntensity: 0.35
  });
  const GOLD_MAT = metalMaterial('#b79a65', 0.25, 0.95);
  const SILVER_MAT = metalMaterial('#b8b6ad', 0.22, 0.95);

  function prepareShadows(root, opts) {
    const skip = opts || {};
    root.traverse((obj) => {
      if (!obj.isMesh) return;
      if (obj.material && obj.material.transparent) return;
      if (obj.userData && obj.userData.noShadow) return;
      obj.castShadow = skip.cast === false ? false : true;
      obj.receiveShadow = true;
    });
  }

  function addTextLabel(parent, text, width, x, y, z, opts) {
    opts = opts || {};
    const label = makeTextPlane(text, width, opts);
    label.position.set(x, y, z);
    if (opts.rotY) label.rotation.y = opts.rotY;
    if (opts.rotZ) label.rotation.z = opts.rotZ;
    label.userData.noShadow = true;
    parent.add(label);
    return label;
  }

  let glassTexture = null;
  function getGlassTexture() {
    if (glassTexture) return glassTexture;
    glassTexture = canvasTexture(512, 512, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * 0.43, h * 0.39, w * 0.02, w * 0.5, h * 0.5, w * 0.5);
      g.addColorStop(0, 'rgba(2,8,12,0.98)');
      g.addColorStop(0.34, 'rgba(8,27,36,0.98)');
      g.addColorStop(0.64, 'rgba(16,52,62,0.94)');
      g.addColorStop(0.86, 'rgba(78,123,126,0.5)');
      g.addColorStop(1, 'rgba(2,8,10,0.98)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.5, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = 'rgba(145,198,202,0.25)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(w * 0.44, h * 0.42, w * (0.12 + i * 0.085), -2.4, 0.7);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(230,206,154,0.38)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, w * 0.41, -2.2, -1.5);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(210,235,232,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, w * 0.3, 2.9, 3.6);
      ctx.stroke();
    });
    return glassTexture;
  }

  function glassMaterial() {
    return new THREE.MeshPhysicalMaterial({
      color: 0x10252b,
      metalness: 0.72,
      roughness: 0.055,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      emissive: 0x0a1c20,
      emissiveIntensity: 0.45,
      map: getGlassTexture(),
      transparent: false
    });
  }
  const GLASS_MAT = glassMaterial();
  const DARK_GLASS_MAT = new THREE.MeshPhysicalMaterial({
    color: 0x040d12,
    metalness: 0.38,
    roughness: 0.07,
    clearcoat: 1,
    clearcoatRoughness: 0.025,
    emissive: 0x041017,
    emissiveIntensity: 0.4
  });

  let sensorTexCache = new Map();
  function getSensorTexture(accent) {
    const key = accent;
    if (sensorTexCache.has(key)) return sensorTexCache.get(key);
    const tex = canvasTexture(512, 352, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#07120f');
      g.addColorStop(0.46, '#0b221b');
      g.addColorStop(0.72, '#123027');
      g.addColorStop(1, '#050d0b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(173,225,206,0.14)';
      ctx.lineWidth = 1;
      for (let x = 16; x < w; x += 24) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 16; y < h; y += 24) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      const glow = ctx.createRadialGradient(w * 0.5, h * 0.5, 4, w * 0.5, h * 0.5, w * 0.7);
      glow.addColorStop(0, accent + '66');
      glow.addColorStop(0.4, accent + '22');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(200,240,225,0.45)';
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, w - 4, h - 4);
      ctx.fillStyle = 'rgba(206,240,227,0.36)';
      ctx.font = 'italic 30px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('CMOS', w / 2, h / 2 + 9);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 60; i++) {
        const x = (i * 83) % w, y = (i * 47) % h;
        ctx.fillRect(x, y, 2, 2);
      }
    });
    sensorTexCache.set(key, tex);
    return tex;
  }

  function makeSensorGroup(v, item, sensorW, sensorH) {
    const group = new THREE.Group();
    const back = new THREE.Mesh(
      roundedBoxGeometry(sensorW * 1.12 + 0.012, sensorH * 1.12 + 0.012, 0.012, 0.008),
      new THREE.MeshStandardMaterial({ color: 0x050806, roughness: 0.4, metalness: 0.5 })
    );
    group.add(back);

    const tex = getSensorTexture(v.accent);
    const sensor = new THREE.Mesh(
      new THREE.PlaneGeometry(sensorW, sensorH),
      new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })
    );
    sensor.position.z = 0.008;
    group.add(sensor);

    const grid = new THREE.Mesh(
      new THREE.PlaneGeometry(sensorW * 0.92, sensorH * 0.92),
      new THREE.MeshBasicMaterial({
        color: 0x7ad0b9,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false
      })
    );
    grid.position.z = 0.009;
    group.add(grid);

    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x92d6c1),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(sensorW * 1.32, sensorH * 1.32),
      glowMat
    );
    glow.position.z = 0.014;
    group.add(glow);

    const haloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x8ed1bb),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(sensorW * 0.63, sensorW * 0.648, 64),
      haloMat
    );
    halo.position.z = 0.015;
    group.add(halo);

    const sensorLight = new THREE.PointLight(0x9fe0cc, 0, 1.8, 2);
    sensorLight.position.set(0, 0, 0.35);
    group.add(sensorLight);

    // contact pads
    const padMat = metalMaterial('#b99a60', 0.25, 0.95);
    for (let i = 0; i < 4; i++) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(sensorW * 0.1, 0.006, 0.006), padMat);
      pad.position.set(-sensorW * 0.36 + i * sensorW * 0.24, -sensorH * 0.76, 0.02);
      group.add(pad);
    }

    group.userData = { sensor, grid, glow, glowMat, halo, haloMat, sensorLight };
    return group;
  }

  function buildLensBarrel(opts) {
    // A lens assembly with its optical axis on +Z.
    const group = new THREE.Group();
    const r = opts.radius;
    const len = opts.length;
    const shell = shellMaterial(opts.shell);
    const accent = accentMaterial(opts.accent);
    const ribbed = rubberMaterial(opts.rubber || '#0a0b0b');
    const metal = opts.silver ? metalMaterial('#c5c2b6', 0.3, 0.9) : metalMaterial('#1d201e', 0.34, 0.72);
    const bayonet = metalMaterial(opts.mountMetal || (opts.silver ? '#c5c2b6' : '#9a988f'), 0.24, 0.93);
    const innerMetal = metalMaterial('#11140f', 0.38, 0.6);
    const trim = opts.darkTrim ? metalMaterial('#252822', 0.42, 0.55) : metal;

    // bayonet mount: silver / dark metal outer ring, black throat, index dot and contacts
    const mount = cylinder(r * 1.08, 0.085, bayonet, 36);
    mount.rotation.x = Math.PI / 2;
    mount.position.z = 0.035;
    group.add(mount);
    const throat = cylinder(r * 0.9, 0.02, innerMetal, 32);
    throat.rotation.x = Math.PI / 2;
    throat.position.z = 0.083;
    group.add(throat);
    const mountRing = torus(r * 1.015, 0.017, bayonet, 44);
    mountRing.position.z = 0.085;
    group.add(mountRing);
    const mountStep = torus(r * 0.94, 0.008, innerMetal, 42);
    mountStep.position.z = 0.091;
    group.add(mountStep);
    const mountDot = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.008, 0.008), accent);
    mountDot.position.set(0, r * 1.075, 0.09);
    group.add(mountDot);
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * TAU + Math.PI / 6;
      const tab = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.014, 0.013), bayonet);
      tab.position.set(Math.sin(a) * r * 0.96, Math.cos(a) * r * 0.96, 0.092);
      tab.rotation.z = -a;
      group.add(tab);
    }
    for (let i = 0; i < 5; i++) {
      const a = -0.85 + i * 0.42;
      const contact = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.006, 0.005), GOLD_MAT);
      contact.position.set(Math.sin(a) * r * 0.75, Math.cos(a) * r * 0.75, 0.094);
      contact.rotation.z = -a;
      group.add(contact);
    }

    const barrel = cylinder(r, len, shell, 36);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = len / 2 + 0.11;
    group.add(barrel);

    const rearStep = cylinder(r * 1.015, 0.11, shell, 36);
    rearStep.rotation.x = Math.PI / 2;
    rearStep.position.z = 0.14;
    group.add(rearStep);

    const taper = cylinder(r * 0.95, 0.12, opts.darkTrim ? trim : metal, 32);
    taper.rotation.x = Math.PI / 2;
    taper.position.z = len + 0.07;
    group.add(taper);

    // focus ring
    const focus = cylinder(r * 1.09, len * (opts.focusWidth || 0.2), ribbed, 40);
    focus.rotation.x = Math.PI / 2;
    focus.position.z = len * 0.42 + 0.11;
    focus.userData.noShadow = true;
    group.add(focus);

    const focusEdge = torus(r * 1.09, 0.009, trim, 44);
    focusEdge.position.z = len * 0.42 + 0.11 + len * 0.1;
    group.add(focusEdge);

    // pronounced axial ribbing on the focus ring
    const focusStart = len * 0.42 + 0.11 - (len * (opts.focusWidth || 0.2)) / 2;
    const focusSpan = len * (opts.focusWidth || 0.2);
    const ridgeMat = metalMaterial('#090b09', 0.62, 0.15);
    for (let i = 1; i < 11; i++) {
      const ridge = torus(r * 1.102, 0.0038, ridgeMat, 40);
      ridge.position.z = focusStart + (focusSpan * i) / 11;
      ridge.userData.noShadow = true;
      group.add(ridge);
    }

    if (opts.zoomRing) {
      const zoom = cylinder(r * 1.075, 0.12, ribbed, 40);
      zoom.rotation.x = Math.PI / 2;
      zoom.position.z = len * 0.69 + 0.11;
      group.add(zoom);
      const zoomRing = torus(r * 1.08, 0.012, accent, 44);
      zoomRing.position.z = len * 0.62 + 0.11;
      group.add(zoomRing);
      const zoomEdge = torus(r * 1.075, 0.006, trim, 44);
      zoomEdge.position.z = len * 0.76 + 0.11;
      group.add(zoomEdge);
    }

    if (opts.apertureRing) {
      const ap = cylinder(r * 1.035, 0.06, ribbed, 40);
      ap.rotation.x = Math.PI / 2;
      ap.position.z = 0.23;
      group.add(ap);
      const apRing = torus(r * 1.04, 0.007, bayonet, 42);
      apRing.position.z = 0.2;
      group.add(apRing);
    }

    // brand / aperture ring near the front (or near the mount for Sony G / XCD)
    const accentZ = opts.accentPlacement === 'rear' ? 0.24 : len * 0.86 + 0.11;
    const accentRing = torus(r * 1.012, opts.bigRing ? 0.02 : 0.013, accent, 48);
    accentRing.position.z = accentZ;
    group.add(accentRing);
    const trimRing = torus(r * 1.012, 0.006, trim, 48);
    trimRing.position.z = accentZ + 0.03;
    group.add(trimRing);

    // front bezel
    const bezel = cylinder(r * 1.025, 0.09, opts.darkTrim ? trim : metal, 36);
    bezel.rotation.x = Math.PI / 2;
    bezel.position.z = len + 0.13;
    group.add(bezel);

    // glass elements
    const glassZ = opts.hood ? len + 0.32 : len + 0.176;
    const glass = new THREE.Mesh(new THREE.CircleGeometry(r * 0.88, 48), DARK_GLASS_MAT);
    glass.position.z = glassZ;
    group.add(glass);
    const glassSheen = new THREE.Mesh(
      new THREE.CircleGeometry(r * 0.8, 40),
      new THREE.MeshBasicMaterial({
        map: getGlassTexture(),
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false
      })
    );
    glassSheen.position.z = glassZ + 0.002;
    glassSheen.userData.noShadow = true;
    group.add(glassSheen);
    const glassRim = torus(r * 0.88, 0.006, trim, 48);
    glassRim.position.z = glassZ + 0.004;
    group.add(glassRim);
    const innerGlass = new THREE.Mesh(
      new THREE.CircleGeometry(r * 0.5, 40),
      new THREE.MeshPhysicalMaterial({
        color: 0x0a1a20, metalness: 0.7, roughness: 0.09,
        clearcoat: 1, clearcoatRoughness: 0.03, emissive: 0x04141a, emissiveIntensity: 0.45
      })
    );
    innerGlass.position.z = glassZ + 0.006;
    group.add(innerGlass);

    // distance window
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(r * 0.55, 0.06),
      new THREE.MeshBasicMaterial({ color: 0x0b100d, transparent: true, opacity: 0.94 })
    );
    win.position.set(0, r * 1.01, len * 0.73 + 0.11);
    group.add(win);
    addTextLabel(group, opts.focusLabel || '∞   5m', r * 0.5, 0, r * 1.093, len * 0.73 + 0.112, {
      color: opts.lightBarrel ? '#34382f' : '#b9d9c9', fontSize: 60, font: 'monospace', ratio: 0.3, fit: false
    });

    if (opts.hood) {
      const hood = new THREE.Mesh(
        new THREE.CylinderGeometry(r * 1.29, r * 1.17, 0.24, 40, 1, true),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(opts.shell), roughness: 0.64, metalness: 0.24, side: THREE.DoubleSide })
      );
      hood.rotation.x = Math.PI / 2;
      hood.position.z = len + 0.26;
      hood.userData.noShadow = true;
      group.add(hood);
      const hoodInner = new THREE.Mesh(
        new THREE.CylinderGeometry(r * 1.21, r * 1.11, 0.23, 40, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x090e0b, roughness: 0.94, metalness: 0.02, side: THREE.BackSide })
      );
      hoodInner.rotation.x = Math.PI / 2;
      hoodInner.position.z = len + 0.255;
      hoodInner.userData.noShadow = true;
      group.add(hoodInner);
      const hoodLip = torus(r * 1.28, 0.011, opts.hoodAccent === false ? trim : accent, 52);
      hoodLip.position.z = len + 0.37;
      group.add(hoodLip);
    }

    if (opts.tripod) {
      const collarMat = opts.lightBarrel ? shellMaterial(opts.shell) : metal;
      const collar = torus(r * 1.21, 0.034, collarMat, 44);
      collar.position.z = len * 0.48 + 0.11;
      collar.rotation.z = 0.02;
      group.add(collar);
      const collarBand = torus(r * 1.21, 0.008, bayonet, 44);
      collarBand.position.z = len * 0.48 + 0.14;
      group.add(collarBand);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(r * 1.05, 0.075, 0.2), innerMetal);
      foot.position.set(0, -r * 1.43, len * 0.48 + 0.11);
      foot.rotation.x = 0.03;
      foot.castShadow = true;
      group.add(foot);
      const footShoe = new THREE.Mesh(new THREE.BoxGeometry(r * 0.52, 0.025, 0.22), rubberMaterial('#0c0d0c'));
      footShoe.position.set(0, -r * 1.49, len * 0.48 + 0.11);
      group.add(footShoe);
    }

    // small engraved barrel text, faces +X
    if (opts.label) {
      const side = addTextLabel(group, opts.label, Math.min(len * 0.42, 0.55), r * 1.014, r * 0.42, len * 0.76 + 0.11, {
        color: opts.lightBarrel ? '#4c4f46' : '#cfc9ba',
        fontSize: 54,
        weight: 500,
        spacing: 1,
        ratio: 0.2,
        fit: false
      });
      side.rotation.y = Math.PI / 2;
    }
    if (opts.brandMark) {
      const side2 = addTextLabel(group, opts.brandMark, r * 1.26, r * 1.014, -r * 0.15, len * 0.84 + 0.11, {
        color: opts.lightBarrel ? '#5b5d53' : '#b9ab89',
        fontSize: 64,
        weight: 600,
        spacing: 5,
        ratio: 0.2,
        fit: false
      });
      side2.rotation.y = Math.PI / 2;
    }

    // small lens-class plaque, e.g. G / L / S PF / XCD / H
    if (opts.badgeText) {
      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(r * 0.5, r * 0.24),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(opts.badgeColor || opts.accent),
          transparent: true,
          opacity: 0.96,
          toneMapped: false
        })
      );
      plaque.position.set(r * 1.016, r * 0.55, len * 0.89 + 0.11);
      plaque.rotation.y = Math.PI / 2;
      group.add(plaque);
      const badge = addTextLabel(group, opts.badgeText, r * 0.46, r * 1.02, r * 0.55, len * 0.89 + 0.112, {
        color: '#fff8e8', fontSize: 62, weight: 700, ratio: 0.5,
        font: 'Georgia, "Times New Roman", serif', fit: false
      });
      badge.rotation.y = Math.PI / 2;
    }

    // image-circle annotation rings, invisible until focus
    const imageCircleMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(opts.accent),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false
    });
    const imageCircle = new THREE.Mesh(new THREE.RingGeometry(r * 1.22, r * 1.235, 64), imageCircleMat);
    imageCircle.position.z = glassZ + 0.018;
    imageCircle.userData.noShadow = true;
    imageCircle.visible = false;
    group.add(imageCircle);
    const imageCircle2 = new THREE.Mesh(new THREE.RingGeometry(r * 1.42, r * 1.428, 64), imageCircleMat);
    imageCircle2.position.z = glassZ + 0.019;
    imageCircle2.userData.noShadow = true;
    imageCircle2.visible = false;
    group.add(imageCircle2);

    group.userData = { focus, glass, innerGlass, imageCircleMat, imageCircle, imageCircle2, mountRing, barrel };
    return group;
  }

  /* ═══════════════════════════════════════════════════════════
     CAMERA DETAIL SYSTEM
     Proportions and details cross-checked against official images.
     ═══════════════════════════════════════════════════════════ */

  let screenTex = null;
  function getScreenTexture() {
    if (screenTex) return screenTex;
    screenTex = canvasTexture(512, 340, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#07110f');
      g.addColorStop(0.5, '#0c1a16');
      g.addColorStop(1, '#050b09');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(151,198,178,0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(207,230,216,0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.18, h * 0.2, w * 0.64, h * 0.58);
      ctx.strokeStyle = 'rgba(226,238,225,0.42)';
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.2); ctx.lineTo(w * 0.5, h * 0.78);
      ctx.moveTo(w * 0.18, h * 0.49); ctx.lineTo(w * 0.82, h * 0.49);
      ctx.stroke();
      ctx.fillStyle = 'rgba(208,229,214,0.6)';
      ctx.font = '22px monospace';
      ctx.fillText('1/250   F4.0   ISO 200', w * 0.2, h * 0.9);
      ctx.fillStyle = 'rgba(199,172,122,0.8)';
      ctx.fillText('AF-C', w * 0.78, h * 0.12);
    });
    return screenTex;
  }

  function matteBodyMaterial(hex) {
    const key = 'matte-body:' + hex;
    if (matCache.has(key)) return matCache.get(key);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex), roughness: 0.58, metalness: 0.18, envMapIntensity: 0.25
    });
    matCache.set(key, mat);
    return mat;
  }

  function createPrismGeometry(w, h, d) {    const shape = new THREE.Shape();
    shape.moveTo(-d / 2, 0);
    shape.lineTo(d / 2, 0);
    shape.lineTo(d * 0.23, h);
    shape.lineTo(-d * 0.17, h);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: w, bevelEnabled: true, bevelSegments: 3, steps: 1,
      bevelSize: 0.014, bevelThickness: 0.014, curveSegments: 4
    });
    geo.rotateY(-Math.PI / 2);
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }

  function addTopDial(parent, x, y, z, r, h, capHex, opts) {
    opts = opts || {};
    const baseMat = metalMaterial('#1c1f1d', 0.32, 0.8);
    const base = cylinder(r, h, baseMat, 28);
    base.position.set(x, y, z);
    parent.add(base);
    const cap = cylinder(r * 0.68, 0.014, accentMaterial(capHex || '#6f7068'), 24);
    cap.position.set(x, y + h / 2 + 0.007, z);
    parent.add(cap);
    const index = new THREE.Mesh(
      new THREE.BoxGeometry(r * 0.7, 0.004, 0.008),
      new THREE.MeshBasicMaterial({ color: opts.tick || 0xdad4c4, toneMapped: false })
    );
    index.position.set(x, y + h / 2 + 0.015, z);
    index.rotation.y = opts.rot || 0;
    parent.add(index);
    return base;
  }

  function addStrapLug(parent, x, y, z, mat) {
    const metal = mat || metalMaterial('#b9b6ab', 0.22, 0.92);
    const loop = torus(0.022, 0.005, metal, 18);
    loop.rotation.y = Math.PI / 2;
    loop.position.set(x, y, z);
    parent.add(loop);
    const post = cylinder(0.009, 0.04, metal, 8);
    post.rotation.z = Math.PI / 2;
    post.position.set(x - Math.sign(x) * 0.03, y, z);
    parent.add(post);
  }

  function addFrontButton(parent, x, y, z, radius, mat, shape) {
    let btn;
    if (shape === 'round') {
      btn = cylinder(radius, 0.015, mat, 18);
      btn.rotation.x = Math.PI / 2;
    } else {
      btn = new THREE.Mesh(roundedBoxGeometry(radius * 2.3, radius * 1.5, 0.016, 0.008), mat);
    }
    btn.position.set(x, y, z);
    parent.add(btn);
    return btn;
  }

  function addTopLcd(parent, x, y, z, w, d) {
    const frame = new THREE.Mesh(roundedBoxGeometry(w, 0.018, d, 0.008), metalMaterial('#181b19', 0.5, 0.35));
    frame.position.set(x, y, z);
    parent.add(frame);
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.78, d * 0.7),
      new THREE.MeshBasicMaterial({ map: getScreenTexture(), toneMapped: false })
    );
    glass.rotation.x = -Math.PI / 2;
    glass.position.set(x, y + 0.011, z);
    glass.userData.noShadow = true;
    parent.add(glass);
  }

  function addRearScreen(parent, W, H, D, v, frontZ) {
    const style = v.screenStyle || 'tilt';
    const dark = metalMaterial('#181b18', 0.42, 0.5);
    const screenMat = new THREE.MeshBasicMaterial({ map: getScreenTexture(), toneMapped: false });

    if (style === 'flip') {
      // ZV-E1 style vari-angle screen, folded out on the camera's left side
      const armX = W / 2 + 0.02;
      const arm = new THREE.Mesh(roundedBoxGeometry(0.028, H * 0.14, 0.022, 0.006), dark);
      arm.position.set(armX, 0.02, 0.01);
      parent.add(arm);
      const hinge = new THREE.Mesh(roundedBoxGeometry(0.025, H * 0.42, 0.022, 0.006), dark);
      hinge.position.set(armX + 0.006, 0.01, -0.005);
      parent.add(hinge);
      const panel = new THREE.Group();
      const back = new THREE.Mesh(roundedBoxGeometry(W * 0.52, H * 0.66, 0.018, 0.012), dark);
      panel.add(back);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.46, H * 0.57), screenMat);
      screen.position.z = 0.012;
      screen.userData.noShadow = true;
      panel.add(screen);
      panel.position.set(armX + 0.105, 0.015, 0.075);
      panel.rotation.y = 0.88;
      parent.add(panel);
      return;
    }

    const large = style === 'large';
    const sw = large ? W * 0.72 : W * 0.63;
    const sh = large ? H * 0.64 : H * 0.54;
    const frame = new THREE.Mesh(roundedBoxGeometry(sw + 0.025, sh + 0.025, 0.012, 0.012), dark);
    frame.position.set(-W * 0.07, -H * 0.045, -D / 2 - 0.012);
    parent.add(frame);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), screenMat);
    screen.rotation.y = Math.PI;
    screen.position.set(-W * 0.07, -H * 0.045, -D / 2 - 0.019);
    screen.userData.noShadow = true;
    parent.add(screen);

    // rear command buttons
    const rearBtn = metalMaterial('#262925', 0.42, 0.4);
    addFrontButton(parent, W * 0.29, H * 0.25, -D / 2 - 0.015, 0.012, rearBtn, 'round').rotation.y = Math.PI;
    addFrontButton(parent, W * 0.34, H * 0.18, -D / 2 - 0.015, 0.012, rearBtn, 'round').rotation.y = Math.PI;
  }

  function buildCameraModel(item) {
    const v = VISUAL[item.id];
    const style = v.style || 'sony';
    const S = {
      sony: style === 'sony',
      vlog: style === 'sony-vlog',
      nikon: style === 'nikon',
      nikonDslr: style === 'nikon-dslr',
      canonRf: style === 'canon-rf',
      canonDslr: style === 'canon-dslr',
      hasselX: style === 'hasselblad-x',
      hassel907: style === 'hasselblad-907',
      fuji: style === 'fuji'
    };
    const raw = new THREE.Group();
    const W = v.bodyW, H = v.bodyH, D = v.bodyD;
    const frontZ = D / 2 + 0.014;
    const shell = shellMaterial(v.shell);
    const accent = accentMaterial(v.accent);
    const gripMat = leatherMaterial(v.gripColor || (v.white ? '#d9d4c7' : v.silver ? '#6d6a60' : '#171817'));
    const darkMetal = metalMaterial('#202320', 0.4, 0.58);
    const blackMat = metalMaterial('#0d100e', 0.5, 0.4);
    const chrome = metalMaterial(v.topPlate === 'silver' ? '#c2beb1' : '#5a5a53', 0.27, 0.9);
    const textColor = v.white || v.silver ? '#1b1d1a' : '#e4ddce';
    const logoFont = '"Georgia", "Times New Roman", serif';
    const sansFont = '"Segoe UI", Arial, sans-serif';
    const isIntegrated = !!v.integrated;
    const prism = v.prism || (v.dslr ? 'dslr' : 'evf');
    const isDslr = prism === 'dslr';

    /* body */
    const bodyRadius = S.hasselX || S.hassel907 ? 0.032 : 0.055;
    const body = new THREE.Mesh(roundedBoxGeometry(W, H, D, bodyRadius), shell);
    body.castShadow = true;
    body.receiveShadow = true;
    raw.add(body);

    // bottom plate / seam
    const basePlate = new THREE.Mesh(roundedBoxGeometry(W * 0.99, 0.025, D * 0.99, 0.01), darkMetal);
    basePlate.position.y = -H / 2 + 0.01;
    raw.add(basePlate);

    // front leatherette inset around the mount
    if (v.frontTexture) {
      const panel = new THREE.Mesh(roundedBoxGeometry(W * 0.9, H * 0.66, 0.016, 0.025), gripMat);
      panel.position.set(0, -H * 0.075, frontZ - 0.012);
      panel.userData.noShadow = true;
      raw.add(panel);
    }

    // top plate
    const plateMat = v.topPlate === 'silver' ? chrome : darkMetal;
    const topPlate = new THREE.Mesh(roundedBoxGeometry(W * 1.004, 0.038, D * 1.002, 0.012), plateMat);
    topPlate.position.y = H / 2 - 0.002;
    topPlate.castShadow = true;
    raw.add(topPlate);
    if (v.topPlate === 'silver') {
      const seam = new THREE.Mesh(new THREE.BoxGeometry(W * 1.006, 0.006, D * 1.003), blackMat);
      seam.position.y = H / 2 - 0.022;
      raw.add(seam);
    }

    /* grip */
    let gripW, gripH, gripD, gripX, gripY, gripZ;
    if (isIntegrated) {
      gripW = W * 0.24; gripH = H * 0.98; gripD = D * 1.03;
      gripX = -W * 0.335; gripY = -H * 0.01; gripZ = D * 0.07;
    } else if (S.vlog) {
      gripW = W * 0.19; gripH = H * 0.76; gripD = D * 0.9;
      gripX = -W * 0.36; gripY = -H * 0.005; gripZ = D * 0.08;
    } else if (S.hasselX || S.hassel907) {
      gripW = W * 0.19; gripH = H * 0.7; gripD = D * 0.9;
      gripX = -W * 0.37; gripY = -H * 0.02; gripZ = D * 0.12;
    } else {
      gripW = W * 0.19; gripH = H * 0.83; gripD = D * 0.94;
      gripX = -W * 0.36; gripY = -H * 0.02; gripZ = D * 0.13;
    }
    if (!S.hassel907) {
      const grip = new THREE.Mesh(roundedBoxGeometry(gripW, gripH, gripD, 0.035), gripMat);
      grip.position.set(gripX, gripY, gripZ);
      grip.castShadow = true;
      raw.add(grip);

      const gripTop = new THREE.Mesh(roundedBoxGeometry(gripW * 0.9, 0.035, gripD * 0.82, 0.01), darkMetal);
      gripTop.position.set(gripX, gripY + gripH / 2 + 0.004, gripZ);
      raw.add(gripTop);

      const gripEdge = new THREE.Mesh(new THREE.BoxGeometry(0.006, gripH * 0.88, 0.006), darkMetal);
      gripEdge.position.set(gripX + gripW * 0.53, gripY, gripZ + gripD * 0.47);
      raw.add(gripEdge);
    }

    /* prism / viewfinder hump */
    let humpH = 0, humpW = 0, humpD = 0, humpFrontZ = 0;
    let topSurfaceY = H / 2 + 0.019;
    if (prism === 'evf') {
      humpH = H * (isIntegrated ? 0.2 : 0.18);
      humpW = W * (isIntegrated ? 0.4 : 0.35);
      humpD = D * 0.65;
      const humpX = -W * 0.005;
      const humpY = H / 2 + humpH / 2 - 0.016;
      const humpZ = -D * 0.055;
      const hump = new THREE.Mesh(roundedBoxGeometry(humpW, humpH, humpD, 0.03), shell);
      hump.position.set(humpX, humpY, humpZ);
      hump.castShadow = true;
      raw.add(hump);
      humpFrontZ = humpZ + humpD / 2;
      topSurfaceY = humpY + humpH / 2;
      const collar = new THREE.Mesh(roundedBoxGeometry(humpW * 0.92, 0.03, humpD * 0.8, 0.01), darkMetal);
      collar.position.set(humpX, humpY + humpH / 2 - 0.008, humpZ);
      raw.add(collar);
      const eyecup = new THREE.Mesh(roundedBoxGeometry(humpW * 0.52, humpH * 0.46, 0.06, 0.013), rubberMaterial('#090b09'));
      eyecup.position.set(humpX, humpY + humpH * 0.12, -D * 0.5 - 0.032);
      raw.add(eyecup);
    } else if (prism === 'dslr') {
      humpH = H * 0.26;
      humpW = W * 0.34;
      humpD = D * 0.72;
      const prismMesh = new THREE.Mesh(createPrismGeometry(humpW, humpH, humpD), matteBodyMaterial(v.shell));
      prismMesh.position.set(-W * 0.005, H / 2 + humpH / 2 - 0.025, -D * 0.04);
      prismMesh.castShadow = true;
      raw.add(prismMesh);
      humpFrontZ = -D * 0.04 - humpD * 0.5;
      topSurfaceY = H / 2 + humpH - 0.025;
      const prismTop = new THREE.Mesh(roundedBoxGeometry(humpW * 0.9, 0.03, humpD * 0.7, 0.008), darkMetal);
      prismTop.position.set(-W * 0.005, H / 2 + humpH - 0.02, -D * 0.08);
      raw.add(prismTop);
      const eyecup = new THREE.Mesh(roundedBoxGeometry(humpW * 0.55, humpH * 0.35, 0.06, 0.012), rubberMaterial('#090b09'));
      eyecup.position.set(-W * 0.005, H / 2 + humpH * 0.48, -D * 0.5 - 0.035);
      raw.add(eyecup);
    } else {
      // flat top: low housing plate, used by Hasselblad and ZV-E1
      const flat = new THREE.Mesh(roundedBoxGeometry(W * 0.92, 0.05, D * 0.72, 0.02), v.topPlate === 'silver' ? chrome : shell);
      flat.position.set(0, H / 2 + 0.01, -D * 0.02);
      raw.add(flat);
      topSurfaceY = H / 2 + 0.036;
    }

    /* top controls */
    const topDialY = H / 2 + 0.035;
    if (S.hasselX || S.hassel907) {
      addTopDial(raw, W * 0.27, topDialY, D * 0.03, 0.048, 0.032, '#c8a45d', { tick: 0x3a3529, rot: 0.3 });
      const shutter = cylinder(0.027, 0.022, accentMaterial('#e08a2e'), 22);
      shutter.position.set(-W * 0.3, topDialY + 0.01, D * 0.12);
      raw.add(shutter);
      const shutterBase = cylinder(0.038, 0.01, chrome, 22);
      shutterBase.position.set(-W * 0.3, topDialY - 0.005, D * 0.12);
      raw.add(shutterBase);
      addTopLcd(raw, -W * 0.02, H / 2 + 0.012, -D * 0.13, W * 0.3, D * 0.13);
    } else if (S.vlog) {
      addTopDial(raw, W * 0.25, topDialY, D * 0.02, 0.038, 0.025, '#4e514c');
      const shutter = cylinder(0.024, 0.02, metalMaterial('#b9b4a7', 0.25, 0.9), 20);
      shutter.position.set(-W * 0.25, topDialY + 0.008, D * 0.13);
      raw.add(shutter);
      // movie button
      const movie = cylinder(0.022, 0.016, accent, 18);
      movie.position.set(-W * 0.02, topDialY + 0.005, -D * 0.13);
      raw.add(movie);
    } else {
      // Sony / Nikon / Canon / Fuji top plate
      const mainDialX = W * (isDslr ? 0.31 : 0.27);
      addTopDial(raw, mainDialX, topDialY, D * 0.02, isIntegrated ? 0.05 : 0.043, 0.03, S.canonRf || S.canonDslr ? '#5a5d56' : '#c7ac7a');
      if (S.fuji) {
        addTopDial(raw, +W * 0.16, topDialY, -D * 0.06, 0.042, 0.028, '#d74945');
      } else if (S.nikon || S.nikonDslr) {
        addTopDial(raw, +W * 0.18, topDialY, -D * 0.03, 0.038, 0.026, '#c7ac7a');
      }
      const shutter = cylinder(0.025, 0.022, metalMaterial(S.canonDslr ? '#b8b5a9' : '#c7b07c', 0.26, 0.9), 20);
      shutter.position.set(-W * (isIntegrated ? 0.31 : 0.28), topDialY + 0.009, D * 0.13);
      raw.add(shutter);
    if (isDslr || isIntegrated || v.id === 'nikon-z8' || S.fuji) {
      addTopLcd(raw, -W * 0.08, H / 2 + 0.012, -D * 0.14, W * 0.3, D * 0.13);
    }
    }

    // hot shoe
    const shoeY = topSurfaceY + 0.018;
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(W * 0.12, 0.02, D * 0.16), darkMetal);
    shoe.position.set(0, shoeY, prism === 'flat' ? -D * 0.03 : -D * 0.08);
    raw.add(shoe);
    const shoeRail = new THREE.Mesh(new THREE.BoxGeometry(W * 0.08, 0.006, D * 0.12), chrome);
    shoeRail.position.set(0, shoeY + 0.014, prism === 'flat' ? -D * 0.03 : -D * 0.08);
    raw.add(shoeRail);

    /* rear screen */
    addRearScreen(raw, W, H, D, v, frontZ);

    /* strap lugs */
    addStrapLug(raw, -W / 2 - 0.005, H * 0.27, -D * 0.06);
    addStrapLug(raw, W / 2 + 0.005, H * 0.27, -D * 0.06);

    /* front buttons & AF lamp */
    const btnMat = metalMaterial('#242724', 0.4, 0.45);
    const btnZ = frontZ + 0.007;
    if (S.canonRf || S.canonDslr) {
      addFrontButton(raw, -W * 0.19, H * 0.12, btnZ, 0.016, btnMat, 'round');
      addFrontButton(raw, -W * 0.15, H * 0.05, btnZ, 0.016, btnMat, 'round');
      addFrontButton(raw, -W * 0.2, -H * 0.15, btnZ, 0.018, btnMat, 'round');
      addFrontButton(raw, W * 0.22, -H * 0.2, btnZ, 0.018, btnMat, 'round');
    } else if (S.nikon || S.nikonDslr) {
      addFrontButton(raw, -W * 0.18, H * 0.07, btnZ, 0.016, btnMat, 'round');
      addFrontButton(raw, -W * 0.18, -H * 0.08, btnZ, 0.016, btnMat, 'round');
      addFrontButton(raw, W * 0.23, -H * 0.2, btnZ, 0.014, btnMat, 'round');
    } else if (S.sony || S.vlog) {
      addFrontButton(raw, -W * 0.18, H * 0.08, btnZ, 0.013, btnMat, 'round');
      if (!S.vlog) addFrontButton(raw, W * 0.23, -H * 0.23, btnZ, 0.015, btnMat, 'round');
    } else {
      addFrontButton(raw, W * 0.27, H * 0.02, btnZ, 0.014, btnMat, 'round');
    }
    const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.008, 10), new THREE.MeshBasicMaterial({
      color: 0xb75b3b, transparent: true, opacity: 0.7, toneMapped: false
    }));
    lamp.position.set(-W * 0.18, H * 0.26, frontZ + 0.006);
    raw.add(lamp);

    /* brand wordmarks */
    const labelZ = frontZ + 0.007;
    if (S.canonRf || S.canonDslr) {
      const onHump = prism === 'evf';
      addTextLabel(raw, 'Canon', W * 0.34, 0, onHump ? H / 2 + humpH * 0.4 : H * 0.41, onHump ? humpFrontZ + 0.038 : labelZ, {
        color: textColor, fontSize: 68, weight: 700, spacing: 0, ratio: 0.2, font: logoFont
      });
      addTextLabel(raw, v.logo, W * 0.23, W * 0.26, H * 0.285, labelZ, {
        color: textColor, fontSize: 54, weight: 500, ratio: 0.19, font: sansFont
      });
      // red accent line on the grip shoulder, faithful to EOS DSLR design language
      if (S.canonDslr) {
        const redLine = new THREE.Mesh(new THREE.BoxGeometry(W * 0.14, 0.006, 0.006), accent);
        redLine.position.set(gripX + gripW * 0.15, H * 0.36, gripZ + gripD / 2 + 0.004);
        raw.add(redLine);
      }
    } else if (S.nikon || S.nikonDslr) {
      const onHump = prism === 'evf';
      addTextLabel(raw, 'Nikon', W * 0.27, 0, onHump ? H / 2 + humpH * 0.4 : H * 0.41, onHump ? humpFrontZ + 0.038 : labelZ, {
        color: textColor, fontSize: 70, weight: 700, ratio: 0.2, font: logoFont
      });
      addTextLabel(raw, v.logo, W * 0.16, W * 0.28, H * 0.285, labelZ, {
        color: textColor, fontSize: 62, weight: 700, ratio: 0.2, font: sansFont
      });
      if (S.nikon) {
        addTextLabel(raw, 'NIKKOR', W * 0.15, W * 0.02, v.mountR + 0.025, labelZ, {
          color: '#d4ccbc', fontSize: 48, weight: 500, spacing: 2, ratio: 0.16, font: sansFont
        });
      }
      const redLine = new THREE.Mesh(new THREE.BoxGeometry(W * 0.11, 0.007, 0.005), accentMaterial('#b74438'));
      redLine.position.set(gripX + gripW * 0.12, H * 0.38, gripZ + gripD / 2 + 0.004);
      raw.add(redLine);
    } else if (S.hasselX || S.hassel907) {
      addTextLabel(raw, 'HASSELBLAD', W * 0.46, -W * 0.02, Math.min(H / 2 - 0.012, v.mountR + 0.04), labelZ + 0.002, {
        color: v.topPlate === 'silver' ? '#34342e' : '#d5cbb8',
        fontSize: 54, weight: 500, spacing: 7, ratio: 0.11, font: logoFont
      });
      addTextLabel(raw, v.logo, W * 0.15, W * 0.31, H * 0.4, labelZ, {
        color: v.topPlate === 'silver' ? '#2d2e29' : '#cfc6b5',
        fontSize: 50, weight: 500, ratio: 0.16, font: sansFont
      });
    } else if (S.fuji) {
      addTextLabel(raw, 'FUJIFILM', W * 0.27, 0, H / 2 + humpH * 0.38, humpFrontZ + 0.038, {
        color: textColor, fontSize: 58, weight: 600, spacing: 2, ratio: 0.2, font: sansFont
      });
      addTextLabel(raw, v.logo, W * 0.2, W * 0.3, -H * 0.3, labelZ, {
        color: textColor, fontSize: 58, weight: 600, ratio: 0.2, font: logoFont
      });
      const gfx = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.075, W * 0.055), accent);
      gfx.position.set(W * 0.34, -H * 0.2, frontZ + 0.003);
      raw.add(gfx);
      addTextLabel(raw, 'GFX', W * 0.06, W * 0.34, -H * 0.2, frontZ + 0.005, {
        color: '#fff7ea', fontSize: 56, weight: 700, ratio: 0.75
      });
    } else if (S.sony || S.vlog) {
      if (prism === 'flat') {
        addTextLabel(raw, 'SONY', W * 0.18, -W * 0.15, H * 0.405, labelZ, {
          color: textColor, fontSize: 66, weight: 700, spacing: 4, ratio: 0.2, font: sansFont
        });
      } else {
        addTextLabel(raw, 'SONY', W * 0.22, 0, H / 2 + humpH * 0.44, humpFrontZ + 0.038, {
          color: textColor, fontSize: 62, weight: 700, spacing: 4, ratio: 0.2, font: sansFont
        });
      }
      addTextLabel(raw, v.logo, W * 0.23, W * 0.22, H * 0.39, labelZ, {
        color: textColor, fontSize: 58, weight: 500, italic: true, ratio: 0.2, font: logoFont
      });
    }

    /* special top details */
    if (S.vlog) {
      // microphone grille and tally lamp
      const grille = new THREE.Mesh(
        new THREE.BoxGeometry(W * 0.5, 0.016, D * 0.22),
        metalMaterial('#222520', 0.8, 0.2)
      );
      grille.position.set(-W * 0.04, H / 2 + 0.022, D * 0.04);
      raw.add(grille);
      for (let i = 0; i < 7; i++) {
        const dot = new THREE.Mesh(new THREE.CircleGeometry(0.0045, 8), new THREE.MeshBasicMaterial({ color: 0x080b08 }));
        dot.rotation.x = -Math.PI / 2;
        dot.position.set(-W * 0.2 + i * W * 0.058, H / 2 + 0.031, D * 0.04);
        raw.add(dot);
      }
      const tally = new THREE.Mesh(new THREE.CircleGeometry(0.011, 12), new THREE.MeshBasicMaterial({
        color: 0xe2673b, transparent: true, opacity: 0.9, toneMapped: false
      }));
      tally.position.set(-W * 0.33, H * 0.15, frontZ + 0.006);
      raw.add(tally);
    }

    if (S.hasselX) {
      // orange shutter collar and top engraving plate
      const shutterCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.052, 0.018, 28), accentMaterial('#e08a2e'));
      shutterCollar.position.set(-W * 0.3, H / 2 + 0.026, D * 0.12);
      raw.add(shutterCollar);
      const topText = addTextLabel(raw, 'X2D II 100C', W * 0.18, -W * 0.05, H / 2 + 0.02, -D * 0.27, {
        color: '#2c2c26', fontSize: 52, weight: 600, spacing: 2, ratio: 0.2, font: sansFont
      });
      topText.rotation.x = -Math.PI / 2;
    }

    if (S.hassel907) {
      // modular CFV back with a chunky black rear module
      const backModule = new THREE.Mesh(roundedBoxGeometry(W * 0.94, H * 0.8, D * 0.48, 0.02), shellMaterial('#252623'));
      backModule.position.set(0, -H * 0.01, -D * 0.52);
      raw.add(backModule);
      const silverRailL = new THREE.Mesh(new THREE.BoxGeometry(0.025, H * 0.7, D * 0.65), chrome);
      silverRailL.position.set(-W * 0.46, -H * 0.02, frontZ - 0.02);
      raw.add(silverRailL);
      const silverRailR = silverRailL.clone();
      silverRailR.position.x = W * 0.46;
      raw.add(silverRailR);
      const backPlate = new THREE.Mesh(roundedBoxGeometry(W * 0.76, H * 0.62, 0.015, 0.01), darkMetal);
      backPlate.position.set(0, -H * 0.03, -D / 2 - 0.015);
      raw.add(backPlate);
      // CFV digital back: a large live-view screen and rear controls on the module
      const cfvScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(W * 0.52, H * 0.48),
        new THREE.MeshBasicMaterial({ map: getScreenTexture(), toneMapped: false })
      );
      cfvScreen.rotation.y = Math.PI;
      cfvScreen.position.set(0, -H * 0.02, -D * 0.765);
      cfvScreen.userData.noShadow = true;
      raw.add(cfvScreen);
      const cfvFrame = new THREE.Mesh(roundedBoxGeometry(W * 0.58, H * 0.54, 0.012, 0.01), blackMat);
      cfvFrame.position.set(0, -H * 0.02, -D * 0.758);
      raw.add(cfvFrame);
    }

    if (isIntegrated) {
      // portrait grip shutter & controls
      const portraitShutter = cylinder(0.024, 0.02, metalMaterial('#b9a678', 0.25, 0.9), 18);
      portraitShutter.rotation.x = Math.PI / 2;
      portraitShutter.position.set(-W * 0.4, -H * 0.34, frontZ + 0.003);
      raw.add(portraitShutter);
      addFrontButton(raw, -W * 0.44, -H * 0.23, frontZ + 0.007, 0.013, btnMat, 'round');
    }

    /* lens mount: chrome / dark metal bayonet, index dot, sensor throat */
    const lensX = W * 0.02;
    const mountR = v.mountR;
    const mountMetal = metalMaterial(v.mountMetal || '#b7b6ae', 0.23, 0.93);
    const mountFace = new THREE.Mesh(new THREE.RingGeometry(mountR * 0.79, mountR * 1.015, 56), mountMetal);
    mountFace.position.set(lensX, 0, frontZ + 0.026);
    raw.add(mountFace);
    const mountWall = new THREE.Mesh(
      new THREE.CylinderGeometry(mountR * 0.82, mountR * 0.82, 0.065, 48, 1, true),
      mountMetal
    );
    mountWall.rotation.x = Math.PI / 2;
    mountWall.position.set(lensX, 0, frontZ + 0.012);
    raw.add(mountWall);
    const mountInner = new THREE.Mesh(new THREE.RingGeometry(mountR * 0.62, mountR * 0.8, 48), blackMat);
    mountInner.position.set(lensX, 0, frontZ + 0.028);
    raw.add(mountInner);
    const mountDot = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.025), accent);
    mountDot.position.set(lensX, mountR * 0.93, frontZ + 0.031);
    raw.add(mountDot);
    // Sony E-mount orange index ring / Canon RF red ring remains a small index mark
    if (v.mountStyle === 'sony-e') {
      const orangeRing = torus(mountR * 1.035, 0.004, accentMaterial('#e97633'), 56);
      orangeRing.position.set(lensX, 0, frontZ + 0.027);
      raw.add(orangeRing);
    }
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * TAU + Math.PI / 4;
      const screw = new THREE.Mesh(new THREE.CircleGeometry(0.008, 10), mountMetal);
      screw.position.set(lensX + Math.sin(a) * mountR * 0.91, Math.cos(a) * mountR * 0.91, frontZ + 0.031);
      raw.add(screw);
    }
    const releaseBtn = cylinder(0.018, 0.018, chrome, 16);
    releaseBtn.rotation.x = Math.PI / 2;
    releaseBtn.position.set(lensX - mountR * 1.25, -mountR * 0.3, frontZ + 0.014);
    raw.add(releaseBtn);

    // sensor — scaled to real world proportions, recessed behind the bayonet
    const isMF = item.sensorFormat === 'Medium Format';
    const sensorW = W * (isMF ? 0.295 : 0.265);
    const sensorH = sensorW * ((isMF ? 32.9 / 43.8 : 24 / 36));
    const sensorGroup = makeSensorGroup(v, item, sensorW, sensorH);
    sensorGroup.position.set(lensX, 0, frontZ + 0.008);
    raw.add(sensorGroup);

    // paired lens
    const lightBarrel = v.white || /^#d|^#e/i.test(v.lensColor || '');
    const lens = buildLensBarrel({
      radius: v.lensR,
      length: v.lensL,
      shell: v.lensColor,
      accent: v.accent,
      mountMetal: v.mountMetal,
      badgeText: v.lensBadge,
      badgeColor: v.accent,
      silver: v.silver,
      focusWidth: 0.24,
      focusLabel: v.logo,
      brandMark: v.brandLabel,
      label: '',
      lightBarrel,
      zoomRing: !!v.lensZoom
    });
    const lensBaseZ = frontZ + 0.035;
    lens.position.set(lensX, 0, lensBaseZ);
    raw.add(lens);

    // accessory / detail accents per family
    if (S.sony || S.vlog) {
      const recRed = new THREE.Mesh(new THREE.CircleGeometry(0.008, 10), new THREE.MeshBasicMaterial({
        color: 0xd75a3b, transparent: true, opacity: 0.9, toneMapped: false
      }));
      recRed.position.set(W * 0.36, H * 0.22, frontZ + 0.006);
      raw.add(recRed);
    }
    if (S.canonRf) {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(W * 0.1, 0.008, 0.012), blackMat);
      vent.position.set(-W * 0.3, H * 0.26, frontZ + 0.006);
      raw.add(vent);
    }

    raw.userData = {
      lensGroup: lens,
      sensorGroup,
      sensorData: sensorGroup.userData,
      lensX,
      frontZ,
      lensBaseZ,
      accent,
      isMF
    };
    return raw;
  }


  function buildStandaloneLens(item) {
    const v = VISUAL[item.id];
    const raw = new THREE.Group();
    const lens = buildLensBarrel({
      radius: v.radius,
      length: v.length,
      shell: v.shell,
      accent: v.accent,
      hood: v.hood,
      tripod: v.tripod,
      zoomRing: !!v.zoomRing,
      apertureRing: !!v.apertureRing,
      focusWidth: v.focusWidth || 0.18,
      focusLabel: item.focal || '∞',
      brandMark: item.brand.toUpperCase(),
      label: v.label,
      badgeText: v.badgeText,
      badgeColor: v.badgeColor,
      mountMetal: v.mountMetal,
      darkTrim: !!v.darkTrim,
      accentPlacement: v.accentPlacement,
      hoodAccent: v.hoodAccent,
      lightBarrel: /^#d|^#e/i.test(v.shell),
      silver: item.id === 'hasselblad-xcd35100',
      bigRing: v.bigRing
    });
    raw.add(lens);
    raw.rotation.x = -0.92; // hangs at a diagonal: front element up & outward
    raw.rotation.z = -0.06;

    // a small strap ring on the barrel
    const loop = torus(v.radius * 1.18, 0.017, GOLD_MAT, 34);
    loop.rotation.x = Math.PI / 2;
    loop.position.set(0, v.radius * 0.96, v.length * 0.48 + 0.11);
    loop.userData.noShadow = true;
    raw.add(loop);

    raw.userData = {
      lensGroup: null,
      sensorGroup: null,
      lensData: lens.userData,
      isMF: item.sensorFormat === 'Medium Format',
      accent: accentMaterial(v.accent)
    };
    return raw;
  }

  /* ═══════════════════════════════════════════════════════════
     ORNAMENTS · RIGGING & PHYSICS
     ═══════════════════════════════════════════════════════════ */

  const ornamentsById = new Map();
  const INV_DOWN = new THREE.Vector3(0, -1, 0);
  const physics = {
    g: 9.81,
    spring: 42,
    damping: 5.8,
    maxDirVel: 11
  };

  function buildOrnaments() {
    const prepared = [];
    for (const item of DATA) {
      const v = VISUAL[item.id];
      if (!v) continue;
      const raw = v.kind === 'lens' ? buildStandaloneLens(item) : buildCameraModel(item);
      const box = new THREE.Box3().setFromObject(raw);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      raw.position.set(-center.x, -center.y, -center.z);
      const wrap = new THREE.Group();
      wrap.add(raw);
      const holder = new THREE.Group();
      holder.add(wrap);
      holder.rotation.y = 0;
      prepareShadows(wrap);
      prepared.push({ item, v, raw, wrap, holder, size, boxCenter: center, bulk: Math.max(size.x, size.y) + size.z * 0.35 });
    }

    // largest pieces hang lowest
    prepared.sort((a, b) => b.bulk - a.bulk);
    const n = prepared.length;
    const twigMat = new THREE.MeshStandardMaterial({ color: 0x30251a, roughness: 0.95, metalness: 0 });

    prepared.forEach((p, rank) => {
      const t = n > 1 ? rank / (n - 1) : 0.5;
      const anchorY = 2.42 + t * 4.98 + (rank % 2 ? 0.05 : -0.03);
      const angle = rank * 2.399963 + 0.24 + (rank % 4) * 0.025;
      const radius = treeRadiusAt(anchorY) + 0.52 + (p.v.kind === 'lens' ? 0.07 : 0);
      const anchor = new THREE.Vector3(Math.sin(angle) * radius, anchorY, Math.cos(angle) * radius);
      const baseScale = (p.v.kind === 'lens' ? 0.78 : 0.94) * (0.94 + (1 - t) * 0.07);
      const gap = 0.24 + (rank % 3) * 0.055;

      // static twig + gold bead at the branch tip
      const radial = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
      const twigStart = anchor.clone().addScaledVector(radial, -0.34).add(new THREE.Vector3(0, 0.09, 0));
      const twigVec = anchor.clone().sub(twigStart);
      const twigLen = twigVec.length();
      const twig = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.022, twigLen, 5), twigMat);
      twig.position.copy(twigStart).addScaledVector(twigVec, 0.5);
      twig.quaternion.setFromUnitVectors(UP, twigVec.normalize());
      twig.castShadow = true;
      (treeScenery || treeGroup).add(twig);
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), GOLD_MAT);
      bead.position.copy(anchor);
      (treeScenery || treeGroup).add(bead);

      // pivot / string / ornament
      const pivot = new THREE.Group();
      pivot.position.copy(anchor);
      treeGroup.add(pivot);

      const string = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0045, 0.0045, gap, 6),
        new THREE.MeshStandardMaterial({ color: 0xbca878, metalness: 0.85, roughness: 0.3 })
      );
      string.position.y = -gap / 2;
      pivot.add(string);

      const hook = torus(0.026, 0.005, GOLD_MAT, 18);
      hook.rotation.x = Math.PI / 2;
      hook.position.y = -gap;
      pivot.add(hook);

      const halfH = (p.size.y / 2) * baseScale;
      p.holder.scale.setScalar(baseScale);
      p.holder.position.y = -gap - halfH - 0.012;
      p.holder.rotation.y = angle + 0.18 + (p.v.kind === 'lens' ? -0.1 : 0);
      pivot.add(p.holder);

      const hookTop = torus(0.023, 0.005, GOLD_MAT, 16);
      hookTop.rotation.x = Math.PI / 2;
      hookTop.position.y = halfH + 0.012;
      p.holder.add(hookTop);

      // invisible but generous hit volume
      const hitMat = new THREE.MeshBasicMaterial({
        transparent: true, opacity: 0, depthWrite: false, colorWrite: false, depthTest: false
      });
      const hit = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.3, Math.max(p.size.x, p.size.y) * 0.63), 8, 6), hitMat);
      hit.position.y = 0;
      hit.userData.ornamentId = p.item.id;
      hit.renderOrder = -1;
      p.holder.add(hit);

      const ornament = {
        item: p.item,
        v: p.v,
        raw: p.raw,
        wrap: p.wrap,
        holder: p.holder,
        pivot,
        anchor: anchor.clone(),
        angle,
        stringGap: gap,
        baseScale,
        size: p.size.clone(),
        hoveredScale: 1,
        scaleCurrent: baseScale,
        dir: new THREE.Vector3(0, -1, 0),
        dirVel: new THREE.Vector3(),
        phase: rand() * TAU,
        selected: false,
        focusT: 0,
        hit,
        rank,
        centerWorld: new THREE.Vector3(),
        sensorGroup: p.raw.userData.sensorGroup || null,
        lensGroup: p.raw.userData.lensGroup || null,
        lensData: p.raw.userData.lensData || null,
        baseX: p.holder.rotation.y
      };
      ornaments.push(ornament);
      ornamentsById.set(ornament.item.id, ornament);
      pickables.push(hit);
      hit.userData.ornament = ornament;
    });

    // build shared selection helpers after ornaments exist
    buildSelectionHelpers();
  }

  let selectionLight = null;
  let selectionGlow = null;
  let selectionHalo = null;
  let hoverGlow = null;
  let focusAnim = { t: 0 };

  function buildSelectionHelpers() {
    state.stageHidden = false;
    selectionLight = new THREE.PointLight(0xfff1dc, 0, 5, 2);
    selectionLight.position.set(0, 4, 4);
    scene.add(selectionLight);
    selectionGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color: 0xffc476,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    }));
    selectionGlow.scale.set(2.2, 2.2, 1);
    scene.add(selectionGlow);
    selectionHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.006, 6, 80),
      new THREE.MeshBasicMaterial({ color: 0xc7ac7a, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
    );
    selectionHalo.visible = false;
    scene.add(selectionHalo);

    hoverGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color: 0xead8ab,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    }));
    hoverGlow.scale.set(1.1, 1.1, 1);
    scene.add(hoverGlow);
  }

  function ornamentWorldCenter(o, out) {
    out.set(0, 0, 0);
    o.holder.getWorldPosition(out);
    return out;
  }

  function applyFocusStage() {
    const hidden = !!state.stageHidden;
    if (treeScenery) treeScenery.visible = !hidden;
    for (const o of ornaments) {
      o.pivot.visible = hidden ? o.selected : true;
    }
  }

  function hideFocusStage() {
    if (state.stageHidden) {
      applyFocusStage();
      return;
    }
    state.stageHidden = true;
    applyFocusStage();
  }

  function showFocusStage() {
    if (!state.stageHidden) return;
    state.stageHidden = false;
    applyFocusStage();
  }

  function updateOrnamentPhysics(dt, time) {
    const focused = state.mode === 'focus' || state.mode === 'focusing' || state.mode === 'returning';
    const omega = state.omega;
    const alpha = state.alpha;
    const cent = omega * omega;

    for (const o of ornaments) {
      const ax = o.anchor.x, az = o.anchor.z;
      // effective gravity in the spinning tree frame
      const gx = cent * ax - alpha * az;
      const gz = cent * az + alpha * ax;
      const gy = -physics.g;

      const target = tmpV.set(gx, gy, gz);
      // gentle winter breeze; disappears while the camera is inspecting
      const wind = focused ? 0.1 : 1;
      target.x += Math.sin(time * 0.63 + o.phase) * 0.34 * wind;
      target.z += Math.cos(time * 0.51 + o.phase * 1.7) * 0.29 * wind;
      target.y += Math.sin(time * 0.37 + o.phase) * 0.06 * wind;
      target.normalize();

      const spring = focused ? 56 : physics.spring;
      const damping = focused ? 8.2 : physics.damping;
      const acc = tmpV2.copy(target).sub(o.dir).multiplyScalar(spring).addScaledVector(o.dirVel, -damping);
      o.dirVel.addScaledVector(acc, dt);
      if (o.dirVel.lengthSq() > physics.maxDirVel * physics.maxDirVel) {
        o.dirVel.setLength(physics.maxDirVel);
      }
      o.dir.addScaledVector(o.dirVel, dt).normalize();
      // velocity must stay tangential
      o.dirVel.addScaledVector(o.dir, -o.dirVel.dot(o.dir));

      tmpQ.setFromUnitVectors(DOWN, o.dir);
      o.pivot.quaternion.copy(tmpQ);

      // hover / selection scale easing
      const targetScale = o.baseScale * (o.selected ? 1.14 : o.hoveredScale);
      o.scaleCurrent = damp(o.scaleCurrent, targetScale, o.selected ? 5 : 9, dt);
      o.holder.scale.setScalar(o.scaleCurrent);
    }
  }

  function updateOrnamentFocus(o, t) {
    o.focusT = t;
    const k = clamp(t, 0, 1);
    const ease = easeOutCubic(k);
    const sd = o.sensorGroup && o.sensorGroup.userData;
    if (o.lensGroup) {
      // drop the lens below the body, exposing the sensor
      o.lensGroup.position.x = (o.raw.userData.lensX || 0) - 0.03 * ease;
      o.lensGroup.position.y = -0.33 * ease;
      o.lensGroup.position.z = (o.raw.userData.lensBaseZ || (o.raw.userData.frontZ + 0.042)) + 0.12 * ease;
      o.lensGroup.rotation.z = 0.08 * ease;
      o.lensGroup.rotation.x = -0.035 * ease;
    }
    if (sd) {
      const pulse = 0.85 + Math.sin(performance.now() * 0.0035) * 0.15;
      sd.glowMat.opacity = 0.2 * ease * pulse;
      sd.haloMat.opacity = 0.1 * ease;
      sd.sensorLight.intensity = 0.5 * ease;
      sd.halo.scale.setScalar(1 + 0.04 * Math.sin(performance.now() * 0.003 + 1));
    }
    if (o.lensData) {
      const ld = o.lensData;
      ld.imageCircle.visible = ease > 0.015;
      ld.imageCircle2.visible = ease > 0.015;
      ld.imageCircleMat.opacity = 0.72 * ease;
      ld.imageCircle.rotation.z = performance.now() * 0.0004;
      ld.imageCircle2.rotation.z = -performance.now() * 0.0003;
      ld.mountRing.material.emissiveIntensity = 0.15 + 0.4 * ease;
      if (ld.innerGlass.material) ld.innerGlass.material.emissiveIntensity = 0.35 + 0.6 * ease;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     INTERFACE · index, nameplate, sensor diagrams
     ═══════════════════════════════════════════════════════════ */

  const BRAND_ORDER = ['Sony', 'Nikon', 'Canon', 'Hasselblad', 'Fujifilm'];
  const BRAND_ROMAN = { Sony: 'I', Nikon: 'II', Canon: 'III', Hasselblad: 'IV', Fujifilm: 'V' };

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, (ch) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
  }

  function releaseText(release) {
    if (!release) return '—';
    const parts = String(release).split(/[.\-/]/);
    return parts.length > 1 ? `${parts[0]} / ${parts[1]}` : release;
  }

  function formatShort(item) {
    if (item.category === 'lens') return 'LENS';
    return item.sensorFormat === 'Medium Format' ? 'MF' : 'FF';
  }

  function formatDotClass(item) {
    if (item.category === 'lens') return 'lens';
    return item.sensorFormat === 'Medium Format' ? 'mf' : 'ff';
  }

  function lensSpecLine(item) {
    return `${item.focal || ''} · ${item.maxAperture || ''}`.replace(/^ · | · $/g, '');
  }

  function itemSubline(item) {
    if (item.category === 'lens') {
      return `${item.focal || '—'} · ${item.maxAperture || '—'} · ${item.sensorFormat === 'Medium Format' ? '中画幅' : '全画幅'}`;
    }
    return `${item.sensorFormat === 'Medium Format' ? 'Medium Format' : '35mm Full Frame'} · ${item.megapixels || '—'} MP`;
  }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return 'manufacturer'; }
  }

  function statisticCounts() {
    const cameras = DATA.filter((x) => x.category !== 'lens').length;
    const lenses = DATA.length - cameras;
    return { cameras, lenses };
  }

  function renderIndex() {
    const counts = statisticCounts();
    let html = '';
    html += `
      <div class="panel-topline">
        <span>THE COLLECTION · N° 12</span>
        <span class="live"><i class="live-dot"></i>TREE IN MOTION</span>
      </div>
      <h2 class="index-title">The Camera<em>Tree.</em></h2>
      <p class="index-cn">一棵挂满相机与镜头的圣诞树</p>
      <p class="index-lede">在冷杉的暗绿里，藏起二十一件影像器物。拖动让树旋转，挂饰会随离心力向外飞起；点亮任意一件，靠近它、检视它的 CMOS，与画幅的差别。挂饰外观已按各品牌官方产品图逐项校正。</p>
      <div class="collection-stats">
        <div><b>${pad2(DATA.length)}</b><small>SPECIMENS</small></div>
        <div><b>${counts.cameras}</b><small>CAMERAS</small></div>
        <div><b>${counts.lenses}</b><small>LENSES</small></div>
      </div>
      <div class="collection">`;

    let indexNo = 0;
    for (const brand of BRAND_ORDER) {
      const items = DATA.filter((x) => x.brand === brand);
      if (!items.length) continue;
      html += `
        <section class="brand-block" aria-label="${escapeHtml(brand)}">
          <div class="brand-head">
            <span class="brand-name">${escapeHtml(brand)}</span>
            <span class="brand-count">${String(items.length).padStart(2, '0')} / ${BRAND_ROMAN[brand] || ''}</span>
            <span class="brand-rule"></span>
          </div>`;
      for (const item of items) {
        indexNo++;
        const no = DATA.indexOf(item) + 1;
        html += `
          <button class="index-item" type="button" data-id="${escapeHtml(item.id)}" aria-label="检视 ${escapeHtml(item.fullName)}">
            <span class="index-num">${pad2(no)}</span>
            <span class="index-main">
              <span class="index-name">${escapeHtml(item.name)}</span>
              <span class="index-sub">${escapeHtml(itemSubline(item))}</span>
            </span>
            <span class="index-type"><i class="format-dot ${formatDotClass(item)}"></i>${formatShort(item)}</span>
            <span class="index-chev" aria-hidden="true">↗</span>
          </button>`;
      }
      html += `</section>`;
    }

    html += `
      </div>
      <div class="index-footnote">
        <span>点击任意挂饰，镜头将靠近并展露 CMOS。<br>DRAG · SPIN · INSPECT</span>
        <span>VOL. II<br>MMXXVI</span>
      </div>`;

    els.panelInner.innerHTML = html;
    els.panelInner.classList.remove('view-enter');
    void els.panelInner.offsetWidth;
    els.panelInner.classList.add('view-enter');
    els.panelScroll.scrollTop = 0;
    els.panel.style.setProperty('--accent', '#d9bc87');
  }

  function sensorCardForCamera(item) {
    const isMF = item.sensorFormat === 'Medium Format';
    const sw = Number(item.sensorW) || (isMF ? 43.8 : 36);
    const sh = Number(item.sensorH) || (isMF ? 32.9 : 24);
    const areaRatio = (sw * sh) / (36 * 24);
    const ffGuide = isMF
      ? `<span class="sensor-ff-guide" aria-hidden="true"></span><span class="sensor-ff-label">35MM FF GUIDE</span>`
      : '';
    const dims = item.sensorDims || `${sw.toFixed(1)} × ${sh.toFixed(1)} mm`;
    const formatName = isMF ? 'MEDIUM FORMAT' : '35MM FULL FRAME';
    const note = isMF
      ? `面积约为 36 × 24mm 全画幅的 <b>${areaRatio.toFixed(2)}×</b>。更大的受光面带来更浅的景深、更平滑的阶调与 16-bit 色彩余量。`
      : `35mm 全画幅基准：36 × 24mm，面积约为 APS-C 的 <b>2.25×</b>。它是这台机器的全部光线入口。`;
    return `
      <div class="sensor-card">
        <div class="sensor-head"><span>CMOS / 电子传感器</span><span class="exposed">EXPOSED</span></div>
        <div class="sensor-stage">
          <div class="sensor-frame" style="--sw:${sw};--sh:${sh}">
            <span class="sensor-scan" aria-hidden="true"></span>
            ${ffGuide}
          </div>
        </div>
        <div class="sensor-caption">
          <div class="dims">${escapeHtml(dims)}<small>${escapeHtml(item.sensorType || 'CMOS')}</small></div>
          <div class="format-big">${formatName}<small>${escapeHtml(String(item.megapixels || '—'))} MEGAPIXELS</small></div>
        </div>
        <div class="sensor-note">${note}</div>
      </div>`;
  }

  function sensorCardForLens(item) {
    const isMF = item.sensorFormat === 'Medium Format';
    const circle = Number(item.imageCircleMm) || (isMF ? 55 : 43.3);
    const formatName = isMF ? 'MEDIUM FORMAT' : '35MM FULL FRAME';
    const coverage = isMF ? 'Ø55MM IMAGE CIRCLE' : 'Ø43.3MM IMAGE CIRCLE';
    let shapes = '';
    if (isMF) {
      shapes += `<div class="sensor-shape mf" style="width:${(43.8 / circle) * 100}%;height:${(32.9 / circle) * 100}%"><span>33 × 44</span></div>`;
      shapes += `<div class="sensor-shape ff" style="width:${(36 / circle) * 100}%;height:${(24 / circle) * 100}%;border-style:dashed;opacity:.75"><span>36 × 24</span></div>`;
    } else {
      shapes += `<div class="sensor-shape" style="width:${(36 / circle) * 100}%;height:${(24 / circle) * 100}%"><span>36 × 24</span></div>`;
    }
    const note = isMF
      ? `镜头不搭载 CMOS。像场直径 <b>Ø55mm</b>，完整覆盖 43.8 × 32.9mm 中画幅传感器；同时也能覆盖 36 × 24mm 全画幅。`
      : `镜头不搭载 CMOS。像场直径 <b>Ø43.3mm</b>，完整覆盖 36 × 24mm 全画幅传感器；用于中画幅会在画面四角出现遮挡。`;
    return `
      <div class="sensor-card">
        <div class="sensor-head"><span>OPTICAL SECTION / 光学截面</span><span class="exposed">IMAGE CIRCLE</span></div>
        <div class="optical-stage">
          <div class="image-circle">
            ${shapes}
          </div>
          <div class="optical-badge"><b>${escapeHtml(coverage)}</b><br>${escapeHtml(formatName)}</div>
        </div>
        <div class="sensor-caption">
          <div class="dims">${escapeHtml(item.focal || '—')}<small>FOCAL RANGE</small></div>
          <div class="format-big">${escapeHtml(item.maxAperture || '—')}<small>MAXIMUM APERTURE</small></div>
        </div>
        <div class="sensor-note">${note}</div>
      </div>`;
  }

  function specCell(label, value, wide) {
    return `<div class="spec-cell${wide ? ' wide' : ''}"><span class="spec-label">${label}</span><span class="spec-value">${value || '—'}</span></div>`;
  }

  function specGridForCamera(item) {
    const mp = item.megapixels ? `<em>${item.megapixels}</em> MP` : '—';
    return `
      <div class="spec-grid">
        ${specCell('EFFECTIVE PIXELS / 有效像素', mp)}
        ${specCell('SENSOR / 传感器', escapeHtml(item.sensorType || '—'))}
        ${specCell('ISO / 感光度', escapeHtml(item.iso || '—'), true)}
        ${specCell('BURST / 连拍', escapeHtml(item.burst || '—'))}
        ${specCell('VIDEO / 视频', escapeHtml(item.video || '—'))}
        ${specCell('AUTOFOCUS / 对焦', escapeHtml(item.af || '—'), true)}
        ${specCell('MOUNT / 卡口', escapeHtml(item.mount || '—'))}
        ${specCell('WEIGHT / 重量', escapeHtml(item.weight || '—'))}
        ${specCell('RELEASE / 发布', releaseText(item.release))}
        ${specCell('FORMAT / 画幅', escapeHtml(item.sensorFormat || '—'))}
      </div>`;
  }

  function specGridForLens(item) {
    return `
      <div class="spec-grid">
        ${specCell('FOCAL / 焦距', escapeHtml(item.focal || '—'))}
        ${specCell('APERTURE / 最大光圈', escapeHtml(item.maxAperture || '—'))}
        ${specCell('COVERAGE / 画幅覆盖', escapeHtml(item.formatCoverage || item.sensorFormat || '—'), true)}
        ${specCell('MIN. FOCUS / 最近对焦', escapeHtml(item.minFocus || '—'))}
        ${specCell('FILTER / 滤镜口径', escapeHtml(item.filter || '—'))}
        ${specCell('OPTICS / 光学结构', escapeHtml(item.elements || '—'), true)}
        ${specCell('DIMENSIONS / 尺寸', escapeHtml(item.dimensions || '—'))}
        ${specCell('WEIGHT / 重量', escapeHtml(item.weight || '—'))}
        ${specCell('MOUNT / 卡口', escapeHtml(item.mount || '—'))}
        ${specCell('RELEASE / 发布', releaseText(item.release))}
      </div>`;
  }

  function renderDetail(item) {
    const no = DATA.indexOf(item) + 1;
    const isLens = item.category === 'lens';
    const kindLabel = isLens ? 'OPTICAL INSTRUMENT' : 'DIGITAL CAMERA';
    const v = VISUAL[item.id] || {};
    const noteFlag = item.uncertain ? `<span class="meta-chip hot">† 规格注记</span>` : '';
    const highlights = (item.highlights || []).map((h, i) => `<li><span>${pad2(i + 1)}</span>${escapeHtml(h)}</li>`).join('');
    const source = (item.sources && item.sources[0]) || '';
    const sourceLink = source
      ? `<a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(hostOf(source))} ↗</a>`
      : '官方规格资料';

    let html = `
      <div class="detail-topline">
        <span class="specimen-no">SPECIMEN · ${pad2(no)} / ${pad2(DATA.length)}</span>
        <span class="step-group">
          <button class="step-btn" type="button" data-step="-1" aria-label="上一件藏品">‹</button>
          <button class="step-btn" type="button" data-step="1" aria-label="下一件藏品">›</button>
        </span>
        <span>${isLens ? 'OPTICS' : 'IMAGING'}</span>
      </div>
      <div class="detail-brandline">${escapeHtml(item.brand)} <span class="kind">· ${kindLabel}</span></div>
      <h2 class="detail-name">${escapeHtml(item.name)}</h2>
      <p class="detail-tagline">${escapeHtml(item.tagline || '')}</p>
      <div class="detail-meta-row">
        <span class="meta-chip">${escapeHtml(item.sensorFormat === 'Medium Format' ? 'MEDIUM FORMAT' : isLens ? 'FULL FRAME OPTICS' : '35MM FULL FRAME')}</span>
        <span class="meta-chip">${escapeHtml(item.mount || '—')}</span>
        <span class="meta-chip">${releaseText(item.release)}</span>
        ${noteFlag}
      </div>
      ${isLens ? sensorCardForLens(item) : sensorCardForCamera(item)}
      <h3 class="detail-section-title">${isLens ? 'TECHNICAL RECORD / 光学档案' : 'TECHNICAL RECORD / 技术档案'}</h3>
      ${isLens ? specGridForLens(item) : specGridForCamera(item)}
      <h3 class="detail-section-title">THREE NOTES / 展签</h3>
      <ul class="highlights">${highlights || '<li><span>01</span>暂无更多资料。</li>'}</ul>
      ${item.note ? `<p class="detail-prose"><span class="note-flag">†</span> ${escapeHtml(item.note)}</p>` : ''}
      <div class="detail-actions">
        <button class="action-primary" type="button" data-back>
          <span>返回全树视角</span><span>←</span>
        </button>
        <button class="action-ghost" type="button" data-step="1">下一件</button>
      </div>
      <div class="detail-signature">LUMIÈRE NOËL · MMXXVI</div>
      <p class="source-note">资料参考：${sourceLink}。外观参考官方产品图校正；参数用于视觉陈列，若与官方最新公布不一致，以厂商页面为准。${item.uncertain ? '<span class="note-flag"> 带 † 的展签注记请以官方为准。</span>' : ''}</p>`;
    return html;
  }

  function showDetailPanel(item) {
    els.panelInner.innerHTML = renderDetail(item);
    els.panelInner.classList.remove('view-enter');
    void els.panelInner.offsetWidth;
    els.panelInner.classList.add('view-enter');
    els.panelScroll.scrollTop = 0;
    els.panel.style.setProperty('--accent', item.accent || '#d9bc87');
  }

  function setBodyMode(mode) {
    document.body.dataset.mode = mode;
    state.mode = mode;
  }

  function updateHover(ornament, ev) {
    if (state.mode !== 'index' && state.mode !== 'returning') return;
    if (state.hovered === ornament) {
      if (ev) positionTooltip(ev.clientX, ev.clientY);
      return;
    }
    if (state.hovered) state.hovered.hoveredScale = 1;
    state.hovered = ornament;
    if (!ornament) {
      els.tooltip.classList.remove('is-visible');
      els.canvas.style.cursor = 'grab';
      if (hoverGlow) hoverGlow.material.opacity = 0;
      return;
    }
    ornament.hoveredScale = 1.055;
    els.tooltipBrand.textContent = `${ornament.item.brand} / ${formatShort(ornament.item)}`;
    els.tooltipName.textContent = ornament.item.name;
    els.tooltip.classList.add('is-visible');
    els.canvas.style.cursor = 'pointer';
    if (ev) positionTooltip(ev.clientX, ev.clientY);
    if (hoverGlow) {
      ornamentWorldCenter(ornament, tmpV);
      hoverGlow.position.copy(tmpV);
      hoverGlow.material.opacity = 0.12;
    }
  }

  function positionTooltip(x, y) {
    const pad = 16;
    const w = 230, h = 105;
    const left = clamp(x + 18, 10, window.innerWidth - w - 10);
    const top = clamp(y + 18, 10, window.innerHeight - h - 10);
    els.tooltip.style.left = left + 'px';
    els.tooltip.style.top = top + 'px';
  }

  function pickAt(x, y) {
    const rect = els.canvas.getBoundingClientRect();
    pointerNDC.x = ((x - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((y - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNDC, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    for (const hit of hits) {
      const o = hit.object.userData.ornament;
      if (!o) continue;
      // only pick ornaments on the camera-facing hemisphere
      ornamentWorldCenter(o, tmpV);
      const worldAngle = o.angle + state.treeYaw;
      tmpV2.set(Math.sin(worldAngle), 0, Math.cos(worldAngle));
      const toCam = camera.position.clone().sub(tmpV).normalize();
      if (tmpV2.dot(toCam) > 0.02) return o;
    }
    return null;
  }

  /* ═══════════════════════════════════════════════════════════
     CAMERA · orbit, close-up fly-to, inspection
     ═══════════════════════════════════════════════════════════ */

  let cameraTarget = new THREE.Vector3(0, 4.45, 0);
  const focusTmp = new THREE.Vector3();

  function defaultCameraPose() {
    const yaw = state.orbit.yaw;
    const pitch = state.orbit.pitch;
    const dist = state.orbit.dist;
    const target = new THREE.Vector3(treeGroup.position.x, state.orbit.targetY, 0);
    const pos = new THREE.Vector3(
      target.x + Math.sin(yaw) * Math.cos(pitch) * dist,
      target.y + Math.sin(pitch) * dist,
      target.z + Math.cos(yaw) * Math.cos(pitch) * dist
    );
    return { pos, target };
  }

  function focusCameraPose(o) {
    const center = ornamentWorldCenter(o, new THREE.Vector3());
    const worldAngle = o.angle + state.treeYaw;
    const outward = new THREE.Vector3(Math.sin(worldAngle), 0, Math.cos(worldAngle));
    const tangent = new THREE.Vector3(Math.cos(worldAngle), 0, -Math.sin(worldAngle));
    const az = state.focus.detailYaw;
    const el = state.focus.detailEl;
    const dir = outward.clone().multiplyScalar(Math.cos(az) * Math.cos(el))
      .addScaledVector(tangent, Math.sin(az) * Math.cos(el))
      .addScaledVector(UP, Math.sin(el));
    const dist = state.focus.dist;
    const pos = center.clone().addScaledVector(dir, dist);
    const forward = center.clone().sub(pos).normalize();
    const right = forward.clone().cross(UP).normalize();
    let shift = 0;
    if (window.innerWidth > 700) {
      const panelW = window.innerWidth > 1180 ? 472 : 424;
      const panelFrac = Math.min(0.34, panelW / window.innerWidth);
      const visibleWidth = 2 * dist * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.aspect;
      shift = visibleWidth * panelFrac * 0.45;
    }
    const target = center.clone().addScaledVector(right, shift);
    if (o.v.kind === 'camera') target.addScaledVector(UP, -0.08);
    if (isNarrow()) target.addScaledVector(UP, -0.58);
    return { pos, target, center };
  }

  function beginFocus(item, fromExisting) {
    const o = ornamentsById.get(item.id);
    if (!o) return;
    if (state.selected === o && state.mode !== 'returning') {
      return;
    }
    if (state.selected) {
      state.selected.selected = false;
      state.selected.focusT = 0;
      state.selected = null;
    }
    o.selected = true;
    state.selected = o;
    o.hoveredScale = 1;
    state.hovered = null;
    els.tooltip.classList.remove('is-visible');
    els.hint.classList.add('is-hidden');

    const maxDim = Math.max(o.size.x, o.size.y, o.size.z * 0.6) * o.baseScale;
    const targetFov = isNarrow() ? 36 : 32;
    state.focus.targetFov = targetFov;
    const visualHeight = o.v.kind === 'lens'
      ? Math.max(o.size.y, o.size.z * 0.85)
      : o.size.y + 0.5;
    const desiredFill = isNarrow() ? 0.32 : 0.68;
    const fovR = targetFov * Math.PI / 180;
    const baseDist = clamp(visualHeight / (2 * Math.tan(fovR / 2) * desiredFill), 2.2, 5.6);
    state.focus.baseDist = baseDist;
    state.focus.dist = baseDist;
    state.focus.detailYaw = o.v.kind === 'lens' ? 0.92 : 0.46;
    state.focus.detailEl = o.v.kind === 'lens' ? 0.23 : 0.15;

    state.lastInteraction = performance.now();
    state.treeSpin = 0;
    state.omega = 0;
    state.alpha = 0;
    setBodyMode('focusing');
    showDetailPanel(item);
    if (els.focusHudLabel) {
      els.focusHudLabel.textContent = o.v.kind === 'lens' ? 'IMAGE CIRCLE' : 'EXPOSED SENSOR';
    }
    if (state.stageHidden) applyFocusStage();

    const pose = focusCameraPose(o);
    state.focus.trans = {
      type: 'in',
      t: 0,
      dur: fromExisting ? 1.02 : 1.25,
      fromPos: camera.position.clone(),
      fromTarget: cameraTarget.clone(),
      fromFov: camera.fov
    };
    focusAnim.t = 0;
  }

  function exitFocus() {
    if (!state.selected || state.mode === 'returning' || state.mode === 'index') return;
    showFocusStage();
    state.treeSpin = 0;
    state.focus.trans = {
      type: 'out',
      t: 0,
      dur: 1.1,
      fromPos: camera.position.clone(),
      fromTarget: cameraTarget.clone(),
      fromFov: camera.fov
    };
    setBodyMode('returning');
    els.hint.classList.remove('is-hidden');
    if (hoverGlow) hoverGlow.material.opacity = 0;
  }

  function finishReturn() {
    showFocusStage();
    if (state.selected) {
      state.selected.selected = false;
      state.selected.focusT = 0;
      state.selected = null;
    }
    state.focus.trans = null;
    state.focus.detailYaw = 0.34;
    state.focus.detailEl = 0.12;
    setBodyMode('index');
    camera.fov = 38;
    camera.updateProjectionMatrix();
    renderIndex();
    state.lastInteraction = performance.now() - 4200;
    els.hint.classList.remove('is-hidden');
  }

  function updateCamera(dt) {
    const now = performance.now();
    if (!state.introDone) {
      const t = clamp((now - introStart) / 2700, 0, 1);
      const e = easeOutCubic(t);
      const narrow = window.innerWidth <= 900;
      if (!state.interactedIntro) {
        state.orbit.dist = lerp(narrow ? 22 : 18.8, narrow ? 19.2 : 15.6, e);
        state.orbit.pitch = lerp(narrow ? 0.02 : 0.07, narrow ? 0.1 : 0.15, e);
        state.orbit.yaw = lerp(-0.06, 0.04, e);
      }
      if (t >= 1) {
        state.introDone = true;
        state.orbit.dist = state.interactedIntro ? state.orbit.dist : (narrow ? 19.2 : 15.6);
      }
    }

    if (state.mode === 'focusing' || state.mode === 'focus') {
      if (!state.selected) return;
      const pose = focusCameraPose(state.selected);
      const targetFov = state.focus.targetFov || 32;
      if (state.mode === 'focusing' && state.focus.trans && state.focus.trans.type === 'in') {
        const tr = state.focus.trans;
        tr.t += dt / tr.dur;
        const k = easeInOutCubic(clamp(tr.t, 0, 1));
        camera.position.lerpVectors(tr.fromPos, pose.pos, k);
        cameraTarget.lerpVectors(tr.fromTarget, pose.target, k);
        camera.fov = lerp(tr.fromFov, targetFov, k);
        camera.updateProjectionMatrix();
        camera.lookAt(cameraTarget);
        if (tr.t >= 1) {
          state.focus.trans = null;
          hideFocusStage();
          setBodyMode('focus');
        } else if (tr.t > 0.58 && !state.stageHidden) {
          hideFocusStage();
        }
      } else {
        const k = 1 - Math.exp(-12 * dt);
        camera.position.lerp(pose.pos, k);
        cameraTarget.lerp(pose.target, k);
        camera.fov = damp(camera.fov, targetFov, 8, dt);
        camera.updateProjectionMatrix();
        camera.lookAt(cameraTarget);
      }
      return;
    }

    if (state.mode === 'returning' && state.focus.trans && state.focus.trans.type === 'out') {
      const home = defaultCameraPose();
      const tr = state.focus.trans;
      tr.t += dt / tr.dur;
      const k = easeInOutCubic(clamp(tr.t, 0, 1));
      camera.position.lerpVectors(tr.fromPos, home.pos, k);
      cameraTarget.lerpVectors(tr.fromTarget, home.target, k);
      camera.fov = lerp(tr.fromFov, 38, k);
      camera.updateProjectionMatrix();
      camera.lookAt(cameraTarget);
      if (tr.t >= 1) finishReturn();
      return;
    }

    const pose = defaultCameraPose();
    camera.position.copy(pose.pos);
    cameraTarget.copy(pose.target);
    camera.fov = damp(camera.fov, 38, 6, dt);
    camera.updateProjectionMatrix();
    camera.lookAt(cameraTarget);
  }

  function updateSelectionVisuals(time) {
    if (!selectionLight) return;
    const focusMode = state.selected && (state.mode === 'focus' || state.mode === 'focusing');
    if (state.selected) {
      const o = state.selected;
      ornamentWorldCenter(o, tmpV);
      const pulse = 0.86 + Math.sin(time * 2.2) * 0.14;
      selectionGlow.position.copy(tmpV);
      selectionGlow.material.opacity = focusMode ? 0.095 * pulse : 0.06;
      const s = 1.35 + Math.min(1.3, o.size.length());
      selectionGlow.scale.set(s, s, 1);
      const toCam = camera.position.clone().sub(tmpV).normalize();
      selectionLight.position.copy(tmpV).addScaledVector(toCam, 0.6).addScaledVector(UP, 0.2);
      selectionLight.intensity = focusMode ? 0.9 * pulse : 0.4;
      selectionHalo.visible = false;
    } else {
      selectionGlow.material.opacity = damp(selectionGlow.material.opacity, 0, 8, 0.016);
      selectionLight.intensity = damp(selectionLight.intensity, 0, 8, 0.016);
      selectionHalo.visible = false;
    }
    if (state.hovered && state.mode === 'index') {
      ornamentWorldCenter(state.hovered, tmpV);
      hoverGlow.position.copy(tmpV);
      hoverGlow.material.opacity = damp(hoverGlow.material.opacity, 0.11, 8, 0.016);
    } else {
      hoverGlow.material.opacity = damp(hoverGlow.material.opacity, 0, 8, 0.016);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     INPUT
     ═══════════════════════════════════════════════════════════ */

  function bindEvents() {
    const canvas = els.canvas;

    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
      if (state.mode === 'focusing' || state.mode === 'returning') return;
      state.dragging = true;
      state.dragMode = state.mode === 'focus' ? 'inspect' : 'tree';
      state.pointerId = e.pointerId;
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      state.lastPointer.x = e.clientX;
      state.lastPointer.y = e.clientY;
      state.dragDistance = 0;
      state.dragOmega = 0;
      state.lastMoveTime = e.timeStamp;
      state.lastInteraction = performance.now();
      state.interactedIntro = true;
      state.introDone = true;
      els.hint.classList.add('is-hidden');
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      if (state.dragMode === 'tree') {
        state.autoRotateHold = true;
      }
      updateHover(null);
      els.tooltip.classList.remove('is-visible');
      canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!state.dragging || e.pointerId !== state.pointerId) {
        const o = pickAt(e.clientX, e.clientY);
        updateHover(o, e);
        return;
      }
      const dx = e.clientX - state.lastPointer.x;
      const dy = e.clientY - state.lastPointer.y;
      const dtMs = Math.max(1, e.timeStamp - state.lastMoveTime);
      state.lastPointer.x = e.clientX;
      state.lastPointer.y = e.clientY;
      state.lastMoveTime = e.timeStamp;
      state.dragDistance += Math.abs(dx) + Math.abs(dy);
      state.lastInteraction = performance.now();
      state.interactedIntro = true;

      if (state.dragMode === 'tree') {
        const deltaYaw = dx * 0.0062;
        state.treeYaw += deltaYaw;
        state.treeSpin = 0;
        state.dragOmega = state.dragOmega * 0.65 + (deltaYaw / (dtMs / 1000)) * 0.35;
        state.dragOmega = clamp(state.dragOmega, -3.3, 3.3);
        state.orbit.pitch = clamp(state.orbit.pitch + dy * 0.0032, -0.03, 0.55);
      } else if (state.dragMode === 'inspect') {
        state.focus.detailYaw -= dx * 0.006;
        state.focus.detailYaw = clamp(state.focus.detailYaw, -1.15, 1.35);
        state.focus.detailEl = clamp(state.focus.detailEl + dy * 0.004, -0.18, 0.61);
      }
    });

    const endDrag = (e) => {
      if (!state.dragging) return;
      if (e && e.pointerId !== undefined && e.pointerId !== state.pointerId) return;
      const wasDragging = state.dragging;
      state.dragging = false;
      try { canvas.releasePointerCapture(state.pointerId); } catch (err) {}
      state.pointerId = null;
      state.autoRotateHold = false;
      const isClick = state.dragDistance < 7;
      const now = performance.now();
      if (wasDragging && state.dragMode === 'tree') {
        if (now - state.lastMoveTime > 120 || isClick) {
          state.treeSpin = 0;
        } else {
          state.treeSpin = clamp(state.dragOmega, -3.2, 3.2);
        }
        state.lastInteraction = now;
      }
      if (isClick && state.dragMode === 'tree') {
        const o = pickAt(e.clientX, e.clientY);
        if (o) beginFocus(o.item, false);
      }
      state.dragMode = null;
      canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    window.addEventListener('pointerup', (e) => {
      if (state.dragging) endDrag(e);
    });

    canvas.addEventListener('pointerleave', () => {
      if (!state.dragging) updateHover(null);
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      state.interactedIntro = true;
      state.introDone = true;
      state.lastInteraction = performance.now();
      if (state.mode === 'focus') {
        state.focus.dist = clamp(state.focus.dist + e.deltaY * 0.0012, 0.78, state.focus.baseDist * 1.6);
      } else if (state.mode === 'index') {
        state.orbit.dist = clamp(state.orbit.dist + e.deltaY * 0.008, 9.2, 22);
      }
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.mode !== 'index') exitFocus();
      }
      if (e.key === 'ArrowLeft' && state.mode === 'index') {
        state.treeSpin = 1.2;
        state.lastInteraction = performance.now();
        state.autoRotateHold = true;
      }
      if (e.key === 'ArrowRight' && state.mode === 'index') {
        state.treeSpin = -1.2;
        state.lastInteraction = performance.now();
        state.autoRotateHold = true;
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        state.treeSpin = 0;
        state.autoRotateHold = false;
      }
    });

    els.panelInner.addEventListener('click', (e) => {
      const indexItem = e.target.closest('[data-id]');
      if (indexItem) {
        const item = DATA.find((x) => x.id === indexItem.getAttribute('data-id'));
        if (item) beginFocus(item, false);
        return;
      }
      const back = e.target.closest('[data-back]');
      if (back) { exitFocus(); return; }
      const step = e.target.closest('[data-step]');
      if (step) {
        if (!state.selected) return;
        const dir = Number(step.getAttribute('data-step')) || 1;
        const idx = DATA.findIndex((x) => x.id === state.selected.item.id);
        const next = DATA[(idx + dir + DATA.length) % DATA.length];
        beginFocus(next, state.mode === 'focus' || state.mode === 'focusing');
      }
    });
    els.panelClose.addEventListener('click', exitFocus);
    els.resetBtn.addEventListener('click', () => {
      if (state.mode !== 'index') {
        finishReturn();
      }
      state.introDone = true;
      state.interactedIntro = true;
      state.treeYaw = 0;
      state.treeSpin = 0;
      state.orbit.yaw = 0.04;
      state.orbit.pitch = 0.15;
      state.orbit.dist = 15.6;
      state.autoRotate = true;
      els.motionBtn.classList.add('is-on');
      els.motionBtn.setAttribute('aria-label', '暂停自动旋转');
      state.lastInteraction = performance.now() - 5000;
      updateHover(null);
    });
    els.motionBtn.addEventListener('click', () => {
      state.autoRotate = !state.autoRotate;
      els.motionBtn.classList.toggle('is-on', state.autoRotate);
      els.motionBtn.setAttribute('aria-label', state.autoRotate ? '暂停自动旋转' : '开始自动旋转');
      state.lastInteraction = performance.now();
    });

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) clock.getDelta();
    });
  }

  function onResize() {
    if (!renderer || !camera) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isNarrow() ? 2 : 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    layoutScene();
    if (state.mode === 'focus' && state.selected) {
      state.focus.trans = null;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     FRAME LOOP
     ═══════════════════════════════════════════════════════════ */

  function updateSpin(dt, time) {
    const prevYaw = state.treeYaw;
    if (state.mode === 'index' || state.mode === 'returning') {
      if (!state.dragging) {
        const idle = time - state.lastInteraction > 4200;
        const wantAuto = state.autoRotate && idle && !state.autoRotateHold && state.mode === 'index';
        const targetSpin = wantAuto ? 0.105 : 0;
        state.treeSpin = damp(state.treeSpin, targetSpin, wantAuto ? 1.1 : 1.9, dt);
        state.treeYaw += state.treeSpin * dt;
      }
    } else {
      state.treeSpin = 0;
    }
    const instOmega = (state.treeYaw - prevYaw) / Math.max(dt, 0.001);
    state.omega = damp(state.omega, instOmega, 11, dt);
    state.alpha = damp(state.alpha, clamp((state.omega - state.prevOmega) / Math.max(dt, 0.001), -25, 25), 7, dt);
    state.prevOmega = state.omega;
    if (treeGroup) treeGroup.rotation.y = state.treeYaw;
  }

  function updateSceneAnimation(dt, time) {
    if (starGroup) {
      starGroup.rotation.y += dt * 0.16;
      const u = starGroup.userData;
      if (u.glow) {
        const s = 2.2 + Math.sin(time * 1.5) * 0.12;
        u.glow.scale.set(s, s, 1);
        u.glow.material.opacity = 0.37 + Math.sin(time * 1.7) * 0.07;
      }
      if (u.light) u.light.intensity = 18 + Math.sin(time * 1.9) * 3.5;
      if (u.alpha) u.alpha.material.emissiveIntensity = 0.34 + Math.sin(time * 1.3) * 0.08;
    }
    if (groundGlow) {
      groundGlow.material.opacity = 0.13 + Math.sin(time * 0.7) * 0.025;
    }
    if (treeLights) {
      treeLights.material.opacity = 0.68 + Math.sin(time * 1.4) * 0.05;
    }
    if (ambientDust) ambientDust.rotation.y = time * 0.003;
    updateSnow(dt, time);
  }

  function updateFocusT(dt) {
    for (const o of ornaments) {
      if (o.selected) {
        o.focusT = damp(o.focusT, 1, 3.7, dt);
        updateOrnamentFocus(o, o.focusT);
      } else if (o.focusT > 0.002) {
        o.focusT = damp(o.focusT, 0, 8, dt);
        updateOrnamentFocus(o, o.focusT);
      }
    }
  }

  function updateLighting(dt) {
    if (!env.key) return;
    const focusTarget = (state.mode === 'focus' || state.mode === 'focusing') ? 1 : 0;
    state.lightFocus = damp(state.lightFocus, focusTarget, 2.6, dt);
    const f = state.lightFocus;
    env.key.intensity = lerp(2.35, 1.3, f);
    env.rim.intensity = lerp(2.55, 1.6, f);
    env.fill.intensity = lerp(0.9, 0.72, f);
    env.spot.intensity = lerp(64, 12, f);
    env.innerWarm.intensity = lerp(7.2, 1.5, f);
    env.innerCool.intensity = lerp(4.8, 1.25, f);
    env.focusFill.intensity = 3.1 * f;
    if (state.selected) {
      env.focusFill.position.copy(camera.position).addScaledVector(UP, 1.3);
      env.focusFill.target.position.copy(state.selected.centerWorld);
      env.focusFill.target.updateMatrixWorld();
    }
    if (els.focusShade && state.selected) {
      const p = tmpV.copy(state.selected.centerWorld).project(camera);
      const x = clamp((p.x + 1) * 50, 8, 92);
      const y = clamp((1 - p.y) * 50, 8, 92);
      els.focusShade.style.setProperty('--fx', x.toFixed(1) + '%');
      els.focusShade.style.setProperty('--fy', y.toFixed(1) + '%');
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    const rawDt = clock.getDelta();
    const dt = Math.min(rawDt, 0.05);
    const uiDt = Math.min(rawDt, 0.2);
    state.time += dt;
    const time = state.time;

    updateSpin(dt, performance.now());
    updateFocusT(dt);
    updateOrnamentPhysics(dt, time);
    updateCamera(uiDt);
    updateSceneAnimation(dt, time);
    updateLighting(dt);
    updateSelectionVisuals(time);

    for (const o of ornaments) {
      ornamentWorldCenter(o, o.centerWorld);
    }

    renderer.render(scene, camera);
  }

  /* ═══════════════════════════════════════════════════════════
     BOOT
     ═══════════════════════════════════════════════════════════ */

  function boot() {
    if (!DATA.length) {
      showWebGLError();
      return;
    }
    if (!initScene()) return;
    buildOrnaments();
    setBodyMode('index');
    renderIndex();
    bindEvents();
    onResize();

    renderer.compile(scene, camera);
    camera.position.set(0, 7, 20);
    animate();
    state.started = true;

    window.__CAMERA_TREE__ = {
      state,
      get camera() { return camera; },
      get tree() { return treeGroup; },
      get ornaments() { return ornaments; },
      beginFocus,
      exitFocus,
      finishReturn,
      DATA
    };

    let frames = 0;
    function waitForFrame() {
      frames++;
      if (frames > 2) {
        els.loader.classList.add('is-done');
        window.__TREE_READY__ = true;
      } else {
        requestAnimationFrame(waitForFrame);
      }
    }
    requestAnimationFrame(waitForFrame);
  }

  boot();

  // __MORE_APP__
})();
