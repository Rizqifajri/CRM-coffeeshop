import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatClient } from "./chat-client";

export default function ChatPage() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>AI Chat (Data-aware)</CardTitle>
          <CardDescription>
            Tanya apa saja soal segment, promo, atau customers — AI akan jawab pakai data yang tersimpan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatClient />
        </CardContent>
      </Card>
    </div>
  );
}


