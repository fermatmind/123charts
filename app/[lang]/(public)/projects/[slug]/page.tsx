import { frameworkPage, frameworkMetadata } from "@/lib/charts/pages";
export const dynamic = "force-dynamic";
export const generateMetadata = frameworkMetadata(["projects", ":slug"]);
export default frameworkPage(["projects", ":slug"]);
