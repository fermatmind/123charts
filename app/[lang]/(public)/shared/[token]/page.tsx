import { frameworkPage, frameworkMetadata } from "@/lib/charts/pages";
export const dynamic = "force-dynamic";
export const generateMetadata = frameworkMetadata(["shared", ":token"]);
export default frameworkPage(["shared", ":token"]);
