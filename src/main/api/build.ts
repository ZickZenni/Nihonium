export interface BuildInfo {
  buildNumber: number | null;
}

export default class ClientInfo {
  /**
   * Fetches the current build info from the official discord web-application.
   */
  public static async getBuild(): Promise<BuildInfo | null> {
    const options = {
      method: "GET",
      headers: {
        cookie:
          "__dcfduid=163fc9203ac611f0bbff812b458e12db; __sdcfduid=163fc9213ac611f0bbff812b458e12db4a0e98842bccd81ea72d32bd34242ced8a2c77f693a824165ab215b500fbc745; __cfruid=98ac0ea5d6cfa6cfa79591109c476726b77c5301-1748328289; _cfuvid=duPwKAzoo0o2_80oNUuhEmmZphpdSdRSWIF3QsS29AE-1748328289976-0.0.1.1-604800000",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36",
      },
    };

    try {
      const response = await fetch("https://discord.com/app", options);
      const text = await response.text();
      if (!text.includes("window.GLOBAL_ENV = ")) {
        return null;
      }

      const globalEnv = text
        .split("window.GLOBAL_ENV = ")[1]
        .split("</script>")[0];
      const json = JSON.parse(globalEnv);
      return {
        buildNumber: json["BUILD_NUMBER"] ?? null,
      };
    } catch {
      /* empty */
    }

    return null;
  }
}
