import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <Container className="grid min-h-dvh place-items-center py-12">
      <EmptyState
        icon={Compass}
        title="ページが見つかりません"
        description="URL が変わったか、削除された可能性があります"
        action={
          <Link to="/">
            <Button>ホームへ戻る</Button>
          </Link>
        }
      />
    </Container>
  );
}
