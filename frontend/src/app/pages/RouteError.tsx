import React from "react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { useLanguage } from "../context/LanguageContext";

export function RouteError() {
  const error = useRouteError();
  const { t } = useLanguage();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : t("error.genericTitle");

  const description = isRouteErrorResponse(error)
    ? error.data?.message || t("error.notLoadedDescription")
    : error instanceof Error
      ? error.message
      : t("error.genericDescription");

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {t("error.goHome")}
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            {t("error.reload")}
          </button>
        </div>
      </section>
    </main>
  );
}
