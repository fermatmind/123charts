"use client";
import { ChartsProvider } from "./context";
import { ZoneFrame } from "./site-shell";
import type { ZoneProps } from "./public-app";
import { DiscoveryAdmin } from "./discovery-admin";
export default function AdminApp(props: ZoneProps) {
  return (
    <ChartsProvider {...props} zone="admin">
      <ZoneFrame zone="admin">
        <DiscoveryAdmin section={props.path[1]} />
      </ZoneFrame>
    </ChartsProvider>
  );
}
