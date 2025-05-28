import { useEffect } from "react";

export default function StartupScreen() {
  useEffect(() => {
    window.electron.ipc.on("gateway:ready", () => {
      console.log("ready");
    });
  }, []);

  return <div></div>;
}
