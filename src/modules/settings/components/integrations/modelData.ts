// ---------------------------------------------------------------------------
// modelData.ts — Static types and data for the Models tab (Integrations page)
// ---------------------------------------------------------------------------

// ---- Types ----------------------------------------------------------------

export type ModelPanelMode =
  | "genie-info"
  | "edit-provider"
  | "add-provider"
  | "edit-selfhosted"
  | "add-selfhosted";

export interface WorkerUsage {
  model: string;
  workerCount: number;
}

export interface ProviderConfig {
  name: string;
  maskedKey: string;
  workers: WorkerUsage[];
  authMethod?: "api_key" | "iam";
  region?: string;
  maskedAccessKeyId?: string;
  maskedSecretKey?: string;
  endpointUrl?: string;
  deploymentName?: string;
}

export interface ModelProviderItem {
  id: string;
  name: string;
  description: string;
  configured: boolean;
  selfHosted?: boolean;
  maskedKey?: string;
  paused?: boolean;
  panelMode: ModelPanelMode;
  providerType: "simple" | "bedrock" | "azure" | "huggingface" | "selfhosted" | "genie" | "catalog" | "hosting";
}

// ---- 1. Genie Managed (Default section) -----------------------------------

export const genieManaged: ModelProviderItem = {
  id: "genie",
  name: "Genie Managed",
  description: "Auto-selects best model",
  configured: true,
  panelMode: "genie-info",
  providerType: "genie",
};

// ---- 2. Configured Providers ----------------------------------------------

export const configuredProviders: ModelProviderItem[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude language models",
    configured: true,
    maskedKey: "sk-ant-••••4f2d",
    panelMode: "edit-provider",
    providerType: "simple",
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    description: "Azure-hosted OpenAI models",
    configured: true,
    paused: true,
    maskedKey: "az-••••1234",
    panelMode: "edit-provider",
    providerType: "hosting",
  },
  {
    id: "groq",
    name: "Groq",
    description: "Ultra-fast inference",
    configured: true,
    maskedKey: "gsk-••••a3f1",
    panelMode: "edit-provider",
    providerType: "catalog",
  },
  {
    id: "bedrock",
    name: "Amazon Bedrock",
    description: "AWS-hosted foundation models",
    configured: true,
    maskedKey: "AKIA••••WXYZ",
    panelMode: "edit-provider",
    providerType: "bedrock",
  },
];

// ---- 3. Self-Hosted Configured --------------------------------------------

export const selfHostedConfigured: ModelProviderItem[] = [
  {
    id: "marico-llm",
    name: "Marico Internal LLM",
    description: "Self-hosted internal model endpoint",
    configured: true,
    selfHosted: true,
    maskedKey: "llm.marico.internal/v1",
    panelMode: "edit-selfhosted",
    providerType: "selfhosted",
  },
];

// ---- 4. Available Providers (not yet configured) --------------------------

export const availableProviders: ModelProviderItem[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT and o-series models",
    configured: false,
    panelMode: "add-provider",
    providerType: "simple",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Multimodal AI models",
    configured: false,
    panelMode: "add-provider",
    providerType: "simple",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "European AI models",
    configured: false,
    panelMode: "add-provider",
    providerType: "simple",
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Enterprise language models",
    configured: false,
    panelMode: "add-provider",
    providerType: "simple",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "Chinese open-source AI models",
    configured: false,
    panelMode: "add-provider",
    providerType: "simple",
  },
  {
    id: "minimax",
    name: "MiniMax",
    description: "Chinese multimodal models",
    configured: false,
    panelMode: "add-provider",
    providerType: "simple",
  },
  {
    id: "moonshot",
    name: "Moonshot AI",
    description: "Kimi language models",
    configured: false,
    panelMode: "add-provider",
    providerType: "simple",
  },
  {
    id: "cerebras",
    name: "Cerebras",
    description: "Ultra-fast wafer-scale inference",
    configured: false,
    panelMode: "add-provider",
    providerType: "catalog",
  },
  {
    id: "xai",
    name: "xAI",
    description: "Grok language models",
    configured: false,
    panelMode: "add-provider",
    providerType: "simple",
  },
  {
    id: "huggingface",
    name: "HuggingFace",
    description: "Open-source model hub & inference",
    configured: false,
    panelMode: "add-provider",
    providerType: "huggingface",
  },
];

// ---- 5. Provider Meta (per-provider configuration details) ----------------

export const providerMeta: Record<string, ProviderConfig> = {
  anthropic: {
    name: "Anthropic",
    maskedKey: "sk-ant-••••4f2d",
    workers: [
      { model: "Claude Sonnet 4", workerCount: 3 },
      { model: "Claude Haiku 3.5", workerCount: 1 },
    ],
  },
  openai: {
    name: "OpenAI",
    maskedKey: "",
    workers: [],
  },
  bedrock: {
    name: "Amazon Bedrock",
    maskedKey: "",
    authMethod: "iam",
    region: "us-east-1",
    maskedAccessKeyId: "AKIA••••••••WXYZ",
    maskedSecretKey: "wJal••••••••••••fiCY",
    workers: [
      { model: "Claude 3.5 Sonnet (Bedrock)", workerCount: 2 },
    ],
  },
  azure: {
    name: "Azure OpenAI",
    maskedKey: "az-••••1234",
    endpointUrl: "https://marico-ai.openai.azure.com/",
    deploymentName: "gpt-4o-prod",
    workers: [
      { model: "GPT-4o (Azure)", workerCount: 1 },
    ],
  },
  gemini: {
    name: "Google Gemini",
    maskedKey: "",
    workers: [],
  },
  mistral: {
    name: "Mistral AI",
    maskedKey: "",
    workers: [],
  },
  cohere: {
    name: "Cohere",
    maskedKey: "",
    workers: [],
  },
  deepseek: {
    name: "DeepSeek",
    maskedKey: "",
    workers: [],
  },
  minimax: {
    name: "MiniMax",
    maskedKey: "",
    workers: [],
  },
  moonshot: {
    name: "Moonshot AI",
    maskedKey: "",
    workers: [],
  },
  groq: {
    name: "Groq",
    maskedKey: "gsk-••••a3f1",
    workers: [],
  },
  cerebras: {
    name: "Cerebras",
    maskedKey: "",
    workers: [],
  },
  xai: {
    name: "xAI",
    maskedKey: "",
    workers: [],
  },
  huggingface: {
    name: "HuggingFace",
    maskedKey: "",
    workers: [],
  },
};

// ---- 5a. Provider Deployments (hosting-type providers) --------------------

export const providerDeployments: Record<string, Deployment[]> = {
  azure: [
    { id: "dep-1", name: "gpt-4o-prod", status: "passed", foundationalModelId: "gpt-4o" },
    { id: "dep-2", name: "gpt-35-turbo", status: "passed", foundationalModelId: "gpt-35-turbo" },
  ],
  bedrock: [
    { id: "dep-3", name: "anthropic.claude-3-5-sonnet-v2", status: "passed", foundationalModelId: "claude-35-sonnet" },
    { id: "dep-4", name: "meta.llama3-1-70b-instruct-v1", status: "passed", foundationalModelId: "llama-31-70b" },
  ],
};

// ---- 5b. Catalog Models (per-provider model lists) ------------------------

export interface CatalogModel {
  id: string;
  name: string;
  capability: "chat" | "code" | "vision" | "embedding";
  params: string;
  enabled: boolean;
}

export interface FoundationalModel {
  id: string;
  name: string;
  family: string;
  capabilities: string[];
}

export const foundationalModels: FoundationalModel[] = [
  // OpenAI
  { id: "gpt-4o", name: "GPT-4o", family: "OpenAI", capabilities: ["Chat", "Vision"] },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", family: "OpenAI", capabilities: ["Chat"] },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", family: "OpenAI", capabilities: ["Chat", "Vision"] },
  { id: "gpt-35-turbo", name: "GPT-3.5 Turbo", family: "OpenAI", capabilities: ["Chat"] },
  { id: "o1", name: "o1", family: "OpenAI", capabilities: ["Chat", "Reasoning"] },
  { id: "o1-mini", name: "o1 Mini", family: "OpenAI", capabilities: ["Chat", "Reasoning"] },
  // Anthropic
  { id: "claude-35-sonnet", name: "Claude 3.5 Sonnet", family: "Anthropic", capabilities: ["Chat", "Code", "Vision"] },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", family: "Anthropic", capabilities: ["Chat"] },
  { id: "claude-3-opus", name: "Claude 3 Opus", family: "Anthropic", capabilities: ["Chat", "Code", "Vision"] },
  // Meta
  { id: "llama-31-70b", name: "Llama 3.1 70B", family: "Meta", capabilities: ["Chat", "Code"] },
  { id: "llama-31-8b", name: "Llama 3.1 8B", family: "Meta", capabilities: ["Chat"] },
  { id: "llama-33-70b", name: "Llama 3.3 70B", family: "Meta", capabilities: ["Chat", "Code"] },
  // Google
  { id: "gemini-15-pro", name: "Gemini 1.5 Pro", family: "Google", capabilities: ["Chat", "Vision"] },
  { id: "gemini-15-flash", name: "Gemini 1.5 Flash", family: "Google", capabilities: ["Chat"] },
  // Mistral
  { id: "mistral-large", name: "Mistral Large", family: "Mistral", capabilities: ["Chat", "Code"] },
  { id: "mixtral-8x7b", name: "Mixtral 8x7B", family: "Mistral", capabilities: ["Chat"] },
];

export interface Deployment {
  id: string;
  name: string;
  status: "untested" | "testing" | "passed" | "failed";
  error?: string;
  foundationalModelId?: string;
}

export const catalogModels: Record<string, CatalogModel[]> = {
  groq: [
    { id: "llama-3.3-70b", name: "Llama 3.3 70B", capability: "chat", params: "70B", enabled: true },
    { id: "llama-3.1-8b", name: "Llama 3.1 8B", capability: "chat", params: "8B", enabled: true },
    { id: "mixtral-8x7b", name: "Mixtral 8x7B", capability: "chat", params: "MoE · 46.7B", enabled: true },
    { id: "llama-3.2-11b-vision", name: "Llama 3.2 11B Vision", capability: "vision", params: "11B", enabled: false },
    { id: "gemma-2-9b", name: "Gemma 2 9B", capability: "chat", params: "9B", enabled: false },
  ],
  cerebras: [
    { id: "llama-3.3-70b", name: "Llama 3.3 70B", capability: "chat", params: "70B", enabled: true },
    { id: "llama-3.1-8b", name: "Llama 3.1 8B", capability: "chat", params: "8B", enabled: true },
    { id: "llama-3.1-70b", name: "Llama 3.1 70B", capability: "chat", params: "70B", enabled: true },
    { id: "deepseek-r1-distill-70b", name: "DeepSeek R1 Distill 70B", capability: "code", params: "70B", enabled: false },
  ],
};

// ---- 6. Self-Hosted Meta --------------------------------------------------

export const selfHostedMeta: Record<
  string,
  {
    name: string;
    endpointUrl: string;
    maskedKey: string;
    modelId: string;
    foundationalModelId?: string;
    compatMethod?: "openai" | "custom";
    workers: WorkerUsage[];
  }
> = {
  "marico-llm": {
    name: "Marico Internal LLM",
    endpointUrl: "https://llm.marico.internal/v1",
    maskedKey: "mk-••••8f3a",
    modelId: "llama-3.1-70b",
    foundationalModelId: "llama-31-70b",
    compatMethod: "openai",
    workers: [{ model: "Llama 3.1 70B", workerCount: 2 }],
  },
};

// ---- 7. Test Messages (toast text after connection test) ------------------

export const testMessages: Record<string, string> = {
  anthropic: "Tested Claude Haiku 3.5 \u00b7 138ms response",
  openai: "Tested GPT-4o Mini \u00b7 95ms response",
  bedrock: "Tested Claude 3.5 Sonnet via Bedrock \u00b7 210ms response",
  azure: "Tested gpt-4o-prod deployment \u00b7 164ms response",
  gemini: "Tested Gemini 1.5 Pro \u00b7 112ms response",
  mistral: "Tested Mistral Large \u00b7 104ms response",
  cohere: "Tested Command R+ \u00b7 118ms response",
  deepseek: "Tested DeepSeek V3 \u00b7 132ms response",
  groq: "Tested Llama 3.1 70B via Groq \u00b7 42ms response",
  xai: "Tested Grok-2 \u00b7 89ms response",
  minimax: "Tested MiniMax abab6.5 \u00b7 147ms response",
  moonshot: "Tested Moonshot Kimi \u00b7 156ms response",
  huggingface: "Tested Llama 3.1 8B via HF Inference \u00b7 185ms response",
  cerebras: "Tested Llama 3.3 70B via Cerebras \u00b7 28ms response",
  "marico-llm": "Tested Llama 3.1 70B (self-hosted) \u00b7 78ms response",
};

// ---- 8. Provider Names (id -> display name) -------------------------------

export const providerNames: Record<string, string> = {
  genie: "Genie Managed",
  anthropic: "Anthropic",
  openai: "OpenAI",
  gemini: "Google Gemini",
  mistral: "Mistral AI",
  bedrock: "Amazon Bedrock",
  azure: "Azure OpenAI",
  cohere: "Cohere",
  deepseek: "DeepSeek",
  minimax: "MiniMax",
  moonshot: "Moonshot AI",
  groq: "Groq",
  xai: "xAI",
  huggingface: "HuggingFace",
  cerebras: "Cerebras",
  "marico-llm": "Marico Internal LLM",
};

// ---- 9. Bedrock Regions ---------------------------------------------------

export const bedrockRegions: string[] = [
  "us-east-1",
  "us-west-2",
  "eu-west-1",
  "eu-central-1",
  "ap-southeast-1",
  "ap-northeast-1",
];
