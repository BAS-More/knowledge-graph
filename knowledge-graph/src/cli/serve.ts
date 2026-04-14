import { createServer } from '../server/api.js';

// Catch anything that would cause a silent exit
process.on('uncaughtException', (err) => {
  console.error('\n[knowledge-graph serve] Uncaught exception:', err.message);
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
});
process.on('unhandledRejection', (reason: any) => {
  console.error('\n[knowledge-graph serve] Unhandled rejection:', reason?.message || reason);
  if (process.env.DEBUG) console.error(reason?.stack);
  process.exit(1);
});

export const serveCommand = async (options?: { port?: string; host?: string }) => {
  const port = Number(options?.port ?? 4747);
  // Default to 'localhost' so the OS decides whether to bind to 127.0.0.1 or
  // ::1 based on system configuration, avoiding spurious CORS errors when the
  // hosted frontend at knowledge-graph.vercel.app connects to localhost.
  const host = options?.host ?? 'localhost';

  try {
    await createServer(port, host);
  } catch (err: any) {
    console.error(`\nFailed to start Knowledge-Graph server:\n`);
    console.error(`  ${err.message || err}\n`);
    if (err.code === 'EADDRINUSE') {
      console.error(`  Port ${port} is already in use. Either:`);
      console.error(`    1. Stop the other process using port ${port}`);
      console.error(`    2. Use a different port: knowledge-graph serve --port 4748\n`);
    }
    if (err.stack && process.env.DEBUG) {
      console.error(err.stack);
    }
    process.exit(1);
  }
};
