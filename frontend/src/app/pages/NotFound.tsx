import React from "react";
import { useNavigate } from "react-router";
import { Code2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useLanguage } from "../context/LanguageContext";

export function NotFound() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground dark flex items-center justify-center">
      <div className="text-center space-y-6">
        <Code2 className="w-16 h-16 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <h1 className="text-4xl">404</h1>
          <p className="text-xl text-muted-foreground">{t("notFound.title")}</p>
        </div>
        <Button onClick={() => navigate("/")}>
          {t("notFound.backHome")}
        </Button>
      </div>
    </div>
  );
}
