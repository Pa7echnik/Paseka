import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useSettings } from "../hooks/useSettings";

function makeSprite(hex: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, hex);
  grad.addColorStop(0.35, hex + "77");
  grad.addColorStop(1, hex + "00");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

interface Cloud {
  points: THREE.Points;
  base: Float32Array;
  speed: Float32Array;
  drift: number;
}

/**
 * Атмосферный фон: два слоя парящих частиц (тёплые искры + холодная пыль),
 * медленный дрейф и параллакс от курсора. При выключенном движении —
 * отрисовывается один статичный кадр.
 */
export function Atmosphere() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { settings } = useSettings();
  const { theme, motion } = settings;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const warm = theme === "ink" ? "#c2875a" : "#8a5a33";
    const cool = theme === "ink" ? "#9fb2bd" : "#4c6a7c";

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.z = 70;

    const build = (color: string, count: number, size: number, opacity: number): Cloud => {
      const geo = new THREE.BufferGeometry();
      const base = new Float32Array(count * 3);
      const speed = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        base[i * 3] = (Math.random() - 0.5) * 170;
        base[i * 3 + 1] = (Math.random() - 0.5) * 120;
        base[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
        speed[i] = 0.02 + Math.random() * 0.05;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(base.slice(), 3));
      const mat = new THREE.PointsMaterial({
        map: makeSprite(color),
        size,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geo, mat);
      scene.add(points);
      return { points, base, speed, drift: 0.0006 + Math.random() * 0.0006 };
    };

    const ember = build(warm, 110, 1.7, theme === "ink" ? 0.5 : 0.35);
    const dust = build(cool, 150, 1.1, theme === "ink" ? 0.32 : 0.22);

    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (!motion) renderer.render(scene, camera);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let t = 0;

    const stepCloud = (c: Cloud, dir: 1 | -1) => {
      const pos = c.points.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3 + 1] += c.speed[i] * dir;
        if (dir > 0 && arr[i * 3 + 1] > 62) arr[i * 3 + 1] = -62;
        if (dir < 0 && arr[i * 3 + 1] < -62) arr[i * 3 + 1] = 62;
      }
      pos.needsUpdate = true;
      c.points.rotation.y += c.drift * 0.1;
    };

    const frame = () => {
      t += 0.008;
      stepCloud(ember, 1);
      stepCloud(dust, -1);
      ember.points.rotation.y = Math.sin(t * 0.4) * 0.05;
      dust.points.rotation.y = Math.cos(t * 0.3) * 0.04;
      camera.position.x += (mouse.x * 5 - camera.position.x) * 0.03;
      camera.position.y += (-mouse.y * 3.5 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };

    if (motion) {
      raf = requestAnimationFrame(frame);
    } else {
      camera.position.set(0, 0, 70);
      renderer.render(scene, camera);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      scene.traverse((o) => {
        if (o instanceof THREE.Points) {
          o.geometry.dispose();
          (o.material as THREE.PointsMaterial).map?.dispose();
          (o.material as THREE.PointsMaterial).dispose();
        }
      });
      renderer.dispose();
    };
  }, [theme, motion]);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
