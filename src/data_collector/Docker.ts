import * as si from 'systeminformation';

export default class Docker {
  static async get(): Promise<any> {
    try {
      const data = await si.dockerInfo();
      return {
        architecture: data.architecture,
        Images: data.images,
        Containers: data.containers,
        http: data.httpProxy,
        https: data.httpsProxy
      };
    } catch (error) {
      console.error('Error fetching Docker information:', error);
    }
  }
}