import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";

export const WIDTH = 920;
export const HEIGHT = 840;

// Base plate and world dimensions
export const PLATE = { x: -116, y: -86, w: 232, d: 172, r: 8 };
export const PLATE_H = 14;
export const FOOT_H = 5;

// 4 Guide column coordinates (NW, NE, SW, SE)
export const POSTS = [
  [-76, -54], // NW
  [76, -54],  // NE
  [-76, 54],  // SW
  [76, 54],   // SE
];
export const POST_R = 3.6;
export const POST_TOP = 246;

// Layer Frame dimensions (shared footprint for the 4 modular tiers)
export const FRAME = { x: -68, y: -48, w: 136, d: 96, r: 5 };
export const FRAME_H = 34;

// Base Z heights of the 4 layers in assembled (rest) state:
export const Z_L1 = 8;    // Capa 1: Persistencia & BD [8 .. 42]
export const Z_L2 = 62;   // Capa 2: Repositorio [62 .. 96]
export const Z_L3 = 116;  // Capa 3: Negocio / Servicio [116 .. 150]
export const Z_L4 = 170;  // Capa 4: Presentación / Controlador [170 .. 204]

// Exploded offsets multipliers (max ΔZ when explode factor = 1.0)
export const EXPLODE_DZ = [0, 24, 52, 80];

// Projection bounds covering rest and fully exploded state
export const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    ...POSTS.map(([x, y]) => [x, y, POST_TOP + 12]),
    [FRAME.x, FRAME.y, Z_L4 + FRAME_H + EXPLODE_DZ[3] + 28],
    [FRAME.x + FRAME.w, FRAME.y + FRAME.d, Z_L4 + FRAME_H + EXPLODE_DZ[3] + 28],
    [-90, 0, 140], // Ejection chute tip
  ],
  WIDTH,
  HEIGHT,
  { pad: 36, azimuth: 42, elevation: 30 }
);

export const at = (point) => k.iso(point, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const L = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const byDepth = (points) =>
  [...points].sort((a, b) => k.depthOf([a[0], a[1], a[2] ?? 0], P) - k.depthOf([b[0], b[1], b[2] ?? 0], P));

// Helpers for screws and circular bolt rings
export function boltCircle(cx, cy, radius, count, z, tone = "mid") {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count;
    pts.push(at([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle), z]));
  }
  return D(pts, { size: 0.55, tone });
}

export function verticalCoil(cx, cy, z0, z1, radius, turns, projection, perTurn = 20) {
  const count = Math.max(1, Math.round(turns * perTurn));
  const back = [];
  const front = [];
  let run = [];
  let near = null;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const angle = t * turns * Math.PI * 2;
    const z = z0 + (z1 - z0) * t;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const normal = [Math.cos(angle), Math.sin(angle), 0];
    const facing = k.depthOf(normal, projection) > 0;
    const flat = k.iso([x, y, z], projection);
    if (near === null) near = facing;
    if (facing !== near) {
      run.push(flat);
      (near ? front : back).push(k.pathOf(run));
      run = [flat];
      near = facing;
      continue;
    }
    run.push(flat);
  }
  if (run.length > 1) (near ? front : back).push(k.pathOf(run));
  return { back: back.join(""), front: front.join("") };
}

// --------------------------------------------------------------------------
// 1. BASE PLATE AND FEET (ESTRUCTURA DE BANCADA)
// --------------------------------------------------------------------------
export function buildBase() {
  const parts = [];

  // Soft halo underneath
  parts.push(`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`);

  // 4 Turned Feet at corners
  const footPositions = k.corners(PLATE, 20);
  for (const [x, y] of byDepth(footPositions)) {
    // Foot base pad (tone lo)
    parts.push(S(k.cylinder(x, y, 9, -PLATE_H - FOOT_H, 2.5, P, 28), { tone: "lo" }));
    // Turned foot pillar (tone mid)
    parts.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H + 2.5, FOOT_H - 2.5, P, 28), { tone: "mid" }));
    // Foot seam ring
    parts.push(L(k.sideArc(x, y, 7, -PLATE_H, P, 28), { tone: "faint" }));
  }

  // Base Plate Heavy Slab with bevel
  parts.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 6, 1.8), { tone: "mid" }));

  // Inset perimeter groove
  parts.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));

  // 4 Corner screws on base plate
  const screwPts = k.corners(PLATE, 9).map(([x, y]) => at([x, y, 0]));
  for (const [x, y] of k.corners(PLATE, 9)) {
    parts.push(L(k.ring(x, y, 2.2, 0, P, 16), { tone: "lo" }));
  }
  parts.push(D(screwPts, { size: 0.6, tone: "hi" }));

  // Front T-Slot guide tracks on the bedplate
  const tSlotY = PLATE.y + PLATE.d - 22;
  parts.push(
    L(
      k.pathOf([
        at([-80, tSlotY - 2, 0]),
        at([80, tSlotY - 2, 0]),
        at([80, tSlotY + 2, 0]),
        at([-80, tSlotY + 2, 0]),
      ], true),
      { tone: "lo" }
    )
  );
  parts.push(
    L(k.pathOf([at([-78, tSlotY, 0]), at([78, tSlotY, 0])]), { tone: "faint" })
  );

  // Front Ruler Strip with millimeter tick marks
  const strip = { x: -94, y: PLATE.y + PLATE.d - 12, w: 188, d: 6.5, r: 1 };
  parts.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.6, 0.6, [1.8, 3.4], P);
  parts.push(L(ticks.minor, { tone: "lo" }));
  parts.push(L(ticks.major, { tone: "mid" }));

  // Engraved Specification Label Plate (Placa del fabricante UNAMBA)
  const specPlate = { x: -44, y: PLATE.y + 7, w: 88, d: 18, r: 1.5 };
  parts.push(S(k.slabOf(specPlate, 0, 0.8, P, 4), { tone: "mid" }));
  parts.push(L(k.planOutline(k.insetPlan(specPlate, 1.4), 0.8, P), { tone: "faint" }));
  // Screws on spec plate
  parts.push(
    D(
      [
        at([specPlate.x + 3, specPlate.y + 3, 0.8]),
        at([specPlate.x + specPlate.w - 3, specPlate.y + 3, 0.8]),
        at([specPlate.x + 3, specPlate.y + specPlate.d - 3, 0.8]),
        at([specPlate.x + specPlate.w - 3, specPlate.y + specPlate.d - 3, 0.8]),
      ],
      { size: 0.45, tone: "mid" }
    )
  );
  // Three simulated engraved text rule lines
  parts.push(L(k.lineOnTop([specPlate.x + 10, specPlate.y + 5], [specPlate.x + specPlate.w - 10, specPlate.y + 5], 0.8, P), { tone: "lo", free: true }));
  parts.push(L(k.lineOnTop([specPlate.x + 10, specPlate.y + 9], [specPlate.x + specPlate.w - 18, specPlate.y + 9], 0.8, P), { tone: "lo", free: true }));
  parts.push(L(k.lineOnTop([specPlate.x + 10, specPlate.y + 13], [specPlate.x + specPlate.w - 26, specPlate.y + 13], 0.8, P), { tone: "lo", free: true }));

  // 4 Steel Guide Posts (Columnas guía cromadas)
  // Sort posts by depth so back posts paint first
  const sortedPosts = byDepth(POSTS);
  for (const [px, py] of sortedPosts) {
    // Post mounting collar at base
    parts.push(S(k.cylinder(px, py, 6, 0, 6, P, 28), { tone: "lo" }));
    parts.push(L(k.sideArc(px, py, 6, 6, P, 28), { tone: "faint" }));
    parts.push(boltCircle(px, py, 4.8, 4, 6, "faint"));

    // Solid Chrome Rod
    parts.push(S(k.cylinder(px, py, POST_R, 6, POST_TOP - 6, P, 28), { tone: "mid" }));

    // Registration line rings on the column at layer boundaries
    for (const zMark of [Z_L1, Z_L2, Z_L3, Z_L4]) {
      parts.push(L(k.sideArc(px, py, POST_R, zMark, P, 24), { tone: "faint" }));
    }

    // Top Knurled Retaining Cap Nut
    parts.push(S(k.cylinder(px, py, 5.2, POST_TOP, 8, P, 28), { tone: "hi" }));
    parts.push(L(k.knurl(px, py, 5.2, POST_TOP + 1, POST_TOP + 7, 24, P), { tone: "lo" }));
    parts.push(S(k.cylinder(px, py, 3.8, POST_TOP + 8, 3, P, 24), { tone: "mid" }));
    parts.push(D([at([px, py, POST_TOP + 11])], { size: 0.6, tone: "lit" }));
  }

  return parts.join("");
}

// --------------------------------------------------------------------------
// 2. CAPA 1: PERSISTENCIA & BASE DE DATOS (Z_L1 = 8)
// --------------------------------------------------------------------------
export function buildLayer1() {
  const parts = [];
  const z0 = Z_L1;

  // Main Tier Casing Block
  parts.push(S(k.slabOf(FRAME, z0, FRAME_H, P, 5, 1.4), { tone: "mid" }));

  // Side Cooling Ribs on left and right flanks
  for (let zRib = z0 + 6; zRib < z0 + FRAME_H - 4; zRib += 6) {
    parts.push(L(k.sideSeam(FRAME, zRib, P, 5), { tone: "faint" }));
  }

  // 4 Bronze Corner Guide Bushings
  for (const [px, py] of byDepth(POSTS)) {
    parts.push(S(k.cylinder(px, py, 5.8, z0 - 1.5, FRAME_H + 3, P, 28), { tone: "lo" }));
    parts.push(L(k.sideArc(px, py, 5.8, z0, P, 24), { tone: "faint" }));
    parts.push(L(k.sideArc(px, py, 5.8, z0 + FRAME_H, P, 24), { tone: "faint" }));
    parts.push(boltCircle(px, py, 4.6, 3, z0 + FRAME_H + 1.5, "lo"));
  }

  // Top Surface Recess and Center Gland Bushing (where plunger penetrates)
  parts.push(L(k.ring(0, 0, 16, z0 + FRAME_H, P, 32), { tone: "lo" }));
  parts.push(S(k.cylinder(0, 0, 9, z0 + FRAME_H, 2.8, P, 32), { tone: "hi" }));
  parts.push(L(k.ring(0, 0, 5, z0 + FRAME_H + 2.8, P, 24), { tone: "faint" }));

  // Storage Drum (Tambor Cilíndrico de Platos Magnéticos)
  // Located on the right side of the module top: cx = 22, cy = -4
  const drumX = 22, drumY = -4;
  parts.push(S(k.cylinder(drumX, drumY, 20, z0 + FRAME_H + 1, 10, P, 36), { tone: "mid" }));
  parts.push(L(k.knurl(drumX, drumY, 20, z0 + FRAME_H + 2, z0 + FRAME_H + 9, 32, P), { tone: "lo" }));
  // Stepped Platter Disc on top of drum
  parts.push(S(k.cylinder(drumX, drumY, 16, z0 + FRAME_H + 11, 2.5, P, 36), { tone: "hi" }));
  // Magnetic track divisions (concentric rings)
  parts.push(L(k.ring(drumX, drumY, 13, z0 + FRAME_H + 13.5, P, 32), { tone: "lo" }));
  parts.push(L(k.ring(drumX, drumY, 9, z0 + FRAME_H + 13.5, P, 28), { tone: "faint" }));
  parts.push(L(k.ring(drumX, drumY, 5, z0 + FRAME_H + 13.5, P, 20), { tone: "faint" }));
  // Sector tick marks
  const radTicks = k.radialTicks(drumX, drumY, 16, 16, 4, z0 + FRAME_H + 13.5, [1.5, 3.2], P);
  parts.push(L(radTicks.minor, { tone: "lo" }));
  parts.push(L(radTicks.major, { tone: "hi" }));
  // Center spindle nut
  parts.push(S(k.cylinder(drumX, drumY, 3, z0 + FRAME_H + 13.5, 3, P, 20), { tone: "lo" }));
  parts.push(D([at([drumX, drumY, z0 + FRAME_H + 16.5])], { size: 0.5, tone: "lit" }));

  // Stepper Motor and Worm Screw Drive (Mecanismo del Cabezal de Escritura)
  const motX = -36, motY = -6;
  parts.push(S(k.cylinder(motX, motY, 11, z0 + FRAME_H + 1, 9, P, 28), { tone: "lo" }));
  parts.push(L(k.sideArc(motX, motY, 11, z0 + FRAME_H + 6, P, 28), { tone: "faint" }));
  parts.push(boltCircle(motX, motY, 8.5, 4, z0 + FRAME_H + 10, "mid"));

  // Worm Screw Shaft crossing from motor to head
  parts.push(
    L(
      k.segment([motX + 11, motY, z0 + FRAME_H + 5], [drumX - 16, drumY, z0 + FRAME_H + 5], P),
      { tone: "hi" }
    )
  );

  // Read/Write Arm and Carriage (Dynamic part hookable or static baseline)
  const arm = { x: drumX - 18, y: drumY - 3, w: 10, d: 6, r: 1.2 };
  parts.push(S(k.slabOf(arm, z0 + FRAME_H + 11, 3.5, P, 3), { tone: "hi" }));
  parts.push(
    L(
      k.segment([arm.x + arm.w, arm.y + arm.d / 2, z0 + FRAME_H + 12], [drumX - 2, drumY, z0 + FRAME_H + 14], P),
      { tone: "lit" }
    )
  );
  parts.push(D([at([drumX - 2, drumY, z0 + FRAME_H + 14])], { size: 0.6, tone: "lit" }));

  // Transaction / WAL Counter Window on front bevel
  const winPlan = { x: -28, y: FRAME.y + FRAME.d - 2, w: 56, d: 2, r: 1 };
  parts.push(
    L(
      k.pathOf([
        at([winPlan.x, winPlan.y, z0 + 10]),
        at([winPlan.x + winPlan.w, winPlan.y, z0 + 10]),
        at([winPlan.x + winPlan.w, winPlan.y, z0 + 24]),
        at([winPlan.x, winPlan.y, z0 + 24]),
      ], true),
      { tone: "hi" }
    )
  );
  parts.push(
    L(
      k.pathOf([
        at([winPlan.x + 2, winPlan.y, z0 + 12]),
        at([winPlan.x + winPlan.w - 2, winPlan.y, z0 + 12]),
        at([winPlan.x + winPlan.w - 2, winPlan.y, z0 + 22]),
        at([winPlan.x + 2, winPlan.y, z0 + 22]),
      ], true),
      { tone: "lo" }
    )
  );
  // Engraved label plate above window
  parts.push(
    L(k.segment([winPlan.x + 6, winPlan.y, z0 + 27], [winPlan.x + winPlan.w - 6, winPlan.y, z0 + 27], P), {
      tone: "mid",
      free: true,
    })
  );

  return parts.join("");
}

// --------------------------------------------------------------------------
// 3. CAPA 2: REPOSITORIO (DATA MAPPER) (Z_L2 = 62)
// --------------------------------------------------------------------------
export function buildLayer2() {
  const parts = [];
  const z0 = Z_L2;

  // Main Tier Chassis Block
  parts.push(S(k.slabOf(FRAME, z0, FRAME_H, P, 5, 1.4), { tone: "mid" }));

  // Horizontal structural seam
  parts.push(L(k.sideSeam(FRAME, z0 + FRAME_H / 2, P, 5), { tone: "faint" }));

  // 4 Bronze Corner Guide Bushings
  for (const [px, py] of byDepth(POSTS)) {
    parts.push(S(k.cylinder(px, py, 5.8, z0 - 1.5, FRAME_H + 3, P, 28), { tone: "lo" }));
    parts.push(L(k.sideArc(px, py, 5.8, z0, P, 24), { tone: "faint" }));
    parts.push(L(k.sideArc(px, py, 5.8, z0 + FRAME_H, P, 24), { tone: "faint" }));
  }

  // Central Gland Collar
  parts.push(S(k.cylinder(0, 0, 11, z0 + FRAME_H, 3.2, P, 32), { tone: "hi" }));
  parts.push(L(k.ring(0, 0, 7, z0 + FRAME_H + 3.2, P, 28), { tone: "lo" }));

  // Barrel Cam / Rotatable Indexed Cam Drum (Tambor de Levas de Mapeo)
  // Center: [-18, 0], radius 16, height 18
  const camX = -18, camY = 0;
  parts.push(S(k.cylinder(camX, camY, 16, z0 + FRAME_H + 1, 16, P, 36), { tone: "mid" }));
  // Helical cam follower groove lines (representing entity mapping pathways)
  for (let zTrack = z0 + FRAME_H + 4; zTrack <= z0 + FRAME_H + 14; zTrack += 3.5) {
    parts.push(L(k.sideArc(camX, camY, 16, zTrack, P, 32), { tone: "hi" }));
  }
  // Cam Top Plate and Crown
  parts.push(S(k.cylinder(camX, camY, 13, z0 + FRAME_H + 17, 2.5, P, 32), { tone: "hi" }));
  parts.push(boltCircle(camX, camY, 10, 6, z0 + FRAME_H + 19.5, "mid"));

  // Oldham Decoupling Coupler (Junta mecánica de desacople / Abstracción de Interfaces)
  // Center: [22, -6], slotted sliding discs
  const coupX = 22, coupY = -6;
  parts.push(S(k.cylinder(coupX, coupY, 11, z0 + FRAME_H + 1, 4, P, 28), { tone: "lo" }));
  // Cross-slotted center disc (interfaz desacoplada)
  parts.push(S(k.cylinder(coupX, coupY, 9.5, z0 + FRAME_H + 5, 4, P, 28), { tone: "hi" }));
  parts.push(
    L(k.segment([coupX - 9, coupY, z0 + FRAME_H + 7], [coupX + 9, coupY, z0 + FRAME_H + 7], P), {
      tone: "lit",
    })
  );
  parts.push(
    L(k.segment([coupX, coupY - 9, z0 + FRAME_H + 7], [coupX, coupY + 9, z0 + FRAME_H + 7], P), {
      tone: "lit",
    })
  );
  // Upper interface hub
  parts.push(S(k.cylinder(coupX, coupY, 8, z0 + FRAME_H + 9, 3, P, 28), { tone: "mid" }));

  // Query Mode Selector Dial on the front face (SELECT / INSERT / FILTER)
  const dialPlan = { x: 12, y: FRAME.y + FRAME.d - 1, w: 22, d: 2, r: 1 };
  parts.push(
    L(
      k.pathOf([
        at([dialPlan.x, dialPlan.y, z0 + 12]),
        at([dialPlan.x + dialPlan.w, dialPlan.y, z0 + 12]),
        at([dialPlan.x + dialPlan.w, dialPlan.y, z0 + 28]),
        at([dialPlan.x, dialPlan.y, z0 + 28]),
      ], true),
      { tone: "hi" }
    )
  );
  // Circular Dial Ring on face
  const dialCenter = [dialPlan.x + dialPlan.w / 2, dialPlan.y, z0 + 20];
  parts.push(
    L(
      k.pathOf(
        Array.from({ length: 24 }, (_, i) => {
          const a = (i * 2 * Math.PI) / 24;
          return at([dialCenter[0] + 7 * Math.cos(a), dialCenter[1], dialCenter[2] + 7 * Math.sin(a)]);
        }),
        true
      ),
      { tone: "mid" }
    )
  );
  // Pointer indicating "INSERT / RESERVAR"
  parts.push(
    L(
      k.pathOf([
        at([dialCenter[0], dialCenter[1], dialCenter[2]]),
        at([dialCenter[0] + 5.2, dialCenter[1], dialCenter[2] + 4.8]),
      ]),
      { tone: "lit" }
    )
  );

  return parts.join("");
}

// --------------------------------------------------------------------------
// 4. CAPA 3: SERVICIO / NEGOCIO (REGLAS DE DOMINIO) (Z_L3 = 116)
// --------------------------------------------------------------------------
export function buildLayer3() {
  const parts = [];
  const z0 = Z_L3;

  // Main Tier Chassis Block
  parts.push(S(k.slabOf(FRAME, z0, FRAME_H, P, 5, 1.4), { tone: "mid" }));

  // Large Front Inspection Glass Aperture with Chamfered Recess
  const windowAperture = { x: -38, y: FRAME.y + FRAME.d - 2, w: 76, d: 2, r: 2 };
  parts.push(
    L(
      k.pathOf([
        at([windowAperture.x, windowAperture.y, z0 + 8]),
        at([windowAperture.x + windowAperture.w, windowAperture.y, z0 + 8]),
        at([windowAperture.x + windowAperture.w, windowAperture.y, z0 + 28]),
        at([windowAperture.x, windowAperture.y, z0 + 28]),
      ], true),
      { tone: "hi" }
    )
  );
  parts.push(
    L(
      k.pathOf([
        at([windowAperture.x + 2, windowAperture.y, z0 + 10]),
        at([windowAperture.x + windowAperture.w - 2, windowAperture.y, z0 + 10]),
        at([windowAperture.x + windowAperture.w - 2, windowAperture.y, z0 + 26]),
        at([windowAperture.x + 2, windowAperture.y, z0 + 26]),
      ], true),
      { tone: "lo" }
    )
  );

  // 4 Bronze Corner Guide Bushings
  for (const [px, py] of byDepth(POSTS)) {
    parts.push(S(k.cylinder(px, py, 5.8, z0 - 1.5, FRAME_H + 3, P, 28), { tone: "lo" }));
    parts.push(L(k.sideArc(px, py, 5.8, z0, P, 24), { tone: "faint" }));
    parts.push(L(k.sideArc(px, py, 5.8, z0 + FRAME_H, P, 24), { tone: "faint" }));
  }

  // Central Guide Gland with internal bypass trip gate
  parts.push(S(k.cylinder(0, 0, 11, z0 + FRAME_H, 3.5, P, 32), { tone: "hi" }));
  parts.push(boltCircle(0, 0, 8.5, 6, z0 + FRAME_H + 3.5, "mid"));

  // Micrometric Balance Mechanism & Spring Test Rig (Inspección de Reglas de Negocio)
  // Fulcrum Pivot Column: [-16, -10]
  const fulcX = -16, fulcY = -10;
  parts.push(S(k.cylinder(fulcX, fulcY, 5, z0 + FRAME_H + 1, 14, P, 24), { tone: "mid" }));
  parts.push(S(k.cylinder(fulcX, fulcY, 3.5, z0 + FRAME_H + 15, 3, P, 24), { tone: "hi" }));

  // Balance Beam (Brazo oscilante de balanza)
  const beamY = fulcY;
  parts.push(
    S(
      k.slabOf({ x: -32, y: beamY - 2.5, w: 48, d: 5, r: 1.2 }, z0 + FRAME_H + 16, 3, P, 3),
      { tone: "hi" }
    )
  );
  parts.push(D([at([fulcX, beamY, z0 + FRAME_H + 19])], { size: 0.6, tone: "lit" }));

  // Calibrated Helical Springs supporting the business rule balance
  const coil1 = verticalCoil(12, beamY, z0 + FRAME_H + 1, z0 + FRAME_H + 16, 3.4, 4.5, P);
  parts.push(L(coil1.back, { tone: "lo" }));
  parts.push(L(coil1.front, { tone: "hi" }));

  const coil2 = verticalCoil(-30, beamY, z0 + FRAME_H + 1, z0 + FRAME_H + 16, 3.4, 4.5, P);
  parts.push(L(coil2.back, { tone: "lo" }));
  parts.push(L(coil2.front, { tone: "hi" }));

  // Lateral Rejection Chute (Rampa de Descarte para 400 Bad Request / Sin Cupo)
  // Extends laterally to the left flank from x = -28 to x = -72
  const chuteStart = [-28, 6, z0 + FRAME_H + 3];
  const chuteMid = [-54, 12, z0 + FRAME_H - 4];
  const chuteEnd = [-82, 18, z0 + FRAME_H - 12];
  parts.push(
    L(
      k.pathOf([
        at(chuteStart),
        at(chuteMid),
        at(chuteEnd),
        at([chuteEnd[0], chuteEnd[1] + 6, chuteEnd[2]]),
        at([chuteMid[0], chuteMid[1] + 6, chuteMid[2]]),
        at([chuteStart[0], chuteStart[1] + 6, chuteStart[2]]),
      ], true),
      { tone: "hi" }
    )
  );
  // Chute side rims
  parts.push(L(k.segment(chuteStart, chuteEnd, P), { tone: "lit" }));
  parts.push(
    L(
      k.segment([chuteStart[0], chuteStart[1] + 6, chuteStart[2]], [chuteEnd[0], chuteEnd[1] + 6, chuteEnd[2]], P),
      { tone: "mid" }
    )
  );

  // Business Rule Feeler Gauge Needle (Galga de Cupos Disponibles)
  const gaugeCenter = [24, 0, z0 + FRAME_H + 8];
  parts.push(S(k.cylinder(gaugeCenter[0], gaugeCenter[1], 10, gaugeCenter[2] - 7, 7, P, 28), { tone: "mid" }));
  parts.push(
    L(k.ring(gaugeCenter[0], gaugeCenter[1], 8, gaugeCenter[2], P, 28), { tone: "lo" })
  );
  // Dial needle pointing towards "PASSED / CUPO DISPONIBLE"
  parts.push(
    L(
      k.pathOf([
        at([gaugeCenter[0], gaugeCenter[1], gaugeCenter[2]]),
        at([gaugeCenter[0] + 5.5, gaugeCenter[1] - 4, gaugeCenter[2]]),
      ]),
      { tone: "lit" }
    )
  );
  parts.push(D([at(gaugeCenter)], { size: 0.5, tone: "lit" }));

  return parts.join("");
}

// --------------------------------------------------------------------------
// 5. CAPA 4: PRESENTACIÓN / CONTROLADOR (HTTP API) (Z_L4 = 170)
// --------------------------------------------------------------------------
export function buildLayer4() {
  const parts = [];
  const z0 = Z_L4;

  // Top Controller Deck Chassis Block
  parts.push(S(k.slabOf(FRAME, z0, FRAME_H, P, 5, 1.4), { tone: "mid" }));

  // Side decorative groove
  parts.push(L(k.sideSeam(FRAME, z0 + FRAME_H - 4, P, 5), { tone: "faint" }));

  // 4 Bronze Corner Guide Bushings with top clamp flanges
  for (const [px, py] of byDepth(POSTS)) {
    parts.push(S(k.cylinder(px, py, 5.8, z0 - 1.5, FRAME_H + 3, P, 28), { tone: "lo" }));
    parts.push(L(k.sideArc(px, py, 5.8, z0, P, 24), { tone: "faint" }));
    parts.push(L(k.sideArc(px, py, 5.8, z0 + FRAME_H, P, 24), { tone: "faint" }));
    parts.push(boltCircle(px, py, 4.6, 4, z0 + FRAME_H + 1.5, "hi"));
  }

  // Turned Polished Brass Hopper (Tolva de Entrada para el Payload HTTP)
  // Center: [0, 0], Z: z0 + FRAME_H to z0 + FRAME_H + 24
  const hopZ = z0 + FRAME_H;
  // Flange ring at base
  parts.push(S(k.cylinder(0, 0, 16, hopZ, 3.5, P, 36), { tone: "hi" }));
  parts.push(boltCircle(0, 0, 13.5, 6, hopZ + 3.5, "mid"));

  // Stepped Funnel Neck & Cone
  parts.push(S(k.cylinder(0, 0, 10, hopZ + 3.5, 6, P, 32), { tone: "mid" }));
  parts.push(S(k.cylinder(0, 0, 14, hopZ + 9.5, 8, P, 36), { tone: "hi" }));
  parts.push(S(k.cylinder(0, 0, 18, hopZ + 17.5, 4, P, 36), { tone: "lit" }));

  // Funnel Inside Throat Aperture
  parts.push(L(k.ring(0, 0, 15, hopZ + 21.5, P, 36), { tone: "lo" }));
  parts.push(L(k.ring(0, 0, 8, hopZ + 21.5, P, 28), { tone: "faint" }));

  // HTTP Status Pressure Manometer (Manómetro de Respuestas HTTP: 200, 400, 422, 500)
  // Located at front right: [26, 6]
  const manoX = 26, manoY = 6, manoZ = hopZ + 2;
  // Manometer Stem & Housing
  parts.push(S(k.cylinder(manoX, manoY, 3.2, hopZ, 5, P, 20), { tone: "lo" }));
  parts.push(S(k.cylinder(manoX, manoY, 13, manoZ + 3, 7, P, 32), { tone: "mid" }));
  // Bezel Ring on top
  parts.push(S(k.cylinder(manoX, manoY, 14, manoZ + 10, 2, P, 32), { tone: "hi" }));
  // Face dial and scale ticks
  parts.push(L(k.ring(manoX, manoY, 11.5, manoZ + 12, P, 32), { tone: "lo" }));
  const manoTicks = k.radialTicks(manoX, manoY, 11.5, 12, 3, manoZ + 12, [1.5, 3.0], P);
  parts.push(L(manoTicks.minor, { tone: "lo" }));
  parts.push(L(manoTicks.major, { tone: "hi" }));
  // Needle pivot dot
  parts.push(D([at([manoX, manoY, manoZ + 12])], { size: 0.6, tone: "lit" }));

  // Header / Payload Parameter Inspection Window on the front face
  const headerWin = { x: -32, y: FRAME.y + FRAME.d - 1.5, w: 64, d: 2, r: 1 };
  parts.push(
    L(
      k.pathOf([
        at([headerWin.x, headerWin.y, z0 + 10]),
        at([headerWin.x + headerWin.w, headerWin.y, z0 + 10]),
        at([headerWin.x + headerWin.w, headerWin.y, z0 + 26]),
        at([headerWin.x, headerWin.y, z0 + 26]),
      ], true),
      { tone: "hi" }
    )
  );
  // Simulated HTTP request text lines in window
  parts.push(L(k.segment([headerWin.x + 4, headerWin.y, z0 + 21], [headerWin.x + headerWin.w - 14, headerWin.y, z0 + 21], P), { tone: "hi", free: true }));
  parts.push(L(k.segment([headerWin.x + 4, headerWin.y, z0 + 15], [headerWin.x + headerWin.w - 24, headerWin.y, z0 + 15], P), { tone: "lo", free: true }));

  return parts.join("");
}

// --------------------------------------------------------------------------
// 6. DYNAMIC PARTS: ÉMBOLO CENTRAL DE PETICIÓN/RESPUESTA & AGUJAS
// --------------------------------------------------------------------------
export function buildDynamicParts() {
  // Main Central Plunger Rod (lit tone so the eye follows it cleanly)
  // Moves vertically through the machine
  const rodR = 2.8;
  const rodLength = 65;
  const rodParts = [];

  // Polished chrome rod shaft
  rodParts.push(S(k.cylinder(0, 0, rodR, 0, rodLength, P, 28), { tone: "lit" }));
  // Top knurled actuator handle & thumb crown
  rodParts.push(S(k.cylinder(0, 0, 6, rodLength, 5, P, 28), { tone: "hi" }));
  rodParts.push(L(k.knurl(0, 0, 6, rodLength + 0.5, rodLength + 4.5, 24, P), { tone: "lo" }));
  rodParts.push(S(k.cylinder(0, 0, 7.5, rodLength + 5, 2, P, 28), { tone: "lit" }));
  // Lower probe tip (sapphire carrier disc)
  rodParts.push(S(k.cylinder(0, 0, 4.2, 0, 2.5, P, 28), { tone: "hi" }));
  rodParts.push(D([at([0, 0, 0])], { size: 0.6, tone: "lit" }));

  return {
    plungerSvg: rodParts.join(""),
  };
}
