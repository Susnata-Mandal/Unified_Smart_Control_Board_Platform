package storage;

import model.Appliance;
import model.DeviceState;

import java.io.*;
import java.util.List;

public class StateManager {

    private static final String FILE_NAME = "device_state.txt";

    public void saveStates(List<Appliance> appliances) {

        try (PrintWriter writer = new PrintWriter(new FileWriter(FILE_NAME))) {

            for (Appliance appliance : appliances) {

                writer.println(
                        appliance.getName() + ","
                                + appliance.getState());

            }

        }

        catch (IOException e) {

            e.printStackTrace();

        }

    }

    public void loadStates(List<Appliance> appliances) {

        File file = new File(FILE_NAME);

        if (!file.exists()) {

            return;

        }

        try (BufferedReader reader =
                     new BufferedReader(new FileReader(file))) {

            String line;

            while ((line = reader.readLine()) != null) {

                String[] parts = line.split(",");

                String name = parts[0];

                DeviceState state =
                        DeviceState.valueOf(parts[1]);

                for (Appliance appliance : appliances) {

                    if (appliance.getName().equals(name)) {

                        if (state == DeviceState.ON)

                            appliance.turnOn();

                        else

                            appliance.turnOff();

                    }

                }

            }

        }

        catch (IOException e) {

            e.printStackTrace();

        }

    }

}