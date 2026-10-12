package controller;

import model.Appliance;

public class AutoModeController {

    private boolean autoMode;

    private DeviceController deviceController;

    public AutoModeController(
            DeviceController deviceController) {

        this.deviceController =
                deviceController;

        autoMode = false;
    }

    public boolean isAutoMode() {

        return autoMode;
    }

    public void setAutoMode(
            boolean autoMode) {

        this.autoMode = autoMode;

    }

    public void updateDevices(
            int temperature,
            Appliance fan,
            Appliance ac) {

        if (!autoMode) {

            return;
        }

        if (temperature >= 35) {

            deviceController.turnOn(fan);

            deviceController.turnOn(ac);

        } else {

            deviceController.turnOff(fan);

            deviceController.turnOff(ac);

        }
    }
}