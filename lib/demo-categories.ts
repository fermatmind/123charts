export interface DemoCategory {
  slug: string;
  title: string;
  overview: string;
  whyMatters: string;
  openSourceVsCommercial: string;
  projectSlugs: string[];
  fastestDevMomentum: string;
  faqs: { q: string; a: string }[];
  methodologyNote: string;
  sourceConfidenceNote: string;
}

export const demoCategories: DemoCategory[] = [
  {
    slug: "ai-agents",
    title: "AI Agents",
    overview:
      "AI agents are autonomous or semi-autonomous software systems that perceive their environment, make decisions, and take actions to achieve goals. This category covers frameworks, platforms, and tools for building, deploying, and orchestrating AI agents in production environments.",
    whyMatters:
      "AI agents represent a shift from passive AI tools to active, goal-driven systems. They are being deployed across customer support, software development, data analysis, and business process automation. The ecosystem is evolving rapidly with new agent frameworks, multi-agent orchestration patterns, and evaluation benchmarks emerging weekly.",
    openSourceVsCommercial:
      "The AI agent space shows a strong open-source presence. Community-driven frameworks like LangChain, CrewAI, and AutoGen dominate developer mindshare, while commercial platforms focus on enterprise deployment, observability, and managed infrastructure. The boundary between open-source frameworks and commercial managed services is a key signal to watch.",
    projectSlugs: ["aurora-code", "nucleus-ml"],
    fastestDevMomentum:
      "Projects in this category show the strongest dev momentum among indexed categories, with consistent GitHub activity, frequent releases, and active community contributions. Open-source agent frameworks tend to have faster iteration cycles than managed services.",
    faqs: [
      {
        q: "What qualifies as an AI agent project on 123Charts?",
        a: "Projects that provide frameworks, platforms, or tools for building autonomous or semi-autonomous AI agents. This includes agent orchestration, multi-agent systems, agent evaluation, and agent hosting platforms.",
      },
      {
        q: "How is dev momentum measured for AI agent projects?",
        a: "Dev Momentum is assessed from public signals including GitHub commit frequency, release cadence, contributor diversity, and community engagement. It does not use private or unverifiable data.",
      },
      {
        q: "Are all AI agent projects open source?",
        a: "No. The category includes both open-source frameworks and commercial platforms. The open-source vs commercial dimension is tracked as part of Signal Score analysis.",
      },
    ],
    methodologyNote:
      "Category projects are indexed from public sources. Signal Scores use only publicly verifiable data. Commercial readiness and product readiness scores are based on observable public signals, not private financial or usage data.",
    sourceConfidenceNote:
      "Source confidence varies by project. Projects with active public GitHub repositories and official websites receive higher source confidence. Projects without public development activity are marked as having lower source confidence.",
  },
  {
    slug: "ai-coding",
    title: "AI Coding",
    overview:
      "AI coding tools assist developers in writing, reviewing, debugging, and generating code. This category includes AI-powered code completion, code review automation, test generation, code search, and pair programming assistants that integrate with development environments.",
    whyMatters:
      "AI coding is one of the fastest-growing AI application categories. These tools are changing how software is built, reviewed, and maintained. Developer adoption metrics, IDE integration depth, and model quality are key differentiators in this category.",
    openSourceVsCommercial:
      "The AI coding category has a mix of open-source tools (code reviewers, linters, search) and commercial offerings (AI-powered IDEs, hosted code assistants). Open-source projects tend to focus on specific workflows (code review, test generation), while commercial platforms offer integrated suites with proprietary models.",
    projectSlugs: ["aurora-code"],
    fastestDevMomentum:
      "AI coding projects with open-source codebases show rapid iteration. Code review tools and test generation utilities tend to have shorter release cycles, while IDE-integrated assistants update on a slower cadence tied to editor plugin release processes.",
    faqs: [
      {
        q: "Does 123Charts track proprietary AI coding tools?",
        a: "123Charts indexes projects based on publicly available information. Proprietary tools with public product pages and documentation can be included, but Signal Scores for proprietary projects may have lower source confidence due to limited public development signals.",
      },
      {
        q: "How does 123Charts evaluate code generation quality?",
        a: "123Charts does not evaluate code generation quality directly. Signal Scores reflect product readiness, dev momentum, and market presence from public signals. Quality assessment is left to editorial review and community feedback.",
      },
    ],
    methodologyNote:
      "AI coding projects are assessed on Product Readiness (public documentation, onboarding clarity), Dev Momentum (public repository activity), and Market Presence (community adoption indicators).",
    sourceConfidenceNote:
      "Projects with public GitHub repositories, open documentation, and transparent release notes receive higher source confidence. Proprietary tools without public development activity receive lower confidence ratings.",
  },
  {
    slug: "open-source-ai",
    title: "Open Source AI",
    overview:
      "Open Source AI encompasses projects released under permissive open-source licenses that provide AI models, training frameworks, inference engines, fine-tuning tools, and model evaluation suites. This category tracks the open-source AI ecosystem beyond individual model releases.",
    whyMatters:
      "Open source AI is the foundation of the broader AI ecosystem. Open models, training frameworks, and inference tools enable wider experimentation, lower barriers to entry, and community-driven improvement. Tracking open-source AI projects reveals infrastructure trends before they appear in commercial products.",
    openSourceVsCommercial:
      "This category focuses specifically on open-source projects. The distinction from commercial offerings is central to the category. Projects are assessed on license clarity, community governance, contribution diversity, and downstream adoption rather than commercial metrics.",
    projectSlugs: ["vectorbase", "aurora-code"],
    fastestDevMomentum:
      "Open-source AI infrastructure projects show consistent, sustained development velocity. Vector databases, model serving frameworks, and fine-tuning tools demonstrate the most reliable open-source contribution patterns among indexed projects.",
    faqs: [
      {
        q: "What licenses qualify as open source for this category?",
        a: "123Charts considers MIT, Apache-2.0, BSD, and GPL-family licenses as open source. Projects with custom or restrictive source-available licenses may be included but noted as having license constraints.",
      },
      {
        q: "Does 123Charts track open-source model releases?",
        a: "The index primarily tracks tools, frameworks, and infrastructure rather than individual model releases. Model releases may be included when they are part of a broader open-source project with ongoing development activity.",
      },
    ],
    methodologyNote:
      "Open-source AI projects are assessed on license clarity, repository activity, contributor diversity, release frequency, documentation quality, and downstream adoption signals from public sources.",
    sourceConfidenceNote:
      "Public GitHub repositories provide the highest source confidence for this category. Projects with archived or low-activity repositories receive lower confidence ratings. Documentation quality and contributor responsiveness are additional confidence indicators.",
  },
  {
    slug: "local-llm",
    title: "Local LLM",
    overview:
      "Local LLM projects enable running large language models on personal or edge devices without cloud dependencies. This category covers model quantization tools, local inference engines, on-device model serving, and applications built on local-first AI infrastructure.",
    whyMatters:
      "Local LLM represents a shift toward privacy-preserving, low-latency AI that runs without cloud API dependencies. This category matters for privacy-sensitive applications, offline-capable tools, and edge deployment scenarios where cloud connectivity is unreliable or undesirable.",
    openSourceVsCommercial:
      "The local LLM space is predominantly open source. Quantization tools (llama.cpp, Ollama), local inference servers, and on-device runtime frameworks are community-driven. Commercial interest is growing in managed local deployment and enterprise on-premise AI infrastructure.",
    projectSlugs: ["scribe-ai"],
    fastestDevMomentum:
      "Local LLM projects show rapid iteration cycles driven by model quantization improvements and inference optimization. The pace of development is tied to upstream model releases and quantization technique advances rather than traditional software release cycles.",
    faqs: [
      {
        q: "What hardware is required for local LLM projects?",
        a: "Hardware requirements vary by project and model size. 123Charts does not provide hardware recommendations. Project documentation and community resources are the best source for hardware guidance.",
      },
      {
        q: "How does 123Charts evaluate local LLM project quality?",
        a: "123Charts assesses Product Readiness (documentation, ease of setup), Dev Momentum (repository activity, release frequency), and Trust Confidence (license clarity, community health). Actual model quality is not evaluated by the index.",
      },
    ],
    methodologyNote:
      "Local LLM projects are assessed on setup complexity, hardware compatibility breadth, model format support, documentation quality, and community health. Signal Scores reflect public development activity and ecosystem integration.",
    sourceConfidenceNote:
      "Projects with active, well-maintained open-source repositories receive the highest source confidence. Projects relying on binary releases without public source code receive lower confidence ratings.",
  },
  {
    slug: "rag-tools",
    title: "RAG Tools",
    overview:
      "Retrieval-Augmented Generation (RAG) tools help developers build AI applications that combine language models with external knowledge retrieval. This category covers vector databases, embedding pipelines, document parsing tools, retrieval frameworks, and end-to-end RAG platforms.",
    whyMatters:
      "RAG is the dominant pattern for grounding AI outputs in factual data. It powers enterprise knowledge bases, customer support bots, research assistants, and code-aware AI tools. The RAG ecosystem spans infrastructure (vector databases), middleware (retrieval frameworks), and applications.",
    openSourceVsCommercial:
      "The RAG tools category has strong open-source foundations in vector databases and retrieval frameworks. Commercial offerings focus on managed vector databases, hosted RAG pipelines, and enterprise knowledge management platforms. Open-source projects lead in innovation, while commercial platforms lead in managed reliability.",
    projectSlugs: ["vectorbase"],
    fastestDevMomentum:
      "Vector database projects and embedding pipeline tools show the fastest dev momentum in the RAG category. Retrieval framework projects have slightly slower cadence but broader integration surface as they add connector ecosystems.",
    faqs: [
      {
        q: "What types of RAG tools does 123Charts track?",
        a: "123Charts tracks vector databases, embedding tools, document parsing and chunking tools, retrieval frameworks, and end-to-end RAG platforms. The category focuses on developer tools and infrastructure rather than end-user RAG applications.",
      },
      {
        q: "How is vector database performance evaluated?",
        a: "123Charts does not benchmark vector database performance. Performance claims from project documentation and third-party benchmarks are noted but not independently verified by 123Charts.",
      },
    ],
    methodologyNote:
      "RAG tool projects are assessed on Product Readiness (API design, documentation), Dev Momentum (repository activity, release cadence), SEO Foundation (discoverability), and Trust Confidence (community governance, security practices).",
    sourceConfidenceNote:
      "Projects with public repositories, transparent benchmarking methodology, and documented performance characteristics receive higher source confidence. Projects making unverifiable performance claims receive lower confidence ratings.",
  },
];

export function getCategoryBySlug(
  slug: string
): DemoCategory | undefined {
  return demoCategories.find((c) => c.slug === slug);
}
