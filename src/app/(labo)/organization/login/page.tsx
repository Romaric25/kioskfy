import { LoginForm } from "@/components/labo/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center  p-4">
      <Suspense fallback={<div>Chargement...</div>}>
        <LoginForm redirectDefault="/organization/dashboard" />
      </Suspense>
    </div>
  );
}
