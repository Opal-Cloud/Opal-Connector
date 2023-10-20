import Data from "./DataCollector";
import fs from 'fs';
import os from 'os';
import WebSocket from 'ws';

const platform = os.platform();
let config;

const configFileLocation = platform === "linux" ? '/opt/opalcloud/config.json' : "./config.json";

if (platform === "linux") {
  config = JSON.parse(fs.readFileSync(configFileLocation, 'utf-8'));
} else {
  config = require("./config.json");
}

const args = process.argv.slice(2);
const signupTokenArgIndex = args.indexOf("-su");
if (signupTokenArgIndex !== -1) {
  const token = args[signupTokenArgIndex + 1];
  if (token) {
    config.access_token = token;
    fs.writeFileSync(configFileLocation, JSON.stringify(config, null, 2));
  }
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