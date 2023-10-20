import CPU from "./data_collector/cpu";
import Docker from "./data_collector/Docker"
import Graphics from "./data_collector/graphics";

import * as packageJson from "../package.json";

export default class Data {
    static async get(): Promise<any> {
        return {
            "Type": "POST",
            "UUID": global.config,
            "Version": packageJson.version,
            "CPU": await CPU.get(),
            "Graphics": await Graphics.get(),
            "Docker": await Docker.get(),
        }
    }
}