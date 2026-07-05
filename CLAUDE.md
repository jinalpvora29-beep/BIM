# Project: BIM Material Studio (BMIP web MVP)

A Next.js 14 (App Router) + TypeScript web app that loads .glb models, lets users
click a mesh, swap its PBR material, and view in AR via <model-viewer>.

## Stack
- Next.js 14 App Router, React 18, TypeScript, Tailwind (dark theme #1E1E1E)
- 3D: react-three-fiber, @react-three/drei, three
- AR: @google/model-viewer

## Key files
- app/page.tsx — top-level state, dropzone, AR export trigger
- components/Viewer.tsx — R3F <Canvas>, GLTFLoader, raycast selection, highlight
- components/Panel.tsx — material palette overlay (reads MATERIAL_OPTIONS)
- components/ARViewer.tsx — <model-viewer> AR stage
- lib/materials.ts — MATERIAL_OPTIONS array + applyMaterialOption() + texture helpers
- public/textures/ — PNG texture maps (may not exist yet; create if needed)

## Hard rules (do not break these)
1. Never break the existing upload → click → swap → AR flow. Test after every change.
2. Keep everything TypeScript, no `any` unless unavoidable.
3. Materials must remain per-mesh safe (see ensureUniqueMaterials in lib/materials.ts).
4. Prefer small, composable components. Match existing dark UI styling.
5. Commit logically. Keep the app runnable with `npm run dev` at all times.
6. If you add a backend, use Next.js API routes + SQLite (better-sqlite3) so it runs
   locally with zero external services. Make cloud swap-in easy later.
