package controller;

import model.Appliance;

import java.util.List;

public class CommandManager {

    private final DeviceController deviceController;


    public CommandManager(DeviceController deviceController) {
        this.deviceController = deviceController;
    }


    public boolean execute(String command) {

        if (command == null || command.trim().isEmpty()) {
            return false;
        }

        command = command.trim().toUpperCase();

        switch (command) {

            case "LIGHT_ON":
                return setDevice("Light", true);

            case "LIGHT_OFF":
                return setDevice("Light", false);

            case "FAN_ON":
                return setDevice("Fan", true);

            case "FAN_OFF":
                return setDevice("Fan", false);

            case "AIR_FRYER_ON":
                return setDevice("Air Fryer", true);

            case "AIR_FRYER_OFF":
                return setDevice("Air Fryer", false);

            case "AC_ON":
                return setDevice("AC", true);

            case "AC_OFF":
                return setDevice("AC", false);

            case "ALL_ON":
                turnAllOn();
                return true;

            case "ALL_OFF":
                deviceController.emergencyOff();
                return true;

            default:
                System.out.println(
                        "[COMMAND] Unknown command: " + command
                );
                return false;
        }
    }

    private boolean setDevice(
            String deviceName,
            boolean turnOn) {

        for (Appliance appliance :
                deviceController.getAppliances()) {

            if (appliance.getName().equalsIgnoreCase(deviceName)) {

                if (turnOn) {
                    deviceController.turnOn(appliance);
                } else {
                    deviceController.turnOff(appliance);
                }

                return true;
            }
        }

        return false;
    }

    private void turnAllOn() {

        List<Appliance> appliances =
                deviceController.getAppliances();

        for (Appliance appliance : appliances) {

            deviceController.turnOn(appliance);

        }
    }

    public DeviceController getDeviceController() {
        return deviceController;
    }
}