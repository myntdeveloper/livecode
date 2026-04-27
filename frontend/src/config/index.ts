type AppImportMeta = ImportMeta & {
  env: Record<string, string | undefined>;
};

const env = (import.meta as AppImportMeta).env;

export const config = {
  apiUrl: env.VITE_API_URL ?? "/api",
  executorUrl: env.VITE_EXECUTOR_URL ?? "/executor",
};