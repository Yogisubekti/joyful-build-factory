import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_project_info",
  title: "Get $AIBOX project info",
  description:
    "Return public facts about the $AIBOX memecoin site: tagline, tokenomics, chain, contract status and contact email.",
  inputSchema: {},
  outputSchema: {
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    chain: z.string(),
    contract: z.string(),
    tokenomics: z.object({ supply: z.string(), tax: z.string(), liquidity: z.string() }),
    contact: z.string(),
    links: z.object({ dexscreener: z.string() }),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "$AIBOX",
      tagline: "The Box That Feeds The Machine",
      description:
        "$AIBOX is a memecoin shrine for AI infrastructure. Not affiliated with Dell. Not financial advice.",
      chain: "Robinhood Chain",
      contract: "coming soon",
      tokenomics: { supply: "1,000,000,000", tax: "0/0", liquidity: "LP burned" },
      contact: "join@getaibox.xyz",
      links: { dexscreener: "https://dexscreener.com/robinhood" },
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
