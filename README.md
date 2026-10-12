# ⚡ Unified Smart Control Hub v2.0

> **Operating Systems (OS) & IoT Hardware-Software Interfacing Project**  
> An end-to-end Smart Home Automation, 3D Digital Twin, and Real-Time Telemetry Control System bridging user-space web & Java applications directly with physical Arduino hardware via asynchronous UART/USB Serial communication.

---

## 👥 Project Team

* **Susnata Mandal**
* **Neel**
* **Ritesh**
* **Sanidhy**

---

## 🌟 Overview

**Unified Smart Control Hub v2.0** demonstrates how modern Operating Systems and user-space applications manage **hardware I/O**, **asynchronous serial communication**, **process concurrency**, **event-driven interrupts**, and **automated resource scheduling**.

Instead of a static dashboard, the system provides a **Dual-Mode Interactive Bedroom (Real Photo HUD + 3D Digital Twin)** where clicking switches on a virtual wall switchboard—or speaking natural voice commands—physically triggers real-world appliances connected to an **Arduino Microcontroller** in real time.

---

## ✨ Key Features

### 1. 🏠 Dual-Mode Interactive Room (Photo HUD + 3D Digital Twin)
* **Real Photo HUD Mode:** High-definition bedroom view with an interactive wall-mounted 4-gang switchboard and clickable appliances.
* **3D Interactive Room Mode:** Built with **Three.js / React Three Fiber**, featuring full 360° orbit camera controls and real-time physical animations:
  * **Ceiling Fan (80W):** Smooth rotational acceleration when switched ON.
  * **Ceiling Light (10W):** Dynamic volumetric lighting and room illumination.
  * **Air Conditioner (1200W):** Crisp digital temperature LED readout (`25°C`) and motorized oscillating louver flaps.
  * **Countertop Air Fryer (1500W):** Internal combustion heating glow effect when active.

### 2. 🔌 Direct Hardware-Software Bridge (Web Serial & Java `jSerialComm`)
* **Zero-Latency USB Serial I/O (`9600 baud`):** Communicates directly with the Arduino over USB (`8 data bits`, `1 stop bit`, `no parity`).
* **Two-Way Handshake Protocol:** Dispatches newline-terminated ASCII control frames (`LIGHT_ON`, `FAN_ON`, etc.) and listens asynchronously for hardware acknowledgment interrupts (`LIGHT_ON_OK`, `FAN_ON_OK`, etc.) and environmental telemetry streams.

### 3. 🎙️ Noise-Resistant Multi-Device Voice Engine
* **Hardware WebRTC Noise Suppression:** Activates `echoCancellation`, `noiseSuppression`, and `autoGainControl` on the microphone input stream to filter out room noise and background chatter.
* **Compound & Mixed Command Parsing:** Supports turning on/off multiple appliances in a single breath:
  * *"Turn on light and fan"*
  * *"Turn off AC and air fryer"*
  * *"Turn on light and turn off fan"*
  * *"Turn on all devices"* / *"All off"*
* **Serial Buffer Staggering:** Automatically staggers rapid multi-device serial packets by `70ms` so the Arduino UART buffer processes every instruction cleanly without packet collision.

### 4. 🤖 Autonomous Climate Daemon (`Auto Mode`)
* Background environmental controller that continuously evaluates room temperature against thermal comfort thresholds ($\ge 30^\circ\text{C}$) to automatically schedule cooling loads (**Fan** and **AC**) ON or OFF.

### 5. 📊 Live Telemetry Sparklines & Hardware Event Terminal
* **4 Real-Time KPI Cards:**
  * **Ambient Temperature (`°C`)** – DHT11 sensor feed with live trend sparkline.
  * **Relative Humidity (`%`)** – Real-time moisture tracking.
  * **Active Power Draw (`W`)** – Instantaneous wattage summation across active loads.
  * **Cumulative Energy (`kWh`)** – Time-integrated energy consumption counter.
* **System Hardware Stream Console:** Timestamped event log recording every serial command, hardware ACK, voice transcript, and auto-mode intervention.

---

## 🧠 Operating Systems (OS) Concepts Demonstrated

| OS Concept | Implementation in Project |
| :--- | :--- |
| **Device Drivers & Serial I/O** | Asynchronous full-duplex UART communication over USB (`COM` ports) at `9600 baud` using `WebSerialManager` and Java `jSerialComm`. |
| **Concurrency & Non-Blocking Threads** | Separate reader/writer streams for serial I/O, background timer threads for telemetry sampling, and 60 FPS WebGL rendering without blocking the main UI thread. |
| **Interrupt & Event-Driven Execution** | Hardware state changes and incoming serial lines trigger reactive event listeners and state transitions rather than CPU-intensive busy-waiting. |
| **Resource & Power Scheduling** | Real-time power load monitoring (`Watts` / `kWh`) and automated thermal load shedding via `AutoModeController`. |
| **I/O Buffer Management** | Line-buffered stream decoding (`\r\n` framing) and 60–70ms packet pacing to prevent microcontroller UART RX buffer overflow. |

---

## 🛠️ Tech Stack

* **Frontend & 3D Engine:** React 18, Vite, Tailwind CSS, Three.js, React Three Fiber (`@react-three/fiber`, `@react-three/drei`), Framer Motion, Lucide Icons
* **Browser Hardware APIs:** Web Serial API (`navigator.serial`), Web Speech API (`SpeechRecognition`), WebRTC MediaStream Constraints
* **Core Backend (Java):** Java SE, Swing UI, `jSerialComm` (`2.11.4`), Vosk Offline Speech Recognition (`0.3.45`), JNA (`5.13.0`)
* **Embedded Hardware:** Arduino Uno / Nano (ATmega328P, Embedded C/C++), 4-Channel 5V Relay Module, DHT11 Temperature & Humidity Sensor

---

## 📂 Project Directory Structure

```text
SmartHome_Project_V2/
├── START_SMART_HOME.bat              # One-click Windows launcher (auto-installs & starts server)
├── README.md                         # Project documentation
├── arduino/
│   └── SmartHome_Hardware/
│       └── SmartHome_Hardware.ino    # Arduino IDE firmware sketch (Pins 2, 3, 4, 5)
├── web/                              # Modern React + 3D Web Application
│   ├── public/
│   │   └── room_photo.jpg            # High-res bedroom base layer for Photo HUD
│   ├── src/
│   │   ├── components/
│   │   │   ├── InteractiveFloor3D.jsx    # Dual-mode Photo HUD & 3D Bedroom Canvas
│   │   │   ├── DeviceSwitchCard.jsx      # Tactile appliance control cards with runtime timers
│   │   │   ├── TelemetrySparklines.jsx   # Live SVG sparkline KPI cards
│   │   │   └── NetworkHero3D.jsx         # 3D rotating neural network scene on Login page
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx             # Security authentication gateway
│   │   │   └── DashboardPage.jsx         # Main control center, drawer navigation & logs
│   │   └── services/
│   │       ├── WebSerialManager.js       # Direct USB Serial driver for Arduino (9600 baud)
│   │       └── VoiceAssistant.js         # Noise-suppressed multi-device speech recognizer
│   └── package.json
├── src/                              # Original Java OOP Backend & Swing Architecture
│   ├── controller/                   # AutoModeController, CommandManager, DeviceController, PowerCalculator
│   ├── model/                        # Appliance & DeviceState models
│   ├── serial/                       # SerialManager & SerialListener (jSerialComm)
│   ├── storage/                      # StateManager persistence
│   ├── ui/                           # Desktop Swing UI panels
│   └── voice/                        # VoiceRecognizer & VoiceCommandParser
└── lib/                              # Java JAR dependencies (jSerialComm, vosk, jna)
```

---

## 🔌 Hardware Pinout & Wiring Guide (Arduino Uno / Nano)

Upload [`arduino/SmartHome_Hardware/SmartHome_Hardware.ino`](arduino/SmartHome_Hardware/SmartHome_Hardware.ino) to your Arduino board using the **Arduino IDE**.

| Appliance | Power Rating | Arduino Digital Pin | Relay / Component Connection | Serial ON Command | Serial OFF Command |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **Light** | `10 W` | **Pin `D2`** | Relay `IN1` / LED Anode (`+`) | `LIGHT_ON` | `LIGHT_OFF` |
| **Fan** | `80 W` | **Pin `D3`** | Relay `IN2` / Fan Driver | `FAN_ON` | `FAN_OFF` |
| **Air Fryer** | `1500 W` | **Pin `D4`** | Relay `IN3` / Indicator LED | `AIR_FRYER_ON` | `AIR_FRYER_OFF` |
| **AC** | `1200 W` | **Pin `D5`** | Relay `IN4` / Indicator LED | `AC_ON` | `AC_OFF` |
| **5V Power** | — | **`5V` Pin** | Relay Module `VCC` | — | — |
| **Ground** | — | **`GND` Pin** | Relay Module `GND` / Common Cathode (`-`) | — | — |

### Serial Communication Protocol (`9600 Baud, 8N1`)
* **Master Emergency Off:** Sending `ALL_OFF\n` sets Digital Pins `2`, `3`, `4`, and `5` to `LOW` simultaneously and returns `ALL_OFF_OK`.
* **Hardware Acknowledgments:** Arduino replies with `LIGHT_ON_OK`, `LIGHT_OFF_OK`, `FAN_ON_OK`, `FAN_OFF_OK`, `AIR_FRYER_ON_OK`, `AIR_FRYER_OFF_OK`, `AC_ON_OK`, `AC_OFF_OK`.

---

## 🚀 Getting Started (Installation & Running)

### Prerequisites
* **Node.js** (v18 or higher) – [Download here](https://nodejs.org/)
* **Google Chrome** or **Microsoft Edge** (required for Web Serial API & Web Speech API support)
* **Arduino IDE** (to upload the `.ino` firmware to your Arduino board once)

### Option A: One-Click Launch on Windows (Recommended)
1. Clone or unzip the repository.
2. Double-click **`START_SMART_HOME.bat`** in the project root folder.
   * *On the first run, the script automatically detects if `node_modules` is missing, runs `npm install`, starts the Vite server, and opens your browser to `http://localhost:5173`.*

### Option B: Manual Terminal Launch
```bash
# 1. Navigate to the web application directory
cd web

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```
Then open **`http://localhost:5173`** in Google Chrome or Microsoft Edge.

---

## 🔐 Default Login Credentials

When the application launches, you will be greeted by the **Security Gateway Login Screen**:

* **Security Identifier (Username):** `admin`
* **Security Key (Password):** `admin123`
*(You can also click **"Auto-fill default"** on the login card for instant access).*

---

## 🎮 How to Use During Live Demo

1. **Connect Physical Arduino:**
   * Plug in your Arduino via USB *(make sure the Arduino IDE Serial Monitor is closed so the COM port is unlocked)*.
   * Click **`🔌 Connect Arduino`** in the top header bar, choose your Arduino COM port from the popup, and click **Connect**.
2. **Interactive Room Control:**
   * Toggle between **Real Photo HUD** and **3D Interactive Room** using the view switcher above the room viewport.
   * Click individual switches on the wall switchboard, click the 3D appliances directly, or use the 4 compact appliance cards below the room.
3. **Voice Control:**
   * Click **`Voice: Idle`** in the top bar and allow microphone access.
   * Speak single or multi-device commands like *"Turn on light and fan"* or *"All off"*.
4. **Hardware Event Logs:**
   * Click the top-left hamburger menu (`☰`) ➔ select **Hardware Event Logs** to smoothly scroll down and highlight the live serial I/O terminal.

---

## 📜 License

Developed as an academic **Operating Systems (OS) & IoT Course Project**. Feel free to fork, explore, and adapt for educational and hardware prototyping purposes.
