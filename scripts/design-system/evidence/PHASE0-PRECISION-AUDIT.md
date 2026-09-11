# Phase 0 precision audit

Deterministic stratified precision audit for the SafeHome design-system evidence spike in issue #1029.

## Authority

- Repository: `sfbrigade/datasci-earthquake`
- Audit branch: `theme-evidence-phase0`
- Audited branch commit: `0580ec5d237fea3bca49f0b42fa1754a5781caa7`
- `develop` authority: `ba9e0ab536b278f7f48196ea75dda852b4e0905e`
- Audited CI run: `33951150290`
- Audited artifact: `9964876510`
- Artifact SHA-256: `a81ac4ed629fe5133efc8dcc97d664443a985565fe312e4e65fc7db7881f97b8`
- Deterministic sampling seed: `33951150290`

This audit measures precision on a deterministic stratified sample plus whole-document invariants. It does **not** establish complete whole-repository coverage.

## Audited document

The normalized repo-wide preview contains:

- 98 files
- 91 eligible files, all intentionally `partial`
- 7 excluded files
- 1,181 source facts
- 144 module facts
- 98 reachability claims
- 958 semantic facts
- 919 positive entity claims
- 23 unresolved source facts
- 8 erased TypeScript `type-import` facts
- 9 Next `framework-route-composition` facts

Because all 91 eligible files remain `partial`, the preview is not eligible to produce strong negative / unused conclusions.

## Results

### Deterministic source / semantic sample

**16 / 16 PASS**

The sample was stratified across explicit tokens, named styles, recipe defaults and variants, non-token style literals, color-palette context, bounded expressions, unresolved expressions, and exact responsive value cases.

| Stratum | Fact | Live source | Expected interpretation | Result |
| --- | --- | --- | --- | --- |
| explicit token | `sf000082` | `components-test-lib/page.tsx:92` `mb="3"` | `spacing.3` | PASS |
| explicit token | `sf000632` | `emergency-kit-steps.tsx:297` `color="fg.muted"` | `colors.fg.muted` | PASS |
| explicit token | `sf000920` | `mobile-card-hazard.tsx:164` `mt="2"` | `spacing.2` | PASS |
| explicit token | `sf000705` | `home-header.tsx:99` `gap="2"` | `spacing.2` | PASS |
| named style | `sf000870` | `mobile-card-hazard.tsx:77` `textStyle="textXSmall"` | `textStyle.textXSmall` | PASS |
| named style | `sf000110` | `earthquake-introduction/page.tsx:47` `textStyle="textMedium"` | `textStyle.textMedium` | PASS |
| recipe default | `sf000927` | `mobile-report-hazards.tsx:36` `<Menu.Root>` | Menu default variant remains implied, not explicit | PASS |
| recipe variant | `sf000338` | `address-mapper.tsx:205` `size="sm"` | explicit `button.size.sm` | PASS |
| non-token style | `sf000922` | `mobile-card-hazard.tsx:167` `display="inline-block"` | CSS literal, not token | PASS |
| non-token style | `sf000734` | `icon-wrapper.tsx:30` `flexShrink="0"` | CSS literal, not token | PASS |
| palette context | `sf001136` | `ui/color-mode.tsx:97` `colorPalette="gray"` | virtual palette context, not one concrete color token | PASS |
| bounded | `sf000346` | `card-container.tsx:30` `px={padded ? "8" : "0"}` | bounded spacing values `{8,0}` | PASS |
| bounded | `sf000604` | `emergency-kit-steps.tsx:250` `pb={isLast ? "0" : "6"}` | bounded spacing values `{0,6}` | PASS |
| unresolved | `sf000662` | `header.tsx:30` `top={showOldHeader ? "0" : undefined}` | unresolved spacing-domain evidence | PASS |
| unresolved | `sf000358` | `card-hazard.tsx:96` responsive object inside conditional | unresolved sizes-domain evidence | PASS |
| responsive exact | `sf000816` | `make-plan-steps.tsx:223` `boxSize={{base:"9",md:"10"}}` | exact cases `base→9`, `md→10` | PASS |

Named-style expansion spot checks also matched the live theme definitions: `textXSmall` expands through `fonts.body`, `fontSizes.xs`, and `fontWeights.normal`; `textPrerelease` includes `fontSizes.xs`, `lineHeights.shortest`, and `fontWeights.bold`; `headerBig` carries responsive heading sizes and `fontWeights.medium`.

### Deterministic entity-claim sample

**10 / 10 PASS**

Two claims were sampled from every claim kind present in the preview.

| Claim | Kind | Entity | Source / realm check | Result |
| --- | --- | --- | --- | --- |
| `c000661` | dependency-only | `fontWeights.normal` | semantic dependency of source-only `textXSmall` use in `mobile-card-hazard.tsx` | PASS |
| `c000670` | dependency-only | `fontSizes.xs` | semantic dependency of source-only `textXSmall` use in `mobile-card-hazard.tsx` | PASS |
| `c000059` | internal-demo-reference | `recipe.separator.orientation.horizontal` | bare Separator in components test route; recipe default implied | PASS |
| `c000768` | internal-demo-reference | `spacing.0` | `search-bar-skeleton.tsx` is imported by components test route only | PASS |
| `c000475` | product-path-reference | `recipe.badge.variant.subtle` | explicit Badge variant in product-reachable emergency-kit flow | PASS |
| `c000072` | product-path-reference | `layerStyle.headerMain` | explicit style on earthquake-introduction product page | PASS |
| `c000069` | semantic-product-path-reference | `fontSizes.4xl` | semantic dependency of `headerBig` on product page | PASS |
| `c000517` | semantic-product-path-reference | `fontWeights.bold` | semantic dependency of `textPrerelease`; Header is in both product and internal-demo layouts | PASS |
| `c000188` | source-only-reference | `textStyle.textXSmall` | archived footer source only | PASS |
| `c000701` | source-only-reference | `recipe.button.size.md` | bare Button in source-only `mobile-report-hazards.tsx`; default implied | PASS |

Whole-document realm/kind consistency check over all **919 claims** found **0 mismatches** between claim realms/kinds and their reachability basis.

### Deterministic reachability sample

**8 / 8 PASS**

Two files were sampled from each final reachability class.

| File | Expected realms | Manual basis | Result |
| --- | --- | --- | --- |
| `search-bar-skeleton.tsx` | internal-demo | directly imported by `components-test-lib/page.tsx`; no product route import | PASS |
| `share.tsx` | internal-demo | directly imported by `components-test-lib/page.tsx`; product header currently does not render Share | PASS |
| `footer.tsx` | product + internal-demo | map layout imports Footer; other layout composes `LayoutScrollable`, which imports Footer | PASS |
| `styles/theme.ts` | product + internal-demo | both route layouts use Provider; Provider imports the SafeHome system | PASS |
| `useHazardDataFetcher.ts` | product | map page → AddressMapper → hook; demo CardHazard→AddressMapper relationship is type-erased | PASS |
| `map.tsx` | product | map page → AddressMapper → Map; no demo runtime path | PASS |
| `postcss.config.ts` | source-only | tooling source, not a Next runtime entry/import | PASS |
| `layout-height-constrained.tsx` | source-only | no runtime importer found; Knip independently flags it as an unused/source-only candidate | PASS |

An independent recomputation of all **98 reachability claims** from the final document's runtime module facts plus framework route-composition facts found **0 mismatches**.

## Defects found by the audit and repaired

The audit was not merely confirmatory. It found three concrete modeling defects before freeze:

1. **False token domain from name heuristic**
   - `whiteSpace` was incorrectly classified as the `spacing` token domain because of substring matching.
   - Repair: Chakra utility metadata is authoritative for recognized Chakra properties; heuristic fallback is restricted to custom typed fields.
   - Normalization now removes this one suspect fact rather than speculatively rewriting it.

2. **Type-only imports inflated runtime reachability**
   - TypeScript imports used only for types, including `data.ts → mobile-card-hazard.tsx` and `card-hazard.tsx → address-mapper.tsx`, were initially treated as runtime edges.
   - Repair: compare source imports with TypeScript's emitted JavaScript. Erased relationships remain visible as `type-import` module facts but do not affect runtime realms.
   - Final preview contains 8 `type-import` facts.

3. **Next App Router layout composition was missing**
   - Pure import reachability missed framework-owned composition such as `components-test-lib/page.tsx → (other)/layout.tsx`.
   - Repair: versioned Next route policy emits `framework-route-composition` facts for route leaves and ancestor layout/template structure.
   - Final preview contains 9 framework composition facts, validated against the repository route tree.

No fourth defect was found in the final deterministic sample.

## Phase-0 decision

**Freeze the `safehome.design-system-evidence.v1` contract shape for this spike.**

Canonical implementation direction:

1. TypeScript Compiler API for source facts, contextual types, and bounded local evaluation.
2. TypeScript emitted-module semantics to separate runtime from erased type dependencies.
3. Explicit versioned Next App Router structural composition for framework-owned runtime edges.
4. The actual SafeHome Chakra system for token domains, named-style expansion, palette semantics, and recipe defaults.
5. Repo-owned evidence and claim policies for provenance, realms, coverage, blockers, and derived conclusions.
6. Knip and other tools remain independent challengers unless they empirically earn a narrower canonical role.

## Remaining gap

Precision is now strong enough to continue, but **completeness is intentionally not claimed**. All 91 eligible files remain `partial` because local-wrapper propagation and per-file completeness proofs are not implemented.

Therefore:

- positive evidence can be inspected and used;
- unresolved evidence remains explicit;
- `Mapped` / `Unused` must not be reintroduced as binary authority;
- no strong-negative or removal recommendation should be generated yet.

## Next action

Implement wrapper propagation and per-file completeness accounting so `partial` files can graduate to `complete` only with evidence. Then define strong-negative eligibility from coverage + unresolved-domain blockers. Keep mapper 2.13 frozen until that evidence layer passes its own audit.
