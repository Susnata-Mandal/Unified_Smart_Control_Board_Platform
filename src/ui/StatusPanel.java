package ui;

import javax.swing.*;
import java.awt.*;

public class StatusPanel extends JPanel {

    private JLabel temperatureLabel;
    private JLabel modeLabel;
    private JLabel connectionLabel;
    private JLabel timeLabel;
    public StatusPanel() {

        initializeUI();

    }

    private void initializeUI() {

        setLayout(new GridLayout(1,4));

        setBorder(BorderFactory.createTitledBorder("System Status"));

        temperatureLabel =
                new JLabel(
                        "Temperature : 25°C",
                        SwingConstants.CENTER);

        modeLabel =
                new JLabel(
                        "Mode : MANUAL",
                        SwingConstants.CENTER);

        connectionLabel =
                new JLabel(
                        "Connection : Simulation",
                        SwingConstants.CENTER);
        timeLabel =
                new JLabel(
                "Time : --:--:--",
                SwingConstants.CENTER);

        add(timeLabel);
        add(temperatureLabel);
        add(modeLabel);
        add(connectionLabel);

    }

    public void updateTemperature(int temperature){

        temperatureLabel.setText(
                "Temperature : "
                        + temperature
                        + "°C");

    }

    public void updateMode(String mode){

        modeLabel.setText(
                "Mode : "
                        + mode);

    }
    public void updateTime(String time){

        timeLabel.setText("Time : " + time);

    }
    public void updateConnection(String connection){

        connectionLabel.setText(
                "Connection : "
                        + connection);

    }

}