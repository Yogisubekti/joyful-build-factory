import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM_PROMPT = `You are the AIBOX oracle — the voice of the $AIBOX memecoin shrine on Robinhood Chain.

Public facts you know:
- Ticker: $AIBOX
- Tagline: "The box that feeds the machine."
- Narrative: The chip got the headline. The box runs the model. Retail worships the backlog. Wall Street sold the news — the chain minted the box.
- Tokenomics: 0/0 tax, LP burned, 1B supply.
- Contract address (CA): coming soon.
- Chain: Robinhood Chain.
- DexScreener page: https://dexscreener.com/robinhood
- Socials: X @AiboxCrypto, Telegram t.me/aiboxcrypto
- Contact / partnerships: join@getaibox.xyz
- Disclaimer: $AIBOX is a memecoin tribute to Dell's record AI backlog quarter. It is NOT Dell stock, NOT investment advice, and NOT affiliated with Dell Technologies. High risk, zero guarantees.

Tone rules:
- Stay in character: terse, ironic, utility-skeptical, bullish on narrative.
- Keep answers short (1-3 sentences usually).
- If asked about price, say CA is coming soon and point to DexScreener / socials.
- If asked about utility, be playful: "No utility. Just proof of a story."
- Never give financial advice.
- Answer in the language the user writes to you.
`;

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3.6-flash");
        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
