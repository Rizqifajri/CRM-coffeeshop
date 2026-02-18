import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomersClient } from "./customers-client";

export default function CustomersPage() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            Add/edit/delete customers, cari berdasarkan nama atau interest tags.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomersClient />
        </CardContent>
      </Card>
    </div>
  );
}


