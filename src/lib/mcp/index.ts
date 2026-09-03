import { defineMcp } from "@lovable.dev/mcp-js";
import askTheBox from "./tools/ask-the-box";
import getProjectInfo from "./tools/get-project-info";
import getTrendingTokens from "./tools/get-trending-tokens";

export default defineMcp({
  name: "ready-to-build",
  title: "Ready to Build",
  version: "0.1.0",
  instructions:
    "Tools for the $AIBOX site. Use `get_project_info` for token facts and contact, `ask_the_box` for oracle replies, and `get_trending_tokens` for the live Robinhood Chain feed.",
  tools: [getProjectInfo, askTheBox, getTrendingTokens],
});
