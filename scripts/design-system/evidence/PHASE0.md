# Design-system evidence Phase 0

Phase-0 spike for issue #1029. This branch does not change SafeHome product behavior, `styles/theme.ts`, or the standalone theme mapper.

## Authority

- Base branch: `develop`
- Base commit: `ba9e0ab536b278f7f48196ea75dda852b4e0905e`
- Base tree: `a3df8ced81ea2dacf9e00b8990578bf82f3561b4`
- Toolchain observed in CI: Node 24.18.0, TypeScript 6.0.2, Chakra UI 3.36.1
- Accepted Phase-0 run: GitHub Actions `33937004135`
- Accepted artifact: `9960521099`

The benchmark oracle is the previously reviewed B1 slice from the correctness-hardened mapper: 10 files, 40 sites, 116 facts (108 explicit Exact, 2 recipe-default Exact, 4 Possible, 2 Unresolved).

## Results

### 1. TypeScript source extraction

The zero-new-dependency TypeScript AST prototype recovered all known B1 source facts that it is intended to score:

- explicit Exact: **108 / 108**
- Possible/bounded: **4 / 4**
- Unresolved sites: **2 / 2**
- recipe defaults: intentionally excluded from AST scoring; handled as Chakra semantic implications

The prototype emits 284 raw facts on the 10-file corpus (255 exact, 6 bounded, 23 unresolved). Therefore the result above is a **recall result against the known oracle, not a precision score**. Whole-repo semantic filtering is still required before these raw facts become evidence claims.

### 2. TypeScript-native module reachability

Using SafeHome's own `tsconfig.json` (`moduleResolution: bundler`, `@/*` path mapping) and an explicit phase-0 Next App Router entrypoint policy:

- TypeScript/JavaScript source files considered: **98**
- `app-source` files: **66**
- product-reachable `app-source` files: **58 / 66**
- internal-demo-reachable files: **25 / 98**
- unresolved local code imports: **0**
- asset dependencies classified separately: **5**

All six reviewed sentinels pass, including:

- `address-mapper.tsx`: product reachable
- `card-hazard.tsx`: product reachable
- `share.tsx`: not product reachable, but internal-demo reachable
- `components-test-lib/page.tsx`: internal-demo entrypoint, not product entrypoint

Reachability is a claim under `safehome-next16-app-router-phase0.v1`, not a universal runtime claim.

### 3. Typed evidence outside JSX

The TypeChecker can identify Chakra-bearing contextual types outside JSX:

- `app/data/data.ts` `iconColor` values (`grey.400`, `orange`, `tsunamiBlue`) have a Chakra color `ConditionalValue<...>` contextual type.
- `emergency-kit-steps.tsx` typed `iconColor` and `iconBackground` literals resolve directly to Chakra `ColorsToken` contextual types.

All **4 / 4** TypeChecker sentinels pass. This supports a whole-source evidence analyzer rather than a JSX-only scanner.

### 4. Controlled Chakra semantic evaluation

Loading the exact SafeHome Chakra system in an isolated probe succeeded for **13 / 13** semantic probes and was byte-deterministic across repeated executions.

Useful observed behavior:

- `system.token("colors.blue.text")` resolves to the SafeHome value.
- `textStyle: "textSmall"` expands through `fonts.body`, `fontSizes.sm`, and `fontWeights.normal` CSS variables.
- `layerStyle: "text"` expands through `colors.grey.900`.
- `p: "4"`, `fontWeight: "bold"`, and `zIndex: "docked"` transform to token-backed CSS variables.
- `display: "flex"` and `position: "absolute"` remain literal values rather than being misclassified as token references.
- `colorPalette: "blue"` expands into virtual palette bindings and should remain distinct from one concrete color-token reference.
- `system.getRecipe("button")` exposes the exact Chakra 3.36.1 defaults `size=md`, `variant=solid`.
- the active token dictionary contains 593 flattened token entries across the observed categories.

Source abstractions remain primary evidence; transformed CSS is semantic expansion, not a replacement for source provenance.

### 5. Determinism

The workflow executes each canonical prototype twice and byte-compares its JSON:

- source extraction: deterministic
- module reachability: deterministic
- TypeChecker probe: deterministic
- Chakra semantic probe: deterministic

## Challenger tools

### Knip

Knip 6.34.0 was run ephemerally in `--production` mode and was **not added to `package.json`**.

It independently corroborated important source-only/orphan candidates such as:

- `layout-height-constrained.tsx`
- `layout-responsive.tsx`
- `mobile-report-hazards.tsx`
- `snippets/legend-clicked-context.tsx`

Knip does not preserve our needed product-vs-internal-demo distinction: for example `share.tsx` is reachable from the real `components-test-lib` Next route, so a single production/unused verdict is less informative than our realm-aware reachability facts.

Knip also reports unrelated dependency/export hygiene findings. Those are outside this spike and are not evidence-authority for the design-system mapper.

### dependency-cruiser

Not adopted in Phase 0. The TypeScript-native graph currently has zero unresolved local code imports, all reviewed reachability sentinels pass, and Knip independently corroborates the high-value source-only cases. dependency-cruiser has therefore not yet demonstrated a correctness advantage that justifies a permanent dependency. Revisit if hostile fixtures or real repository patterns expose a graph gap.

### Panda CSS

Not adopted in Phase 0. TypeScript recovered the complete known B1 source oracle, and the actual SafeHome Chakra system successfully provides Chakra-specific semantic expansion. Panda remains a useful future extraction oracle if precision/fuzz testing exposes cases that the intentionally bounded evaluator cannot safely resolve.

## Provisional architecture decision

Use the smallest authority-preserving stack unless future evidence falsifies it:

1. **TypeScript Compiler API** — source facts, bounded local evaluation, symbols/types, and initially module resolution.
2. **SafeHome's actual Chakra system** — controlled configuration evaluation and semantic implications.
3. **Repo-owned evidence/claim layer** — coverage, provenance, entrypoint policy, unresolved domains, and derived claims.
4. **Knip/Panda/other tools** — independent challengers, not canonical authority unless they empirically earn a narrower role.

No `Mapped`/`Unused` conclusion should be generated from these facts. The future mapper should expose explicit usage-evidence dimensions and preserve unresolved/coverage blockers.

## Remaining Phase-0 gap

The B1 benchmark establishes recall on known reviewed facts, **not whole-repository precision**. Before freezing `safehome.design-system-evidence.v1`, the next benchmark must classify raw facts through Chakra semantics and hostile fixtures so that behavioral props/literal CSS values cannot become false token evidence.

## Next action

Implement the repo-wide semantic/domain classifier and hostile precision fixtures, then freeze the v1 fact/claim contract. Keep the mapper 2.13 UI frozen until that contract is trustworthy.
