import Data from "./DataCollector";
import fs from 'fs';
import os from 'os';
import WebSocket from 'ws';

const args = process.argv.slice(2);
const platform = os.platform();
let config;

if (platform === "linux") {
  config = JSON.parse(fs.readFileSync('/opt/opalcloud/config.json', 'utf-8'));
} else {
  config = require("./config.json");
}

const suIndex = args.indexOf('-su');
if (suIndex !== -1 && args[suIndex + 1]) {
  const token = args[suIndex + 1];
  config.access_token = token;

  const configPath = platform === "linux" ? '/opt/opalcloud/config.json' : './config.json';
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

const ws = new WebSocket('ws://localhost:3000');
ws.on('error', console.error);

/*  
   Global Vars
*/
declare global {
  var config: any;
}

global.config = config.access_token;

let sendDataInterval: NodeJS.Timeout;

const sendData = async () => {
  if (!global.config) return;
  const dataToSend = await Data.get();
  ws.send(JSON.stringify(dataToSend));
};

ws.on('open', async () => {
  console.log('Connected to the Node');
  sendData();
  sendDataInterval = setInterval(sendData, 1000);
});

ws.on('message', (message) => {
  console.log(`Node: ${message}`);
});

ws.on('close', () => {
  clearInterval(sendDataInterval);
});