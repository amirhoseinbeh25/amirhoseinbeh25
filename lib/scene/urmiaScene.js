/**
 * صحنه سه‌بعدی دریاچه ارومیه.
 *
 * عمداً جاوااسکریپت خالص و بدون وابستگی به React است و `THREE` را به‌عنوان
 * ورودی می‌گیرد. به این ترتیب هم کامپوننت React سایت از آن استفاده می‌کند و
 * هم فایل پریویو تک‌فایلی، بدون اینکه کد صحنه دو نسخه شود.
 *
 * محتوای صحنه: سطح دریاچه با موج، پل میانگذر، جزایر، بلور مکعبی نمک،
 * فلامینگو، رشته‌کوه‌های اطراف و چرخ‌دنده مهندسی مکانیک. دوربین هم به
 * نشانگر و هم به موقعیت اسکرول واکنش نشان می‌دهد.
 *
 * @param {typeof import("three")} THREE
 * @param {HTMLElement} el ظرفی که بوم رندر داخلش می‌نشیند
 * @param {{ onReady?: () => void }} [options]
 * @returns {{ dispose: () => void } | null} اگر WebGL در دسترس نباشد null
 */
export function createUrmiaScene(THREE, el, options = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }

  const scene = new THREE.Scene();
  const accent = new THREE.Color("#6fd3c2");
  const rose = new THREE.Color("#f2a3b8");
  const salt = new THREE.Color("#dfeeff");
  const night = new THREE.Color("#06140f");

  const FOG = 0.021;
  scene.fog = new THREE.FogExp2(night.getHex(), FOG);

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

  // ---- سطح دریاچه ---------------------------------------------------------
  const LAKE_W = 120;
  const LAKE_H = 190;
  const lakeGeo = new THREE.PlaneGeometry(LAKE_W, LAKE_H, 78, 118);
  lakeGeo.rotateX(-Math.PI / 2);
  const lakeBase = lakeGeo.attributes.position.array;

  /**
   * شکل کشیده دریاچه ارومیه: عرض در دو سر بیشتر و در تنگه میانی — جایی که پل
   * میانگذر از آن می‌گذرد — کمتر می‌شود. بیرون از خط ساحلی صفر است.
   */
  const shoreFalloff = (x, z) => {
    const t = z / (LAKE_H / 2);
    const width = 0.52 + 0.42 * Math.abs(t) - 0.3 * Math.exp(-(t * t) / 0.02);
    const r = Math.abs(x) / (LAKE_W / 2) / Math.max(width, 0.12);
    return Math.max(0, 1 - r * r);
  };

  const shore = new Float32Array(lakeBase.length / 3);
  for (let i = 0; i < shore.length; i++) {
    shore[i] = shoreFalloff(lakeBase[i * 3], lakeBase[i * 3 + 2]);
  }
  lakeGeo.setAttribute("aShore", new THREE.BufferAttribute(shore, 1));

  // موج و محوشدن ساحل هر دو روی GPU: حدود ۹۴۰۰ رأس نباید هر فریم از
  // جاوااسکریپت بازنویسی شوند.
  const lakeMat = new THREE.ShaderMaterial({
    wireframe: true,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(accent) },
      uFog: { value: FOG },
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

  // ---- پل میانگذر ---------------------------------------------------------
  const bridgeMat = new THREE.MeshBasicMaterial({
    color: salt,
    transparent: true,
    opacity: 0.3,
  });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(62, 0.28, 1.2), bridgeMat);
  deck.position.set(0, -4.4, 0);
  scene.add(deck);
  const pierGeo = new THREE.BoxGeometry(0.28, 3.2, 0.28);
  for (let i = -4; i <= 4; i++) {
    const pier = new THREE.Mesh(pierGeo, bridgeMat);
    pier.position.set(i * 7.2, -6, 0);
    scene.add(pier);
  }

  // ---- چرخ‌دنده مهندسی مکانیک ---------------------------------------------
  const gear = new THREE.Group();
  const gearMat = new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.55,
  });
  gear.add(new THREE.Mesh(new THREE.TorusGeometry(7.4, 0.3, 10, 80), gearMat));
  gear.add(new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.2, 8, 40), gearMat));
  const toothGeo = new THREE.BoxGeometry(1, 1.75, 0.6);
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const tooth = new THREE.Mesh(toothGeo, gearMat);
    tooth.position.set(Math.cos(a) * 8.3, Math.sin(a) * 8.3, 0);
    tooth.rotation.z = a - Math.PI / 2;
    gear.add(tooth);
  }
  const spokeGeo = new THREE.BoxGeometry(0.2, 5.4, 0.2);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const spoke = new THREE.Mesh(spokeGeo, gearMat);
    spoke.position.set(Math.cos(a) * 4.7, Math.sin(a) * 4.7, 0);
    spoke.rotation.z = a - Math.PI / 2;
    gear.add(spoke);
  }
  gear.position.set(-21, 15, -34);
  gear.rotation.x = 0.22;
  scene.add(gear);

  // ---- بلورهای مکعبی نمک --------------------------------------------------
  const saltGeo = new THREE.BoxGeometry(1, 1, 1);
  const saltEdges = new THREE.EdgesGeometry(saltGeo);
  const saltMat = new THREE.LineBasicMaterial({
    color: salt,
    transparent: true,
    opacity: 0.42,
  });
  const crystals = [];
  for (let i = 0; i < 26; i++) {
    const c = new THREE.LineSegments(saltEdges, saltMat);
    c.scale.setScalar(0.9 + Math.random() * 2.4);
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

  // ---- فلامینگوها ---------------------------------------------------------
  const flamCount = 40;
  const flamHome = new Float32Array(flamCount * 3);
  for (let i = 0; i < flamCount; i++) {
    flamHome[i * 3] = (Math.random() - 0.5) * 90;
    flamHome[i * 3 + 1] = -3 + Math.random() * 9;
    flamHome[i * 3 + 2] = (Math.random() - 0.5) * 130;
  }
  const flamGeo = new THREE.BufferGeometry();
  flamGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(Float32Array.from(flamHome), 3),
  );
  const flamingos = new THREE.Points(
    flamGeo,
    new THREE.PointsMaterial({
      color: rose,
      size: 0.85,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    }),
  );
  scene.add(flamingos);

  // ---- رشته‌کوه‌های اطراف ---------------------------------------------------
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
    pos.needsUpdate = true;
  }
  const ridge = new THREE.Mesh(
    ridgeGeo,
    new THREE.MeshBasicMaterial({
      color: accent,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    }),
  );
  ridge.position.set(0, -7, -115);
  scene.add(ridge);

  // ---- ستاره‌ها -------------------------------------------------------------
  const starPos = new Float32Array(320 * 3);
  for (let i = 0; i < 320; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 320;
    starPos[i * 3 + 1] = 10 + Math.random() * 110;
    starPos[i * 3 + 2] = -220 + Math.random() * 240;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.55,
      transparent: true,
      opacity: 0.6,
    }),
  );
  scene.add(stars);

  // ---- ورودی‌ها -------------------------------------------------------------
  let pointerX = 0;
  let pointerY = 0;
  let scrollT = 0; // ۰ بالای صفحه، ۱ انتهای صحنه

  const onPointerMove = (event) => {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
  };
  const onScroll = () => {
    const rect = el.getBoundingClientRect();
    scrollT = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
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
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(el);

  // فقط وقتی صحنه در دید است رندر می‌شود
  let visible = true;
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
    threshold: 0,
  });
  io.observe(el);
  const onVisibility = () => (visible = !document.hidden);
  document.addEventListener("visibilitychange", onVisibility);

  // ---- حلقه رندر -----------------------------------------------------------
  const clock = new THREE.Clock();
  let camX = 0;
  let camY = 0;
  let frame = 0;
  let announced = false;

  const tick = () => {
    frame = requestAnimationFrame(tick);
    if (!visible) return;

    const t = clock.getElapsedTime();
    lakeMat.uniforms.uTime.value = t;
    gear.rotation.z = t * 0.16;
    stars.rotation.y = t * 0.006;

    for (const c of crystals) {
      c.rotation.x += c.userData.spin * 0.008;
      c.rotation.y += c.userData.spin * 0.011;
    }

    const fp = flamGeo.attributes.position;
    for (let i = 0; i < flamCount; i++) {
      fp.setY(i, flamHome[i * 3 + 1] + Math.sin(t * 0.7 + i) * 0.5);
    }
    fp.needsUpdate = true;

    // نشانگر آرام دنبال می‌شود، اسکرول دوربین را پایین و جلو می‌برد
    camX += (pointerX * 7 - camX) * 0.035;
    camY += (-pointerY * 4 - camY) * 0.035;
    camera.position.x = CAMERA_HOME.x + camX;
    camera.position.y = CAMERA_HOME.y + camY - scrollT * 12;
    camera.position.z = CAMERA_HOME.z - scrollT * 26;
    camera.lookAt(LOOK_X, -3 - scrollT * 3, -18);

    renderer.render(scene, camera);

    if (!announced) {
      announced = true;
      options.onReady?.();
    }
  };
  frame = requestAnimationFrame(tick);

  return {
    dispose() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      saltEdges.dispose();
      saltGeo.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
