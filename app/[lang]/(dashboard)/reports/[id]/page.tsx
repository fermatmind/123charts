import { frameworkPage, frameworkMetadata } from "@/lib/charts/pages";
export const dynamic = "force-dynamic";
export const generateMetadata = frameworkMetadata(["reports", ":id"]);
export default frameworkPage(["reports", ":id"]);
