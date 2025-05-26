import { app as electronApp } from "electron";
import app from "./app";

electronApp.on("ready", async () => {
  await app.init();
});