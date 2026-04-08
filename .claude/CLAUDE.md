# CLAUDE.md — EcoShop AI Customer Support Agent

## Project Overview

EcoShop is being rebuilt from a static landing page + Botpress chatbot into a **production-ready sustainable e-commerce platform** powered by Next.js with an **advanced multi-step AI customer support agent**.

The AI agent demonstrates strong prompt engineering, tool calling, and polished UI — positioning Ramon as a **Vibe Coder + Senior Prompt Engineer**.

**Goal**: Build a beautiful, intelligent, context-aware chatbot that handles real customer scenarios (orders, returns, billing, product questions, de-escalation) using a real Prisma database.

## Current State (Being Replaced)

- `frontend/` — Static HTML landing page
- `server/` — Express webhook server (Botpress → HubSpot CRM)
- `bot/` — Botpress chatbot flow + knowledge base
- `botpress-setup-steps.txt` — Botpress configuration steps

All of this will be replaced by the new Next.js stack below.

## Target Tech Stack

| Layer        | Technology                                        |
| ------------ | ------------------------------------------------- |
| Framework    | Next.js 15/16 (App Router) + TypeScript           |
| AI SDK       | Vercel AI SDK (`ai` + `@ai-sdk/anthropic`)        |
| LLM          | Claude Sonnet 4.6 (preferred), Claude 3.5 Sonnet (fallback) |
| UI           | shadcn/ui + Tailwind CSS                          |
| Animations   | Framer Motion                                     |
| Database     | Prisma + PostgreSQL                               |
| Validation   | Zod (tool schemas)                                |
| Payments     | Stripe (existing)                                 |

## Environment Setup

- **Node**: v20+ (LTS)
- **Package Manager**: npm
- **Dev Server**: `npm run dev` (Next.js on port 3000)
- **Database**: PostgreSQL (local or hosted — connection string in `.env`)
- **Deployment Target**: Vercel (frontend + API routes) + hosted PostgreSQL (Neon, Supabase, or Railway)

## Database Schema (Prisma Models)

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  orders    Order[]
  createdAt DateTime @default(now())
}

model Product {
  id          String      @id @default(cuid())
  name        String
  description String
  price       Float
  ecoRating   Int         // 1–5 sustainability score
  category    String
  inStock     Boolean     @default(true)
  imageUrl    String?
  orderItems  OrderItem[]
}

model Order {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  status    OrderStatus @default(PROCESSING)
  total     Float
  items     OrderItem[]
  returns   Return[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float
}

model Return {
  id        String       @id @default(cuid())
  orderId   String
  order     Order        @relation(fields: [orderId], references: [id])
  reason    String
  status    ReturnStatus @default(REQUESTED)
  createdAt DateTime     @default(now())
}

enum OrderStatus {
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum ReturnStatus {
  REQUESTED
  APPROVED
  DENIED
  COMPLETED
}
```

## Seed Data

The demo needs realistic fake data to showcase the agent. The seed script (`prisma/seed.ts`) should create:

- **5–10 users** with names and emails
- **15–20 products** across categories (Home & Kitchen, Clothing, Beauty, Garden, Kids) with eco ratings and realistic prices
- **10–15 orders** in various statuses (processing, shipped, delivered, cancelled)
- **3–5 returns** in various statuses

Use consistent, memorable order IDs (e.g., `ECO-10001`) so they're easy to type in demos.

## Target Project Structure

```
app/
  api/chat/route.ts          # Main AI endpoint with tools + streaming
  components/support-chat/
    SupportChat.tsx           # Chat container
    ChatMessage.tsx           # Individual message bubbles
    ChatInput.tsx             # Input field + send button
    FloatingChatButton.tsx    # Floating open/close trigger
lib/
  tools/                     # Prisma-based tool functions
    orderTools.ts
    productTools.ts
    returnTools.ts
  prompts/
    system-prompt.md          # Main system prompt (versioned)
    few-shot-examples.md      # Example conversations
prisma/
  schema.prisma
  seed.ts                    # Realistic demo data
```

## Coding Rules

- Always use TypeScript with strict types.
- Prefer server actions and server components where possible.
- Use the `useChat` hook from Vercel AI SDK for streaming + tool calling.
- Enable multi-step reasoning with `maxSteps` (5–10).
- All tools must use Zod for input/output validation.
- Keep UI smooth and premium — use Framer Motion for open/close, typing indicators, and message animations.

## Agent Tone

Empathetic, professional, patient, and solution-focused. Draw from real customer service experience at Solera, Verizon, and IC System.

## Cost Control

- Use Sonnet 4.6 or Haiku during heavy development.
- Limit conversation history sent to the model (max 20 messages).
- Add rate limiting on the chat endpoint.
- Monitor usage in Anthropic dashboard with alerts.
- Target: < $10/month for portfolio demo with moderate testing.

## Migration Phases

### Phase 1 — Scaffold
- Initialize Next.js with TypeScript, Tailwind, shadcn/ui
- Set up Prisma with PostgreSQL connection
- Define schema and run initial migration
- Create seed script with realistic demo data

### Phase 2 — Database + Tools
- Build Prisma tool functions (`getOrder`, `searchProducts`, `initiateReturn`, etc.)
- Add Zod schemas for all tool inputs/outputs
- Test tools independently against seeded data

### Phase 3 — AI Agent
- Set up Vercel AI SDK with Claude
- Write the system prompt with Chain-of-Thought and few-shot examples
- Create `api/chat/route.ts` with tool calling and streaming
- Add de-escalation and edge-case handling

### Phase 4 — Chat UI + Polish
- Build floating chat widget with Framer Motion animations
- Implement message bubbles, typing indicators, and scroll behavior
- Responsive design and accessibility
- Lighthouse performance optimization (target 97+)

## Success Scenarios

These are the conversations the agent must handle well. They double as few-shot examples and test cases.

1. **"Where's my order?"** — Customer provides an order ID. Agent looks it up, returns status, estimated delivery, and items. Handles invalid IDs gracefully.

2. **"I want to return this"** — Customer wants to return an item from a delivered order. Agent confirms eligibility, collects a reason, and initiates the return.

3. **"This charge looks wrong"** — Customer disputes a charge. Agent pulls up the order, breaks down the total (items + tax), and explains. Offers to escalate if unresolved.

4. **"What sustainable products do you have for the kitchen?"** — Product discovery. Agent searches by category, presents options with eco ratings, and makes recommendations.

5. **"I'm really frustrated, nothing is working"** — De-escalation. Agent acknowledges frustration, apologizes, asks clarifying questions, and offers concrete next steps or human handoff.

## Testing Strategy

- **Tool unit tests**: Each Prisma tool function tested against a test database with seeded data
- **Prompt regression tests**: Run the 5 success scenarios above through the agent and verify expected tool calls and response quality
- **E2E tests**: Playwright tests for the chat UI (open widget, send message, receive response)
- **Manual QA**: Walk through each success scenario in the browser before any demo

## Portfolio Description

**Project Name**: EcoShop — AI-Powered E-Commerce with Intelligent Multi-Step Support Agent

**Short Description**: Full-stack Next.js e-commerce platform featuring an advanced AI customer support agent. The agent uses structured prompt engineering, Chain-of-Thought reasoning, and tool calling integrated with a real database to resolve orders, returns, billing issues, and product questions with empathetic, professional responses. Includes smooth Framer Motion animations and 97+ Lighthouse performance.

**Key Highlights**:
- Multi-step tool calling with Vercel AI SDK + Claude
- Prisma-backed tools for real database queries
- De-escalation and empathy-driven prompt engineering
- Polished floating chat UI with Framer Motion
- Seed data for realistic demo scenarios

## Working With Claude

- Keep changes focused and incremental.
- Ask for confirmation before large refactors.
- Prioritize beautiful, accessible, and performant UI.
- Show prompt iterations clearly when improving the agent.
- Follow the migration phases in order — don't skip ahead.
