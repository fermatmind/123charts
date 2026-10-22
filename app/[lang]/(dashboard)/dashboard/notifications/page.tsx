import { frameworkPage, frameworkMetadata } from "@/lib/charts/pages";
export const dynamic = "force-dynamic";
export const generateMetadata = frameworkMetadata([
  "dashboard",
  "notifications",
]);
export default frameworkPage(["dashboard", "notifications"]);
