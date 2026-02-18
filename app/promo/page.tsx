import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PromoClient } from "./promo-client";

export default function PromoPage() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Promo Ideas (Global)</CardTitle>
          <CardDescription>
            Generate 2–3 promo themes berbasis <b>seluruh customer base</b> (trend interest tags), lengkap dengan segment + message siap kirim.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromoClient />
        </CardContent>
      </Card>
    </div>
  );
}


