import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

type Boost = { chainId?: string; tokenAddress?: string };
type Pair = {
  baseToken?: { name?: string; symbol?: string; address?: string };
  priceChange?: { h24?: number };
  url?: string;
};

export default defineTool({
  name: "get_trending_tokens",
  title: "Get trending Robinhood Chain tokens",
  description:
    "Fetch boosted/trending tokens on Robinhood Chain from the public DexScreener API, same live feed shown on the site.",
  inputSchema: {
    limit: z.number().int().min(1).max(20).default(10).describe("Max tokens to return."),
  },
  outputSchema: {
    tokens: z.array(
      z.object({
        name: z.string(),
        symbol: z.string(),
        change24h: z.number().nullable(),
        url: z.string(),
      }),
    ),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ limit }) => {
    const urls = [
      "https://api.dexscreener.com/token-boosts/top/v1",
      "https://api.dexscreener.com/token-boosts/latest/v1",
    ];
    const lists = await Promise.all(
      urls.map((u) => fetch(u).then((r) => (r.ok ? r.json() : [])).catch(() => [])),
    );
    const addrs = Array.from(
      new Set(
        (lists.flat() as Boost[])
          .filter((b) => b.chainId === "robinhood" && b.tokenAddress)
          .map((b) => b.tokenAddress as string),
      ),
    ).slice(0, limit);

    if (addrs.length === 0) {
      return {
        content: [{ type: "text", text: "No boosted Robinhood Chain tokens right now." }],
        structuredContent: { tokens: [] },
      };
    }

    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${addrs.join(",")}`,
    ).catch(() => null);
    if (!res || !res.ok) throw new ToolError("DexScreener request failed.");
    const data = (await res.json()) as { pairs?: Pair[] };

    const seen = new Set<string>();
    const tokens = (data.pairs ?? [])
      .filter((p) => {
        const s = p.baseToken?.symbol;
        if (!s || seen.has(s)) return false;
        seen.add(s);
        return true;
      })
      .slice(0, limit)
      .map((p) => ({
        name: p.baseToken?.name ?? "",
        symbol: p.baseToken?.symbol ?? "",
        change24h: p.priceChange?.h24 ?? null,
        url: p.url ?? "https://dexscreener.com/robinhood",
      }));

    return {
      content: [{ type: "text", text: JSON.stringify(tokens, null, 2) }],
      structuredContent: { tokens },
    };
  },
});
