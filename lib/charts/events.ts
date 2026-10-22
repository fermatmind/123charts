/** Best-effort user-agent classification, not proof of visitor identity. */
export function eventExclusion(
  ua: string,
  automated = false,
  internal = false,
) {
  if (automated || /headless|playwright|curl|python|integrationtest/i.test(ua))
    return "test_automation";
  if (
    /gptbot|oai-searchbot|chatgpt-user|claudebot|claude-user|perplexitybot|ccbot|bytespider|meta-externalagent/i.test(
      ua,
    )
  )
    return "ai_crawler";
  if (/bot|crawler|spider/i.test(ua)) return "crawler";
  return internal ? "self_or_internal" : null;
}
