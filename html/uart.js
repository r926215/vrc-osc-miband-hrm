// UART 配置控制
const UART_COM_PORT = document.querySelector("#com-port");
const UART_BAUD_RATE = document.querySelector("#baud-rate");
const CONNECT_UART_BTN = document.querySelector("#connect-uart");
const UART_STATUS = document.querySelector("#UARTStatus");

// 在 uart.js 中直接建立新的 WebSocket 實例
const uartWS = new WebSocket(`ws://${location.hostname}:3228`);

// 確認 WebSocket 連接成功
uartWS.addEventListener("open", () => {
  console.log("UART WebSocket Connected!");
  // 可在連線後發送測試訊息
  uartWS.send(JSON.stringify({ action: "connect", message: "Client connected." }));
});

// 處理 WebSocket 訊息
uartWS.addEventListener("message", (event) => {
  console.log("Received from server:", event.data);
  // 在此處理從伺服器接收到的 UART 資料
});

// 處理連接錯誤
uartWS.addEventListener("error", (error) => {
  console.error("UART WebSocket Error:", error);
});

// 處理連接關閉
uartWS.addEventListener("close", () => {
  console.log("UART WebSocket Disconnected.");
});

// 獲取可用的 COM 埠
async function fetchAvailablePorts() {
  try {
    const response = await fetch('/list-ports'); // 調用伺服器 API
    const ports = await response.json();
    UART_COM_PORT.innerHTML = `<option value="">Select COM Port</option>`;
    ports.forEach(port => {
      const option = document.createElement("option");
      option.value = port.path;
      option.textContent = `${port.path} (${port.manufacturer || "Unknown"})`;
      UART_COM_PORT.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to fetch COM ports:", error);
  }
}

// 處理 UART 連接請求
CONNECT_UART_BTN.addEventListener("click", () => {
  const selectedPort = UART_COM_PORT.value;
  const baudRate = parseInt(UART_BAUD_RATE.value, 10);

  if (!selectedPort || !baudRate) {
    alert("Please select both COM port and Baud rate.");
    return;
  }

  // 發送 UART 配置到伺服器
  uartWS.send(JSON.stringify({
    action: "connect-uart",
    comPort: selectedPort,
    baudRate: baudRate
  }));

  // 更新 UART 狀態
  UART_STATUS.textContent = "Connecting...";

  // 接收伺服器消息
  uartWS.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
  
    if (message.status === "connected") {
      UART_STATUS.textContent = `Connected to ${message.port} at ${message.baudRate} baud`;
    } else if (message.status === "error") {
      UART_STATUS.textContent = `Error: ${message.error}`;
    } else {
      // 可根據伺服器傳來的其它資料進行相對應的處理
    }
  });
});

// 頁面加載時自動獲取 COM 埠
fetchAvailablePorts();