const os = require('os');

export default class Uptime {
  static async get(): Promise<any> {
    try {
      const uptimeInSeconds = os.uptime();
      return Math.floor(uptimeInSeconds);
    } catch (error) {
      throw error;
    }
  }
}