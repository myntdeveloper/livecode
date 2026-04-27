import { apiFetch } from "./client";

interface ExecuteResponse {
  output?: string;
  error?: string;
  stderr?: string;
  stdout?: string;
  timeout?: boolean;
}

export const execute = async (language: string, code: string, input: string) => {
  const res = await apiFetch("/executor/execute", {
    method: "POST",
    body: JSON.stringify({
      language,
      code,
      input,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    try {
      const errorBody = JSON.parse(errorText) as { error?: string };
      throw new Error(errorBody.error || "Execution failed");
    } catch {
      throw new Error(errorText || "Execution failed");
    }
  }

  return (await res.json()) as ExecuteResponse;
};
