import CPU from "./data_collector/cpu";
import Docker from "./data_collector/Docker"
import Graphics from "./data_collector/graphics";

export default class Data {
    static async get(): Promise<any> {
        return {
            "CPU": await CPU.get(),
            "Graphics": await Graphics.get(),
            "Docker": await Docker.get(),
        }
    }
}