import Data from "./DataCollector";
import config from "./config";

const ws = new WebSocket('ws://localhost:3000');

let sendDataInterval: NodeJS.Timeout;

const sendData = async () => {
  const dataToSend = await Data.get();
  ws.send(JSON.stringify(dataToSend));
};

ws.addEventListener('open', async () => {
  console.log('Connected to the Node');
  sendData();
  sendDataInterval = setInterval(sendData, 1000);
});

ws.addEventListener('message', (event) => {
  console.log(`Node: ${event.data}`);
});

ws.addEventListener('close', () => {
  clearInterval(sendDataInterval);
});
