import Ajv from "ajv";
import addFormats from "ajv-formats";

function formatErrors(artifact, errors) {
  return errors
    .map((error) => {
      const path = error.instancePath || "/";
      return `${artifact}${path}: ${error.message} (${error.schemaPath})`;
    })
    .join("\n");
}

export function validateDesignTokenArtifact(artifact, schema, document) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  if (!validate(document)) {
    throw new Error(
      `JSON Schema validation failed:\n${formatErrors(artifact, validate.errors ?? [])}`
    );
  }
}
