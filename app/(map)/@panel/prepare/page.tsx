import { Suspense } from "react";
import { PanelWrapper } from "../panel-wrapper";
import Prepare from "@/components/prepare";

export default function PreparePage() {
  return (
    <Suspense fallback={null}>
      <PanelWrapper>
        <Prepare />
      </PanelWrapper>
    </Suspense>
  );
}
