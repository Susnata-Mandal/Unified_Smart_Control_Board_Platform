package ui;

import controller.CommandManager;
import model.Appliance;
import model.DeviceState;

import javax.swing.*;
import java.awt.*;

public class DevicePanel extends JPanel {

    private final Appliance appliance;
    private final CommandManager commandManager;

    private JLabel nameLabel;
    private JLabel statusLabel;
    private JLabel powerLabel;

    private JButton onButton;
    private JButton offButton;

    public DevicePanel(
            Appliance appliance,
            CommandManager commandManager) {

        this.appliance = appliance;
        this.commandManager = commandManager;

        initializeUI();
        refresh();
    }

    private void initializeUI() {

        setLayout(new BorderLayout(10, 10));
        setBorder(
                BorderFactory.createLineBorder(
                        Color.GRAY,
                        2));

        JPanel infoPanel = new JPanel();
        infoPanel.setLayout(
                new GridLayout(3, 1));

        nameLabel = new JLabel(
                appliance.getName(),
                SwingConstants.CENTER);

        nameLabel.setFont(
                new Font(
                        "Segoe UI",
                        Font.BOLD,
                        18));

        statusLabel = new JLabel(
                "",
                SwingConstants.CENTER);

        powerLabel = new JLabel(
                "Power : "
                        + appliance.getPowerRating()
                        + " W",
                SwingConstants.CENTER);

        infoPanel.add(nameLabel);
        infoPanel.add(statusLabel);
        infoPanel.add(powerLabel);

        JPanel buttonPanel = new JPanel();

        onButton = new JButton("ON");
        offButton = new JButton("OFF");

        onButton.setBackground(
                new Color(34, 177, 76));

        onButton.setForeground(Color.WHITE);

        offButton.setBackground(
                new Color(220, 53, 69));

        offButton.setForeground(Color.WHITE);

        buttonPanel.add(onButton);
        buttonPanel.add(offButton);

        add(infoPanel, BorderLayout.CENTER);
        add(buttonPanel, BorderLayout.SOUTH);

        onButton.addActionListener(e -> {

            commandManager.execute(
                    getCommand(true));

            refresh();
        });

        offButton.addActionListener(e -> {

            commandManager.execute(
                    getCommand(false));

            refresh();
        });
    }

    private String getCommand(boolean turnOn) {

        String name =
                appliance.getName();

        if (name.equalsIgnoreCase("Light")) {
            return turnOn
                    ? "LIGHT_ON"
                    : "LIGHT_OFF";
        }

        if (name.equalsIgnoreCase("Fan")) {
            return turnOn
                    ? "FAN_ON"
                    : "FAN_OFF";
        }

        if (name.equalsIgnoreCase("Air Fryer")) {
            return turnOn
                    ? "AIR_FRYER_ON"
                    : "AIR_FRYER_OFF";
        }

        if (name.equalsIgnoreCase("AC")) {
            return turnOn
                    ? "AC_ON"
                    : "AC_OFF";
        }

        return "";
    }

    public void refresh() {

        if (appliance.getState()
                == DeviceState.ON) {

            statusLabel.setText(
                    "Status : ON");

            statusLabel.setForeground(
                    new Color(34, 177, 76));

            onButton.setEnabled(false);
            offButton.setEnabled(true);

        } else {

            statusLabel.setText(
                    "Status : OFF");

            statusLabel.setForeground(
                    Color.RED);

            onButton.setEnabled(true);
            offButton.setEnabled(false);
        }
    }
}