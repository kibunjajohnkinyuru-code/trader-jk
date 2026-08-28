import { NextResponse } from "next/server";
import WebSocket from "ws";

export async function GET() {
  return new Promise((resolve) => {
    const appId = process.env.DERIV_APP_ID || "1089";

    const ws = new WebSocket(
      `wss://ws.derivws.com/websockets/v3?app_id=${appId}`
    );

    const timeout = setTimeout(() => {
      ws.close();

      resolve(
        NextResponse.json(
          {
            ok: false,
            error: "Deriv WebSocket timeout",
          },
          { status: 504 }
        )
      );
    }, 10000);

    ws.on("open", () => {
      ws.send(
        JSON.stringify({
          active_symbols: "brief",
          product_type: "basic",
        })
      );
    });

    ws.on("message", (data) => {
      clearTimeout(timeout);

      try {
        const message = JSON.parse(data.toString());

        ws.close();

        resolve(
          NextResponse.json({
            ok: true,
            received: true,
            msg_type: message.msg_type ?? null,
            error: message.error ?? null,
            active_symbols_count: Array.isArray(message.active_symbols)
              ? message.active_symbols.length
              : 0,
          })
        );
      } catch {
        ws.close();

        resolve(
          NextResponse.json(
            {
              ok: false,
              error: "Invalid response from Deriv",
            },
            { status: 502 }
          )
        );
      }
    });

    ws.on("error", (error) => {
      clearTimeout(timeout);

      resolve(
        NextResponse.json(
          {
            ok: false,
            error: error.message,
          },
          { status: 502 }
        )
      );
    });
  });
          }
