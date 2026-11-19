
import {
  readFileSync,
  writeFileSync,
} from "node:fs";

import {
  cwd,
} from "node:process";

import {
  resolve,
} from "node:path";

const basePath = resolve(
  cwd(),
  "docs",
  "openapi.json"
);

const modulePath = resolve(
  cwd(),
  "docs",
  "modulo2.openapi.json"
);

const baseDocument = JSON.parse(
  readFileSync(basePath, "utf8")
);

const moduleDocument = JSON.parse(
  readFileSync(modulePath, "utf8")
);

const merged = {
  ...baseDocument,

  paths: {
    ...baseDocument.paths,
    ...moduleDocument.paths,
  },

  components: {
    ...baseDocument.components,

    schemas: {
      ...baseDocument.components?.schemas,
      ...moduleDocument.components?.schemas,
    },

    responses: {
      ...baseDocument.components?.responses,
      ...moduleDocument.components?.responses,
    },
  },
};

writeFileSync(
  basePath,
  JSON.stringify(merged, null, 2) + "\n",
  "utf8"
);

console.log(
  "Módulo II integrado en docs/openapi.json"
);
