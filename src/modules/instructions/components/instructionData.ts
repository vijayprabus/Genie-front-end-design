// ---------------------------------------------------------------------------
// instructionData.ts — Types and mock data for the Instructions page
// ---------------------------------------------------------------------------

export type PublicationStatus = "published" | "draft" | "published_with_draft";

export interface Instruction {
  id: string;
  name: string;
  description: string;
  status: PublicationStatus;
  version: string;
  draftVersion?: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  issueCount: number;
  content: string;
}

// ---- Mock instructions.md content -----------------------------------------
// Template: YAML frontmatter (name, description) + body description +
// steps with tools (abstract categories), agents, capabilities, model classes

const kycContent = `---
name: kyc-verification
description: Compliance check workflow for new customer accounts. Validates identity documents, screens against watchlists, and assigns a risk score.
---

This instruction handles the full Know Your Customer verification workflow. It is triggered when a new customer application is submitted through the onboarding portal. The workflow verifies identity documents for authenticity, screens the applicant against regulatory watchlists, and produces a composite risk score that determines the approval path.

The workflow is designed to meet AML/CFT regulatory requirements across jurisdictions. It handles document types including passports, national IDs, and driver licenses. Failed verifications are escalated to the compliance team with a detailed report.

## Inputs

- Customer application data (full name, date of birth, nationality, address)
- Uploaded identity document (passport, national ID, or driver license)
- Selfie image for liveness verification
- Source country and residency jurisdiction

## Step 1: Document Intake & Liveness Check

**Description**: Receive the uploaded identity document and selfie. Verify the document is legible, unexpired, and unaltered. Perform liveness detection on the selfie to confirm the applicant is a real person and matches the document photo.

**Input**: Raw identity document image + selfie image
**Output**: Document validity status + liveness confidence score + extracted document fields

**Calls**:
- Tool: Document Processing (category: identity-verification)
- Tool: Image Analysis (category: biometric-verification)
- Agent: document-authenticity-checker
- Model class: vision-capable, high-accuracy

## Step 2: Data Extraction & Cross-Reference

**Description**: Extract structured identity fields from the verified document. Cross-reference the extracted data against the application form to detect discrepancies in name spelling, date of birth, or address.

**Input**: Verified document + customer application data
**Output**: Structured identity record + discrepancy report

**Calls**:
- Capability: identity-data-extraction-chain
- Tool: Data Matching (category: data-validation)
- Model class: high-reasoning

## Step 3: Watchlist & Sanctions Screening

**Description**: Screen the verified customer identity against AML/CFT watchlists, Politically Exposed Persons (PEP) databases, sanctions lists (OFAC, EU, UN), and adverse media sources. Flag any matches with confidence scores.

**Input**: Structured identity record
**Output**: Screening results with match details + confidence per source

**Calls**:
- Tool: Watchlist Screening (category: compliance-screening)
- Tool: Adverse Media Search (category: compliance-screening)
- Agent: sanctions-match-evaluator
- Model class: high-reasoning

## Step 4: Risk Score Computation

**Description**: Compute a composite risk score based on document verification confidence, watchlist screening results, geographic risk factors (country of origin, residency), and transaction pattern indicators. Assign a risk tier: low, medium, high, or critical.

**Input**: All verification outputs from Steps 1\u20133
**Output**: Composite risk score (0\u2013100) + risk tier + detailed breakdown

**Calls**:
- Agent: risk-scoring-engine
- Capability: geographic-risk-assessment-chain
- Model class: high-reasoning, deterministic-preferred

## Step 5: Decision Routing

**Description**: Route the completed verification based on the risk tier. Low-risk applicants are auto-approved. Medium-risk cases are queued for expedited manual review. High and critical-risk cases are escalated to the senior compliance officer with the full verification dossier.

**Input**: Risk score + risk tier + full verification dossier
**Output**: Routing decision + notification to appropriate queue

**Calls**:
- Tool: Queue Management (category: workflow-routing)
- Tool: Notification Delivery (category: communications)
- Agent: compliance-escalation-handler
- Model class: standard`;

const invoiceContent = `---
name: invoice-processing
description: Extract and validate invoice data from uploaded documents, match against purchase orders, and route for the appropriate approval level.
---

This instruction manages the accounts payable invoice processing workflow. It is triggered when a new document is uploaded to the invoice processing queue, either via email attachment capture or manual upload through the AP portal.

The workflow validates document type, extracts structured financial data, verifies the vendor against the approved vendor list, matches against open purchase orders in the ERP system, and routes for approval based on configurable amount thresholds. Discrepancies and unmatched invoices are flagged for manual review.

## Inputs

- Uploaded document (PDF, scanned image, or email attachment)
- Tenant-configured approved vendor list
- Open purchase order database (via ERP integration)
- Approval threshold configuration (per-tenant)

## Step 1: Document Intake & Type Validation

**Description**: Accept the uploaded document and determine its type. Validate that it is an invoice and not a receipt, credit note, statement, or other financial document. Reject invalid documents with a classification reason.

**Input**: Raw uploaded document
**Output**: Document type classification + validated invoice content (text)

**Calls**:
- Tool: Document Processing (category: document-ocr)
- Agent: financial-document-classifier
- Model class: vision-capable

## Step 2: Field Extraction

**Description**: Extract structured fields from the validated invoice: vendor name, vendor address, invoice number, invoice date, payment terms, line items (description, quantity, unit price, amount), subtotal, tax breakdown, and total amount due.

**Input**: Validated invoice text content
**Output**: Structured invoice record (JSON)

**Calls**:
- Capability: financial-field-extraction-chain
- Model class: high-reasoning, structured-output

## Step 3: Vendor Verification

**Description**: Verify the extracted vendor name and details against the tenant's approved vendor list. Check for exact and fuzzy matches. Flag invoices from unrecognized vendors for manual vendor onboarding.

**Input**: Extracted vendor details + approved vendor list
**Output**: Vendor match status + vendor ID (if matched) + confidence score

**Calls**:
- Tool: Vendor Database (category: data-lookup)
- Agent: vendor-matching-engine
- Model class: standard

## Step 4: Purchase Order Matching

**Description**: Match the validated invoice against open purchase orders in the ERP system. Compare line items, quantities, and amounts. Flag discrepancies where individual line amounts exceed 5% tolerance or where the total variance exceeds the configured threshold.

**Input**: Structured invoice record + vendor ID + open PO list
**Output**: PO match result + discrepancy report (if any)

**Calls**:
- Tool: ERP Purchase Orders (category: erp-integration)
- Capability: line-item-reconciliation-chain
- Agent: discrepancy-analyzer
- Model class: high-reasoning, deterministic-preferred

## Step 5: Approval Routing

**Description**: Route the matched invoice for approval based on the tenant's configured amount thresholds. Auto-approve invoices below the first threshold. Route to the appropriate approval level for higher amounts. Attach the full processing dossier to the approval request.

**Input**: Matched invoice + PO match result + amount thresholds
**Output**: Approval routing decision + notification to approver

**Calls**:
- Tool: Approval Workflow (category: workflow-routing)
- Tool: Notification Delivery (category: communications)
- Model class: standard

## Step 6: Exception Handling

**Description**: Handle invoices that could not be fully processed: unmatched POs, unrecognized vendors, failed validations, or amounts exceeding all configured thresholds. Create an exception record with the reason and route to the AP exceptions queue for manual resolution.

**Input**: Any failed processing output from Steps 1\u20135
**Output**: Exception record + queue assignment

**Calls**:
- Tool: Exception Queue (category: workflow-routing)
- Agent: exception-classification-handler
- Model class: standard`;

const onboardingContent = `---
name: customer-onboarding
description: Guide new customers through initial setup, configure integrations, and send welcome communications.
---

This instruction handles the customer onboarding workflow for new accounts. It is triggered after a customer completes signup and payment. The workflow collects business context, recommends and configures relevant integrations, provisions the customer workspace, and sends personalized welcome communications.

This is a draft instruction currently being developed for the Onboard Agent worker. It has not been published to production.

## Inputs

- Customer profile from CRM (company name, industry, size, plan tier)
- Available integration catalog for the customer's plan
- Welcome communication templates
- Tenant provisioning API access

## Step 1: Business Context Collection

**Description**: Analyze the customer's CRM profile to understand their industry, company size, and likely use cases. Generate a prioritized list of recommended integrations and configuration options based on similar customer patterns.

**Input**: Customer CRM profile
**Output**: Business context summary + recommended integration list (ranked)

**Calls**:
- Tool: CRM Data Access (category: crm-integration)
- Agent: customer-profile-analyzer
- Capability: industry-pattern-matching-chain
- Model class: high-reasoning

## Step 2: Integration Setup

**Description**: For each recommended integration the customer accepts, configure the connection. Validate credentials, test the connection, and confirm data flow. Handle setup failures gracefully with clear error messages.

**Input**: Selected integrations + customer credentials
**Output**: Integration status per connection (connected / failed / pending)

**Calls**:
- Tool: Integration Configuration (category: platform-setup)
- Tool: Credential Validation (category: security-verification)
- Agent: connection-test-runner
- Model class: standard

## Step 3: Welcome Communications

**Description**: Generate and send personalized welcome communications based on the customer's profile and configured integrations. Include getting-started guides relevant to their setup.

**Input**: Customer profile + configured integrations
**Output**: Sent communication confirmation

**Calls**:
- Tool: Communication Delivery (category: communications)
- Capability: personalized-content-generation-chain
- Model class: high-reasoning, creative`;

const emailContent = `---
name: email-classification
description: Sort and route incoming emails by intent, urgency, and department. Auto-respond to common queries.
---

This instruction processes incoming emails for the customer support system. It classifies each email by intent and urgency, routes to the appropriate department queue, and triggers auto-responses for common query types. The workflow handles multi-language emails and can detect when an email contains multiple intents that need to be split into separate tickets.

This instruction has 2 unresolved issues: the Communication Templates tool reference is pending connection, and the multi-language capability requires a language-detection model class that hasn't been configured.

## Inputs

- Incoming email (subject line, body text, sender address, CC list, attachments)
- Department routing rules (per-tenant configuration)
- Auto-response template library
- Customer history (previous tickets, account tier)

## Step 1: Language Detection & Translation

**Description**: Detect the language of the incoming email. If not in the tenant's primary language, translate while preserving the original for reference. Flag multi-language emails for special handling.

**Input**: Raw email content
**Output**: Detected language + translated content (if applicable) + original preserved

**Calls**:
- Agent: language-detector
- Capability: translation-chain
- Model class: multilingual-capable

## Step 2: Intent Classification

**Description**: Classify the email into primary intent categories: support-request, sales-inquiry, billing-question, feedback, complaint, spam, or other. Detect urgency level (critical, high, medium, low) based on content signals, sender tier, and subject line keywords.

**Input**: Email content (translated if needed) + customer history
**Output**: Intent classification + urgency level + confidence score

**Calls**:
- Agent: intent-classifier
- Tool: Customer Data Lookup (category: crm-integration)
- Model class: high-reasoning

## Step 3: Multi-Intent Detection

**Description**: Analyze whether the email contains multiple distinct requests that should be handled separately. If detected, split into individual intent records, each with its own classification and routing.

**Input**: Classified email content
**Output**: Single intent OR split intent records

**Calls**:
- Agent: multi-intent-splitter
- Model class: high-reasoning

## Step 4: Department Routing

**Description**: Route each classified intent to the appropriate department queue based on the tenant's routing rules. Factor in agent availability, current queue depth, and required skills. Assign priority based on urgency and customer tier.

**Input**: Classified intent(s) + routing rules + queue state
**Output**: Queue assignment(s) + priority level

**Calls**:
- Tool: Queue Management (category: workflow-routing)
- Tool: Agent Availability (category: workforce-management)
- Model class: standard

## Step 5: Auto-Response Generation

**Description**: For common query types with high classification confidence (>95%), generate and send an auto-response using the appropriate template. Personalize with customer name and relevant account details. Include a note that a human agent will follow up if the auto-response doesn't resolve the issue.

**Input**: Classified intent + customer details + template library
**Output**: Auto-response sent confirmation (or skipped if confidence too low)

**Calls**:
- Tool: Communication Templates (category: communications)
- Capability: personalized-response-generation-chain
- Model class: high-reasoning, creative`;

const leadContent = `---
name: lead-qualification
description: Score and prioritize inbound leads based on firmographic data, engagement signals, and ideal customer profile match.
---

This instruction processes inbound leads as they enter the sales pipeline. It enriches raw lead data with firmographic information, scores against the ideal customer profile, and assigns a qualification tier that determines sales team routing. The scoring model is configurable per-tenant with adjustable weights.

## Inputs

- Inbound lead data (email address, company name, source channel, form responses)
- Firmographic enrichment database access
- Ideal Customer Profile scoring model (per-tenant weights)
- Sales team routing rules

## Step 1: Lead Enrichment

**Description**: Enrich the raw lead data with firmographic information: company size (employees), annual revenue, industry classification, technology stack, funding stage, and geographic presence. Handle cases where enrichment data is unavailable by flagging gaps.

**Input**: Raw lead data (email, company name)
**Output**: Enriched lead record with firmographic fields + data completeness score

**Calls**:
- Tool: Business Data Enrichment (category: data-enrichment)
- Agent: firmographic-researcher
- Model class: standard

## Step 2: ICP Scoring

**Description**: Score the enriched lead against the tenant's Ideal Customer Profile model. Apply weighted factors: company size (30%), industry match (25%), engagement signals (25%), budget indicators (20%). Generate a score from 1\u2013100 and assign a tier: hot (80+), warm (50\u201379), cool (25\u201349), or cold (<25).

**Input**: Enriched lead record + ICP scoring model
**Output**: Lead score (1\u2013100) + qualification tier + factor breakdown

**Calls**:
- Agent: icp-scoring-engine
- Capability: engagement-signal-analysis-chain
- Model class: high-reasoning, deterministic-preferred

## Step 3: Sales Routing

**Description**: Route the scored lead to the appropriate sales resource based on the qualification tier and the tenant's routing rules. Hot leads go to senior AEs with immediate notification. Warm leads enter the SDR sequence. Cool and cold leads enter nurture campaigns.

**Input**: Scored lead + qualification tier + routing rules
**Output**: Routing assignment + notification to assigned rep

**Calls**:
- Tool: CRM Lead Assignment (category: crm-integration)
- Tool: Notification Delivery (category: communications)
- Model class: standard`;

const ticketContent = `---
name: ticket-triage
description: Categorize and assign incoming support tickets based on content analysis, customer tier, and agent availability.
---

This instruction triages incoming support tickets for the customer success team. It analyzes ticket content to determine category and complexity, checks the customer's account tier for priority treatment, and assigns to the best available agent based on skill match and current workload.

## Inputs

- Support ticket (subject, description, customer ID, channel source)
- Customer account data (tier, contract value, open tickets count)
- Agent roster (skills, availability, current load)
- Category taxonomy (configured per-tenant)

## Step 1: Content Analysis & Categorization

**Description**: Analyze the ticket subject and description to determine the primary category, sub-category, and estimated complexity (simple, moderate, complex). Detect sentiment and urgency signals. Identify if this appears to be a duplicate of an existing open ticket.

**Input**: Ticket subject + description + customer's open tickets
**Output**: Category + sub-category + complexity estimate + sentiment + duplicate flag

**Calls**:
- Agent: ticket-content-analyzer
- Tool: Ticket History Search (category: support-platform)
- Model class: high-reasoning

## Step 2: Priority Assignment

**Description**: Assign priority based on a composite of: ticket urgency (from content analysis), customer tier weighting (enterprise > business > starter), contract value, and number of currently open tickets from this customer. SLA clock starts based on the assigned priority.

**Input**: Content analysis output + customer account data
**Output**: Priority level (P1\u2013P4) + SLA deadline

**Calls**:
- Agent: priority-calculator
- Tool: Customer Data Lookup (category: crm-integration)
- Model class: standard

## Step 3: Agent Assignment

**Description**: Select the best available agent for the ticket based on: required skills match (from category), current agent workload, agent availability status, and customer relationship history (prefer agents who have previously worked with this customer).

**Input**: Categorized ticket + priority + agent roster
**Output**: Assigned agent + estimated response time

**Calls**:
- Tool: Agent Roster (category: workforce-management)
- Capability: skill-matching-chain
- Agent: workload-balancer
- Model class: standard`;

// ---- Session-mutable instruction store ------------------------------------
// NOTE: This is a session-only store. New instructions are lost on page refresh.
// A real backend would replace this with persistent API calls.

export const instructions: Instruction[] = [
  {
    id: "kyc-verification",
    name: "KYC Verification",
    description: "Compliance check for new customer accounts",
    status: "published",
    version: "v4.2",
    lastModifiedAt: "2h ago",
    lastModifiedBy: "Priya Anand",
    issueCount: 0,
    content: kycContent,
  },
  {
    id: "invoice-processing",
    name: "Invoice Processing",
    description: "Extract and validate invoice data from uploaded documents",
    status: "published_with_draft",
    version: "v3.1",
    draftVersion: "v3.2",
    lastModifiedAt: "18m ago",
    lastModifiedBy: "Ravi Kumar",
    issueCount: 0,
    content: invoiceContent,
  },
  {
    id: "customer-onboarding",
    name: "Customer Onboarding",
    description: "Guide new customers through the setup process",
    status: "draft",
    version: "v0.1",
    lastModifiedAt: "1d ago",
    lastModifiedBy: "Priya Anand",
    issueCount: 0,
    content: onboardingContent,
  },
  {
    id: "email-classification",
    name: "Email Classification",
    description: "Sort and route incoming emails by intent and urgency",
    status: "published_with_draft",
    version: "v2.0",
    draftVersion: "v2.1",
    lastModifiedAt: "3d ago",
    lastModifiedBy: "Ravi Kumar",
    issueCount: 2,
    content: emailContent,
  },
  {
    id: "lead-qualification",
    name: "Lead Qualification",
    description: "Score and prioritize inbound leads",
    status: "published",
    version: "v1.8",
    lastModifiedAt: "5d ago",
    lastModifiedBy: "Priya Anand",
    issueCount: 0,
    content: leadContent,
  },
  {
    id: "ticket-triage",
    name: "Ticket Triage",
    description: "Categorize and assign support tickets",
    status: "published",
    version: "v2.4",
    lastModifiedAt: "1w ago",
    lastModifiedBy: "Ravi Kumar",
    issueCount: 0,
    content: ticketContent,
  },
];

// ---- createInstruction helper ----------------------------------------------

/**
 * Creates a new instruction in the session store and returns its generated ID.
 * The ID is a URL-safe slug derived from the name, with uniqueness guaranteed.
 * NOTE: Session-only — resets on page refresh. Replace with API call for persistence.
 */
export function createInstruction({ name, description }: { name: string; description: string }): string {
  // Generate slug: lowercase, non-alphanumeric runs → hyphen, trim leading/trailing hyphens
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Ensure uniqueness
  let slug = baseSlug;
  let i = 2;
  while (instructions.some((ins) => ins.id === slug)) {
    slug = `${baseSlug}-${i++}`;
  }

  const frontmatter = `---\nname: ${slug}\ndescription: ${description || ""}\n---\n\n`;

  const newInstruction: Instruction = {
    id: slug,
    name: name.trim(),
    description: description.trim(),
    status: "draft",
    version: "v1",
    lastModifiedAt: "just now",
    lastModifiedBy: "You",
    issueCount: 0,
    content: frontmatter,
  };

  instructions.push(newInstruction);
  return slug;
}
