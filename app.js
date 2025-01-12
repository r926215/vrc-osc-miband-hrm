// 引入必要的模組
const osc = require("osc");
const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const open = require('open');
const { SerialPort } = require('serialport');
const { apps } = open;
const throttledQueue = require('throttled-queue');

// 建立 HTTP 和 WebSocket 伺服器
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ port: 3228 });

// 靜態資源伺服器 (提供 HTML 檔案)
app.use(express.static('html'));

// OSC 設定
let vrchatOSC = new osc.UDPPort({
  remoteAddress: "localhost",
  remotePort: 9000,
  metadata: true
});

// 初始化控制變數
let activePort = null;
let sendToChatbox = "false";
let chatboxText = "❤{HR} bpm";
const chatboxRatelimit = throttledQueue(1, 1300);

// 啟動 OSC 服務
vrchatOSC.open();
open(`http://localhost:8080/index.html`, { app: { name: apps.edge } });
console.log("Waiting for connection from browser...");

// 啟動伺服器
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// WebSocket 處理
wss.on('connection', ws => {
  console.log("WebSocket Connected. Waiting for data...");

  ws.on('message', async (message) => {
    const data = JSON.parse(message);

    // UART 連接配置請求
    if (data.action === "connect-uart") {
      try {
        if (activePort) {
          // 若已存在舊連線，先關閉
          activePort.close();
        }

        // 初始化 UART 連接
        activePort = new SerialPort({
          path: data.comPort,         // e.g. 'COM5' 或 '/dev/ttyUSB0'
          baudRate: data.baudRate,    // 115200
          dataBits: 8,
          parity: 'none',
          stopBits: 1,
          rtscts: false
        });

        // ★ (1) 序列埠開啟後的事件
        activePort.on('open', () => {
          console.log(`Serial port ${activePort.path} is open`);
          console.log(`isOpen? ${activePort.isOpen}`);

          // ★ (2) (可選) 這裡主動送一筆測試資料給 HT32，像 apptest.js 裡送 '49\n'
          activePort.write('49\n', (err) => {
            if (err) {
              return console.error('Write error:', err.message);
            }
            console.log('Write success (49\\n)!');
          });
        });

        // ★ (3) 監聽 HT32 回傳的資料
        activePort.on('data', (chunk) => {
          console.log('Data from HT32:', chunk.toString());
          
          // 若要把 HT32 回傳的資料再傳給網頁前端，可用:
          /*
          ws.send(JSON.stringify({
            status: "data",
            data: chunk.toString()
          }));
          */
        });

        // 通知前端：已連線成功
        ws.send(JSON.stringify({
          status: "connected",
          port: data.comPort,
          baudRate: data.baudRate
        }));

        // 錯誤處理
        activePort.on('error', (err) => {
          ws.send(JSON.stringify({
            status: "error",
            error: err.message
          }));
        });

      } catch (err) {
        ws.send(JSON.stringify({
          status: "error",
          error: err.message
        }));
      }
    }

    // 心率數據處理
    if (data.action === "heart-rate") {
      const heartRate = data.value;
      const heartRateString = `${heartRate}\n`;

      if (heartRate === 0) {
        console.log("Got heart rate: 0 bpm, skipping parameter update...");
        return;
      }

      console.log('Got heart rate:', heartRate);
      
      // 發送心率到 UART
      if (activePort && activePort.isOpen) {
        console.log(`Port isOpen? ${activePort.isOpen}`);
        activePort.write(heartRateString, (err) => {
          console.log("[Debug] write() callback is invoked");
          if (err) {
            console.error('UART Transmission Error:', err.message);
            return;
          }
          console.log('Sent to UART:', heartRateString);
        });
      } else {
        console.log('UART port not open. Cannot send data to UART.');
      }

      // 發送心率到 VRChat OSC
      vrchatOSC.send({
        address: "/avatar/parameters/Heartrate",
        args: { type: "f", value: heartRate / 127 - 1 }
      });
      vrchatOSC.send({
        address: "/avatar/parameters/Heartrate2",
        args: { type: "f", value: heartRate / 255 }
      });
      vrchatOSC.send({
        address: "/avatar/parameters/Heartrate3",
        args: { type: "i", value: heartRate }
      });

      // 發送到聊天框
      if (sendToChatbox === "true") {
        chatboxRatelimit(() => {
          let text = chatboxText.replace("{HR}", heartRate.toString()) + "    ";
          vrchatOSC.send({
            address: "/chatbox/input",
            args: [
              { type: "s", value: text },
              { type: "T", value: true }
            ]
          });
        });
      }
    }

    // 聊天框狀態更新
    if (data.text) {
      chatboxText = data.text;
    } else if (data === "true" || data === "false") {
      sendToChatbox = data;
    }
  });
});

// API: 列出 COM 埠
app.get('/list-ports', async (req, res) => {
  try {
    const ports = await SerialPort.list();
    res.json(ports);  // 回傳可用的 COM 埠
  } catch (error) {
    console.error("Failed to list COM ports:", error);
    res.status(500).json({ error: "Failed to list COM ports" });
  }
});

console.log("Server started...");
