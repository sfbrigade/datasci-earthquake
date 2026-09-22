# Design-system evidence Phase 0

Phase-0 spike for issue #1029. This branch does not change SafeHome product behavior, `styles/theme.ts`, or the standalone theme mapper.

## Authority

- Base branch: `develop`
- Base commit: `ba9e0ab536b278f7f48196ea75dda852b4e0905e`
- Toolchain validated in CI: Node 24.18.0, TypeScript 6.0.2, Chakra UI 3.36.1, Next 16.2.11
- Final audited technical run: GitHub Actions `33951150290`
- Final audited technical artifact: `9964876510`
- Artifact SHA-256: `a81ac4ed629fe5133efc8dcc97d664443a985565fe312e4e65fc7db7881f97b8`
- Detailed audit: `PHASE0-PRECISION-AUDIT.md`

The original benchmark oracle is the reviewed B1 mapper slice: 10 files, 40 sites, 116 facts (108 explicit Exact, 2 recipe-default Exact, 4 Possible, 2 Unresolved).

## Verified results

### Source extraction

The zero-new-dependency TypeScript prototype recovered the complete B1 source oracle it is intended to score:

- explicit Exact: **108 / 108**
- Possible / bounded: **4 / 4**
- Unresolved sites: **2 / 2**
- recipe defaults: kept out of AST scoring and modeled as Chakra semantic implications

### Chakra semantics

The exact SafeHome Chakra system passes **13 / 13** controlled probes. It provides:

- token lookup and token-domain metadata;
- named text/layer style expansion;
- responsive token transformation;
- palette-context expansion;
- actual recipe defaults.

The hostile semantic classifier passes **17 / 17** sentinels, including exact responsive condition cases and the distinction between token-backed values and ordinary CSS literals.

### Typed evidence outside JSX

TypeScript's TypeChecker passes **4 / 4** probes for Chakra-bearing contextual types outside JSX, including the real typed color fields in `app/data/data.ts` and `emergency-kit-steps.tsx`.

### Runtime reachability

The final runtime realm model combines:

1. emitted JavaScript imports, excluding erased TypeScript type dependencies; and
2. policy-versioned Next App Router structural composition.

The final reachability probe passes **16 / 16** sentinels. The normalized preview records:

- 8 `type-import` module facts;
- 9 `framework-route-composition` module facts;
- no unresolved local code imports.

### Determinism

Canonical source extraction, TypeChecker, Chakra semantics, classifier, reachability, and repo-wide evidence generation all replay byte-identically in CI.

## Repo-wide preview

The final audited normalized preview contains:

- **98 files**
- **91 eligible files**, all deliberately `partial`
- **7 excluded files**
- **1,181 source facts**
- **144 module facts**
- **98 reachability claims**
- **958 semantic facts**
- **919 positive entity claims**
- **23 unresolved source facts**

Normalization removed one incorrect `whiteSpace → spacing` domain fact, reclassified 8 erased type-only imports, and materialized 9 Next framework-composition facts.

No negative / unused conclusion is emitted because coverage is still partial.

## Precision audit

The deterministic audit seeded by run `33951150290` passed:

- **16 / 16** sampled source/semantic records;
- **10 / 10** sampled entity claims;
- **8 / 8** sampled reachability classifications;
- **0 / 98** mismatches in an independent full reachability recomputation;
- **0 / 919** claim realm/kind consistency mismatches.

The audit found and repaired three real defects before freeze:

1. false `whiteSpace → spacing` domain inference;
2. type-only imports counted as runtime reachability;
3. missing Next ancestor-layout composition.

See `PHASE0-PRECISION-AUDIT.md` for the bounded methodology and evidence.

## Challenger tools

### Knip

Knip 6.34.0 was run ephemerally and is **not** a project dependency. It independently corroborates useful source-only candidates, but its single production/unused view does not preserve SafeHome's product-vs-internal-demo realm distinction.

### dependency-cruiser

Not adopted. No demonstrated correctness gain currently justifies another canonical graph engine.

### Panda CSS

Not adopted. The actual SafeHome Chakra system plus TypeScript currently supplies the needed semantic authority. Revisit only if a hostile fixture or real source pattern exposes a gap.

## Phase-0 architecture decision

Use the smallest authority-preserving stack:

1. **TypeScript Compiler API** — source facts, contextual types, bounded local evaluation.
2. **TypeScript emitted-module semantics** — runtime vs erased type dependencies.
3. **Versioned Next route-structure policy** — framework-owned layout/template composition.
4. **SafeHome's actual Chakra system** — token domains and semantic implications.
5. **Repo-owned evidence/claim layer** — provenance, coverage, realms, blockers, and policy-versioned conclusions.
6. **Knip/Panda/other tools** — challengers, not canonical authority unless they empirically earn a narrower role.

`Mapped` and `Unused` remain forbidden as binary evidence-authority statuses.

## Phase-0 state

**Contract shape frozen for this spike. Mapper 2.13 remains frozen.**

This is a precision milestone, not a completeness milestone. All 91 eligible files remain `partial`, so strong-negative and removal conclusions remain blocked.

## Next action

Implement wrapper propagation and per-file completeness accounting. Graduate a file from `partial` to `complete` only when the analyzer can demonstrate coverage, then define strong-negative eligibility from coverage plus unresolved-domain blockers. Only after that should mapper 2.14 consume the evidence contract as a new **Usage evidence** model.
