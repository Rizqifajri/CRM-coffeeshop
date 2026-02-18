import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 pt-10">
      <Card>
        <CardHeader>
          <CardTitle>Login Mimi CRM</CardTitle>
          <CardDescription>
            Masuk untuk kelola customers & generate promo global.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="rounded-xl border border-border/70 bg-white/60 p-4 text-sm text-muted-foreground dark:bg-zinc-950/40">
                Loading...
              </div>
            }
          >
            <LoginForm />
          </Suspense>
          <p className="mt-4 text-xs text-muted-foreground">
            email: mimi@kopikita.com <br />
            password: belikopidulu
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


