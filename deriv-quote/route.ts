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
          ticks: "R_100",
          subscribe: 0,
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
        } else if (msg.tick) {
          resolve(
            NextResponse.json({
              ok: true,
              feed: "READY",
              appId,
              symbol: msg.tick.symbol,
              quote: msg.tick.quote,
              epoch: msg.tick.epoch,
              pip_size: msg.tick.pip_size,
            })
          );
        } else {
          resolve(
            NextResponse.json({
              ok: true,
              feed: "NO_TICK",
              appId,
              msg_type: msg.msg_type ?? null,
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
