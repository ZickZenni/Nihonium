import { RawData, WebSocket as WebSocketClient } from "ws";
import GatewayReadyDispatchData from "./dispatch/ready";
import IdentityProperties from "@main/api/types/identity";
import { TypedEmitter } from "tiny-typed-emitter";

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

type DispatchHandler = (event: RawGatewayEvent) => void;

/**
 * Available events for other classes to use.
 */
interface Events {
  ready: (data: GatewayReadyDispatchData) => void;
}

export default class GatewayClient extends TypedEmitter<Events> {
  public readonly version: number;

  private socket: WebSocketClient | null;

  private heartbeat: ReturnType<typeof setInterval> | null;

  private dispatchHandlers: Map<string, DispatchHandler>;

  constructor(version: number) {
    super();
    this.version = version;
    this.socket = null;
    this.heartbeat = null;
    this.dispatchHandlers = new Map();
    this.dispatchHandlers.set("READY", (event) => this.handleDispatchReady(event));
  }

  /**
   * Connects to the gateway with the specified version and token.
   *
   * @param token A valid discord authentication token.
   * @param identity A IdentityProperties instance to which you identify as on discord (gateway).
   *
   * @throws an Error when the gateway is already connected.
   * @throws an Error when the version is invalid.
   */
  public connect(token: string, identity: IdentityProperties) {
    if (this.socket !== null) {
      throw new Error("GatewayClient.connect(): Socket is not null");
    }

    if (this.version <= 0 || this.version > 10) {
      throw new Error("GatewayClient.connect(): Invalid version");
    }

    this.socket = new WebSocketClient(
      `wss://gateway.discord.gg/?v=${this.version}&encoding=json`
    );

    this.socket.on("open", () => this.handleSocketOpen(token, identity));
    this.socket.on("message", (data: RawData) => this.handleSocketRead(data));
    this.socket.on("close", () => this.handleSocketClose());
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
  private handleSocketOpen(token: string, identity: IdentityProperties) {
    this.send({
      op: GatewayOpcode.Identify,
      d: {
        token: token,
        capabilities: 4605,
        properties: identity.toJson(),
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
  private handleSocketRead(data: RawData) {
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

    const handler = this.dispatchHandlers.get(event.t);
    if (handler !== undefined) {
      handler(event);
    } else {
      console.warn(`Unknown dispatch event received '${event.t}' that couldn't be handled`)
    }
  }

  /**
   * Executed when the socket is getting closed.
   */
  private handleSocketClose() {
    if (this.heartbeat !== null) {
      clearInterval(this.heartbeat);
      this.heartbeat = null;
    }
    this.socket = null;
    console.log("Closed gateway socket");
  }

  /**
   * Handles the READY dispatch event.
   */
  private handleDispatchReady(event: RawGatewayEvent) {
    const data = event.d as GatewayReadyDispatchData;
    this.emit("ready", data);
  }
}
