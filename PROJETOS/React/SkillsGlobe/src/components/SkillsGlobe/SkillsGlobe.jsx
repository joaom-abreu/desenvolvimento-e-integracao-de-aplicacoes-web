import { useEffect, useMemo, useRef } from "react";
import "./SkillsGlobe.css";

/**
 * Globo 3D de habilidades, feito só com React + CSS + <canvas> 2D
 * (sem three.js e sem nenhuma biblioteca de 3D).
 *
 * Como funciona:
 *   1. Os ícones são espalhados numa esfera com a "espiral de Fibonacci".
 *   2. A cada quadro (requestAnimationFrame), cada ponto é girado nos eixos
 *      X e Y e projetado na tela com perspectiva (longe = menor e mais apagado).
 *   3. Os ícones são movidos direto no DOM (style.transform), sem re-render
 *      do React: 60 quadros por segundo sem custo.
 *   4. A grade da esfera (meridianos e paralelos) é desenhada num <canvas>.
 *
 * Arraste para girar (mouse ou dedo). Clique num ícone para abrir o link.
 *
 * <SkillsGlobe skills={SKILLS} />
 * <SkillsGlobe skills={SKILLS} speed={0.2} color="#005380" />
 */

const DRAG_THRESHOLD = 6; // px: acima disso o clique vira arrasto e não abre o link
const MAX_TILT = 1.1; // rad: limite da inclinação vertical
const GRID_STEPS = 64; // pontos por linha da grade

// Espiral de Fibonacci: N pontos bem distribuídos numa esfera de raio 1
function fibonacciSphere(n) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
  });
}

// Linhas da grade: 6 meridianos + 5 paralelos (pontos 3D na esfera de raio 1)
function sphereGrid() {
  const lines = [];
  for (let m = 0; m < 6; m += 1) {
    const lon = (m / 6) * Math.PI;
    lines.push(
      Array.from({ length: GRID_STEPS + 1 }, (_, i) => {
        const t = (i / GRID_STEPS) * Math.PI * 2;
        return { x: Math.cos(t) * Math.cos(lon), y: Math.sin(t), z: Math.cos(t) * Math.sin(lon) };
      })
    );
  }
  for (const lat of [-60, -30, 0, 30, 60]) {
    const phi = (lat * Math.PI) / 180;
    lines.push(
      Array.from({ length: GRID_STEPS + 1 }, (_, i) => {
        const t = (i / GRID_STEPS) * Math.PI * 2;
        return { x: Math.cos(phi) * Math.cos(t), y: Math.sin(phi), z: Math.cos(phi) * Math.sin(t) };
      })
    );
  }
  return lines;
}
const GRID = sphereGrid();

// Gira o ponto em Y (horizontal) e depois em X (vertical)
function rotate(p, rx, ry) {
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const x1 = p.x * cosY - p.z * sinY;
  const z1 = p.x * sinY + p.z * cosY;
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  return { x: x1, y: p.y * cosX - z1 * sinX, z: p.y * sinX + z1 * cosX };
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function SkillsGlobe({ skills, speed = 0.15, color = "#005380" }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const itemsRef = useRef([]);
  const points = useMemo(() => fibonacciSphere(skills.length), [skills.length]);

  // Estado da animação em refs: muda 60x por segundo e não precisa de re-render
  const motion = useRef({
    rx: -0.3, // inclinação
    ry: 0, // giro
    vx: 0, // velocidade do arrasto (inércia)
    vy: 0,
    dragging: false,
    hover: false,
    start: null,
    last: null,
    moved: 0,
  });

  /* -------------------------------------------------------------
     Loop de animação
     ------------------------------------------------------------- */
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = prefersReducedMotion();
    const m = motion.current;
    let frame = 0;
    let lastTime = performance.now();
    let visible = true;

    // Para de animar quando o globo sai da tela
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(stage);

    const draw = (now) => {
      frame = requestAnimationFrame(draw);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (!visible) return;

      // Giro automático (mais lento com o mouse em cima) + inércia do arrasto
      if (!m.dragging) {
        if (!reduced) m.ry += speed * dt * (m.hover ? 0.25 : 1);
        m.ry += m.vy;
        m.rx = Math.max(-MAX_TILT, Math.min(MAX_TILT, m.rx + m.vx));
        m.vx *= 0.92;
        m.vy *= 0.92;
      }

      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const radius = Math.min(width, height) * 0.38;
      const camera = radius * 4.2; // distância da câmera: menor = perspectiva mais forte
      const cx = width / 2;
      const cy = height / 2;

      // Projeção 3D → 2D com perspectiva
      const project = (p) => {
        const r = rotate(p, m.rx, m.ry);
        const scale = camera / (camera - r.z * radius);
        return { x: cx + r.x * radius * scale, y: cy + r.y * radius * scale, z: r.z, scale };
      };

      /* ---------- grade no canvas ---------- */
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Halo atrás da esfera
      const halo = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.25);
      halo.addColorStop(0, `${color}14`);
      halo.addColorStop(1, `${color}00`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 1;
      ctx.strokeStyle = color;
      for (const line of GRID) {
        let prev = project(line[0]);
        for (let i = 1; i < line.length; i += 1) {
          const cur = project(line[i]);
          // Frente da esfera mais forte, fundo bem fraco
          ctx.globalAlpha = (prev.z + cur.z) / 2 > 0 ? 0.28 : 0.07;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(cur.x, cur.y);
          ctx.stroke();
          prev = cur;
        }
      }
      ctx.globalAlpha = 1;

      /* ---------- ícones no DOM ---------- */
      points.forEach((p, i) => {
        const el = itemsRef.current[i];
        if (!el) return;
        const { x, y, z, scale } = project(p);
        const depth = (z + 1) / 2; // 0 = atrás, 1 = na frente
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${(0.62 + 0.38 * depth) * scale})`;
        el.style.opacity = String(0.2 + 0.8 * depth ** 1.5);
        el.style.zIndex = String(Math.round(depth * 100));
        el.style.pointerEvents = depth > 0.45 ? "auto" : "none";
        // Ícones atrás do globo saem da ordem do Tab
        el.tabIndex = depth > 0.45 ? 0 : -1;
      });
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [points, speed, color]);

  /* -------------------------------------------------------------
     Arrastar para girar (mouse, caneta ou dedo)
     ------------------------------------------------------------- */
  const onPointerDown = (e) => {
    const m = motion.current;
    m.dragging = true;
    m.start = { x: e.clientX, y: e.clientY };
    m.last = { x: e.clientX, y: e.clientY };
    m.moved = 0;
    m.vx = 0;
    m.vy = 0;
  };

  const onPointerMove = (e) => {
    const m = motion.current;
    if (!m.dragging) return;
    const dx = e.clientX - m.last.x;
    const dy = e.clientY - m.last.y;
    m.last = { x: e.clientX, y: e.clientY };
    m.moved = Math.hypot(e.clientX - m.start.x, e.clientY - m.start.y);
    // Só "captura" o ponteiro depois de arrastar de verdade: o clique no ícone continua funcionando
    if (m.moved > DRAG_THRESHOLD && !stageRef.current.hasPointerCapture(e.pointerId)) {
      stageRef.current.setPointerCapture(e.pointerId);
    }
    m.ry += dx * 0.006;
    m.rx = Math.max(-MAX_TILT, Math.min(MAX_TILT, m.rx - dy * 0.006));
    m.vy = dx * 0.006;
    m.vx = -dy * 0.006;
  };

  const onPointerUp = () => {
    motion.current.dragging = false;
  };

  // Depois de um arrasto, o "click" que vem junto não abre o link
  const onClickCapture = (e) => {
    if (motion.current.moved > DRAG_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={stageRef}
      className="skills-globe"
      style={{ "--globe-color": color }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={() => (motion.current.hover = true)}
      onPointerLeave={() => {
        motion.current.hover = false;
        motion.current.dragging = false;
      }}
      onClickCapture={onClickCapture}
    >
      <canvas ref={canvasRef} className="skills-globe-canvas" aria-hidden="true" />

      <ul className="skills-globe-layer" aria-label="Habilidades">
        {skills.map((skill, i) => {
          const Icon = skill.icon;
          return (
            <li key={skill.name}>
              <a
                ref={(el) => {
                  itemsRef.current[i] = el;
                }}
                className="skills-globe-item"
                style={{ "--skill": skill.color }}
                href={skill.link}
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                aria-label={skill.name}
              >
                <Icon aria-hidden="true" />
                <span className="skills-globe-label">{skill.name}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
