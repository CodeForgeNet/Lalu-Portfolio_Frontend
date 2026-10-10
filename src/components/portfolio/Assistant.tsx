"use client";
import dynamic from "next/dynamic";
const Chat = dynamic(() => import("@/components/Chat"), {
  ssr: false,
  loading: () => (
    <div className="assistant-shell" role="status">
      Loading the portfolio assistant…
    </div>
  ),
});
export default function Assistant() {
  return <Chat />;
}
