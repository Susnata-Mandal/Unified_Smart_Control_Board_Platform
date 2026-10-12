package model;

public class Appliance {

    private String name;
    private DeviceState state;
    private int powerRating;

    private long startTime;
    private long runningTime;

    private double energyConsumed;

    public Appliance(String name, int powerRating) {

        this.name = name;
        this.powerRating = powerRating;

        state = DeviceState.OFF;

        runningTime = 0;
        energyConsumed = 0;

    }

    public String getName() {
        return name;
    }

    public DeviceState getState() {
        return state;
    }

    public int getPowerRating() {
        return powerRating;
    }

    public long getRunningTime() {
        return runningTime;
    }

    public double getEnergyConsumed() {
        return energyConsumed;
    }

    public void turnOn() {

        if(state == DeviceState.OFF){

            state = DeviceState.ON;

            startTime = System.currentTimeMillis();

        }

    }

    public void turnOff() {

        if(state == DeviceState.ON){

            state = DeviceState.OFF;

            long stopTime = System.currentTimeMillis();

            runningTime += stopTime - startTime;

            energyConsumed =
                    (runningTime / 3600000.0)
                            * powerRating;

        }

    }

}