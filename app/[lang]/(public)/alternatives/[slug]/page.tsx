import { frameworkPage, frameworkMetadata } from "@/lib/charts/pages";
export const dynamic = "force-dynamic";
export const generateMetadata = frameworkMetadata(["alternatives", ":slug"]);
export default frameworkPage(["alternatives", ":slug"]);
