import { frameworkPage, frameworkMetadata } from "@/lib/charts/pages";
export const dynamic = "force-dynamic";
export const generateMetadata = frameworkMetadata([
  "dashboard",
  "reports",
  ":id",
]);
export default frameworkPage(["dashboard", "reports", ":id"]);
