import { NextResponse } from "next/server";
import WebSocket, { RawData } from "ws";
export async function GET() {
return new Promise<NextResponse>((resolve) => {  
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
            feed: "ERROR",
            reason: "Deriv WebSocket timeout",
            appId,
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

    ws.on("message", (data: RawData) => {
      clearTimeout(timeout);

      try {
        const msg = JSON.parse(data.toString());

        if (msg.error) {
          resolve(
            NextResponse.json(
              {
                ok: false,
                feed: "ERROR",
                appId,
                error: msg.error,
              },
              { status: 502 }
            )
          );
        } else {
          const symbols = msg.active_symbols || [];

          resolve(
            NextResponse.json({
              ok: true,
              feed: symbols.length > 0 ? "READY" : "EMPTY",
              appId,
              symbolCount: symbols.length,
              sampleSymbols: symbols.slice(0, 10).map((s: any) => ({
                symbol: s.symbol,
                display_name: s.display_name,
              })),
            })
          );
        }

        ws.close();
      } catch {
        resolve(
          NextResponse.json(
            {
              ok: false,
              feed: "ERROR",
              reason: "Invalid response from Deriv",
              appId,
            },
            { status: 502 }
          )
        );

        ws.close();
      }
    });

    ws.on("error", (error: Error) => {
      clearTimeout(timeout);

      resolve(
        NextResponse.json(
          {
            ok: false,
            feed: "ERROR",
            reason: "WebSocket connection failed",
            appId,
            error: error.message,
          },
          { status: 502 }
        )
      );
    });
  });
              }
