import Data from "./DataCollector";
import Node from "./EventManager";
import fs from 'fs';
import os from 'os';
import WebSocket from 'ws';

const platform = os.platform();
let config;

if (platform === "linux") {
  config = JSON.parse(fs.readFileSync('/opt/opalcloud/config.json', 'utf-8'));
} else {
  config = require("./config.json");
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

ws.on('message', async (message) => {
  const response = await Node.Manage(ws, message);
  ws.send(JSON.stringify(response));
});

ws.on('close', () => {
  clearInterval(sendDataInterval);
});

ws.on('error', (err) => {
  ws.send(`WebSocket Error: ${err}`);
});