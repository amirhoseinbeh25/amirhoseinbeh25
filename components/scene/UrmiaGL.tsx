"use client";

import { useEffect, useRef, useState } from "react";

/**
 * صحنه سه‌بعدی WebGL صفحه اصلی.
 *
 * ارتقای تدریجی است: صحنه CSS بلافاصله رندر می‌شود و این کامپوننت فقط
 * وقتی روی آن می‌نشیند که three.js بارگذاری شود و مرورگر WebGL داشته باشد.
 * پس اگر بارگذاری شکست بخورد یا کاربر prefers-reduced-motion داشته باشد،
 * صفحه همچنان تصویر کامل خودش را دارد.
 *
 * three.js با import پویا بارگذاری می‌شود تا از باندل اولیه بیرون بماند.
 *
 * محتوای صحنه: سطح دریاچه ارومیه به‌صورت مشبک با موج واقعی، پل میانگذر،
 * ذرات بلور نمک، رشته‌کوه‌های کم‌وجه اطراف و چرخ‌دنده مهندسی مکانیک.
 * دوربین هم به نشانگر و هم به اسکرول واکنش نشان می‌دهد.
 */
export function UrmiaGL({ onReady }: { onReady?: () => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      let THREE: typeof import("three");
      try {
        THREE = await import("three");
      } catch {
        if (!disposed) setFailed(true);
        return;
      }
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        });
      } catch {
        if (!disposed) setFailed(true);
        return;
      }

      const scene = new THREE.Scene();
      const accent = new THREE.Color("#6fd3c2");
      const rose = new THREE.Color("#f2a3b8");
      const salt = new THREE.Color("#dfeeff");
      const night = new THREE.Color("#06140f");

      scene.fog = new THREE.FogExp2(night.getHex(), 0.021);

      const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 400);
      const CAMERA_HOME = new THREE.Vector3(0, 11, 44);
      // نگاه به راستِ اجسام، تا صحنه سمت چپ کادر جمع شود و متن راست آزاد بماند
      const LOOK_X = 17;
      camera.position.copy(CAMERA_HOME);

      renderer.setClearColor(night, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
      el.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";

      // ---- سطح دریاچه: مشبک موج‌دار -------------------------------------
      const LAKE_W = 120;
      const LAKE_H = 190;
      const SEG_X = 78;
      const SEG_Y = 118;
      const lakeGeo = new THREE.PlaneGeometry(LAKE_W, LAKE_H, SEG_X, SEG_Y);
      lakeGeo.rotateX(-Math.PI / 2);
      const lakeBase = lakeGeo.attributes.position.array;

      /**
       * شکل کشیده دریاچه ارومیه: عرض در دو سر بیشتر و در تنگه میانی — جایی
       * که پل میانگذر از آن می‌گذرد — کمتر می‌شود. بیرون از خط ساحلی مقدار
       * صفر است و آن‌جا شبکه اصلاً کشیده نمی‌شود.
       */
      const shoreFalloff = (x: number, z: number) => {
        const t = z / (LAKE_H / 2); // -1..1 در راستای شمال-جنوب
        const width = 0.52 + 0.42 * Math.abs(t) - 0.3 * Math.exp(-(t * t) / 0.02);
        const r = Math.abs(x) / (LAKE_W / 2) / Math.max(width, 0.12);
        return Math.max(0, 1 - r * r);
      };

      const shore = new Float32Array(lakeBase.length / 3);
      for (let i = 0; i < shore.length; i++) {
        shore[i] = shoreFalloff(lakeBase[i * 3], lakeBase[i * 3 + 2]);
      }
      lakeGeo.setAttribute("aShore", new THREE.BufferAttribute(shore, 1));

      // موج روی GPU محاسبه می‌شود؛ حدود ۹۴۰۰ رأس هر فریم روی CPU هدررفت بود.
      // آلفا با فاصله از خط ساحلی محو می‌شود تا خودِ شکل دریاچه دیده شود.
      const lakeMat = new THREE.ShaderMaterial({
        wireframe: true,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(accent) },
          uFog: { value: 0.021 },
        },
        vertexShader: `
          attribute float aShore;
          uniform float uTime;
          varying float vShore;
          varying float vDepth;
          void main() {
            float wave =
              sin(position.x * 0.09 + uTime * 0.75) * 0.7 +
              sin(position.z * 0.06 - uTime * 0.55) * 0.9 +
              sin((position.x + position.z) * 0.04 + uTime * 0.35) * 0.6;
            vec3 p = position;
            p.y += wave * aShore;
            vShore = aShore;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uFog;
          varying float vShore;
          varying float vDepth;
          void main() {
            if (vShore <= 0.02) discard;
            float fog = 1.0 - exp(-uFog * uFog * vDepth * vDepth);
            float alpha = 0.62 * smoothstep(0.0, 0.35, vShore) * (1.0 - fog);
            if (alpha <= 0.01) discard;
            gl_FragColor = vec4(uColor, alpha);
          }
        `,
      });
      const lake = new THREE.Mesh(lakeGeo, lakeMat);
      lake.position.y = -6;
      scene.add(lake);

      // ---- پل میانگذر ----------------------------------------------------
      const bridgeGroup = new THREE.Group();
      const bridgeMat = new THREE.MeshBasicMaterial({
        color: salt,
        transparent: true,
        opacity: 0.3,
      });
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(62, 0.28, 1.2),
        bridgeMat,
      );
      deck.position.set(0, -4.4, 0);
      bridgeGroup.add(deck);
      for (let i = -4; i <= 4; i++) {
        const pier = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 3.2, 0.28),
          bridgeMat,
        );
        pier.position.set(i * 7.2, -6, 0);
        bridgeGroup.add(pier);
      }
      scene.add(bridgeGroup);

      // ---- چرخ‌دنده مهندسی مکانیک ---------------------------------------
      const gear = new THREE.Group();
      const gearMat = new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.55,
      });
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(7.4, 0.3, 10, 80),
        gearMat,
      );
      gear.add(ring);
      const hub = new THREE.Mesh(
        new THREE.TorusGeometry(2.1, 0.2, 8, 40),
        gearMat,
      );
      gear.add(hub);
      const toothGeo = new THREE.BoxGeometry(1, 1.75, 0.6);
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2;
        const tooth = new THREE.Mesh(toothGeo, gearMat);
        tooth.position.set(Math.cos(a) * 8.3, Math.sin(a) * 8.3, 0);
        tooth.rotation.z = a - Math.PI / 2;
        gear.add(tooth);
      }
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 5.4, 0.2),
          gearMat,
        );
        spoke.position.set(Math.cos(a) * 4.7, Math.sin(a) * 4.7, 0);
        spoke.rotation.z = a - Math.PI / 2;
        gear.add(spoke);
      }
      gear.position.set(-21, 15, -34);
      gear.rotation.x = 0.22;
      scene.add(gear);

      // ---- بلورهای مکعبی نمک ---------------------------------------------
      const saltGeo = new THREE.BoxGeometry(1, 1, 1);
      const saltEdges = new THREE.EdgesGeometry(saltGeo);
      const saltMat = new THREE.LineBasicMaterial({
        color: salt,
        transparent: true,
        opacity: 0.42,
      });
      const crystals: import("three").LineSegments[] = [];
      for (let i = 0; i < 26; i++) {
        const c = new THREE.LineSegments(saltEdges, saltMat);
        const s = 0.9 + Math.random() * 2.4;
        c.scale.setScalar(s);
        c.position.set(
          (Math.random() - 0.5) * 110,
          -2 + Math.random() * 26,
          (Math.random() - 0.5) * 150,
        );
        c.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        c.userData.spin = 0.06 + Math.random() * 0.16;
        c.userData.bob = Math.random() * Math.PI * 2;
        crystals.push(c);
        scene.add(c);
      }

      // ---- فلامینگوها: ذرات صورتی که آرام حرکت می‌کنند --------------------
      const flamCount = 40;
      const flamPos = new Float32Array(flamCount * 3);
      for (let i = 0; i < flamCount; i++) {
        flamPos[i * 3] = (Math.random() - 0.5) * 90;
        flamPos[i * 3 + 1] = -3 + Math.random() * 9;
        flamPos[i * 3 + 2] = (Math.random() - 0.5) * 130;
      }
      const flamGeo = new THREE.BufferGeometry();
      flamGeo.setAttribute("position", new THREE.BufferAttribute(flamPos, 3));
      const flamMat = new THREE.PointsMaterial({
        color: rose,
        size: 0.85,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
      });
      const flamingos = new THREE.Points(flamGeo, flamMat);
      scene.add(flamingos);

      // ---- رشته‌کوه‌های اطراف ---------------------------------------------
      const ridgeMat = new THREE.MeshBasicMaterial({
        color: accent,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      });
      const ridgeGeo = new THREE.PlaneGeometry(300, 70, 60, 10);
      ridgeGeo.rotateX(-Math.PI / 2);
      {
        const pos = ridgeGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const z = pos.getZ(i);
          const h =
            Math.sin(x * 0.07) * 6 +
            Math.sin(x * 0.021 + 1.7) * 10 +
            Math.cos(x * 0.13) * 3;
          pos.setY(i, Math.max(0, h) * (0.35 + (z + 35) / 70));
        }
        ridgeGeo.attributes.position.needsUpdate = true;
      }
      const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
      ridge.position.set(0, -7, -115);
      scene.add(ridge);

      // ---- ستاره‌ها --------------------------------------------------------
      const starCount = 320;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 320;
        starPos[i * 3 + 1] = 10 + Math.random() * 110;
        starPos[i * 3 + 2] = -220 + Math.random() * 240;
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.55,
        transparent: true,
        opacity: 0.6,
      });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      // ---- ورودی‌ها: نشانگر و اسکرول --------------------------------------
      let pointerX = 0;
      let pointerY = 0;
      let scrollT = 0; // ۰ بالای صفحه، ۱ انتهای هیرو

      const onPointerMove = (event: PointerEvent) => {
        pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
        pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
      };
      const onScroll = () => {
        const h = el.getBoundingClientRect();
        const span = Math.max(h.height, 1);
        scrollT = Math.min(1, Math.max(0, -h.top / span));
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(el);

      // صحنه فقط وقتی در دید است رندر می‌شود
      let visible = true;
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
        },
        { threshold: 0 },
      );
      io.observe(el);

      const onVisibility = () => {
        visible = !document.hidden;
      };
      document.addEventListener("visibilitychange", onVisibility);

      // ---- حلقه رندر ------------------------------------------------------
      const clock = new THREE.Clock();
      let camX = 0;
      let camY = 0;
      let frame = 0;
      let announced = false;

      const lakePos = lakeGeo.attributes.position;

      const tick = () => {
        frame = requestAnimationFrame(tick);
        if (!visible) return;

        const t = clock.getElapsedTime();

        // موج سطح دریاچه
        for (let i = 0; i < shore.length; i++) {
          const f = shore[i];
          if (f <= 0) {
            lakePos.setY(i, -14);
            continue;
          }
          const x = lakeBase[i * 3];
          const z = lakeBase[i * 3 + 2];
          const wave =
            Math.sin(x * 0.09 + t * 0.75) * 0.7 +
            Math.sin(z * 0.06 - t * 0.55) * 0.9 +
            Math.sin((x + z) * 0.04 + t * 0.35) * 0.6;
          lakePos.setY(i, wave * f - (1 - f) * 9);
        }
        lakePos.needsUpdate = true;

        gear.rotation.z = t * 0.16;
        stars.rotation.y = t * 0.006;

        for (const c of crystals) {
          c.rotation.x += c.userData.spin * 0.008;
          c.rotation.y += c.userData.spin * 0.011;
          c.position.y += Math.sin(t * 0.5 + c.userData.bob) * 0.004;
        }

        const fp = flamGeo.attributes.position;
        for (let i = 0; i < flamCount; i++) {
          const base = i * 3;
          fp.setY(base / 3, flamPos[base + 1] + Math.sin(t * 0.7 + i) * 0.5);
        }
        fp.needsUpdate = true;

        // دوربین: نشانگر آرام دنبال می‌شود، اسکرول آن را پایین و جلو می‌برد
        camX += (pointerX * 7 - camX) * 0.035;
        camY += (-pointerY * 4 - camY) * 0.035;

        camera.position.x = CAMERA_HOME.x + camX;
        camera.position.y = CAMERA_HOME.y + camY - scrollT * 12;
        camera.position.z = CAMERA_HOME.z - scrollT * 26;
        camera.lookAt(LOOK_X, -3 - scrollT * 3, -18);

        renderer.render(scene, camera);

        if (!announced) {
          announced = true;
          onReady?.();
        }
      };
      frame = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("scroll", onScroll);

        scene.traverse((obj) => {
          const mesh = obj as import("three").Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = mesh.material as
            | import("three").Material
            | import("three").Material[]
            | undefined;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        });
        saltEdges.dispose();
        saltGeo.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [onReady]);

  if (failed) return null;

  return (
    <div
      ref={mount}
      aria-hidden
      className="pointer-events-none absolute inset-0"
    />
  );
}
