import { Suspense } from "react";
import { SurveyWizard } from "@/components/survey/SurveyWizard";

export default function SurveyPage() {
  return (
    <Suspense
      fallback={
        <p
          style={{
            textAlign: "center",
            marginTop: "4rem",
            color: "var(--muted)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
          }}
        >
          Загрузка…
        </p>
      }
    >
      <SurveyWizard />
    </Suspense>
  );
}
