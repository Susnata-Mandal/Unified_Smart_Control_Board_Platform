package controller;

import model.Appliance;
import serial.SerialManager;

import java.util.ArrayList;
import java.util.List;

public class DeviceController {

    private final List<Appliance> appliances;

    private SerialManager serialManager;

    public DeviceController() {

        appliances = new ArrayList<>();

    }

    public void setSerialManager(
            SerialManager serialManager) {

        this.serialManager = serialManager;

    }

    public void addAppliance(
            Appliance appliance) {

        appliances.add(appliance);

    }

    public List<Appliance> getAppliances() {

        return appliances;

    }

    public void turnOn(
            Appliance appliance) {

        if (appliance == null) {
            return;
        }

        appliance.turnOn();

        sendCommand(
                appliance.getName(),
                true
        );
    }

    public void turnOff(
            Appliance appliance) {

        if (appliance == null) {
            return;
        }

        appliance.turnOff();

        sendCommand(
                appliance.getName(),
                false
        );
    }

    public void emergencyOff() {

        for (Appliance appliance : appliances) {

            appliance.turnOff();

        }

        if (serialManager != null &&
                serialManager.isConnected()) {

            serialManager.sendCommand(
                    "ALL_OFF"
            );

        }
    }

    private void sendCommand(
            String applianceName,
            boolean turnOn) {

        if (serialManager == null ||
                !serialManager.isConnected()) {

            return;
        }

        String command = "";

        if (applianceName.equals("Light")) {

            command = turnOn
                    ? "LIGHT_ON"
                    : "LIGHT_OFF";

        } else if (applianceName.equals("Fan")) {

            command = turnOn
                    ? "FAN_ON"
                    : "FAN_OFF";

        } else if (applianceName.equals("Air Fryer")) {

            command = turnOn
                    ? "AIR_FRYER_ON"
                    : "AIR_FRYER_OFF";

        } else if (applianceName.equals("AC")) {

            command = turnOn
                    ? "AC_ON"
                    : "AC_OFF";
        }

        if (!command.isEmpty()) {

            serialManager.sendCommand(
                    command
            );

        }
    }
}