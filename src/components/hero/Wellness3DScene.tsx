import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import heroFallback from "@/assets/hero.jpg";

export function Wellness3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isWebGLAvailable = () => {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
      } catch {
        return false;
      }
    };

    if (!isWebGLAvailable()) {
      setWebglSupported(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0.5, 7.5);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    setIsLoaded(true);

    const ambientLight = new THREE.AmbientLight(0xfdfbf7, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdce5dc, 1.1);
    fillLight.position.set(-5, -2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, 6, -4);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xe8dfd1,
      roughness: 0.85,
      metalness: 0.02,
    });
    materials.push(ceramicMat);

    const terracottaMat = new THREE.MeshStandardMaterial({
      color: 0xc46849,
      roughness: 0.75,
      metalness: 0.04,
    });
    materials.push(terracottaMat);

    const mossMat = new THREE.MeshStandardMaterial({
      color: 0x364838,
      roughness: 0.65,
      metalness: 0.05,
    });
    materials.push(mossMat);

    const seedMat = new THREE.MeshStandardMaterial({
      color: 0x222220,
      roughness: 0.4,
      metalness: 0.08,
    });
    materials.push(seedMat);

    const flaxMat = new THREE.MeshStandardMaterial({
      color: 0xc49a5b,
      roughness: 0.5,
      metalness: 0.05,
    });
    materials.push(flaxMat);

    const baseGeo = new THREE.CylinderGeometry(2.1, 2.3, 0.35, 48);
    geometries.push(baseGeo);
    const baseMesh = new THREE.Mesh(baseGeo, ceramicMat);
    baseMesh.position.set(0, -1.3, 0);
    baseMesh.rotation.set(0.1, 0.2, -0.05);
    rootGroup.add(baseMesh);

    const stoneGeo = new THREE.SphereGeometry(0.85, 36, 36);
    stoneGeo.scale(1, 1.22, 0.88);
    geometries.push(stoneGeo);
    const stoneMesh = new THREE.Mesh(stoneGeo, terracottaMat);
    stoneMesh.position.set(-0.55, -0.15, 0.2);
    stoneMesh.rotation.set(0.2, -0.3, 0.15);
    rootGroup.add(stoneMesh);

    const petalCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.8, 0),
      new THREE.Vector3(0.5, 0.2, 0.3),
      new THREE.Vector3(1.1, 1.2, -0.1),
      new THREE.Vector3(0.7, 1.9, -0.3),
    ]);
    const petalGeo = new THREE.TubeGeometry(petalCurve, 32, 0.16, 16, false);
    geometries.push(petalGeo);
    const petalMesh = new THREE.Mesh(petalGeo, mossMat);
    petalMesh.position.set(0.2, -0.4, -0.2);
    petalMesh.rotation.set(-0.15, 0.4, -0.2);
    rootGroup.add(petalMesh);

    const seedGeo = new THREE.SphereGeometry(0.12, 16, 16);
    seedGeo.scale(0.8, 1.4, 0.5);
    geometries.push(seedGeo);

    interface FloatingSeed {
      mesh: THREE.Mesh;
      initialPos: THREE.Vector3;
      speed: number;
      offset: number;
      rotSpeed: THREE.Vector3;
    }

    const floatingSeeds: FloatingSeed[] = [];
    const seedConfigs = [
      { pos: new THREE.Vector3(-1.4, 0.7, 0.6), mat: seedMat, speed: 1.1, offset: 0.2 },
      { pos: new THREE.Vector3(1.3, 0.9, 0.4), mat: flaxMat, speed: 0.9, offset: 1.4 },
      { pos: new THREE.Vector3(0.9, -0.4, 1.1), mat: seedMat, speed: 1.3, offset: 2.5 },
      { pos: new THREE.Vector3(-0.9, 1.4, -0.5), mat: flaxMat, speed: 0.8, offset: 3.1 },
      { pos: new THREE.Vector3(1.5, -0.7, -0.3), mat: seedMat, speed: 1.0, offset: 4.0 },
      { pos: new THREE.Vector3(-0.2, 1.7, 0.5), mat: flaxMat, speed: 1.2, offset: 5.2 },
    ];

    seedConfigs.forEach((cfg) => {
      const mesh = new THREE.Mesh(seedGeo, cfg.mat);
      mesh.position.copy(cfg.pos);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      rootGroup.add(mesh);

      floatingSeeds.push({
        mesh,
        initialPos: cfg.pos.clone(),
        speed: cfg.speed,
        offset: cfg.offset,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.01
        ),
      });
    });

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.45;
      targetY = y * 0.35;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        mouseX += (targetX - mouseX) * 0.04;
        mouseY += (targetY - mouseY) * 0.04;

        rootGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.08 + mouseX;
        rootGroup.rotation.x = Math.cos(elapsed * 0.2) * 0.04 - mouseY;

        stoneMesh.position.y = -0.15 + Math.sin(elapsed * 0.8) * 0.03;
        petalMesh.rotation.z = -0.2 + Math.sin(elapsed * 0.6) * 0.04;

        floatingSeeds.forEach((s) => {
          s.mesh.position.y =
            s.initialPos.y + Math.sin(elapsed * s.speed + s.offset) * 0.08;
          s.mesh.position.x =
            s.initialPos.x + Math.cos(elapsed * (s.speed * 0.7) + s.offset) * 0.04;
          s.mesh.rotation.x += s.rotSpeed.x;
          s.mesh.rotation.y += s.rotSpeed.y;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-secondary shadow-soft md:aspect-[5/4]">
        <img
          src={heroFallback}
          alt="Natural wellness ingredients and kraft packaging"
          width={1600}
          height={1104}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-secondary/40 shadow-soft md:aspect-[5/4]">
      <div
        ref={containerRef}
        className={`h-full w-full transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}