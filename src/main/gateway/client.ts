import { RawData, WebSocket as WebSocketClient } from "ws";
import ClientInfo from "../api/build";

/**
 * All opcodes of the gateway.
 */
enum GatewayOpcode {
  Dispatch = 0,
  Heartbeat = 1,
  Identify = 2,
  Hello = 10,
}

/**
 * The raw structure of a incoming gateway event.
 */
interface RawGatewayEvent {
  t: string | null;
  s: number | null;
  op: GatewayOpcode;
  d: unknown;
}

export default class GatewayClient {
  public readonly version: number;

  private socket: WebSocketClient | null;

  private heartbeat: ReturnType<typeof setInterval> | null;

  constructor(version: number) {
    this.version = version;
    this.socket = null;
    this.heartbeat = null;
  }

  /**
   * Connects to the gateway with the specified version and token.
   *
   * @param token A valid discord authentication token.
   *
   * @throws an Error when the gateway is already connected.
   * @throws an Error when the version is invalid.
   */
  public connect(token: string) {
    if (this.socket !== null) {
      throw new Error("GatewayClient.connect(): Socket is not null");
    }

    if (this.version <= 0 || this.version > 10) {
      throw new Error("GatewayClient.connect(): Invalid version");
    }

    this.socket = new WebSocketClient(
      `wss://gateway.discord.gg/?v=${this.version}&encoding=json`
    );

    this.socket.on("open", () => this.handleOpen(token));
    this.socket.on("message", (data: RawData) => this.handleMessage(data));
    this.socket.on("close", () => this.handleClose());
  }

  /**
   * Send json data to the gateway.
   *
   * @throws an Error when the gateway is not connected.
   */
  public send(data: unknown) {
    if (this.socket === null) {
      throw new Error("GatewayClient.send(): A connection is non existent.");
    }

    if (this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("GatewayClient.send(): Socket is not ready.");
    }

    this.socket.send(JSON.stringify(data));
  }

  /**
   * Executed when the socket is opened.
   */
  private async handleOpen(token: string) {
    const build = await ClientInfo.getBuild();

    this.send({
      op: GatewayOpcode.Identify,
      d: {
        token: token,
        capabilities: 4605,
        properties: {
          os: "Windows",
          browser: "Chrome",
          device: "",
          system_locale: "en-US",
          has_client_mods: false,
          browser_user_agent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36",
          browser_version: "67.0.3396.87",
          os_version: "10",
          referrer: "",
          referring_domain: "",
          referrer_current: "",
          referring_domain_current: "",
          release_channel: "stable",
          client_build_number: build ? `${build.buildNumber}` : "402402",
          client_event_source: "",
        },
        presence: {
          status: "online",
          since: 0,
          is_afk: false,
        },
        does_support_compression: false,
      },
    });
    console.log("Opened gateway socket");
  }

  /**
   * Handles the raw data coming from the socket.
   */
  private handleMessage(data: RawData) {
    if (!(data instanceof Buffer)) {
      return;
    }

    const json = JSON.parse(data.toString("utf8"));
    const event = json as RawGatewayEvent;

    if (event.t === null) {
      if (event.op === GatewayOpcode.Hello) {
        /*
         * This is so fucking dogshit and shouldn't be done, but it only does contain this
         * so it's likely okay.
         */
        const data = event.d as {
          heartbeat_interval: number;
        };
        this.heartbeat = setInterval(() => {
          this.send({
            op: GatewayOpcode.Heartbeat,
            d: 0,
          });
        }, data.heartbeat_interval);
      }
      return;
    }
  }

  /**
   * Executed when the socket is getting closed.
   */
  private handleClose() {
    if (this.heartbeat !== null) {
      clearInterval(this.heartbeat);
      this.heartbeat = null;
    }
    this.socket = null;
    console.log("Closed gateway socket");
  }
}
