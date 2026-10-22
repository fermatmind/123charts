"use client";
import type { AnchorHTMLAttributes } from "react";
export function OfficialLink({
  productId,
  surface,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  productId: string;
  surface: string;
}) {
  return (
    <a
      {...props}
      href={
        "/api/v1/events/outbound?" +
        new URLSearchParams({ product_id: productId, surface })
      }
      onClick={() => {
        void fetch("/api/v1/events/outbound", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            surface,
            event_id: crypto.randomUUID(),
            automated: navigator.webdriver,
          }),
          keepalive: true,
        }).catch(() => {});
      }}
    >
      {children}
    </a>
  );
}
