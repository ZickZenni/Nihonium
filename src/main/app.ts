import { app as electronApp, BrowserWindow, session, net } from "electron";
import squirrelStartup from "electron-squirrel-startup";
import url from "url";
import path from "path";
import GatewayClient from "./gateway/client";

class Application {
  public readonly gateway: GatewayClient;

  private mainWindow: BrowserWindow | null;

  constructor() {
    this.gateway = new GatewayClient(10);
    this.mainWindow = null;

    /*
     * Quit when all windows are closed, except on macOS. There, it's common
     * for applications and their menu bar to stay active until the user quits
     * explicitly with Cmd + Q.
     */
    electronApp.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        electronApp.quit();
      }
    });

    electronApp.on("activate", () => {
      /*
       * On OS X it's common to re-create a window in the app when the
       * dock icon is clicked and there are no other windows open.
       */
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });
  }

  /**
   * Initializes vital components and systems before creating the main window.
   *
   * @note Quits when `electron-squirrel-startup` returns true, handles e.g. creation of shortcuts on Windows.
   */
  public async init() {
    /*
     * Handle creating/removing shortcuts on Windows when installing/uninstalling.
     */
    if (squirrelStartup) {
      electronApp.quit();
      return;
    }

    this.hookCorsBypass();
    this.hookAssetsProtocol();
    this.gateway.connect("");

    await this.createMainWindow();
  }

  /**
   * Hooks a listener to when a fetch/web request is being handled
   * and allow specific urls to be fetched without any CORS problems.
   */
  private hookCorsBypass() {
    const corsBypassFilter = {
      urls: ["https://tenor.com/view/*"],
    };

    session.defaultSession.webRequest.onBeforeSendHeaders(
      corsBypassFilter,
      (details, callback) => {
        details.requestHeaders["Origin"] = null;
        callback({ requestHeaders: details.requestHeaders });
      }
    );
    session.defaultSession.webRequest.onHeadersReceived(
      corsBypassFilter,
      (details, callback) => {
        details.responseHeaders["Access-Control-Allow-Origin"] = ["*"];
        callback({ responseHeaders: details.responseHeaders });
      }
    );
  }

  /**
   * Hooks a protocol for static assets to be loaded/fetched in the renderer.
   */
  private hookAssetsProtocol() {
    session.defaultSession.protocol.handle(
      "assets",
      (request: GlobalRequest) => {
        const fileUrl = request.url.replace("assets://", "");
        const assetsPath = path.join(electronApp.getAppPath(), "assets");
        const filePath = path.join(assetsPath, fileUrl);
        if (!filePath.startsWith(assetsPath)) {
          return null;
        }

        return net.fetch(url.pathToFileURL(filePath).toString());
      }
    );
  }

  /**
   * Creates the main window of the application.
   *
   * @throws an Error when the main window is already created.
   */
  private async createMainWindow() {
    if (this.mainWindow !== null) {
      throw new Error("Application.mainWindow is not null.");
    }

    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 700,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });

    {
      const bounds = this.mainWindow.getBounds();
      console.log(`Window created: ${bounds.width}x${bounds.height}`);
    }

    /*
     * Load the index.html of the app.
     */
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      await this.mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      await this.mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
      );
    }
  }
}

export default new Application();
