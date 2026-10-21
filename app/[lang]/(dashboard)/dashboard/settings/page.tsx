import { frameworkPage, frameworkMetadata } from "@/lib/charts/pages";
export const dynamic = "force-dynamic";
export const generateMetadata = frameworkMetadata(["dashboard", "settings"]);
export default frameworkPage(["dashboard", "settings"]);
