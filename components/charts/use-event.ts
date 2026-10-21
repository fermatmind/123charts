"use client";
import { useEffect, useRef } from "react";
export function useEvent(
  projectId: string | undefined,
  kind = "project_view",
  surface = "/products",
) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!projectId) return;
    let session = sessionStorage.getItem("charts-session");
    if (!session) {
      session = crypto.randomUUID();
      sessionStorage.setItem("charts-session", session);
    }
    const key = `charts-seen:${session}:${projectId}:${kind}:${surface}`;
    if (sessionStorage.getItem(key)) return;
    let timer: ReturnType<typeof setTimeout> | undefined,
      sent = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (timer) clearTimeout(timer);
        if (
          sent ||
          !entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.5)
        )
          return;
        timer = setTimeout(() => {
          sent = true;
          void fetch(
            kind === "impression"
              ? "/api/v1/events/impression"
              : "/api/charts/event",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              keepalive: true,
              body: JSON.stringify({
                project_id: projectId,
                kind,
                surface,
                session_id: session,
                automated: navigator.webdriver,
              }),
            },
          )
            .then((r) => {
              if (r.ok) sessionStorage.setItem(key, "1");
            })
            .catch(() => {});
        }, 1000);
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [projectId, kind, surface]);
  return ref;
}
