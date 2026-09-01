# Typed Math Model Experiment Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the disconnected 150-experiment data flow with a typed runtime in which category models produce formula, scene data, observations, condition checks, predictions, conclusions, and counterexamples from one computation.

**Architecture:** Add a framework-agnostic `experiment-core` domain layer, then place a React runtime on top of it. Category models own mathematics and emit renderer-ready data; experiment configuration selects a model and supplies constants, while pages only render the resulting computation.

**Tech Stack:** TypeScript 5.9, React 19, Vitest 3, SVG, existing Experiment V2 components.

**Spec:** `docs/superpowers/specs/2026-09-01-typed-math-model-experiment-runtime-design.md`

## Global Constraints

- Preserve all 150 experiment IDs and `/demo/:id` routes.
- Do not modify the current course directory, chapter/section ordering, navigation, course home, experiment-library entry, AI pages, server, or publishing data.
- Preserve the overall `ExperimentShell`, sidebar-card, canvas, and `PlayerBar` visual language.
- Keep formula, plot data, observations, conditions, prediction answer, conclusion, and counterexample computation in category models.
- Do not add a generic expression DSL or runtime-generated React code.
- Do not expose a parameter that changes none of its declared outputs.
- Migrate the production renderer registry only after every catalog item has a valid typed registration.
- Do not stage or commit unrelated dirty-worktree files.

---

### Task 1: Core schema and parameter normalization

**Files:**
- Create: `client/src/experiment-core/schema.ts`
- Create: `client/src/experiment-core/parameters.ts`
- Test: `client/src/experiment-core/parameters.test.ts`

**Interfaces:**
- Produces: `ParameterSpec`, `ParameterValues`, `normalizeParameterValue`, `normalizeParameterValues`, `ParameterValidationError`.
- Consumes: no React code and no existing scene code.

- [ ] **Step 1: Write failing parameter tests**

Cover continuous values, integer rejection, enum membership, boolean values, `NaN`, infinity, range violations, and step violations. The central assertion is:

```ts
expect(() => normalizeParameterValue(integerSpec, 2.5)).toThrow(/整数/)
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/experiment-core/parameters.test.ts`

Expected: FAIL because `parameters.ts` and its exports do not exist.

- [ ] **Step 3: Implement the discriminated parameter union and normalization**

Use this public signature:

```ts
export function normalizeParameterValues(
  specs: readonly ParameterSpec[],
  input: Readonly<Record<string, ParameterValue>>,
): ParameterValues
```

Return a new frozen-compatible record and throw `ParameterValidationError` containing the parameter key and Chinese reason for invalid input.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- src/experiment-core/parameters.test.ts`

- [ ] **Step 5: Commit only Task 1 files**

```powershell
git add -- client/src/experiment-core/schema.ts client/src/experiment-core/parameters.ts client/src/experiment-core/parameters.test.ts
git commit -m "feat: add typed experiment parameters"
```

### Task 2: Structured prediction engine

**Files:**
- Modify: `client/src/experiment-core/schema.ts`
- Create: `client/src/experiment-core/prediction.ts`
- Test: `client/src/experiment-core/prediction.test.ts`

**Interfaces:**
- Consumes: `PredictionSpec`, `PredictionResponse`, and `PredictionAnswer` from `schema.ts`.
- Produces: `judgePrediction(spec, response): PredictionJudgement`.

- [ ] **Step 1: Write failing tests for all four prediction types**

Include trend, boolean, numeric absolute tolerance, numeric relative tolerance, single choice, multiple choice as a set, and ordered choice. Assert that a mismatched response type is rejected.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/experiment-core/prediction.test.ts`

Expected: FAIL because `judgePrediction` is unavailable.

- [ ] **Step 3: Implement exhaustive prediction judging**

Use a `switch (spec.type)` with an exhaustive `never` branch. Numeric comparison must accept a response when either configured tolerance passes:

```ts
const absoluteOk = absoluteError <= (spec.absoluteTolerance ?? -1)
const relativeOk = relativeError <= (spec.relativeTolerance ?? -1)
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- src/experiment-core/prediction.test.ts`

- [ ] **Step 5: Commit only Task 2 files**

```powershell
git add -- client/src/experiment-core/schema.ts client/src/experiment-core/prediction.ts client/src/experiment-core/prediction.test.ts
git commit -m "feat: add structured prediction judging"
```

### Task 3: Safe curve sampling and scene fingerprints

**Files:**
- Create: `client/src/experiment-core/sampling/curve.ts`
- Create: `client/src/experiment-core/fingerprint.ts`
- Test: `client/src/experiment-core/sampling/curve.test.ts`
- Test: `client/src/experiment-core/fingerprint.test.ts`

**Interfaces:**
- Produces: `sampleCurve`, `CurveSeries`, `sceneFingerprint`, and `textFingerprint`.
- Consumes: point and scene types from `schema.ts`.

- [ ] **Step 1: Write failing discontinuity tests**

Assert that `1/x`, `tan(x)`, `log(x)`, and a jump function produce separate segments and no non-finite points. Assert that different numeric scene data produce different stable fingerprints.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/experiment-core/sampling/curve.test.ts src/experiment-core/fingerprint.test.ts`

- [ ] **Step 3: Implement segmented sampling and stable fingerprints**

Use the public sampler:

```ts
export function sampleCurve(options: CurveSamplingOptions): readonly Point2D[][]
```

Start a new segment for a non-finite value, an excluded domain point, an out-of-range value, or a jump larger than `jumpThreshold`.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- src/experiment-core/sampling/curve.test.ts src/experiment-core/fingerprint.test.ts`

- [ ] **Step 5: Commit only Task 3 files**

```powershell
git add -- client/src/experiment-core/sampling/curve.ts client/src/experiment-core/fingerprint.ts client/src/experiment-core/sampling/curve.test.ts client/src/experiment-core/fingerprint.test.ts
git commit -m "feat: add safe math sampling"
```

### Task 4: Model contract, runtime computation, and config validator

**Files:**
- Modify: `client/src/experiment-core/schema.ts`
- Create: `client/src/experiment-core/model.ts`
- Create: `client/src/experiment-core/runtime.ts`
- Create: `client/src/experiment-core/validateConfig.ts`
- Test: `client/src/experiment-core/runtime.test.ts`
- Test: `client/src/experiment-core/validateConfig.test.ts`

**Interfaces:**
- Produces: `MathModel`, `ExperimentConfig`, `ExperimentComputation`, `computeExperiment`, `validateExperimentRegistration`.
- Consumes: parameter normalization, prediction judging, and fingerprints from Tasks 1–3.

- [ ] **Step 1: Write failing model-runtime tests**

Create a real small quadratic test model. Assert that one `computeExperiment` result supplies formula, scene, observations, conditions, verification, actual prediction answer, conclusion, explanation, and counterexamples from the same normalized parameter record.

- [ ] **Step 2: Write failing registration validation tests**

Reject missing units, empty mathematical meaning, invalid integer steps, unknown models, dead parameters, absent conditions, absent counterexamples, duplicate text fingerprints, and unchanged declared plot output.

- [ ] **Step 3: Run both tests and verify RED**

Run: `npm test -- src/experiment-core/runtime.test.ts src/experiment-core/validateConfig.test.ts`

- [ ] **Step 4: Implement the model contract and validator**

`validateExperimentRegistration` receives the config, model, and a `compute` callback. For each parameter, it changes the initial value by one legal step and verifies every declared `affects` target changes.

- [ ] **Step 5: Run both tests and verify GREEN**

Run: `npm test -- src/experiment-core/runtime.test.ts src/experiment-core/validateConfig.test.ts`

- [ ] **Step 6: Commit only Task 4 files**

```powershell
git add -- client/src/experiment-core/schema.ts client/src/experiment-core/model.ts client/src/experiment-core/runtime.ts client/src/experiment-core/validateConfig.ts client/src/experiment-core/runtime.test.ts client/src/experiment-core/validateConfig.test.ts
git commit -m "feat: add typed math model runtime"
```

### Task 5: Common React runtime and prediction gate

**Files:**
- Create: `client/src/experiment-core/components/PredictionPanel.tsx`
- Create: `client/src/experiment-core/components/ParameterControls.tsx`
- Create: `client/src/experiment-core/components/ObservationPanel.tsx`
- Create: `client/src/experiment-core/components/ValidationPanel.tsx`
- Create: `client/src/experiment-core/components/PredictionComparison.tsx`
- Create: `client/src/experiment-core/components/ExperimentRuntimePage.tsx`
- Test: `client/src/experiment-core/components/ExperimentRuntimePage.test.tsx`

**Interfaces:**
- Consumes: `ExperimentRegistration`, `computeExperiment`, and existing `ExperimentShell`/`ExperimentCard`/`PlayerBar`.
- Produces: `ExperimentRuntimePage({ registration })`.

- [ ] **Step 1: Write a failing interaction test**

Use the quadratic test registration. Assert parameter controls are disabled before prediction, enabled after submission, and that changing a parameter updates formula, graph fingerprint, observation, condition, and comparison output.

- [ ] **Step 2: Run the component test and verify RED**

Run: `npm test -- src/experiment-core/components/ExperimentRuntimePage.test.tsx`

- [ ] **Step 3: Implement the seven-stage runtime UI**

Keep the current shell and cards. Map `question → prediction → explore → observe → validate → conclude → counterexample` to seven `PlayerBar` steps. Prevent navigation beyond prediction until a valid response is submitted.

- [ ] **Step 4: Run the component test and verify GREEN**

Run: `npm test -- src/experiment-core/components/ExperimentRuntimePage.test.tsx`

- [ ] **Step 5: Commit only Task 5 files**

```powershell
git add -- client/src/experiment-core/components
git commit -m "feat: add experiment learning runtime"
```

### Task 6: Category model registry and all 150 configurations

**Files:**
- Create: `client/src/experiment-core/models/shared.ts`
- Create: `client/src/experiment-core/models/function1d/index.ts`
- Create: `client/src/experiment-core/models/limit/index.ts`
- Create: `client/src/experiment-core/models/continuity/index.ts`
- Create: `client/src/experiment-core/models/derivative/index.ts`
- Create: `client/src/experiment-core/models/theoremApplication/index.ts`
- Create: `client/src/experiment-core/models/integral/index.ts`
- Create: `client/src/experiment-core/models/ode/index.ts`
- Create: `client/src/experiment-core/models/space/index.ts`
- Create: `client/src/experiment-core/models/multivariable/index.ts`
- Create: `client/src/experiment-core/models/multipleIntegral/index.ts`
- Create: `client/src/experiment-core/models/fieldIntegral/index.ts`
- Create: `client/src/experiment-core/models/series/index.ts`
- Create: `client/src/experiment-core/configs.ts`
- Create: `client/src/experiment-core/registry.ts`
- Test: `client/src/experiment-core/registry.test.ts`

**Interfaces:**
- Consumes: `HIGH_MATH_CURRICULUM`, `OWNED_EXPERIMENT_CATALOG`, and all Task 1–4 domain interfaces.
- Produces: `EXPERIMENT_REGISTRY` with exactly 150 valid entries and `getExperimentRegistration(id)`.

- [ ] **Step 1: Write the failing 150-entry registry test**

Assert exact catalog coverage, exact model-family counts from the spec, zero dead controls, all four prediction types represented, every experiment has conditions and a counterexample, and no duplicate config/output fingerprint pair.

- [ ] **Step 2: Run the registry test and verify RED**

Run: `npm test -- src/experiment-core/registry.test.ts`

- [ ] **Step 3: Implement shared mathematical primitives and category models**

Each model file exposes focused models for the knowledge points in that family. Model callbacks build formula, scene data, observations, conditions, prediction, conclusion, and counterexamples together; no page-level formulas are permitted.

- [ ] **Step 4: Register all 150 experiment configurations**

Give every config its own mathematical object, parameter semantics, observation keys, prediction scenario, conditions, conclusion behavior, and counterexample. Reuse only model algorithms and renderer data types.

- [ ] **Step 5: Run the registry test and verify GREEN**

Run: `npm test -- src/experiment-core/registry.test.ts`

- [ ] **Step 6: Commit only Task 6 files**

```powershell
git add -- client/src/experiment-core/models client/src/experiment-core/configs.ts client/src/experiment-core/registry.ts client/src/experiment-core/registry.test.ts
git commit -m "feat: register typed models for 150 experiments"
```

### Task 7: Category renderers and production cutover

**Files:**
- Create: `client/src/experiment-core/renderers/CartesianRenderer.tsx`
- Create: `client/src/experiment-core/renderers/SequenceRenderer.tsx`
- Create: `client/src/experiment-core/renderers/SurfaceRenderer.tsx`
- Create: `client/src/experiment-core/renderers/SpaceRenderer.tsx`
- Create: `client/src/experiment-core/renderers/FieldRenderer.tsx`
- Create: `client/src/experiment-core/renderers/index.ts`
- Modify: `client/src/owned-experiments/renderers.ts`
- Modify: `client/src/owned-experiments/renderers.test.ts`
- Delete after cutover: `client/src/demo/knowledge-native/scenes.tsx`
- Delete after cutover: `client/src/demo/knowledge-native/NativeKnowledgeExperiment.tsx`
- Delete after cutover: `client/src/demo/knowledge-native/definitions.ts`
- Delete after cutover: `client/src/demo/knowledge-native/types.ts`
- Delete after cutover: `client/src/demo/knowledge-native/definitions.test.ts`

**Interfaces:**
- Consumes: `EXPERIMENT_REGISTRY`, `ExperimentRuntimePage`, and typed scene data.
- Produces: production `OWNED_EXPERIMENT_RENDERERS` entries for all 150 IDs.

- [ ] **Step 1: Extend the renderer test and verify RED**

Assert every renderer resolves through the typed registry and no production import references `knowledge-native/scenes` or the old `NativeKnowledgeExperiment`.

- [ ] **Step 2: Implement renderers that consume scene data only**

Render curves from presegmented points, sequences from discrete samples, surfaces from model grids, and fields from sampled vectors. Derive axes and legends from `scene` metadata.

- [ ] **Step 3: Cut the production registry over atomically**

Create one lightweight component per ID that passes its registration to `ExperimentRuntimePage`. Then remove the old runtime files.

- [ ] **Step 4: Run renderer and course tests**

Run: `npm test -- src/owned-experiments/renderers.test.ts src/course/courseScope.test.ts src/course/ExperimentLibrary.test.ts`

- [ ] **Step 5: Commit Task 7 cutover files**

```powershell
git add -- client/src/experiment-core/renderers client/src/owned-experiments/renderers.ts client/src/owned-experiments/renderers.test.ts client/src/demo/knowledge-native
git commit -m "refactor: cut experiments over to typed runtime"
```

### Task 8: Experiment-only quality gate

**Files:**
- Create: `client/src/experiment-core/qualityReport.ts`
- Test: `client/src/experiment-core/qualityReport.test.ts`
- Test: existing experiment and renderer tests.

**Interfaces:**
- Consumes: public registry validation and catalog coverage.
- Produces: an experiment-local report used by Vitest without changing course or product-scope scripts.

- [ ] **Step 1: Add failing integrity expectations**

The experiment quality report must expose catalog count, registry count, family counts, prediction-type counts, dead-control count, duplicate count, and validation-error count. The test requires every error count to be zero.

- [ ] **Step 2: Run integrity checks and verify RED**

Run: `npm test -- src/experiment-core/qualityReport.test.ts`

- [ ] **Step 3: Wire the typed validator into the existing checks**

Build the report from the framework-free experiment registry without rendering React or changing any non-experiment script.

- [ ] **Step 4: Run the complete quality gate**

Run: `npm test`

Run: `npm run build`

Expected: all commands exit 0; registry count is 150; dead controls, duplicate configurations, invalid parameters, disconnected formulas, and unsafe singularity segments are all zero.

- [ ] **Step 5: Commit only Task 8 files**

```powershell
git add -- client/src/experiment-core/qualityReport.ts client/src/experiment-core/qualityReport.test.ts
git commit -m "chore: enforce experiment model quality"
```
