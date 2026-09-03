import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/aibox-logo.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "$AIBOX — The Box That Feeds The Machine" },
      {
        name: "description",
        content:
          "$AIBOX — memecoin shrine for AI infrastructure. 0/0 tax, LP burned, 1B supply. Not affiliated with Dell.",
      },
      { property: "og:title", content: "$AIBOX — The Box That Feeds The Machine" },
      {
        property: "og:description",
        content: "The chip got the headline. The box runs the model.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TERM_LINES = [
  "allocating gpu... done",
  "backlog detected: $95B",
  "compiling narrative.exe",
  "retail sentiment: euphoric",
  "roadmap.pdf not found",
  "chip demand > chip supply",
  "box status: feeding model",
  "holders: stacking silently",
  "narrative uptime: 99.9%",
  "dyor.exe refused to run",
];

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

const CHAIN = "robinhood";
const CA_VALUE = "coming soon";

type HotToken = {
  name: string;
  symbol: string;
  icon?: string;
  change: number | null;
  url: string;
};

function Cursor() {
  return <span className="t-cursor" />;
}

function Terminal() {
  const [text, setText] = useState("");
  const idx = useRef(0);
  const char = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      const line = TERM_LINES[idx.current % TERM_LINES.length] ?? "";
      if (char.current < line.length) {
        char.current += 1;
        setText(line.slice(0, char.current));
        timeout = setTimeout(tick, 32);
      } else {
        idx.current += 1;
        char.current = 0;
        timeout = setTimeout(tick, 1400);
      }
    };
    tick();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="panel mb-[22px] text-left">
      <div className="panel-head">
        <span className="t-dot" />
        AIBOX // LIVE PROCESS
      </div>
      <div className="min-h-[38px] whitespace-pre-wrap font-mono text-[0.78rem] leading-relaxed text-neon">
        {text}
        <Cursor />
      </div>
    </div>
  );
}

function AskTheBox() {
  const [reply, setReply] = useState<string | null>(null);
  const [thinking, setThinking] = useState(0);

  const ask = () => {
    setReply(null);
    setThinking(1);
    let dots = 0;
    const iv = setInterval(() => {
      dots = (dots + 1) % 4;
      setThinking(dots + 1);
    }, 220);
    setTimeout(() => {
      clearInterval(iv);
      setThinking(0);
      setReply(ASK_REPLIES[Math.floor(Math.random() * ASK_REPLIES.length)] ?? null);
    }, 1100);
  };

  return (
    <div className="mb-10 w-full max-w-[460px]">
      <button
        onClick={ask}
        className="mb-[10px] w-full cursor-pointer rounded-xl border border-dashed border-led bg-surface p-[14px] font-mono text-[0.88rem] font-semibold text-led transition-colors hover:bg-surface-hover"
      >
        Ask the box ↴
      </button>
      <div className="min-h-5 px-1 text-left font-mono text-[0.82rem] text-foreground">
        {thinking > 0 && (
          <span className="text-dim">thinking{".".repeat(thinking - 1)}</span>
        )}
        {reply && (
          <>
            <span className="text-dim">&gt; </span>
            {reply}
          </>
        )}
      </div>
    </div>
  );
}

function HotTokens() {
  const [rows, setRows] = useState<HotToken[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const [top, latest] = await Promise.all([
          fetch("https://api.dexscreener.com/token-boosts/top/v1").then((r) =>
            r.ok ? r.json() : [],
          ),
          fetch("https://api.dexscreener.com/token-boosts/latest/v1").then((r) =>
            r.ok ? r.json() : [],
          ),
        ]);
        const combined: any[] = ([] as any[]).concat(top || [], latest || []);
        const seen = new Set<string>();
        const addrs: string[] = [];
        combined.forEach((t) => {
          if (t?.chainId === CHAIN && t.tokenAddress && !seen.has(t.tokenAddress)) {
            seen.add(t.tokenAddress);
            addrs.push(t.tokenAddress);
          }
        });
        if (addrs.length === 0) throw new Error("none");

        const data = await fetch(
          "https://api.dexscreener.com/latest/dex/tokens/" + addrs.slice(0, 10).join(","),
        ).then((r) => (r.ok ? r.json() : { pairs: [] }));

        const byToken: Record<string, any> = {};
        (data.pairs || [])
          .filter((p: any) => p.chainId === CHAIN)
          .forEach((p: any) => {
            const addr = p.baseToken?.address;
            if (!addr) return;
            const vol = p.volume?.h24 || 0;
            if (!byToken[addr] || vol > byToken[addr]._vol) {
              byToken[addr] = { ...p, _vol: vol };
            }
          });
        const list = Object.values(byToken)
          .sort((a: any, b: any) => (b._vol || 0) - (a._vol || 0))
          .slice(0, 6)
          .map((p: any) => ({
            name: p.baseToken?.name || "Unknown",
            symbol: p.baseToken?.symbol || "",
            icon: p.info?.imageUrl,
            change: typeof p.priceChange?.h24 === "number" ? p.priceChange.h24 : null,
            url: p.url || `https://dexscreener.com/${CHAIN}`,
          }));
        if (list.length === 0) throw new Error("none");
        if (!cancelled) setRows(list);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="panel mb-10 text-left">
      <div className="panel-head">
        <span className="t-dot" />
        ROBINHOOD CHAIN · HOT 24H
      </div>
      <div className="flex flex-col">
        {!rows && !failed && (
          <div className="py-1.5 font-mono text-[0.78rem] text-dim">
            fetching live data
            <Cursor />
          </div>
        )}
        {failed && (
          <div className="py-1.5 text-[0.78rem] leading-relaxed text-dim">
            No live boosted tokens on Robinhood Chain right now.{" "}
            <a
              href="https://dexscreener.com/robinhood"
              target="_blank"
              rel="noopener"
              className="text-led underline"
            >
              Browse Robinhood Chain on DexScreener
            </a>
          </div>
        )}
        {rows?.map((t, i) => (
          <a
            key={t.url + i}
            href={t.url}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2.5 border-b border-line py-[9px] last:border-b-0"
          >
            <span className="w-4 shrink-0 font-mono text-[0.72rem] text-dim">{i + 1}</span>
            {t.icon && (
              <img
                src={t.icon}
                alt=""
                loading="lazy"
                className="h-[22px] w-[22px] shrink-0 rounded-full object-cover"
              />
            )}
            <span className="flex-1 truncate text-[0.9rem] font-medium">
              {t.name}
              <span className="ml-1 font-mono text-[0.7rem] text-dim">{t.symbol}</span>
            </span>
            <span
              className={`shrink-0 font-mono text-[0.78rem] ${
                t.change === null ? "" : t.change >= 0 ? "text-led" : "text-down"
              }`}
            >
              {t.change === null
                ? "—"
                : `${t.change >= 0 ? "+" : ""}${t.change.toFixed(1)}%`}
            </span>
          </a>
        ))}
      </div>
      <a
        href="https://dexscreener.com/robinhood"
        target="_blank"
        rel="noopener"
        className="mt-3.5 block rounded-[10px] border border-line bg-surface p-[11px] text-center font-mono text-[0.76rem] font-semibold text-led transition-colors hover:border-led hover:bg-surface-hover"
      >
        View all on DexScreener
      </a>
      <div className="mt-2.5 font-mono text-[0.64rem] text-dim opacity-70">
        source: dexscreener, boosted tokens on Robinhood Chain
      </div>
    </div>
  );
}

function Index() {
  const [copyLabel, setCopyLabel] = useState("Copy");

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(CA_VALUE).catch(() => {});
    setCopyLabel(CA_VALUE === "coming soon" ? "Not live" : "Copied");
    setTimeout(() => setCopyLabel("Copy"), 1300);
  };

  return (
    <main className="flex min-h-screen flex-col items-center px-5 pb-10 pt-14 text-center">
      <div className="mb-10 w-full max-w-[520px] border-b border-line pb-3.5 font-mono text-[0.72rem] tracking-wide text-dim">
        AI DOESN'T LIVE IN SLIDES. IT LIVES IN A BOX.
      </div>

      <div className="relative mb-[26px] h-[132px] w-[132px] overflow-hidden rounded-full border-2 border-neon shadow-glow">
        <img src={logo.url} alt="AIBOX logo" className="block h-full w-full object-cover" />
      </div>

      <div className="mb-5 rounded-full border border-neon px-4 py-1.5 font-mono text-[0.85rem] tracking-wide text-neon">
        $AIBOX
      </div>

      <h1 className="mb-[18px] max-w-[11ch] text-[clamp(2.1rem,9vw,3.2rem)] font-extrabold leading-[1.08] tracking-tight">
        The box that feeds the machine.
      </h1>

      <p className="mb-[30px] max-w-[36ch] text-[1.02rem] leading-relaxed text-dim">
        The chip got the headline. The box runs the model. Retail worships the backlog.
      </p>

      <div className="mb-[22px] flex w-full max-w-[460px] items-center justify-between gap-3 rounded-[14px] border border-line bg-surface px-[18px] py-3.5">
        <span className="flex-1 truncate text-left font-mono text-[0.82rem] text-dim">
          CA: {CA_VALUE}
        </span>
        <button
          onClick={copy}
          className="shrink-0 cursor-pointer rounded-lg bg-neon px-3.5 py-[9px] font-mono text-[0.78rem] font-semibold text-background"
        >
          {copyLabel}
        </button>
      </div>

      <div className="mb-11 flex w-full max-w-[460px] flex-wrap justify-center gap-3">
        <a
          href="#"
          className="min-w-[130px] flex-auto rounded-xl bg-neon px-[18px] py-[15px] text-[0.98rem] font-bold text-background shadow-glow"
        >
          Buy on Pons
        </a>
        <a
          href="#"
          className="min-w-[130px] flex-auto rounded-xl border border-line bg-surface px-[18px] py-[15px] text-[0.98rem] font-bold transition-colors hover:border-led hover:text-led"
        >
          Dexscreener
        </a>
      </div>

      <Terminal />
      <AskTheBox />

      <div className="mb-10 flex w-full max-w-[460px] overflow-hidden rounded-[14px] border border-line font-mono">
        {[
          ["0/0", "Tax"],
          ["Burned", "LP"],
          ["1B", "Supply"],
        ].map(([v, l]) => (
          <div key={l} className="flex-1 border-r border-line px-2 py-4 last:border-r-0">
            <div className="text-[1.05rem] font-bold text-led">{v}</div>
            <div className="mt-1 text-[0.68rem] uppercase tracking-wide text-dim">{l}</div>
          </div>
        ))}
      </div>

      <HotTokens />

      <p className="mb-3.5 max-w-[440px] text-[0.95rem] leading-[1.75] text-dim">
        <b className="text-foreground">No utility. Just proof of a story.</b>
        <br />
        AI needs a brain, a brain needs power, power needs a rack.
        <br />
        Wall Street sold the news — the chain minted the box.
      </p>

      <p className="mb-10 font-mono text-[0.72rem] text-led opacity-85">
        fun fact: the real backlog behind this joke is $95B*
      </p>

      <div className="mb-11 flex gap-[22px] text-[0.92rem]">
        {[
          ["X", "https://x.com/AiboxCrypto"],
          ["Telegram", "https://t.me/aiboxcrypto"],
          ["Dexscreener", "#"],
        ].map(([label, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener"
            className="border-b border-transparent pb-0.5 text-dim transition-colors hover:border-neon hover:text-neon"
          >
            {label}
          </a>
        ))}
      </div>

      <div className="mb-10 w-full max-w-[460px] rounded-[14px] border border-line bg-surface p-[18px] text-center">
        <div className="mb-2 font-mono text-[0.72rem] uppercase tracking-wide text-dim">
          Contact / Partnerships
        </div>
        <a
          href="mailto:join@getaibox.xyz"
          className="inline-block font-mono text-[0.95rem] font-semibold text-neon transition-colors hover:text-led"
        >
          join@getaibox.xyz
        </a>
      </div>

      <footer className="max-w-[420px] font-mono text-[0.7rem] leading-[1.7] text-dim">
        Built to celebrate Dell's record AI backlog quarter. A tribute, not a ticker.
        <span className="mt-2 block text-muted-foreground">
          $AIBOX is a memecoin — not Dell stock, not investment advice, not affiliated with
          Dell Technologies. High risk, zero guarantees.
        </span>
        <span className="mt-2 block text-muted-foreground">
          *Backlog figure from Dell's public Q2 FY27 filing. © 2026 $AIBOX.
        </span>
      </footer>
    </main>
  );
}
