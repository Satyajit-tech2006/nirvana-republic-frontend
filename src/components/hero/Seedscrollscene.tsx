import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createBagMeshAsync } from "./BagModel"; 

type Vec3Tuple = readonly [number, number, number];

interface HeroCopyContent { eyebrow: string; title: string; description: string; ctaLabel: string; ctaHref: string; }
interface SeedInstanceData { spoutOffset: THREE.Vector3; bowlTarget: THREE.Vector3; arcHeight: number; pushStrength: number; delay: number; duration: number; scale: number; rotationAxis: THREE.Vector3; rotationSpeed: number; settleFrequency: number; settleDecay: number; colorVariant: number; }
interface SceneHandles {
  renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; packetPivot: THREE.Group;
  seedMesh: THREE.InstancedMesh; seedInstances: SeedInstanceData[]; contactShadowPacket: THREE.Mesh; contactShadowBowl: THREE.Mesh;
  spoutLocalOffset: THREE.Vector3; spoutDirLocal: THREE.Vector3; dummy: THREE.Object3D;
  tempSpoutWorld: THREE.Vector3; tempSpoutDir: THREE.Vector3; tempColor: THREE.Color; colorDark: THREE.Color; colorLight: THREE.Color;
  geometries: THREE.BufferGeometry[]; materials: THREE.Material[]; textures: THREE.Texture[];
}

const SEED_COUNT = 360;
const CAMERA_FOV = 44;

const POUR_TILT_START = 0.12;
const POUR_TILT_HOLD_END = 0.85;
const REST_TILT_RADIANS = -0.14;
const MAX_TILT_ADD_RADIANS = -1.15; 

const POUR_LIFT_Y = 1.1; 
const POUR_SHIFT_X = -0.4; 

const PACKET_WIDTH = 0.78;
const PACKET_HEIGHT = 1.9;
const PACKET_DEPTH = 0.34;
const PACKET_PIVOT: Vec3Tuple = [-1.35, -0.95, 0.15];

const BOWL_CENTER: Vec3Tuple = [1.2, -1.32, 0.3];
const BOWL_INNER_RADIUS = 0.92;
const BOWL_BASIN_Y_OFFSET = 0.12;

const COLORS = {
  ceramic: "#f7f4ed", 
  ceramicShadow: "#d4cdbc",
  seedDark: "#1a1612",
  seedLight: "#d19347",
  ambient: "#fff6e9",
} as const;

const HERO_COPY: HeroCopyContent = {
  eyebrow: "Ritual, reconnected",
  title: "Nourishment Poured With Intention",
  description: "Ceremonial seed blends, sun-dried and stone-milled in small batches, because wellness should feel like a ritual, not a routine.",
  ctaLabel: "Explore the ritual",
  ctaHref: "#collection",
};

// Math
function clamp01(value: number): number { return Math.min(1, Math.max(0, value)); }
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
function easeInOutCubic(t: number): number { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function easeOutCubic(t: number): number { return 1 - Math.pow(1 - t, 3); }
function easeOutBack(t: number): number { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleFibonacciDisk(index: number, total: number, radius: number, rng: () => number): THREE.Vector2 {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const r = radius * Math.sqrt((index + 0.5) / total);
  const theta = index * goldenAngle + rng() * 0.4;
  return new THREE.Vector2(Math.cos(theta) * r, Math.sin(theta) * r);
}

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

// Procedural 
function createBowlGeometry(): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0, 0), new THREE.Vector2(0.3, 0), new THREE.Vector2(0.34, 0.04),
    new THREE.Vector2(0.78, 0.07), new THREE.Vector2(1.18, 0.27), new THREE.Vector2(1.42, 0.5),
    new THREE.Vector2(1.52, 0.62), new THREE.Vector2(1.58, 0.65), new THREE.Vector2(1.62, 0.7),
    new THREE.Vector2(1.58, 0.75), new THREE.Vector2(1.5, 0.73), new THREE.Vector2(1.4, 0.69),
    new THREE.Vector2(1.32, 0.63),
  ];
  const geometry = new THREE.LatheGeometry(points, 48); 
  geometry.computeVertexNormals();
  return geometry;
}

function createSeedGeometry(): THREE.SphereGeometry {
  const geometry = new THREE.SphereGeometry(0.045, 12, 10);
  geometry.scale(1, 1.6, 0.62);
  geometry.computeVertexNormals();
  return geometry;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(20, 15, 10, 0.5)");
    gradient.addColorStop(0.5, "rgba(20, 15, 10, 0.16)");
    gradient.addColorStop(1, "rgba(20, 15, 10, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createStonewareFleckTexture(): THREE.CanvasTexture {
  const size = 128; 
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#8f8f8f";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 1.5 + 0.3;
      const v = Math.random() > 0.5 ? 40 : 210;
      ctx.fillStyle = `rgba(${v},${v},${v},0.6)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 12);
  texture.needsUpdate = true;
  return texture;
}

function generateSeedInstances(count: number, rng: () => number): SeedInstanceData[] {
  const instances: SeedInstanceData[] = [];
  const usableRadius = BOWL_INNER_RADIUS * 0.8;

  for (let i = 0; i < count; i++) {
    const disk = sampleFibonacciDisk(i, count, usableRadius, rng);
    const normalizedRadius = disk.length() / Math.max(usableRadius, 0.001);
    const stackHeight = (1 - Math.min(1, normalizedRadius)) * 0.22 + rng() * 0.06;

    const bowlTarget = new THREE.Vector3(BOWL_CENTER[0] + disk.x, BOWL_CENTER[1] + BOWL_BASIN_Y_OFFSET + stackHeight, BOWL_CENTER[2] + disk.y);
    const spoutOffset = new THREE.Vector3((rng() - 0.5) * 0.12, (rng() - 0.5) * 0.05, (rng() - 0.5) * 0.12);
    const delayBase = i / count;
    const delay = POUR_TILT_START + delayBase * (POUR_TILT_HOLD_END - POUR_TILT_START - 0.08);

    instances.push({
      spoutOffset, bowlTarget, arcHeight: 0.1 + rng() * 0.15, pushStrength: 0.8 + rng() * 0.6, delay, duration: 0.055 + rng() * 0.03, scale: 0.75 + rng() * 0.45,
      rotationAxis: new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize(), rotationSpeed: 2.0 + rng() * 4, settleFrequency: 10 + rng() * 5, settleDecay: 6 + rng() * 3, colorVariant: rng(),
    });
  }
  return instances;
}

// Animation
function computeTiltAngle(progress: number): number {
  if (progress <= POUR_TILT_START) {
    const t = easeInOutCubic(clamp01(progress / POUR_TILT_START));
    return lerp(REST_TILT_RADIANS, REST_TILT_RADIANS + MAX_TILT_ADD_RADIANS, t) + (Math.sin(t * Math.PI) * 0.05);
  }
  if (progress <= POUR_TILT_HOLD_END) {
    const span = POUR_TILT_HOLD_END - POUR_TILT_START;
    const wobbleT = span > 0 ? (progress - POUR_TILT_START) / span : 0;
    return REST_TILT_RADIANS + MAX_TILT_ADD_RADIANS + (Math.sin(wobbleT * Math.PI * 8) * 0.01);
  }
  const span = 1 - POUR_TILT_HOLD_END;
  const t = easeInOutCubic(clamp01(span > 0 ? (progress - POUR_TILT_HOLD_END) / span : 1));
  return lerp(REST_TILT_RADIANS + MAX_TILT_ADD_RADIANS, REST_TILT_RADIANS, t);
}

function computePacketPosition(progress: number): THREE.Vector3 {
  const pos = new THREE.Vector3(PACKET_PIVOT[0], PACKET_PIVOT[1], PACKET_PIVOT[2]);
  let t = 0;
  if (progress <= POUR_TILT_START) {
    t = easeInOutCubic(clamp01(progress / POUR_TILT_START));
  } else if (progress <= POUR_TILT_HOLD_END) {
    t = 1;
  } else {
    const span = 1 - POUR_TILT_HOLD_END;
    t = lerp(1, 0, easeInOutCubic(clamp01(span > 0 ? (progress - POUR_TILT_HOLD_END) / span : 1)));
  }
  const arc = Math.sin(t * Math.PI) * 0.05;
  pos.x += t * POUR_SHIFT_X;
  pos.y += t * POUR_LIFT_Y + arc;
  return pos;
}

function updateSeedInstanceMatrix(inst: SeedInstanceData, progress: number, elapsed: number, spoutWorld: THREE.Vector3, spoutDir: THREE.Vector3, dummy: THREE.Object3D): THREE.Matrix4 {
  const localT = clamp01((progress - inst.delay) / inst.duration);
  const hasStarted = progress >= inst.delay;
  const overshootWindow = 0.12;
  const overshoot = clamp01((progress - (inst.delay + inst.duration)) / overshootWindow);

  const arriveEase = easeOutCubic(localT);
  const omt = 1 - arriveEase;

  const p0x = spoutWorld.x + inst.spoutOffset.x; const p0y = spoutWorld.y + inst.spoutOffset.y; const p0z = spoutWorld.z + inst.spoutOffset.z;
  const p1x = p0x + spoutDir.x * inst.pushStrength; const p1y = p0y + spoutDir.y * inst.pushStrength; const p1z = p0z + spoutDir.z * inst.pushStrength;
  const p3x = inst.bowlTarget.x; const p3y = inst.bowlTarget.y; const p3z = inst.bowlTarget.z;
  const p2x = p3x; const p2y = Math.max(p0y, p3y) + inst.arcHeight; const p2z = p3z;

  const posX = omt * omt * omt * p0x + 3 * omt * omt * arriveEase * p1x + 3 * omt * arriveEase * arriveEase * p2x + arriveEase * arriveEase * arriveEase * p3x;
  const posY = omt * omt * omt * p0y + 3 * omt * omt * arriveEase * p1y + 3 * omt * arriveEase * arriveEase * p2y + arriveEase * arriveEase * arriveEase * p3y;
  const posZ = omt * omt * omt * p0z + 3 * omt * omt * arriveEase * p1z + 3 * omt * arriveEase * arriveEase * p2z + arriveEase * arriveEase * arriveEase * p3z;

  let settleY = 0, settleX = 0, settleZ = 0;
  if (overshoot > 0 && overshoot < 1) {
    const damping = Math.exp(-inst.settleDecay * overshoot);
    const oscillation = Math.sin(overshoot * inst.settleFrequency);
    settleY = damping * oscillation * 0.04;
    settleX = damping * oscillation * (inst.spoutOffset.x * 0.5);
    settleZ = damping * oscillation * (inst.spoutOffset.z * 0.5);
  }

  dummy.position.set(posX + settleX, posY + Math.abs(settleY), posZ + settleZ);
  const spinAmount = hasStarted ? elapsed * inst.rotationSpeed + overshoot * inst.rotationSpeed * 2 : 0;
  dummy.quaternion.setFromAxisAngle(inst.rotationAxis, spinAmount);
  
  const popIn = hasStarted ? Math.min(1, localT / 0.15) : 0;
  dummy.scale.setScalar(Math.max(0.0001, inst.scale * easeOutBack(popIn)));

  dummy.updateMatrix();
  return dummy.matrix;
}

function updateScene(handles: SceneHandles, progress: number, elapsed: number): void {
  handles.packetPivot.rotation.z = computeTiltAngle(progress);
  handles.packetPivot.position.copy(computePacketPosition(progress));
  handles.packetPivot.updateMatrixWorld(true);

  handles.tempSpoutWorld.copy(handles.spoutLocalOffset).applyMatrix4(handles.packetPivot.matrixWorld);
  handles.tempSpoutDir.copy(handles.spoutDirLocal).transformDirection(handles.packetPivot.matrixWorld).normalize();

  for (let i = 0; i < handles.seedInstances.length; i++) {
    const inst = handles.seedInstances[i];
    const matrix = updateSeedInstanceMatrix(inst, progress, elapsed, handles.tempSpoutWorld, handles.tempSpoutDir, handles.dummy);
    handles.seedMesh.setMatrixAt(i, matrix);
    handles.tempColor.copy(handles.colorDark).lerp(handles.colorLight, inst.colorVariant);
    handles.seedMesh.setColorAt(i, handles.tempColor);
  }

  handles.seedMesh.instanceMatrix.needsUpdate = true;
  if (handles.seedMesh.instanceColor) handles.seedMesh.instanceColor.needsUpdate = true;

  (handles.contactShadowPacket.material as THREE.MeshBasicMaterial).opacity = lerp(0.48, 0.16, clamp01(progress / POUR_TILT_START));
  (handles.contactShadowBowl.material as THREE.MeshBasicMaterial).opacity = lerp(0.35, 0.55, progress);

  handles.renderer.render(handles.scene, handles.camera);
}

// ---------------------------------------------------------------------------
// Async Scene Builder for Zero TBT
// ---------------------------------------------------------------------------
async function buildSceneAsync(container: HTMLDivElement, width: number, height: number): Promise<SceneHandles> {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, 0.1, 50);
  camera.position.set(0.22, 0.62, 6.8);
  camera.lookAt(new THREE.Vector3(-0.05, -0.55, 0.1));

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05; 
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const hemiLight = new THREE.HemisphereLight(new THREE.Color("#ffffff"), new THREE.Color("#443322"), 0.6);
  scene.add(hemiLight);
  const ambientLight = new THREE.AmbientLight(new THREE.Color(COLORS.ambient), 0.2);
  scene.add(ambientLight);
  const keyLight = new THREE.DirectionalLight(0xfff2e0, 2.5);
  keyLight.position.set(3.5, 6.0, 4.0);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xd8e2ee, 1.2);
  fillLight.position.set(-4.5, 2.0, -2.5);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0xffffff, 2.5);
  rimLight.position.set(-1.0, 5.0, -5.0);
  scene.add(rimLight);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const stonewareTexture = createStonewareFleckTexture();
  const shadowTexture = createContactShadowTexture();
  textures.push(stonewareTexture, shadowTexture);

  const ceramicMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(COLORS.ceramic),
    bumpMap: stonewareTexture,
    bumpScale: 0.0015,
    roughness: 0.1,
    metalness: 0.0,
    clearcoat: 1.0, 
    clearcoatRoughness: 0.05,
    ior: 1.52, 
  });
  const ceramicInnerMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(COLORS.ceramicShadow),
    bumpMap: stonewareTexture,
    bumpScale: 0.001,
    roughness: 0.4,
    side: THREE.BackSide,
  });
  materials.push(ceramicMaterial, ceramicInnerMaterial);

  const bowlGeometry = createBowlGeometry();
  geometries.push(bowlGeometry);

  const bowlMesh = new THREE.Mesh(bowlGeometry, ceramicMaterial);
  bowlMesh.position.set(BOWL_CENTER[0], BOWL_CENTER[1], BOWL_CENTER[2]);
  scene.add(bowlMesh);

  const bowlInnerMesh = new THREE.Mesh(bowlGeometry, ceramicInnerMaterial);
  bowlInnerMesh.position.copy(bowlMesh.position);
  bowlInnerMesh.scale.setScalar(0.94);
  scene.add(bowlInnerMesh);

  const packetPivot = new THREE.Group();
  packetPivot.position.set(PACKET_PIVOT[0], PACKET_PIVOT[1], PACKET_PIVOT[2]);
  packetPivot.rotation.z = REST_TILT_RADIANS;
  
  const bagMeshGroup = await createBagMeshAsync(geometries, materials, textures);
  packetPivot.add(bagMeshGroup);
  scene.add(packetPivot);

  const spoutLocalOffset = new THREE.Vector3(PACKET_WIDTH * 0.12, PACKET_HEIGHT * 0.98, PACKET_DEPTH * 0.15);
  const spoutDirLocal = new THREE.Vector3(0, 1, 0);

  const shadowGeometry = new THREE.PlaneGeometry(1, 1);
  geometries.push(shadowGeometry);
  const packetShadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.48 });
  const bowlShadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.35 });
  materials.push(packetShadowMaterial, bowlShadowMaterial);

  const contactShadowPacket = new THREE.Mesh(shadowGeometry, packetShadowMaterial);
  contactShadowPacket.rotation.x = -Math.PI / 2; contactShadowPacket.scale.set(1.6, 1.2, 1);
  contactShadowPacket.position.set(PACKET_PIVOT[0], PACKET_PIVOT[1] - 0.01, PACKET_PIVOT[2]);
  scene.add(contactShadowPacket);

  const contactShadowBowl = new THREE.Mesh(shadowGeometry, bowlShadowMaterial);
  contactShadowBowl.rotation.x = -Math.PI / 2; contactShadowBowl.scale.set(2.8, 2.2, 1);
  contactShadowBowl.position.set(BOWL_CENTER[0], BOWL_CENTER[1] - 0.01, BOWL_CENTER[2]);
  scene.add(contactShadowBowl);

  const seedGeometry = createSeedGeometry();
  geometries.push(seedGeometry);
  const seedMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.06 });
  materials.push(seedMaterial);
  
  const rng = createSeededRandom(20240613);
  const seedInstances = generateSeedInstances(SEED_COUNT, rng);
  const seedMesh = new THREE.InstancedMesh(seedGeometry, seedMaterial, SEED_COUNT);
  seedMesh.frustumCulled = false;
  scene.add(seedMesh);

  return {
    renderer, scene, camera, packetPivot, seedMesh, seedInstances, contactShadowPacket, contactShadowBowl,
    spoutLocalOffset, spoutDirLocal, dummy: new THREE.Object3D(), tempSpoutWorld: new THREE.Vector3(), tempSpoutDir: new THREE.Vector3(),
    tempColor: new THREE.Color(), colorDark: new THREE.Color(COLORS.seedDark), colorLight: new THREE.Color(COLORS.seedLight), geometries, materials, textures,
  };
}

// Lifecycle
function disposeScene(handles: SceneHandles | null, container: HTMLDivElement): void {
  if (!handles) return;
  if (container.contains(handles.renderer.domElement)) container.removeChild(handles.renderer.domElement);
  handles.geometries.forEach((g) => g.dispose()); handles.materials.forEach((m) => m.dispose()); handles.textures.forEach((t) => t.dispose());
  handles.renderer.dispose(); handles.renderer.forceContextLoss();
}

function computeScrollProgress(section: HTMLElement): number {
  const rect = section.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  if (total <= 0) return rect.top <= 0 ? 1 : 0;
  return clamp01(-rect.top / total);
}

export function SeedScrollScene() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const sceneHandlesRef = useRef<SceneHandles | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    let idleCallbackId: number;
    let timeoutId: NodeJS.Timeout;
    
    const container = containerRef.current;
    if (!container) return;
    if (!isWebGLAvailable()) { setWebglSupported(false); return; }

    const width = container.clientWidth || 600; const height = container.clientHeight || 500;
    
    let rafId: number | null = null;
    let targetProgress = 0, currentProgress = 0, lastTime = performance.now();
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;

    const initScene = async () => {
      try {
        const handles = await buildSceneAsync(container, width, height);
        if (isCancelled) { disposeScene(handles, container); return; }
        
        sceneHandlesRef.current = handles;
        setIsLoaded(true);

        const isStaticMode = reducedMotion || !sectionRef.current;
        if (isStaticMode) {
          updateScene(handles, 1, 0);
          resizeObserver = new ResizeObserver(() => {
            if (!containerRef.current || !sceneHandlesRef.current) return;
            const w = containerRef.current.clientWidth; const h = containerRef.current.clientHeight;
            if (w === 0 || h === 0) return;
            sceneHandlesRef.current.camera.aspect = w / h; sceneHandlesRef.current.camera.updateProjectionMatrix();
            sceneHandlesRef.current.renderer.setSize(w, h); updateScene(sceneHandlesRef.current, 1, 0);
          });
          resizeObserver.observe(container);
          return;
        }

        const sectionEl = sectionRef.current as HTMLElement;

        const handleScroll = () => { targetProgress = computeScrollProgress(sectionEl); };
        const tick = (time: number) => {
          rafId = requestAnimationFrame(tick);
          const delta = Math.min(0.05, (time - lastTime) / 1000);
          lastTime = time;
          currentProgress = lerp(currentProgress, targetProgress, Math.min(1, delta * 6));
          updateScene(handles, currentProgress, time / 1000);
        };

        const startLoop = () => { if (rafId === null) { lastTime = performance.now(); rafId = requestAnimationFrame(tick); } };
        const stopLoop = () => { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } };

        intersectionObserver = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) { handleScroll(); startLoop(); } else { stopLoop(); }
        }, { threshold: 0, rootMargin: "200px 0px 200px 0px" });
        intersectionObserver.observe(sectionEl);

        resizeObserver = new ResizeObserver(() => {
          if (!containerRef.current || !sceneHandlesRef.current) return;
          const w = containerRef.current.clientWidth; const h = containerRef.current.clientHeight;
          if (w === 0 || h === 0) return;
          sceneHandlesRef.current.camera.aspect = w / h; sceneHandlesRef.current.camera.updateProjectionMatrix();
          sceneHandlesRef.current.renderer.setSize(w, h); handleScroll();
        });
        resizeObserver.observe(container);

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); currentProgress = targetProgress; updateScene(handles, currentProgress, 0);

      } catch (error) {
        console.error("ThreeJS Initialization Failed:", error);
      }
    };

    // CRITICAL FIX: Ensure browser paints HTML before we begin heavy ThreeJS tasks
    const start = () => { if (!isCancelled) initScene(); };
    if ('requestIdleCallback' in window) {
      idleCallbackId = window.requestIdleCallback(start, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(start, 400); // Fallback for Safari
    }

    return () => {
      isCancelled = true;
      if (idleCallbackId) window.cancelIdleCallback(idleCallbackId);
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (intersectionObserver) intersectionObserver.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("scroll", () => { targetProgress = computeScrollProgress(sectionRef.current as HTMLElement); });
      disposeScene(sceneHandlesRef.current, container);
      sceneHandlesRef.current = null;
    };
  }, [reducedMotion]);

  const heroCopy = (
    <div className="relative z-10 max-w-xl">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#8f6a45]">{HERO_COPY.eyebrow}</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight text-[#2b2620] md:text-5xl">{HERO_COPY.title}</h1>
      <p className="mt-5 text-base leading-relaxed text-[#4a463d] md:text-lg">{HERO_COPY.description}</p>
      <a href={HERO_COPY.ctaHref} className="mt-8 inline-flex items-center justify-center rounded-full border border-[#2b2620] px-7 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[#2b2620] transition-colors duration-300 hover:bg-[#2b2620] hover:text-[#fffcf7]">
        {HERO_COPY.ctaLabel}
      </a>
      <div className={`absolute bottom-[-60px] left-0 flex items-center gap-3 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
         <div className="h-8 w-[1px] bg-[#2b2620]/30 animate-pulse"></div>
         <span className="text-[10px] font-medium uppercase tracking-widest text-[#2b2620]/50">Scroll to witness the ritual</span>
      </div>
    </div>
  );

  if (!webglSupported) {
    return (
      <section className="relative w-full bg-[#fffcf7]">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          {heroCopy}
          <div aria-hidden="true" className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-[#efebe1] shadow-sm md:aspect-[5/4]">
             <div className="absolute inset-0 flex items-center justify-center">
                 <p className="text-[#8f6a45]">WebGL not supported</p>
             </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[220vh] w-full bg-[#fffcf7] md:h-[280vh]">
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-2">
          {heroCopy}
          <div ref={containerRef} aria-hidden="true" className={`relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-[#efebe1]/40 transition-opacity duration-700 md:aspect-[5/4] ${isLoaded ? "opacity-100" : "opacity-0"}`} />
        </div>
      </div>
    </section>
  );
}

export default SeedScrollScene;