/** Read-only compatibility with existing external resources and historical input. */
export const LEGACY = {
  projectSchema: "88cn-project-v1",
  metricsHeader: "x-88cn-metrics-key",
  indexRepository: "88cn-index-data",
  indexLocalPath: "../88cn-index-data",
} as const;
export const PROJECT_SCHEMA = "123charts-project-v1";
export function acceptsProjectSchema(value: string) {
  return value === PROJECT_SCHEMA || value === LEGACY.projectSchema;
}
