package ui;

import javax.swing.*;
import java.awt.*;

public class PowerPanel extends JPanel {

    private JLabel currentPower;
    private JLabel totalEnergy;

    public PowerPanel(){

        setBorder(BorderFactory.createTitledBorder("Power Monitor"));
        setPreferredSize(
                new Dimension(250,120));
        setLayout(new GridLayout(2,1));

        currentPower = new JLabel(
                "Current Power : 0 W",
                SwingConstants.CENTER);

        totalEnergy = new JLabel(
                "Energy Used : 0 Wh",
                SwingConstants.CENTER);

        add(currentPower);
        add(totalEnergy);

    }

    public void updatePower(int power){

        currentPower.setText(
                "Current Power : "
                        + power
                        + " W");

    }

    public void updateEnergy(double energy){

        totalEnergy.setText(
                String.format(
                        "Energy Used : %.2f Wh",
                        energy));

    }

}