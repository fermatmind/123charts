import { frameworkPage, frameworkMetadata } from "@/lib/charts/pages";
export const dynamic = "force-dynamic";
export const generateMetadata = frameworkMetadata(["dashboard", "projects"]);
export default frameworkPage(["dashboard", "projects"]);
