import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const ASK_REPLIES = [
  "The box doesn't answer. The box ships.",
  "Utility is a state of mind.",
  "Ask again after the backlog clears. (It won't.)",
  "0/0 tax. 100/100 vibes.",
  "The chip got the headline. You got the chart.",
  "Roadmap? The rack has no map, only rows.",
  "Not financial advice. Barely advice at all.",
  "It's not a bubble, it's a box.",
  "Buy high, believe higher.",
  "The model trains. The chart doesn't.",
];

export default defineTool({
  name: "ask_the_box",
  title: "Ask the box",
  description:
    "Ask $AIBOX a question and receive one of the box's oracle replies (same feature as the website widget).",
  inputSchema: { question: z.string().trim().min(1).describe("Question for the box.") },
  outputSchema: { question: z.string(), reply: z.string() },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: ({ question }) => {
    const reply = ASK_REPLIES[Math.floor(Math.random() * ASK_REPLIES.length)]!;
    return {
      content: [{ type: "text", text: reply }],
      structuredContent: { question, reply },
    };
  },
});
