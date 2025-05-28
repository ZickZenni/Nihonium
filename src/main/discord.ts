import ClientInfo from "./api/build";
import IdentityProperties from "./api/types/identity";
import DiscordApiUser from "./api/types/user";
import GatewayClient from "./gateway/client";
import GatewayReadyDispatchData from "./gateway/dispatch/ready";

export default class DiscordClient {
  public readonly gateway: GatewayClient;

  public readonly identity: IdentityProperties;

  public localUser: DiscordApiUser;

  private sessionId: string | null;

  constructor() {
    this.gateway = new GatewayClient(10);
    this.identity = new IdentityProperties();
    this.sessionId = null;

    this.gateway.on("ready", (data) => this.handleGatewayReady(data));
    this.identity.os = "Windows";
    this.identity.browser = "Chrome";
    this.identity.device = "";
    this.identity.systemLocale = "en-US";
    this.identity.hasClientMods = false;
    this.identity.browserUserAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36";
    this.identity.browserVersion = "67.0.3396.87";
    this.identity.osVersion = "10";
    this.identity.referrer = "";
    this.identity.referringDomain = "";
    this.identity.referrerCurrent = "";
    this.identity.referringDomainCurrent = "";
    this.identity.releaseChannel = "stable";
    this.identity.clientBuildNumber = "363557";
    this.identity.clientEventSource = "";
  }

  /**
   * Connects to the discord gateway to receive realtime data/events.
   *
   * @param token A valid discord authentication token.
   */
  public async connect(token: string) {
    const build = await ClientInfo.getBuild();
    this.identity.clientBuildNumber = build
      ? build.buildNumber
      : this.identity.clientBuildNumber;
    this.gateway.connect(token, this.identity);
  }

  private handleGatewayReady(data: GatewayReadyDispatchData) {
    this.localUser = data.user;
    this.sessionId = data.session_id;
  }
}
