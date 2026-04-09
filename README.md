# EcoShop — AI-Powered Sustainable E-Commerce

A full-stack Next.js e-commerce platform featuring an intelligent AI customer support agent. The agent uses structured prompt engineering, Chain-of-Thought reasoning, and multi-step tool calling integrated with a real PostgreSQL database to handle orders, returns, billing inquiries, and product recommendations with empathetic, professional responses.

**Live Demo**: [ecoshop-coral.vercel.app](https://ecoshop-coral.vercel.app/)

---

## What the AI Agent Can Do

The support agent connects to a real database and handles multi-turn conversations across five core scenarios:

| Scenario              | What Happens                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| **Order Lookup**      | Customer provides an order ID or email. Agent retrieves status, items, total, and timeline.               |
| **Returns**           | Agent checks eligibility (only delivered orders), collects a reason, and initiates the return.            |
| **Billing Disputes**  | Agent pulls the order, breaks down charges item-by-item, and offers escalation if unresolved.             |
| **Product Discovery** | Agent searches by category, keyword, or eco rating and recommends 2-3 options with sustainability scores. |
| **De-escalation**     | Agent acknowledges frustration, apologizes, asks clarifying questions, and offers concrete next steps.    |

### Demo Order IDs

Use these to test the agent in the live demo:

| Order ID  | Customer        | Status     | Items                                                      |
| --------- | --------------- | ---------- | ---------------------------------------------------------- |
| ECO-10001 | Sarah Chen      | Delivered  | Bamboo Cutting Board Set, Beeswax Food Wraps               |
| ECO-10002 | Marcus Johnson  | Shipped    | Recycled Denim Jacket                                      |
| ECO-10003 | Emily Rodriguez | Processing | Recycled Glass Tumbler Set, Compost Bin, Bamboo Toothbrush |
| ECO-10004 | David Kim       | Delivered  | Organic Cotton Hoodie, Hemp Blend T-Shirt                  |
| ECO-10005 | Olivia Thompson | Cancelled  | Wooden Block Set                                           |

---

## Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Framework  | Next.js 16 (App Router) + TypeScript |
| AI         | Vercel AI SDK + Claude Sonnet 4      |
| Database   | Prisma ORM + PostgreSQL (Neon)       |
| UI         | Tailwind CSS + Framer Motion         |
| Validation | Zod (tool input schemas)             |
| Deployment | Vercel                               |

---

## Architecture

```
src/
  app/
    api/chat/route.ts              # Streaming chat endpoint with 7 tools
    components/support-chat/
      SupportChat.tsx               # Chat container with useChat hook
      ChatMessage.tsx               # Message bubbles (text + tool results)
      ChatInput.tsx                 # Input field with submit handling
      FloatingChatButton.tsx        # Animated open/close trigger
    page.tsx                        # Landing page
    layout.tsx                      # Root layout with chat widget
  lib/
    tools/
      orderTools.ts                 # getOrder, getOrdersByEmail, cancelOrder
      productTools.ts               # searchProducts, getProductDetails
      returnTools.ts                # initiateReturn, getReturnStatus
    prompts/
      system-prompt.md              # Agent persona, CoT instructions, boundaries
      few-shot-examples.md          # 5 example conversations for consistency
    db.ts                           # Prisma client singleton
    rate-limit.ts                   # Sliding window rate limiter
prisma/
  schema.prisma                     # 5 models, 2 enums
  seed.ts                           # 7 users, 16 products, 10 orders, 3 returns
```

### How the Agent Works

1. User sends a message via the floating chat widget
2. `useChat` streams the request to `/api/chat`
3. The route validates input (Zod), checks rate limits, and verifies the origin
4. Claude receives the system prompt + few-shot examples + conversation history
5. Claude reasons through the request and calls tools (up to 8 steps)
6. Tools execute Prisma queries against the PostgreSQL database
7. Claude formulates a response using real data and streams it back

---

## Prompt Engineering

The agent uses a layered prompt strategy:

- **Persona definition** — empathetic, professional support agent with clear boundaries
- **Chain-of-Thought** — explicit reasoning steps: identify intent, determine tools, execute, formulate response
- **Tool descriptions** — each tool includes when and how to use it
- **Scenario playbooks** — specific handling instructions for orders, returns, billing, products, and de-escalation
- **Few-shot examples** — 5 complete conversations showing expected tool usage and response format
- **Security rules** — anti-jailbreak protections, no prompt leaking, untrusted input handling

---

## Security

- **Input validation** — Zod schemas enforce message limits (20 messages, 2000 chars per part)
- **Rate limiting** — 10 requests/minute per IP (sliding window)
- **Origin validation** — rejects cross-origin requests not in the allowlist
- **Security headers** — CSP, HSTS, X-Frame-Options, Permissions-Policy
- **Error masking** — internal errors return generic messages, no stack traces
- **Parameterized queries** — Prisma prevents SQL injection
- **Prompt security** — agent refuses to reveal instructions or execute injected commands

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)
- [Anthropic API key](https://console.anthropic.com)

### Setup

```bash
# Clone and install
git clone https://github.com/Ramon-Carrillo/eco_shop
cd ecoshop
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and ANTHROPIC_API_KEY

# Set up database
npx prisma migrate dev --name init
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click the chat button in the bottom-right corner.

### Environment Variables

| Variable            | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string                                    |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude                                    |
| `ALLOWED_ORIGINS`   | Comma-separated allowed origins (e.g. `https://yourdomain.com`) |

### Database Commands

```bash
npm run db:migrate   # Run migrations
npm run db:seed      # Seed demo data
npm run db:reset     # Reset and re-seed
npm run db:studio    # Open Prisma Studio
```

---

## Deployment

### Vercel + Neon

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy — Prisma generates the client automatically during build

---

## Built By

**Ramon C** — Full-stack developer and prompt engineer. Built with real customer service experience from Solera, Verizon, and IC System.
