import { frameworkPage, frameworkMetadata } from "@/lib/charts/pages";
export const dynamic = "force-dynamic";
export const generateMetadata = frameworkMetadata(["charts", ":slug"]);
export default frameworkPage(["charts", ":slug"]);
