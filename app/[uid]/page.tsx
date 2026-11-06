import { Suspense } from "react";
import { LoadingScreen } from "@/components/lovely/LoadingScreen";
import { SharedLovelyPage } from "@/components/lovely/SharedLovelyPage";

export default function Page({ params }: { params: Promise<{ uid: string }> }) {
  return (
    <Suspense fallback={<LoadingScreen message="Finding your love note..." />}>
      <SharedLovelyPage params={params} />
    </Suspense>
  );
}
