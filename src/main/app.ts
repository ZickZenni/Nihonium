import { app as electronApp, BrowserWindow } from "electron";
import squirrelStartup from "electron-squirrel-startup";
import path from "path";

class Application {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    electronApp.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        electronApp.quit();
      }
    });

    electronApp.on("activate", () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });
  }

  public async init() {
    // Handle creating/removing shortcuts on Windows when installing/uninstalling.
    if (squirrelStartup) {
      electronApp.quit();
      return;
    }

    await this.createMainWindow();
  }

  private async createMainWindow() {
    const mainWindow = new BrowserWindow({
      width: 1200,
      height: 700,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });

    {
      const bounds = mainWindow.getBounds();
      console.log(`Window created: ${bounds.width}x${bounds.height}`);
    }

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      await mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
      );
    }
  }
}

export default new Application();
