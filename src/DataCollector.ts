import CPU from "./data_collector/cpu";
import Docker from "./data_collector/Docker"
import Graphics from "./data_collector/graphics";
import Geolocation from "./data_collector/geolocation";
import DISKS from "./data_collector/disks";
import Uptime from "./data_collector/uptime";
import config from "./config.json";

import * as packageJson from "../package.json";

export default class Data {
    static async get(): Promise<any> {
        return {
            "Type": "POST",
            "UUID": config.access_token,
            "Version": packageJson.version,
            "Uptime": await Uptime.get(),
            "Location": await Geolocation.get(),
            "CPU": await CPU.get(),
            "Graphics": await Graphics.get(),
            "DISKS": await DISKS.get(),
            "Docker": await Docker.get(),
        }
    }
}