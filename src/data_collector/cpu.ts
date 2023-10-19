import * as si from 'systeminformation';

export default class CPU {
  static async get(): Promise<any> {
    try {
      const data = await si.cpu();
      return {
        Usage: data.speed,
        Freq: data.speedMax,
        Cors: data.physicalCores,
        Pcores: data.performanceCores,
        processors: data.processors
      };
    } catch (error) {
      console.error('Error fetching CPU information:', error);
    }
  }
}