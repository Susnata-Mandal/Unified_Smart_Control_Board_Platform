package controller;

import model.Appliance;
import model.DeviceState;

import java.util.List;

public class PowerCalculator {

    public int calculateCurrentPower(List<Appliance> appliances){

        int total = 0;

        for(Appliance appliance : appliances){

            if(appliance.getState()==DeviceState.ON){

                total += appliance.getPowerRating();

            }

        }

        return total;

    }

    public double calculateEnergy(List<Appliance> appliances){

        double total = 0;

        for(Appliance appliance : appliances){

            total += appliance.getEnergyConsumed();

        }

        return total;

    }

}