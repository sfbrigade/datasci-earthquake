# Vendored DTCG schemas

The design-token tests validate canonical artifacts without network access using the official Design Tokens Community Group schemas pinned under `2025.10/`.

| File                    | Upstream source                                              | SHA-256                                                            |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| `2025.10/format.json`   | `https://www.designtokens.org/schemas/2025.10/format.json`   | `32e93b780e4e4bca778d0780cb797a560deedc470c608af16576223f7e42915f` |
| `2025.10/resolver.json` | `https://www.designtokens.org/schemas/2025.10/resolver.json` | `a5acd14318f3c347ea2d12b4ab0f873d1340e74e957c454d112672e58b1da977` |

To intentionally refresh a schema, download the same versioned URL, review the upstream diff, replace the matching vendored file, update its checksum here, and run `npm run test:design-tokens`. Never replace these files from an unversioned or `latest` URL.
