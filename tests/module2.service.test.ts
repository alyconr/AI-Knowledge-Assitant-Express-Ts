
import {
  describe,
  it,
  expect,
  vi,
} from "vitest";

import {
  createExtractorService,
} from "../src/services/extract.services.js";

import type {
  StructuredGenerator,
} from "../src/ai/openrouter-structured.js";

const modelId = "test/fixture:free";

const activity = {
  title: "Crear una API",
  summary: "Desarrollar una API REST con Express",
  topics: ["Express", "TypeScript"],
  difficulty: "media",
  estimatedHours: 4,
  deadline: null,
};

const request = {
  text: "Crear una API REST con Express y TypeScript.",
  mode: "structured" as const,
};

describe("Módulo II - ExtractorService", () => {

  it("genera y valida información estructurada", async () => {
    const generate = vi.fn().mockResolvedValue({
      content: JSON.stringify(activity),
      model: modelId,
      usage: null,
    });

    const generator: StructuredGenerator = {
      generate,
    };

    const service = createExtractorService(
      generator,
      modelId
    );

    const result = await service.extract(request);

    expect(result.model).toBe(modelId);
    expect(result.mode).toBe("structured");
    expect(result.data.estimatedHours).toBe(4);

    expect(generate).toHaveBeenCalledOnce();

    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: modelId,
        mode: "structured",
      })
    );
  });

  it("rechaza JSON inválido", async () => {
    const generator: StructuredGenerator = {
      generate: vi.fn().mockResolvedValue({
        content: "{json_invalido",
        model: modelId,
        usage: null,
      }),
    };

    const service = createExtractorService(
      generator,
      modelId
    );

    await expect(
      service.extract(request)
    ).rejects.toMatchObject({
      statusCode: 502,
      code: "MODEL_INVALID_JSON",
    });
  });

  it("rechaza datos que incumplen Zod", async () => {
    const generator: StructuredGenerator = {
      generate: vi.fn().mockResolvedValue({
        content: JSON.stringify({
          ...activity,
          estimatedHours: "cuatro horas",
        }),
        model: modelId,
        usage: null,
      }),
    };

    const service = createExtractorService(
      generator,
      modelId
    );

    await expect(
      service.extract(request)
    ).rejects.toMatchObject({
      statusCode: 502,
      code: "MODEL_SCHEMA_VIOLATION",
    });
  });

  it("construye mensajes system y user", async () => {
    const generate = vi.fn().mockResolvedValue({
      content: JSON.stringify(activity),
      model: modelId,
      usage: null,
    });

    const service = createExtractorService(
      { generate },
      modelId
    );

    await service.extract(request);

    const input = generate.mock.calls[0][0];

    expect(input.messages).toHaveLength(2);
    expect(input.messages[0].role).toBe("system");
    expect(input.messages[1].role).toBe("user");
    expect(input.messages[1].content).toContain(
      "Express"
    );
  });

  it("rechaza ausencia de modelo", async () => {
    const service = createExtractorService(
      {
        generate: vi.fn(),
      },
      ""
    );

    await expect(
      service.extract(request)
    ).rejects.toMatchObject({
      statusCode: 503,
      code: "MODEL_NOT_CONFIGURED",
    });
  });
});
