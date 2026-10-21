import { frameworkPage, frameworkMetadata } from "@/lib/charts/pages";
export const dynamic = "force-dynamic";
export const generateMetadata = frameworkMetadata(["products", ":slug"]);
export default frameworkPage(["products", ":slug"]);
