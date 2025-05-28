export interface BuildInfo {
  buildNumber: string;
  releaseChannel: string;
  versionHash: string;
}

export default class ClientInfo {
  /**
   * Fetches the current build info from the official discord web-application.
   */
  public static async getBuild(): Promise<BuildInfo | null> {
    const options = {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
      },
    };

    try {
      const response = await fetch('https://discord.com/app', options);
      const text = await response.text();
      if (!text.includes('window.GLOBAL_ENV = ')) {
        return null;
      }

      const globalEnv = text.split('window.GLOBAL_ENV = ')[1].split('</script>')[0];
      const json = JSON.parse(globalEnv.replaceAll('Date.now()', '""'));
      return {
        buildNumber: json['BUILD_NUMBER'],
        releaseChannel: json['RELEASE_CHANNEL'],
        versionHash: json['VERSION_HASH'],
      };
    } catch (e) {
      console.log(e);
      /* empty */
    }

    return null;
  }
}
