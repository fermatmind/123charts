import { frameworkPage, frameworkMetadata } from "@/lib/charts/pages";
export const dynamic = "force-dynamic";
export const generateMetadata = frameworkMetadata(["admin", "discovery"]);
export default frameworkPage(["admin", "discovery"]);
