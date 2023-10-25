import Data from "./DataCollector";
import Node from "./EventManager";
import fs from 'fs';
import os from 'os';
import WebSocket from 'ws';
import axios from 'axios';

const platform = os.platform();
let config: {
  Verified: boolean; access_token: string;
};

const readConfig = () => {
  if (platform === "linux") {
    return JSON.parse(fs.readFileSync('/opt/opalcloud/config.json', 'utf-8'));
  } else {
    return require("./config.json");
  }
};

const saveConfig = () => {
  const data = JSON.stringify(config, null, 2);
  if (platform === "linux") {
    fs.writeFileSync('/opt/opalcloud/config.json', data);
  } else {
    fs.writeFileSync('./src/config.json', data);
  }
};

config = readConfig();

const ws = new WebSocket('ws://localhost:4000');
ws.on('error', console.error);

let sendDataInterval: NodeJS.Timeout;

const sendData = async () => {
  if (!config.access_token) return;
  if (config.Verified === false) {
    try {
      const response = await axios.post('http://localhost:4000/verify', {
        access_token: config.access_token
      });
      if (response.data.success) {
        config.Verified = true;
        saveConfig();
      } else {
        config.Verified = false;
        saveConfig();
      }
    } catch (error) {
      console.error('Verification API error:', error);
    }
  } else {
    const dataToSend = await Data.get();
    ws.send(JSON.stringify(dataToSend));
  }
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