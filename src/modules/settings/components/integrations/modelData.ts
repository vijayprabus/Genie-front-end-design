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
  providerType: "simple" | "bedrock" | "azure" | "huggingface" | "selfhosted" | "genie";
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
    providerType: "azure",
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
    id: "bedrock",
    name: "Amazon Bedrock",
    description: "AWS-hosted foundation models",
    configured: false,
    panelMode: "add-provider",
    providerType: "bedrock",
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
    id: "groq",
    name: "Groq",
    description: "Ultra-fast inference",
    configured: false,
    panelMode: "add-provider",
    providerType: "simple",
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

// ---- 6. Self-Hosted Meta --------------------------------------------------

export const selfHostedMeta: Record<
  string,
  {
    name: string;
    endpointUrl: string;
    maskedKey: string;
    modelId: string;
    workers: WorkerUsage[];
  }
> = {
  "marico-llm": {
    name: "Marico Internal LLM",
    endpointUrl: "https://llm.marico.internal/v1",
    maskedKey: "mk-••••8f3a",
    modelId: "llama-3.1-70b",
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
