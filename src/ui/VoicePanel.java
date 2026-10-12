package ui;

import voice.VoiceRecognizer;

import javax.swing.*;
import java.awt.*;

public class VoicePanel extends JPanel {

    private final VoiceRecognizer voiceRecognizer;

    private JButton listenButton;
    private JLabel statusLabel;
    private JTextField commandField;
    private JButton testButton;

    public VoicePanel(
            VoiceRecognizer voiceRecognizer) {

        this.voiceRecognizer =
                voiceRecognizer;

        initializeUI();
    }

    private void initializeUI() {

        setBorder(
                BorderFactory.createTitledBorder(
                        "VOICE CONTROL"));

        setLayout(
                new GridLayout(
                        4,
                        1,
                        5,
                        5));

        listenButton =
                new JButton("🎤 START LISTENING");

        statusLabel =
                new JLabel(
                        "Status: Ready",
                        SwingConstants.CENTER);

        commandField =
                new JTextField();

        commandField.setToolTipText(
                "Temporary voice command test");

        testButton =
                new JButton("TEST COMMAND");

        add(listenButton);
        add(statusLabel);
        add(commandField);
        add(testButton);

        listenButton.addActionListener(e -> {

            if (!voiceRecognizer.isListening()) {

                voiceRecognizer.startListening();

                listenButton.setText(
                        "🛑 STOP LISTENING");

                statusLabel.setText(
                        "Status: Listening...");

            } else {

                voiceRecognizer.stopListening();

                listenButton.setText(
                        "🎤 START LISTENING");

                statusLabel.setText(
                        "Status: Ready");
            }
        });

        testButton.addActionListener(e -> {

            String text =
                    commandField.getText();

            if (text == null ||
                    text.trim().isEmpty()) {

                return;
            }

            voiceRecognizer.testVoiceCommand(
                    text);

            statusLabel.setText(
                    "Command: " + text);
        });
    }
}