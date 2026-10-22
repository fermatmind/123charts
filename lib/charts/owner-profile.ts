import { z } from "zod";
import type { Locale } from "./types";
const httpURL = z
  .string()
  .max(500)
  .refine((value) => {
    try {
      const u = new URL(value);
      return (
        ["http:", "https:"].includes(u.protocol) && !u.username && !u.password
      );
    } catch {
      return false;
    }
  }, "Use an HTTP(S) source URL");
export const ownerSourceSchema = z
  .object({
    field: z.string().min(1).max(80),
    url: httpURL,
    checked_at: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .or(z.literal("")),
    note: z.string().max(500),
  })
  .strict();
export type OwnerSource = z.infer<typeof ownerSourceSchema>;
const profileSchema = z
  .object({
    name: z.string().min(1).max(200),
    description_en: z.string().max(2000),
    description_zh: z.string().max(2000),
    task: z.string().max(300),
    differentiator: z.string().max(700),
    price_type: z.enum(["unknown", "free", "freemium", "trial", "paid"]),
    conditions: z.string().max(1200),
    supported_languages: z.array(z.string().min(2).max(50)).max(30),
    is_open_source: z.boolean(),
    open_source_url: httpURL.or(z.literal("")),
  })
  .partial()
  .strict()
  .refine((p) => Object.keys(p).length > 0, "No editable profile fields");
const packetSchema = z
  .object({
    schema_version: z.literal("123charts-owner-profile-v1"),
    website_url: httpURL,
    profile: profileSchema,
    sources: z.array(ownerSourceSchema).max(30),
  })
  .strict();
export function parseOwnerProfile(raw: string, websiteURL: string) {
  if (new TextEncoder().encode(raw).length > 65536)
    throw Error("JSON must be 64 KB or smaller / JSON 不得超过 64 KB");
  const value = packetSchema.parse(JSON.parse(raw));
  const host = (v: string) =>
    new URL(v).hostname.toLowerCase().replace(/^www\./, "");
  if (host(value.website_url) !== host(websiteURL))
    throw Error(
      "Official domain does not match this project / 官网域名与当前项目不一致",
    );
  return { ...value.profile, owner_sources: value.sources };
}
export function ownerPrompt(name: string, websiteURL: string, locale: Locale) {
  const example = JSON.stringify(
    {
      schema_version: "123charts-owner-profile-v1",
      website_url: websiteURL,
      profile: {
        name,
        description_en: "",
        description_zh: "",
        task: "",
        differentiator: "",
        price_type: "unknown",
        conditions: "",
        supported_languages: [],
      },
      sources: [],
    },
    null,
    2,
  );
  return locale === "zh"
    ? `你是我的项目资料核实助手。项目：${name}；唯一官网：${websiteURL}。这不是第三方项目背书。
请实际访问官网、官方文档、定价页及官方许可证，只整理可以核实的信息。不能联网、页面无法读取或无可靠依据时明确说明，并保持未知；不得假装已经核实，也不得编造来源、日期、功能、用户规模或名次。不要访问或索取私有后台、账号密码及密钥。
核实：简短用途介绍、主要任务、适用对象与特点、价格类型与限制、托管/自部署成本、支持语言及开源许可证。免费使用、持续免费额度、限时试用和付费分开；开源不代表托管免费。价格未知用 unknown，未知文字用空字符串、语言用空数组；未知是否开源时省略 is_open_source 与 open_source_url。确认开源时才添加 is_open_source:true 及官方许可证链接。
为有依据的字段记录官方来源 URL、实际读取日期（YYYY-MM-DD）、依据摘要；未读取的页面不记录日期。描述须客观，不写“最佳”“领先”或保证流量。不要改变官网域名，不生成项目 ID、slug、审核状态、price_verified、名次或同行关系。中英文分别自然撰写；无法核实的事实留空。
只输出下列 JSON 格式，不加 Markdown 围栏。sources 每项格式：{"field":"price_type","url":"实际官方来源地址","checked_at":"实际读取日期或空字符串","note":"对应事实依据"}。空模板并不代表信息已经核实。输出后由我逐项核对再导入草稿，仍须平台审核。
${example}`
    : `You are helping me verify my own project profile. Project: ${name}. Canonical official website: ${websiteURL}. This is not an independent endorsement.
Actually read the official website, documentation, pricing and license. If browsing is unavailable or evidence is missing, state the limitation and leave facts unknown. Never invent citations, read dates, features, user counts or rankings. Do not request credentials or private dashboards.
Check purpose, tasks, audience, distinguishing focus, pricing and limits, hosted/self-hosting costs, supported languages and license. Distinguish sustained free use, free allowances, trials and paid plans. Open source does not imply free hosting. Use price_type unknown, empty strings and empty arrays for unknowns; omit is_open_source/open_source_url unless supported. Add is_open_source:true only with an official license URL.
For supported fields, cite an actually read official URL, actual read date (YYYY-MM-DD, empty if not read) and evidence note. Write natural English and Chinese descriptions without unsupported praise or guarantees. Keep the official domain unchanged. Never output project IDs, slugs, review states, price_verified, rankings or peer relationships.
Return only the JSON format below, without Markdown fences. Each sources entry is {"field":"price_type","url":"actual official source URL","checked_at":"actual read date or empty string","note":"supporting evidence"}. The template is not verified data. I must review every field before importing a draft; platform review still applies.
${example}`;
}
