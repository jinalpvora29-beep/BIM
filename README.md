# BIM Material Studio — MVP (Local + AI Layer)

A local-first, browser-based 3D viewer for the BIM Material Intelligence Platform.
Upload any `.glb` / `.gltf`, click any sub-mesh, swap its material (by hand, by
search, or by asking the AI assistant), and view the customized result in AR.
Models never leave the browser; the optional AI features call OpenAI from local
Next.js API routes and fall back to on-device logic without a key.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- React Three Fiber + Three.js + `@react-three/drei` (Bounds, OrbitControls, Environment)
- `@google/model-viewer` for native AR handoff (Scene Viewer / Quick Look / WebXR)
- Tailwind CSS, dark AEC aesthetic (`#1E1E1E`)

## Run it

```bash
npm install
npm run dev
# → http://localhost:3000
```

### Environment variables (optional — enables AI features)

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Natural-language material search + texture auto-tagging |
| `OPENAI_MODEL` | Chat model override (default `gpt-4o-mini`) |
| `OPENAI_VISION_MODEL` | Vision model override (default `gpt-4o-mini`) |

**No key? Everything still works**: search falls back to local fuzzy matching,
the assistant applies the best fuzzy match, and uploaded textures get tags
derived from the filename plus a client-computed swatch color.

## AI layer (Phase 3)

- **Data-driven catalog** — materials live in `public/textures/materials.json`
  (id, label, category, swatch, color, PBR params, `tags[]`). Entries with a
  `folder` load real `basecolor/normal/roughness` PNGs from
  `public/textures/<folder>/`; the rest use flat color + procedural texture.
- **Smart search** — the search box filters the palette with fuzzy matching as
  you type; press Enter / ✨ for natural-language search ("warm matte wood
  under budget") via `POST /api/search`.
- **AI assistant** — "Ask for a material…" applies the top suggestion straight
  to the selected mesh.
- **Add material from image** — upload a PNG texture; `POST /api/tag-texture`
  auto-tags it with a vision model, saves it to `public/textures/<id>/`, and
  appends it to `materials.json` (note: runtime writes to `public/` are a
  dev-server convenience; a production deploy would move this to real storage).
- **Presentation Mode** — the "Present" button switches to a clean client view
  with a before/after toggle for the last material change and named "Design
  Options" (mesh → material assignments) saved in `localStorage`.

## Testing AR on a phone

AR requires HTTPS (Scene Viewer / Quick Look / WebXR all refuse plain HTTP except
localhost). Two easy options:

1. **Next.js self-signed HTTPS** — then open `https://<your-LAN-IP>:3000` on the phone
   (same Wi-Fi) and accept the certificate warning:
   ```bash
   npm run dev:https
   ```
2. **Tunnel** (no cert warnings):
   ```bash
   npx ngrok http 3000
   ```

On Android the AR button hands off to Scene Viewer; on iOS `<model-viewer>` converts
the exported GLB to USDZ at runtime for AR Quick Look. `ar-scale="fixed"` keeps the
model at true 1:1 world scale.

## How the core mechanics work

- **Generic loading** — the picked `File` becomes an object URL parsed by
  `GLTFLoader` (with Draco decoder support). The parsed scene is wrapped in drei's
  `<Bounds fit clip observe>`, so any model — millimeter door handle or full site
  model — is auto-centered and framed.
- **Selection** — a single `onClick` on the root `<primitive>` uses R3F's built-in
  raycaster. `e.object` is the *deepest mesh actually hit*, `e.stopPropagation()`
  kills bubbling through unknown ancestor hierarchies, and clicks with drag deltas
  > 4 px are ignored so orbiting never triggers selection. Empty-space clicks
  (`onPointerMissed`) deselect. Selection is shown with a temporary emissive tint
  that is snapshot-restored on deselect (never baked into exports).
- **Safe material swap** — `ensureUniqueMaterials()` clones a mesh's material(s)
  exactly once (flagged in `userData` with the mesh UUID) before mutation, so GLBs
  that share one material across many meshes only change on the mesh you clicked.
  Non-PBR materials (e.g. KHR unlit) are coerced to `MeshStandardMaterial`.
  Oak/Concrete textures are generated procedurally on a canvas — zero network,
  zero CORS, and they serialize through `GLTFExporter`.
- **AR export** — "View in AR" clears the selection highlight, serializes the live
  (mutated) scene with `GLTFExporter` (`binary: true, embedImages: true`) into a
  `.glb` blob, and feeds the blob URL to `<model-viewer>`.

## File map

```
app/page.tsx                  state orchestration, dropzone, AR export pipeline
app/layout.tsx                dark shell
app/api/search/route.ts       NL material search (OpenAI → fuzzy fallback)
app/api/tag-texture/route.ts  vision auto-tagging + save texture + catalog append
components/Viewer.tsx         R3F canvas, GLTF loading, Bounds, raycast selection
components/Panel.tsx          properties palette, smart search, AI assistant
components/AddMaterial.tsx    "Add material from image" upload UI
components/PresentMode.tsx    client presentation overlay + design options
components/ARViewer.tsx       full-screen <model-viewer> AR stage
lib/materials.ts              JSON-driven catalog, textures, safe cloning
lib/search.ts                 shared fuzzy search (client + server fallback)
lib/server/catalog.ts         read/append public/textures/materials.json
public/textures/materials.json  the material catalog (source of truth)
types/model-viewer.d.ts       JSX typing for the custom element
```

## Known MVP limits

- Multi-file `.gltf` (external `.bin`/textures) isn't wired up — re-export as a
  single binary `.glb` (Blender: glTF Binary; Revit: via an exporter that emits GLB).
- `GLTFExporter` re-embeds textures; very large models may take a few seconds to
  serialize before the AR stage opens.
