# Claude Code Task: Complete the CCWS STP ITS WebGL Project

You are working inside the existing repository `ccws-stp-its`. Continue the current implementation. Do not replace it with a new project.

## Project context

This is a university Computer Graphics assignment to recreate the Co-Working Space at Science Techno Park, Institut Teknologi Sepuluh Nopember (CCWS STP ITS).

The lecturer requires WebGL. Use **native WebGL 2 and GLSL ES 3.00 only**. Do not use Three.js, Babylon.js, PlayCanvas, or another 3D engine. Vite is only the development server and build tool.

The current exterior scene is already substantial. It includes the CCWS building, surrounding environment, procedural textures, lighting, shadows, orbit camera, camera presets, day-night cycle, animated exterior objects, scene graph, exploded hierarchy view, original reference photos and videos, and a submission page. Preserve this work.

## Main goal

Extend the existing exterior scene with a simplified but recognizable interior and innovation exhibition, plus a small set of meaningful interactions.

The intended demo:
1. Show the existing CCWS exterior.
2. Move to an interior camera preset.
3. Show a collaborative workspace with tables, chairs, lounge seating, and a small coffee/snack counter.
4. Show an innovation exhibition area with a train display, electric motorcycle, and robotic arm.
5. Interact with the robotic arm, motorcycle wheels, and one train exhibit feature.
6. Compare the 3D scene with original photographs and videos on the submission page.

Keep the ambition balanced. Prioritize recognizable shapes, plausible placement, stable rendering, and clear demonstrations of course concepts over tiny decorative details.

## Read before editing

Read:
- `CLAUDE.md`, `README.md`
- `docs/NASKAH_TUGAS_2.md`
- `docs/PROJECT_PLAN.md`, `docs/REQUIREMENTS_TRACEABILITY.md`
- `docs/COURSE_CONCEPT_MAPPING.md`, `docs/FLOOR_PLAN.md`
- `docs/SCENE_GRAPH.md`, `docs/COORDINATE_SYSTEM.md`
- `docs/INTEGRATION_CONTRACT.md`, `docs/INTERACTION_SPEC.md`
- `docs/TASK_DIVISION.md`, `docs/ASSET_REGISTER.md`
- `src/core/createApp.js`, `src/webgl/renderer.js`
- `src/webgl/sceneNode.js`, `src/webgl/geometry.js`, `src/webgl/mat4.js`
- `src/models/ccwsBuilding.js`, `src/models/environment.js`, `src/models/parts.js`
- `src/world/animator.js`, `src/world/dayNight.js`
- `src/ui/bindUI.js`, `index.html`

Inspect actual exports and call sites. Do not assume an API exists without checking.

## Project rules

- Keep the native WebGL 2 renderer and existing GLSL shaders.
- Preserve the existing exterior and its working features.
- Keep the convention: world matrix = parent world matrix × local matrix.
- Follow `docs/COORDINATE_SYSTEM.md`.
- Models create scene nodes and geometry only. They must not create a WebGL context or a second animation loop.
- The renderer remains the only owner of WebGL state, GPU buffers, shader programs, texture upload, and draw calls.
- Reuse existing geometry and material helpers. Inspect the renderer before adding material properties.
- Use pivot nodes for doors, wheels, robot joints, grippers, and other articulated parts.
- Use the existing app animation loop and delta time. Do not add a second `requestAnimationFrame` loop.
- Centralize dimensions and placements where practical. Label unmeasured dimensions as estimates.
- Do not use external 3D models, downloaded building models, screenshots as scene backgrounds, or image planes as substitutes for modelling.
- Use supplied photos and videos as visual references. Build scene objects from code.
- Do not claim that the conceptual floor plan is measured.
- Keep original photos and videos.
- Do not silently rename, delete, or replace working modules.
- Do not add dependencies without a clear reason.
- Do not commit, push, or change Git branches.

## Floor plan and evidence

The interior references show a bright, high-ceiling room, side windows, tables and chairs, lounge seating, a coffee/snack counter, and a separate innovation display area. One supplied train photo has the text "HST JAKARTA".

No measured floor plan has been verified. Treat `docs/FLOOR_PLAN.md` as conceptual. Distinguish details visible in photos, details described by the team, and approximate placement assumptions.

Suggested arrangement:
- Connect the interior to the existing main entrance.
- Put the collaborative workspace on one side.
- Put the coffee/snack counter near the workspace without blocking circulation.
- Put the innovation exhibition in the other half.
- Place the train along an exhibition wall.
- Put the motorcycle and robot arm on separate display platforms.

Use the references and existing coordinate system to adjust this arrangement where necessary. Document important assumptions.

## Implementation phases

Complete and test one phase before moving to the next.

### Phase 0. Audit and documentation correction

1. Inspect the existing architecture and extension points.
2. Run `npm run build` before editing and record the result.
3. The assignment handout specifies **three weeks**. Correct documentation that says the lecturer gives three months. An internal team schedule may differ, but do not misstate the handout.
4. Resolve the old `CLAUDE.md` and project-plan instructions that prohibit interior and interactions. Update them to match this agreed scope.
5. Ensure `README.md` accurately describes native WebGL 2, not Three.js.
6. Keep the existing exterior as the baseline.

### Phase 1. Interior shell

Create a new module, preferably `src/models/interior.js`.

Build a simplified interior from existing geometry helpers:
- floor and ceiling,
- side and rear walls,
- large window bays and frames,
- visible ceiling beams,
- connection to the entrance,
- counter area,
- exhibition wall or display zone.

The interior should be visible from the existing camera system. Add practical interior and exhibition camera presets. Do not add a full first-person controller unless it can be done without destabilizing the project.

### Phase 2. Furniture and café

Create reusable modules, for example `src/models/furniture.js` and `src/models/cafeCounter.js`.

Include:
- several tables,
- chairs with seats, backs, and legs,
- a small sofa or lounge seating,
- coffee/snack counter,
- simple shelves,
- coffee machine or dispenser,
- a few snack/product blocks.

Use parent-child groups. Prefer reusable builder functions over many one-off objects.

### Phase 3. Innovation exhibition

Create independent modules:
- `src/models/exhibits/train.js`
- `src/models/exhibits/motorcycle.js`
- `src/models/exhibits/robotArm.js`

**Train**
- Model only the visible exhibit segment from the supplied photo.
- Include recognizable body panels, windows, door outline, red upper band, dark lower band, and simple signage.
- Do not infer train specifications from the photo.
- Add one simple interaction, such as display lighting or a door toggle.

**Electric motorcycle**
- Build a recognizable simplified motorcycle from code.
- Use a parent frame with front and rear wheel pivot nodes.
- Add body panels, seat, handlebar, front fork, headlight, and wheels.
- Add a power toggle. When powered on, rotate both wheels smoothly around their own axes.
- Keep the motorcycle stationary. Add a headlight state if it fits the existing material system.

**Robot arm**
- Main interactive exhibit and strongest hierarchical-modelling demonstration.
- Hierarchy: base → rotating base → shoulder → upper arm → elbow → forearm → wrist → gripper → left/right fingers.
- Put each pivot at its joint.
- Use the existing parent × local transformation convention.
- Add controls for base, shoulder, elbow, wrist, and gripper.
- Add a small box that the gripper can pick up and release.
- On pickup, attach the box to the gripper in the scene graph or with a clear parent-relative transform. On release, preserve its world position.
- Clamp joint angles to sensible ranges.
- Add a reset-pose control.
- Do not implement physics. A deterministic attach/release interaction is enough.

### Phase 4. UI and interactions

Extend the current UI without replacing it.

Required:
- interior camera preset,
- exhibition camera preset,
- robot control panel,
- motorcycle power toggle,
- train exhibit interaction,
- robot reset-pose control,
- clear active/inactive states.

If mouse object picking is straightforward without changing the renderer architecture, it can be added later. Visible controls are more reliable for the demo.

Keep controls readable and usable on smaller screens.

### Phase 5. Lighting and textures

Reuse the current day-night and lighting system.
- Interior ceiling lights should illuminate the workspace.
- Exhibition lights should make the displays easy to see.
- Connect lighting controls to the actual renderer light data.
- Reuse existing texture handling for floor, walls, wood, glass, and metal where useful.
- Use simple material colors where texture adds little.
- Ensure the interior is visible at the default time.

### Phase 6. Submission page and documentation

The submission page must include:
- group name, with a placeholder if not provided,
- correct member names and NRP values, without guessing missing digits,
- original location photos,
- original location videos,
- WebGL canvas near the reference images,
- scene hierarchy tree,
- task division,
- short control instructions,
- concise explanation of graphics techniques used.

Add the interior and exhibition photos already in `public/assets/references/photos/` to the gallery. Keep paths valid.

Update these documents to describe the actual implementation:
- `README.md`
- `CLAUDE.md`
- `docs/PROJECT_PLAN.md`
- `docs/FLOOR_PLAN.md`
- `docs/SCENE_GRAPH.md`
- `docs/INTERACTION_SPEC.md`
- `docs/TASK_DIVISION.md`
- `docs/REQUIREMENTS_TRACEABILITY.md`
- `docs/COURSE_CONCEPT_MAPPING.md`
- `docs/DEMO_AND_CHALLENGE_PLAN.md`
- `docs/ASSET_REGISTER.md`

Do not mark planned features as completed.

## Suggested two-person division

**Kemas Muhammad Athariq**
- Existing WebGL renderer and integration.
- Camera and scene registration.
- Robot arm hierarchy and controls.
- Object attach/release logic.
- Final integration and build checks.

**Mahda / second member**
- Interior shell and layout.
- Furniture and coffee/snack counter.
- Train exhibit.
- Electric motorcycle and wheel animation.
- Interior/exhibition photo gallery updates.

**Shared**
- Agree on dimensions and object placement.
- Review the floor plan.
- Test the complete scene.
- Update the final division based on actual contributions.
- Prepare each member to explain their own code.

Inspect `docs/TASK_DIVISION.md` and `index.html` for the official member name and NRP. If the official name is currently "Gilbran Mahdavikia Raja" and "Mahda" is a nickname, retain the official name in submission materials unless the team confirms otherwise. Do not invent missing NRP digits.

## Code comments and style

Write code as a clear student project.
- Comment on non-obvious pivot placement, coordinate choices, matrix operations, animation logic, and assumptions based on photos.
- Do not comment on every line.
- Do not repeat the code in words.
- Avoid long generic paragraphs, marketing language, excessive section banners, and phrases such as "robust and scalable solution".
- Do not mention AI, Claude, prompts, or generated code in comments.
- Use descriptive names and small, understandable functions.
- Follow the language and style already used in each file.
- Keep documentation concise and factual.

## Testing and acceptance criteria

After each phase:
1. Run `npm run build`.
2. Fix build errors before continuing.
3. Check browser console errors if browser testing is available.
4. Confirm the existing exterior still renders.
5. Confirm the scene tree matches the rendered scene.
6. Confirm animation pause/resume works.
7. Confirm time slider and day-night cycle work.
8. Confirm texture and shadow toggles work.
9. Confirm all new controls work and have sensible limits.
10. Check new models are visible and not hidden behind walls.

Robot tests:
- Move each joint independently.
- Confirm children follow the parent joint.
- Open and close the gripper.
- Pick up the box.
- Move while holding it.
- Release it and confirm it stays in place.
- Reset the pose.

Motorcycle tests:
- Toggle power.
- Confirm both wheels rotate around their own axes.
- Confirm the frame does not rotate with the wheels.

Train test:
- Confirm its interaction visibly changes the exhibit.

Before finishing:
- Run `npm run build` and report the exact result.
- List completed features and remaining limitations.
- Do not claim browser testing if it was not performed.
- Give a short lecturer-demo sequence.

## How to work

Do not implement everything in one giant edit.

First audit the repository and report:
- current architecture,
- features that must be preserved,
- files to modify,
- new files required,
- integration risks,
- build status before changes.

Then implement Phase 0 and Phase 1. Continue through the remaining phases in order, keeping the project buildable after each phase. Do not stop after writing a plan.

Use clearly labelled estimates when details are missing. Ask only if a missing fact materially affects the layout or submission identity.

At the end, summarize:
1. What changed.
2. Which files changed.
3. What can be demonstrated.
4. Build and test results.
5. What the team must still verify or fill in before submission.
