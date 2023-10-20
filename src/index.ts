import Data from "./DataCollector";
import config from "./config.json";
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3000');
ws.on('error', console.error);

/*  
   Global Vars
*/
declare global {
  var config: any;
}

global.config = config.UUID;

let sendDataInterval: NodeJS.Timeout;

const sendData = async () => {
  //if (!global.config) return;
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
