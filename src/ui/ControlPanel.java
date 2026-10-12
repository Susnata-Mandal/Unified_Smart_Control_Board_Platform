package ui;

import javax.swing.*;
import java.awt.*;

public class ControlPanel extends JPanel {

    private JButton autoModeButton;
    private JButton emergencyButton;

    public ControlPanel() {

        initializeUI();

    }

    private void initializeUI() {

        setLayout(new FlowLayout(
                FlowLayout.CENTER,
                30,
                10));

        autoModeButton =
                new JButton("AUTO MODE");

        emergencyButton =
                new JButton("EMERGENCY OFF");

        emergencyButton.setBackground(Color.RED);
        emergencyButton.setForeground(Color.WHITE);

        add(autoModeButton);
        add(emergencyButton);

    }

    public JButton getAutoModeButton() {

        return autoModeButton;

    }

    public JButton getEmergencyButton() {

        return emergencyButton;

    }

}