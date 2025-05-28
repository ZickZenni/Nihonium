import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

class IpcSubscription {
  public readonly channel: string;

  public readonly subscription: unknown;

  constructor(channel: string, subscription: unknown) {
    this.channel = channel;
    this.subscription = subscription;
  }

  public remove() {
    ipcRenderer.removeListener(this.channel, this.subscription as never);
  }
}

const subscriptions: Map<number, IpcSubscription> = new Map();
let id = 0;

const electron = {
  ipc: {
    on(channel: string, func: (...args: never[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: never[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      const sub = new IpcSubscription(channel, subscription);
      const subId = id++;
      subscriptions.set(subId, sub);
      return subId;
    },
    invoke(channel: string, ...args: unknown[]): Promise<unknown> {
      return ipcRenderer.invoke(channel, ...args);
    },
    removeListener(id: number) {
      const sub = subscriptions.get(id);
      if (sub) {
        sub.remove();
        subscriptions.delete(id);
      }
    },
  },
};

contextBridge.exposeInMainWorld("electron", electron);

export type ElectronHandler = typeof electron;
