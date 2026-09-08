import * as THREE from "three";

const CONFIG = {
  width: 1.15,
  height: 1.7,
  maxDepth: 0.45,
  segmentsX: 48,
  segmentsY: 48,
  sealSide: 0.08,
  sealTop: 0.12,
  sealBottom: 0.08,
  colors: {
    kraftBase: "#c59161",
    kraftDark: "#a37042",
    labelWhite: "#faf9f5",
    textDark: "#2c3325",
    greenDot: "#2e7d32"
  }
};

// --- Math & Geometry ---
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function createDoypackGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BoxGeometry(
    CONFIG.width, CONFIG.height, 0.01, 
    CONFIG.segmentsX, CONFIG.segmentsY, 2
  );
  
  const pos = geom.attributes.position;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    vertex.fromBufferAttribute(pos, i);
    const nx = vertex.x / (CONFIG.width / 2);
    const ny = vertex.y / (CONFIG.height / 2);
    const isFront = vertex.z > 0 ? 1 : -1;
    
    if (Math.abs(vertex.z) < 0.001) continue; 

    const absNx = Math.abs(nx);
    let zScale = 1.0;

    if (absNx > 1.0 - CONFIG.sealSide) {
      zScale = 0.02; 
    } else {
      const t = (1.0 - CONFIG.sealSide - absNx) / (1.0 - CONFIG.sealSide);
      zScale = Math.sin(t * Math.PI / 2); 
    }

    if (ny > 1.0 - CONFIG.sealTop || ny < -1.0 + CONFIG.sealBottom) {
      zScale = Math.min(zScale, 0.02);
    } else {
      const mappedY = (ny - (-1.0 + CONFIG.sealBottom)) / ((1.0 - CONFIG.sealTop) - (-1.0 + CONFIG.sealBottom));
      const profile = (1.0 - Math.pow(mappedY, 1.8)) * 1.2 + 0.05;
      zScale *= profile;
    }

    const finalZ = isFront * (CONFIG.maxDepth / 2) * zScale;
    let finalY = vertex.y;
    if (ny < -1.0 + CONFIG.sealBottom + 0.1 && zScale > 0.1) {
       finalY += (zScale * 0.05); 
    }

    pos.setXYZ(i, vertex.x, finalY, finalZ);
  }

  geom.computeVertexNormals();
  return geom;
}

// --- High-Performance GPU-Accelerated Canvas Textures ---

const yieldThread = () => new Promise(r => setTimeout(r, 0));

function createFastNoiseCanvas(size: number, alpha: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const imgData = ctx.createImageData(size, size);
  const buf = new Uint32Array(imgData.data.buffer);
  
  for (let i = 0; i < buf.length; i++) {
    const v = (Math.random() * 255) | 0;
    buf[i] = (255 << 24) | (v << 16) | (v << 8) | v;
  }
  
  ctx.putImageData(imgData, 0, 0);

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = size;
  finalCanvas.height = size;
  const fCtx = finalCanvas.getContext("2d");
  if (fCtx) {
    fCtx.fillStyle = "#fff";
    fCtx.fillRect(0, 0, size, size);
    fCtx.globalAlpha = alpha;
    fCtx.drawImage(canvas, 0, 0);
  }
  return finalCanvas;
}

// Converted to async to chunk drawing tasks
async function createAlbedoTextureAsync(): Promise<THREE.CanvasTexture> {
  // Reduced to 1024x1024 (4x faster than 2048, looks identical on web)
  const width = 1024;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Base Kraft
  ctx.fillStyle = CONFIG.colors.kraftBase;
  ctx.fillRect(0, 0, width, height);

  const aoGradient = ctx.createRadialGradient(width/2, height/2, height*0.2, width/2, height/2, height*0.8);
  aoGradient.addColorStop(0, "rgba(0,0,0,0)");
  aoGradient.addColorStop(1, "rgba(70,40,20,0.15)");
  ctx.fillStyle = aoGradient;
  ctx.fillRect(0, 0, width, height);
  
  await yieldThread(); // YIELD

  // 2. Heat Seals
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 2;
  const topCrimpY = height * 0.04;
  for(let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(width * 0.02, topCrimpY + (i * 6));
    ctx.lineTo(width * 0.98, topCrimpY + (i * 6));
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(width * 0.05, height * 0.12);
  ctx.lineTo(width * 0.95, height * 0.12);
  ctx.stroke();
  
  ctx.fillStyle = "#fffcf7"; 
  ctx.beginPath();
  ctx.arc(width * 0.01, height * 0.09, 8, 0, Math.PI*2);
  ctx.arc(width * 0.99, height * 0.09, 8, 0, Math.PI*2);
  ctx.fill();

  await yieldThread(); // YIELD

  // 3. Label Base
  const lWidth = width * 0.70;
  const lHeight = height * 0.58;
  const lX = (width - lWidth) / 2;
  const lY = height * 0.25;

  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = CONFIG.colors.labelWhite;
  ctx.beginPath();
  ctx.roundRect(lX, lY, lWidth, lHeight, 10);
  ctx.fill();
  ctx.shadowBlur = 0; 

  ctx.strokeStyle = CONFIG.colors.textDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(lX + 12, lY + 12, lWidth - 24, lHeight - 24);
  ctx.stroke();
  
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(lX + 16, lY + 16, lWidth - 32, lHeight - 32);
  ctx.stroke();

  await yieldThread(); // YIELD

  // 4. Typography
  ctx.fillStyle = CONFIG.colors.textDark;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cx = width / 2;

  ctx.font = "italic 400 16px Georgia, serif";
  ctx.fillText("EST. 2024", cx, lY + 40);

  ctx.font = "italic 600 32px Georgia, serif";
  ctx.fillText("NIRVANA REPUBLIC", cx, lY + 80);
  
  ctx.font = "400 12px 'Trebuchet MS', sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("WELLNESS COLLECTIVE", cx, lY + 110);
  ctx.letterSpacing = "0px";

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 80, lY + 140);
  ctx.lineTo(cx + 80, lY + 140);
  ctx.stroke();

  ctx.font = "400 42px Georgia, serif";
  ctx.fillText("ASHWAGANDHA", cx, lY + 200);
  ctx.fillText("POWDER", cx, lY + 250);

  ctx.font = "italic 400 18px Georgia, serif";
  ctx.fillText("Premium Ayurvedic Herb", cx, lY + 310);

  const dotX = lX + 40;
  const dotY = lY + lHeight - 40;
  ctx.strokeStyle = CONFIG.colors.greenDot;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(dotX - 12, dotY - 12, 24, 24);
  ctx.stroke();
  ctx.fillStyle = CONFIG.colors.greenDot;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 6, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = CONFIG.colors.textDark;
  ctx.font = "600 14px sans-serif";
  ctx.fillText("100g", lX + lWidth - 40, dotY);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

async function createOptimizedBumpAndRoughnessMapsAsync(): Promise<{ bump: THREE.CanvasTexture, roughness: THREE.CanvasTexture }> {
  const size = 512; // Reduced size for performance
  const noiseCanvas = createFastNoiseCanvas(64, 0.15); 
  
  await yieldThread(); // YIELD

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = size; bumpCanvas.height = size;
  const bumpCtx = bumpCanvas.getContext("2d")!;
  
  bumpCtx.fillStyle = "#808080";
  bumpCtx.fillRect(0, 0, size, size);
  
  const pattern = bumpCtx.createPattern(noiseCanvas, 'repeat');
  if (pattern) {
    bumpCtx.fillStyle = pattern;
    bumpCtx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 20; i++) {
    bumpCtx.beginPath();
    bumpCtx.moveTo(Math.random() * size, Math.random() * size);
    bumpCtx.bezierCurveTo(Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size);
    bumpCtx.strokeStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    bumpCtx.lineWidth = 5 + Math.random() * 20;
    bumpCtx.lineCap = "round";
    bumpCtx.shadowBlur = 10;
    bumpCtx.shadowColor = bumpCtx.strokeStyle;
    bumpCtx.stroke();
  }

  await yieldThread(); // YIELD

  const roughCanvas = document.createElement("canvas");
  roughCanvas.width = size; roughCanvas.height = size;
  const roughCtx = roughCanvas.getContext("2d")!;
  
  roughCtx.fillStyle = "rgb(220, 220, 220)";
  roughCtx.fillRect(0, 0, size, size);
  
  if (pattern) {
    roughCtx.globalAlpha = 0.5;
    roughCtx.fillStyle = pattern;
    roughCtx.fillRect(0, 0, size, size);
    roughCtx.globalAlpha = 1.0;
  }

  const lWidth = size * 0.70;
  const lHeight = size * 0.58;
  const lX = (size - lWidth) / 2;
  const lY = size * 0.25;
  
  roughCtx.fillStyle = "rgb(150, 150, 150)"; 
  roughCtx.beginPath();
  roughCtx.roundRect(lX, lY, lWidth, lHeight, 8);
  roughCtx.fill();

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;

  const roughTex = new THREE.CanvasTexture(roughCanvas);

  return { bump: bumpTex, roughness: roughTex };
}

// --- Assembly ---
export async function createBagMeshAsync(
  geometries: THREE.BufferGeometry[], 
  materials: THREE.Material[], 
  textures: THREE.Texture[]
): Promise<THREE.Group> {
  
  const doypackGeom = createDoypackGeometry();
  geometries.push(doypackGeom);

  const albedoMap = await createAlbedoTextureAsync();
  const { bump, roughness } = await createOptimizedBumpAndRoughnessMapsAsync();
  textures.push(albedoMap, bump, roughness);

  await yieldThread(); // Final yield before compiling material

  const bagMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: albedoMap,
    bumpMap: bump,
    bumpScale: 0.02,
    roughnessMap: roughness,
    metalness: 0.0,
    clearcoat: 0.05, 
    clearcoatRoughness: 0.8,
    side: THREE.DoubleSide, 
  });
  
  const plainKraftCanvas = document.createElement("canvas");
  plainKraftCanvas.width = 64; plainKraftCanvas.height = 64;
  const pkCtx = plainKraftCanvas.getContext("2d")!;
  pkCtx.fillStyle = CONFIG.colors.kraftBase;
  pkCtx.fillRect(0,0,64,64);
  const plainKraftTex = new THREE.CanvasTexture(plainKraftCanvas);
  textures.push(plainKraftTex);

  const backMaterial = bagMaterial.clone();
  backMaterial.map = plainKraftTex;
  materials.push(bagMaterial, backMaterial);

  const materialArray = [
    backMaterial, backMaterial, backMaterial, backMaterial, 
    bagMaterial,  backMaterial  
  ];

  const bagGroup = new THREE.Group();
  const bagMesh = new THREE.Mesh(doypackGeom, materialArray);
  bagMesh.castShadow = true;
  bagMesh.receiveShadow = true;
  bagGroup.add(bagMesh);

  return bagGroup;
}