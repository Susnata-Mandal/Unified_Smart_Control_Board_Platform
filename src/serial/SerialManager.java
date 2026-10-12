package serial;

import com.fazecast.jSerialComm.SerialPort;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class SerialManager {

    private SerialPort serialPort;
    private boolean connected;

    private Thread readerThread;
    private boolean reading;

    private final List<SerialListener> listeners;

    public SerialManager() {

        connected = false;
        reading = false;

        listeners =
                new CopyOnWriteArrayList<>();
    }

    public boolean connect(String portName) {

        serialPort =
                SerialPort.getCommPort(portName);

        serialPort.setBaudRate(9600);
        serialPort.setNumDataBits(8);
        serialPort.setNumStopBits(
                SerialPort.ONE_STOP_BIT
        );
        serialPort.setParity(
                SerialPort.NO_PARITY
        );

        serialPort.setComPortTimeouts(
                SerialPort.TIMEOUT_READ_SEMI_BLOCKING,
                1000,
                1000
        );

        connected = serialPort.openPort();

        if (connected) {

            System.out.println(
                    "[SERIAL] Arduino connected on "
                            + portName
            );

            startReader();

        } else {

            System.out.println(
                    "[SERIAL] Failed to connect Arduino"
            );
        }

        return connected;
    }

    public void addListener(
            SerialListener listener) {

        listeners.add(listener);
    }

    private void startReader() {

        reading = true;

        readerThread =
                new Thread(() -> {

                    StringBuilder lineBuffer =
                            new StringBuilder();

                    byte[] buffer =
                            new byte[64];

                    while (reading &&
                            connected) {

                        int bytesRead =
                                serialPort.readBytes(
                                        buffer,
                                        buffer.length
                                );

                        if (bytesRead <= 0) {
                            continue;
                        }

                        String received =
                                new String(
                                        buffer,
                                        0,
                                        bytesRead,
                                        StandardCharsets.UTF_8
                                );

                        for (char c :
                                received.toCharArray()) {

                            if (c == '\n') {

                                String line =
                                        lineBuffer
                                                .toString()
                                                .trim();

                                lineBuffer.setLength(0);

                                if (!line.isEmpty()) {

                                    notifyListeners(line);
                                }

                            } else if (c != '\r') {

                                lineBuffer.append(c);
                            }
                        }
                    }

                });

        readerThread.setDaemon(true);
        readerThread.start();
    }

    private void notifyListeners(
            String message) {

        System.out.println(
                "[SERIAL RECEIVE] " + message
        );

        for (SerialListener listener :
                listeners) {

            listener.onMessage(message);
        }
    }

    public void sendCommand(String command) {

        if (!connected ||
                serialPort == null) {

            System.out.println(
                    "[SERIAL] Arduino not connected"
            );

            return;
        }

        String message =
                command + "\n";

        byte[] data =
                message.getBytes(
                        StandardCharsets.UTF_8
                );

        serialPort.writeBytes(
                data,
                data.length
        );

        System.out.println(
                "[SERIAL SEND] " + command
        );
    }

    public void disconnect() {

        reading = false;

        if (serialPort != null &&
                serialPort.isOpen()) {

            serialPort.closePort();
        }

        connected = false;
    }

    public boolean isConnected() {

        return connected;
    }
}