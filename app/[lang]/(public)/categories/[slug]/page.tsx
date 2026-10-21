import { frameworkPage, frameworkMetadata } from "@/lib/charts/pages";
export const dynamic = "force-dynamic";
export const generateMetadata = frameworkMetadata(["categories", ":slug"]);
export default frameworkPage(["categories", ":slug"]);
