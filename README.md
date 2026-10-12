# Unified Smart Control Hub v2.0

A modern Smart Home Control & Telemetry System featuring an interactive 3D/Photo Bedroom HUD, physical Arduino USB relay control via Web Serial, browser-native Voice Recognition, and automated climate control.

---

## 🚀 Quick Start (One-Click Launch on Windows)

1. **Unzip** this project folder to any location on your computer.
2. Double-click **`START_SMART_HOME.bat`**.
   * *Note: On the very first run on a new computer, the script will automatically install the required web packages (`npm install`) if needed, and then launch the application.*
   * Make sure [Node.js](https://nodejs.org/) (v18+) is installed on the computer.
3. Your browser (Google Chrome or Microsoft Edge recommended) will automatically open to **`http://localhost:5173`**.

---

## 🔐 Login Credentials

* **Security Identifier (Username):** `admin`
* **Security Key (Password):** `admin123`

---

## 🔌 Connecting Physical Arduino Hardware

1. Plug your Arduino board into a USB port.
2. On the dashboard header bar, click **`🔌 Connect Arduino`**.
3. Select your Arduino's COM port from the browser popup and click **Connect**.
4. **Serial Protocol (9600 Baud):**
   * **Outgoing Commands:** `LIGHT_ON`, `LIGHT_OFF`, `FAN_ON`, `FAN_OFF`, `AIR_FRYER_ON`, `AIR_FRYER_OFF`, `AC_ON`, `AC_OFF`, `ALL_OFF`
   * **Incoming Telemetry:** `TEMP:<value>`, `HUMIDITY:<value>`, `SENSOR_ERROR`

---

## 🎙️ Voice Commands

1. Click **`Voice: Idle`** in the top bar and allow microphone access.
2. Speak naturally:
   * *"Turn on light"* / *"Turn off light"*
   * *"Turn on fan"* / *"Turn off fan"*
   * *"Turn on AC"* / *"Turn off AC"*
   * *"Turn on air fryer"* / *"Turn off air fryer"*
   * *"Turn on all devices"* / *"Turn off all devices"*
