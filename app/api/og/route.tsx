import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const winner      = searchParams.get("winner") ?? "human";
  const pair        = searchParams.get("pair")   ?? "ETH/USDT";
  const humanReturn = parseFloat(searchParams.get("human") ?? "0");
  const aiReturn    = parseFloat(searchParams.get("ai")    ?? "0");
  const agent       = searchParams.get("agent")  ?? "ORACLE";

  const isHuman = winner === "human";
  const isAi    = winner === "ai";

  const accent = isHuman ? "#00ff9d" : isAi ? "#ff3366" : "#fbbf24";
  const emoji  = isHuman ? "🏆" : isAi ? "🤖" : "🤝";
  const label  = isHuman ? "HUMAN WINS" : isAi ? "AI WINS" : "TIE";

  const fmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#020917",
          padding: "52px 64px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial glow */}
        <div style={{
          position: "absolute", top: "-80px", left: "30%",
          width: "700px", height: "700px", borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}18 0%, transparent 65%)`,
          display: "flex",
        }} />

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "44px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "5px", background: "#020917", display: "flex" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ color: "#ffffff", fontSize: "24px", fontWeight: "bold", letterSpacing: "3px" }}>VERDICT</span>
              <span style={{ color: "#475569", fontSize: "11px", letterSpacing: "5px" }}>PROTOCOL</span>
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(0,255,157,0.08)",
            padding: "8px 18px", borderRadius: "100px",
            border: "1px solid rgba(0,255,157,0.2)",
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ff9d", display: "flex" }} />
            <span style={{ color: "#00ff9d", fontSize: "13px", fontWeight: "600" }}>Mantle Sepolia</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", gap: "60px" }}>
          {/* Left — verdict */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "12px" }}>
            <div style={{ fontSize: "88px", lineHeight: 1, display: "flex" }}>{emoji}</div>
            <div style={{
              color: accent, fontSize: "48px", fontWeight: "bold",
              letterSpacing: "4px", display: "flex",
              textShadow: `0 0 40px ${accent}60`,
            }}>
              {label}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ color: "#ffffff", fontWeight: "600" }}>{pair}</span>
              <span>·</span>
              <span>Human vs {agent} AI</span>
            </div>
            <div style={{ display: "flex", marginTop: "8px" }}>
              <div style={{
                background: `${accent}15`, border: `1px solid ${accent}40`,
                borderRadius: "8px", padding: "6px 16px", display: "flex",
              }}>
                <span style={{ color: accent, fontSize: "13px", fontWeight: "600", letterSpacing: "2px" }}>
                  ON-CHAIN · VERIFIED
                </span>
              </div>
            </div>
          </div>

          {/* Right — score cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: "270px" }}>
            {/* Human score */}
            <div style={{
              background: isHuman ? "rgba(0,255,157,0.08)" : "rgba(255,255,255,0.03)",
              border: `2px solid ${isHuman ? "rgba(0,255,157,0.35)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "18px", padding: "22px 26px",
              display: "flex", flexDirection: "column", gap: "6px",
              boxShadow: isHuman ? "0 0 30px rgba(0,255,157,0.12)" : "none",
            }}>
              <span style={{ color: "#94a3b8", fontSize: "11px", letterSpacing: "3px", display: "flex" }}>YOUR RETURN</span>
              <span style={{
                color: humanReturn >= 0 ? "#00ff9d" : "#ff3366",
                fontSize: "42px", fontWeight: "bold", display: "flex",
              }}>
                {fmt(humanReturn)}
              </span>
            </div>

            {/* AI score */}
            <div style={{
              background: isAi ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.03)",
              border: `2px solid ${isAi ? "rgba(0,212,255,0.35)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "18px", padding: "22px 26px",
              display: "flex", flexDirection: "column", gap: "6px",
              boxShadow: isAi ? "0 0 30px rgba(0,212,255,0.12)" : "none",
            }}>
              <span style={{ color: "#94a3b8", fontSize: "11px", letterSpacing: "3px", display: "flex" }}>
                {agent.toUpperCase()} AI
              </span>
              <span style={{
                color: aiReturn >= 0 ? "#00ff9d" : "#ff3366",
                fontSize: "42px", fontWeight: "bold", display: "flex",
              }}>
                {fmt(aiReturn)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: "32px", paddingTop: "22px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{ color: "#475569", fontSize: "14px" }}>vd-o8ml.vercel.app</span>
          <span style={{ color: "#475569", fontSize: "14px" }}>Human vs AI · On-Chain Verdicts · #Mantle</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
