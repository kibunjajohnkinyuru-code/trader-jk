"use client";

import { useEffect, useState } from "react";

const digits = Array.from({ length: 10 }, (_, i) => i);

type QuoteData = {
  ok: boolean;
  feed: string;
  symbol?: string;
  quote?: number;
  epoch?: number;
  pip_size?: number;
  error?: unknown;
  reason?: string;
};

export default function Home() {
  const [selectedDigit, setSelectedDigit] = useState(5);

  const [price, setPrice] = useState<number | null>(null);
  const [lastDigit, setLastDigit] = useState<number | null>(null);

  const [connection, setConnection] = useState("Connecting...");
  const [error, setError] = useState("");

  const [matchCount, setMatchCount] = useState(0);
  const [nonMatchCount, setNonMatchCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const getQuote = async () => {
      try {
        const response = await fetch("/api/deriv-quote", {
          cache: "no-store",
        });

        const data: QuoteData = await response.json();

        if (cancelled) return;

        if (data.ok && data.feed === "READY" && data.quote !== undefined) {
          const quote = Number(data.quote);

          setPrice(quote);
          setConnection("● Live Feed");
          setError("");

          /*
           * Convert the quote to a string and find the final
           * decimal digit.
           *
           * Example:
           * 1234.5678 → last digit = 8
           */
          const quoteText = String(data.quote);
          const decimalPart = quoteText.split(".")[1] || "";

          const digitText =
            decimalPart.length > 0
              ? decimalPart.charAt(decimalPart.length - 1)
              : quoteText.charAt(quoteText.length - 1);

          const digit = Number(digitText);

          if (Number.isInteger(digit) && digit >= 0 && digit <= 9) {
            setLastDigit(digit);

            if (digit === selectedDigit) {
              setMatchCount((previous) => previous + 1);
            } else {
              setNonMatchCount((previous) => previous + 1);
            }
          }
        } else {
          setConnection("● Feed Error");
          setError(data.reason || "No quote received");
        }
      } catch (err) {
        if (!cancelled) {
          setConnection("● Connection Error");
          setError(
            err instanceof Error ? err.message : "Unable to reach quote API"
          );
        }
      }

      if (!cancelled) {
        timer = setTimeout(getQuote, 1000);
      }
    };

    getQuote();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedDigit]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0f19",
        color: "#ffffff",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <header style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "32px", margin: 0 }}>
            Trader JK
          </h1>

          <p style={{ color: "#9ca3af", marginTop: "8px" }}>
            Deriv Digit Analysis Tool
          </p>
        </header>

        <section
          style={{
            background: "#111827",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid #1f2937",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ color: "#9ca3af", fontSize: "13px" }}>
                MARKET
              </div>

              <strong>Volatility 100 Index</strong>
            </div>

            <div>
              <div style={{ color: "#9ca3af", fontSize: "13px" }}>
                CONNECTION
              </div>

              <strong
                style={{
                  color:
                    connection.includes("Live")
                      ? "#22c55e"
                      : connection.includes("Error")
                        ? "#ef4444"
                        : "#f59e0b",
                }}
              >
                {connection}
              </strong>
            </div>
          </div>

          {error && (
            <div
              style={{
                marginTop: "14px",
                color: "#f87171",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "#111827",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #1f2937",
            }}
          >
            <div style={{ color: "#9ca3af", fontSize: "13px" }}>
              CURRENT PRICE
            </div>

            <div
              style={{
                fontSize: "28px",
                marginTop: "10px",
              }}
            >
              {price !== null ? price : "Waiting..."}
            </div>
          </div>

          <div
            style={{
              background: "#111827",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #1f2937",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#9ca3af", fontSize: "13px" }}>
              LAST DIGIT
            </div>

            <div
              style={{
                fontSize: "56px",
                fontWeight: "bold",
                marginTop: "4px",
              }}
            >
              {lastDigit !== null ? lastDigit : "—"}
            </div>
          </div>
        </section>

        <section
          style={{
            background: "#111827",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #1f2937",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Digit Analysis
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "10px",
            }}
          >
            {digits.map((digit) => (
              <button
                key={digit}
                onClick={() => {
                  setSelectedDigit(digit);
                  setMatchCount(0);
                  setNonMatchCount(0);
                }}
                style={{
                  padding: "16px 8px",
                  borderRadius: "10px",
                  border:
                    selectedDigit === digit
                      ? "2px solid #ffffff"
                      : "1px solid #374151",
                  background:
                    selectedDigit === digit
                      ? "#1f2937"
                      : "#0b0f19",
                  color: "#ffffff",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                {digit}
              </button>
            ))}
          </div>
        </section>

        <section
          style={{
            background: "#111827",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #1f2937",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Match Analysis
          </h2>

          <p style={{ color: "#9ca3af" }}>
            Selected target digit
          </p>

          <div
            style={{
              fontSize: "42px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            {selectedDigit}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "#0b0f19",
                padding: "18px",
                borderRadius: "12px",
              }}
            >
              <div style={{ color: "#9ca3af" }}>
                MATCH
              </div>

              <strong
                style={{
                  fontSize: "24px",
                }}
              >
                {matchCount}
              </strong>
            </div>

            <div
              style={{
                background: "#0b0f19",
                padding: "18px",
                borderRadius: "12px",
              }}
            >
              <div style={{ color: "#9ca3af" }}>
                NON-MATCH
              </div>

              <strong
                style={{
                  fontSize: "24px",
                }}
              >
                {nonMatchCount}
              </strong>
            </div>
          </div>
        </section>

        <footer
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginTop: "28px",
            fontSize: "13px",
          }}
        >
          Trader JK • Analysis only • Not financial advice
        </footer>
      </div>
    </main>
  );
                        }
