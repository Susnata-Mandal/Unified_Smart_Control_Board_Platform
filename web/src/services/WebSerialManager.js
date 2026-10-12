/**
 * WebSerialManager
 * Direct Web Serial API integration for Arduino communication in Chrome / Edge.
 * Baud rate: 9600
 * Commands: LIGHT_ON, LIGHT_OFF, FAN_ON, FAN_OFF, AIR_FRYER_ON, AIR_FRYER_OFF, AC_ON, AC_OFF, ALL_OFF
 * Telemetry: TEMP:<val>, HUMIDITY:<val>, SENSOR_ERROR
 */

class WebSerialManager {
  constructor() {
    this.port = null;
    this.writer = null;
    this.reader = null;
    this.readableStreamClosed = null;
    this.writableStreamClosed = null;
    this.isConnected = false;
    this.portInfo = null;
    this.onTelemetry = null; // callback: ({ temp, humidity, error })
    this.onStatusChange = null; // callback: ({ isConnected, portName, error })
    this.onLog = null; // callback: (message, type)
    this.keepReading = false;
  }

  isSupported() {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  async connect() {
    if (!this.isSupported()) {
      const err = 'Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.';
      this.notifyLog(`[SERIAL] ${err}`, 'warn');
      throw new Error(err);
    }

    try {
      this.notifyLog('[SERIAL] Requesting USB Arduino port selection...', 'info');
      // Prompt user to select port
      this.port = await navigator.serial.requestPort();
      
      await this.port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        bufferSize: 255
      });

      const info = this.port.getInfo();
      const portDescriptor = info.usbVendorId
        ? `USB VID:0x${info.usbVendorId.toString(16).padStart(4, '0')} PID:0x${info.usbProductId.toString(16).padStart(4, '0')}`
        : 'Arduino USB Port';

      this.portInfo = portDescriptor;
      this.isConnected = true;
      this.keepReading = true;

      this.notifyLog(`[SERIAL] Connected to ${portDescriptor} at 9600 baud`, 'success');
      if (this.onStatusChange) {
        this.onStatusChange({ isConnected: true, portName: portDescriptor, error: null });
      }

      // Prepare text writer
      const textEncoder = new TextEncoderStream();
      this.writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable);
      this.writer = textEncoder.writable.getWriter();

      // Start reader loop
      this.readLoop();

      return true;
    } catch (err) {
      this.isConnected = false;
      this.notifyLog(`[SERIAL] Connection failed: ${err.message}`, 'warn');
      if (this.onStatusChange) {
        this.onStatusChange({ isConnected: false, portName: null, error: err.message });
      }
      throw err;
    }
  }

  async readLoop() {
    while (this.port && this.port.readable && this.keepReading) {
      const textDecoder = new TextDecoderStream();
      this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      this.reader = reader;

      let buffer = '';

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          if (value) {
            buffer += value;
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop(); // keep remainder

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed) {
                this.handleIncomingLine(trimmed);
              }
            }
          }
        }
      } catch (error) {
        if (this.keepReading) {
          this.notifyLog(`[SERIAL] Read error: ${error.message}`, 'warn');
        }
      } finally {
        reader.releaseLock();
      }
    }
  }

  handleIncomingLine(line) {
    this.notifyLog(`[ARDUINO IN] ${line}`, 'info');

    if (line.startsWith('TEMP:')) {
      const raw = line.substring(5).trim();
      const temp = parseFloat(raw);
      if (!isNaN(temp) && this.onTelemetry) {
        this.onTelemetry({ temp, raw: line });
      }
    } else if (line.startsWith('HUMIDITY:')) {
      const raw = line.substring(9).trim();
      const hum = parseFloat(raw);
      if (!isNaN(hum) && this.onTelemetry) {
        this.onTelemetry({ humidity: hum, raw: line });
      }
    } else if (line === 'SENSOR_ERROR') {
      if (this.onTelemetry) {
        this.onTelemetry({ sensorError: true, raw: line });
      }
    }
  }

  async sendCommand(command) {
    if (!this.isConnected || !this.writer) {
      this.notifyLog(`[SERIAL] Skipped "${command}" (Arduino not connected)`, 'info');
      return false;
    }

    try {
      // Send command followed by newline
      await this.writer.write(`${command}\n`);
      this.notifyLog(`[ARDUINO OUT] Sent command: ${command}`, 'success');
      return true;
    } catch (err) {
      this.notifyLog(`[SERIAL] Write failed: ${err.message}`, 'warn');
      return false;
    }
  }

  async disconnect() {
    this.keepReading = false;

    try {
      if (this.reader) {
        await this.reader.cancel();
      }
      if (this.readableStreamClosed) {
        await this.readableStreamClosed.catch(() => {});
      }
      if (this.writer) {
        await this.writer.close();
      }
      if (this.writableStreamClosed) {
        await this.writableStreamClosed.catch(() => {});
      }
      if (this.port) {
        await this.port.close();
      }
    } catch (err) {
      console.warn('Error during disconnect:', err);
    } finally {
      this.port = null;
      this.writer = null;
      this.reader = null;
      this.isConnected = false;
      this.portInfo = null;

      this.notifyLog('[SERIAL] Arduino disconnected', 'warn');
      if (this.onStatusChange) {
        this.onStatusChange({ isConnected: false, portName: null, error: null });
      }
    }
  }

  notifyLog(msg, type = 'info') {
    if (this.onLog) {
      this.onLog(msg, type);
    }
  }
}

export const webSerialManager = new WebSerialManager();
