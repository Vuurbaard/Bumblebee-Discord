import { App } from "./app";
import process from "process";

const app = new App();

app.boot();

process.on("beforeExit", async () => {
  await app.shutdown();
});

process.once("SIGHUP", async () => {
  await app.shutdown();
});
