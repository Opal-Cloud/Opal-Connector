import * as si from 'systeminformation';

export default class Graphics {
  static async get(): Promise<any> {
    try {
      const data = await si.graphics();
      return {
        controllers: data.controllers,
        displays: data.displays
      };
    } catch (error) {
      console.error('Error fetching Graphics information:', error);
    }
  }
}