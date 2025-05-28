export default class IdentityProperties {
  public os: string;

  public browser: string;

  public device: string;

  public systemLocale: string;

  public hasClientMods: boolean;

  public browserUserAgent: string;

  public browserVersion: string;

  public osVersion: string;

  public referrer: string;

  public referringDomain: string;

  public referrerCurrent: string;

  public referringDomainCurrent: string;

  public releaseChannel: string;

  public clientBuildNumber: string;

  public clientEventSource: string;

  public toJson(): unknown {
    return {
      os: this.os,
      browser: this.browser,
      device: this.device,
      system_locale: this.systemLocale,
      has_client_mods: this.hasClientMods,
      browser_user_agent: this.browserUserAgent,
      browser_version: this.browserVersion,
      os_version: this.osVersion,
      referrer: this.referrer,
      referring_domain: this.referringDomain,
      referrer_current: this.referrerCurrent,
      referring_domain_current: this.referringDomainCurrent,
      release_channel: this.releaseChannel,
      client_build_number: this.clientBuildNumber,
      client_event_source: this.clientEventSource,
    };
  }
}
