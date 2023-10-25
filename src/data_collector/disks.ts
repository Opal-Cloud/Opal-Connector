import * as si from 'systeminformation';

export default class DISKS {
  static async get(): Promise<any> {
    try {
      const disks = [];
      const diskList = await si.diskLayout();
      const diskUsageList = await si.fsSize();

      for (const disk of diskList) {
        const { name } = disk;

        if (name.includes('docker')) {
          continue;
        }

        const usageInfo = diskUsageList.find((usage) => usage.fs === disk.device);

        if (!usageInfo) {
          continue;
        }

        disks.push({
          name,
          fs: usageInfo.type,
          type: disk.type,
          total: usageInfo.size,
          used: usageInfo.used,
        });
      }

      return disks;
    } catch (error) {
      console.error('Error fetching disk information:', error);
    }
  }
}