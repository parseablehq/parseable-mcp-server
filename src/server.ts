#!/usr/bin/env node
import "dotenv/config";

async function main(): Promise<void> {
  const cmd = process.argv[2] ?? "run";

  if (cmd === "init") {
    const { runInit } = await import("./init.js");
    await runInit();
    return;
  }

  if (cmd === "http") {
    const { startHttpServer } = await import("./http.js");
    await startHttpServer();
    return;
  }

  if (cmd === "run") {
    const { startStdio } = await import("./stdio.js");
    await startStdio();
    return;
  }

  console.error(`Unknown command: ${cmd}\nUsage: parseable-mcp-server [run | http | init]`);
  process.exit(1);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
