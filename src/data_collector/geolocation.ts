const os = require('os');
const interfaceName = 'eth0';

interface NetworkStats {
  [interfaceName: string]: {
    time: number;
    txBytes: number;
    rxBytes: number;
  };
}

let lastStats: NetworkStats = {};

export default class Geolocation {
  static async get(): Promise<any> {
    try {
      const networkInterfaces = os.networkInterfaces();
      const now = Date.now();

      if (!lastStats[interfaceName]) {
        lastStats[interfaceName] = {
          time: now,
          txBytes: 0,
          rxBytes: 0,
        };
        return { txSpeed: 0, rxSpeed: 0 };
      }

      const prevStats = lastStats[interfaceName];
      const currentStats = networkInterfaces[interfaceName]?.find(
        (entry: any) => !entry.internal
      );

      if (!currentStats) {
        return { txSpeed: 0, rxSpeed: 0 };
      }

      const timeElapsed = (now - prevStats.time) / 1000;
      const txSpeed =
        ((currentStats.tx_bytes - prevStats.txBytes) / timeElapsed) * 8;
      const rxSpeed =
        ((currentStats.rx_bytes - prevStats.rxBytes) / timeElapsed) * 8;

      lastStats[interfaceName] = {
        time: now,
        txBytes: currentStats.tx_bytes,
        rxBytes: currentStats.rx_bytes,
      };

      return { txSpeed, rxSpeed };
    } catch (error) {
      throw error;
    }
  }
}