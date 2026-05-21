import {
  getEnabledModelRegistryEntries,
  type OpencodeModelDefinition,
  type OpencodeModelDefinitions,
  type ModelLimit,
  type ModelModalities,
  type ModelModality,
  type ModelThinkingConfig,
  type ModelThinkingLevel,
  type ModelVariant,
} from "../models/registry";

export type {
  ModelLimit,
  ModelModalities,
  ModelModality,
  ModelThinkingConfig,
  ModelThinkingLevel,
  ModelVariant,
  OpencodeModelDefinition,
  OpencodeModelDefinitions,
} from "../models/registry";

export const OPENCODE_MODEL_DEFINITIONS: OpencodeModelDefinitions = Object.fromEntries(
  getEnabledModelRegistryEntries().map((entry): [string, OpencodeModelDefinition] => [
    entry.id,
    {
      name: entry.name,
      limit: entry.limit,
      modalities: entry.modalities,
      ...(entry.variants ? { variants: entry.variants } : {}),
    },
  ]),
);
