# Remaining 135 Native Experiments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `hm-02-01` through `hm-14-09` with 135 knowledge-specific Native V2 experiments.

**Architecture:** A shared neutral Native shell renders module-owned experiment specifications. Each knowledge point owns a unique formula, parameters, SVG layers, four teaching actions, observation calculation, and renderer registration.

**Tech Stack:** React 19, TypeScript, SVG, Tailwind CSS, ExperimentShell, PlayerBar.

**Spec:** `docs/superpowers/specs/2026-08-31-remaining-135-native-experiments-design.md`

## Global Constraints

- Preserve the accepted 15 function experiments.
- Do not use title/color/random seed as the only difference.
- Give every point a unique visual signature and four real step actions.
- Keep all 150 routes and current Native V2 shell.

### Task 1: Shared specification runtime
- [ ] Add typed experiment specification, mathematical SVG primitives, stateful controls and teaching-step adapter.
- [ ] Add unique-signature validation and dedicated component factory.

### Task 2: Limits and continuity (22 experiments)
- [ ] Implement `hm-02-*` limit models and `hm-03-*` continuity/interval theorem models.

### Task 3: Derivatives and applications (28 experiments)
- [ ] Implement `hm-04-*` derivative models and `hm-05-*` mean-value/application models.

### Task 4: Integrals and applications (27 experiments)
- [ ] Implement `hm-06-*`, `hm-07-*`, and `hm-08-*` antiderivative, Riemann and application models.

### Task 5: Differential equations and spatial geometry (21 experiments)
- [ ] Implement `hm-09-*` direction-field/solution models and `hm-10-*` vector/space models.

### Task 6: Multivariable calculus (19 experiments)
- [ ] Implement `hm-11-*` differential models and `hm-12-*` multiple-integral models.

### Task 7: Field integrals and series (18 experiments)
- [ ] Implement `hm-13-*` field-integral models and `hm-14-*` series models.

### Task 8: Registry and verification
- [ ] Register all 135 dedicated components, remove the generic fallback from production routes, update changelog, and run TypeScript build.
