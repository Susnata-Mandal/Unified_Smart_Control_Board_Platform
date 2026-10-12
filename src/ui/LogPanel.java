package ui;

import utils.Logger;

import javax.swing.*;
import java.awt.*;

public class LogPanel extends JPanel {

    private JTextArea logArea;

    public LogPanel() {

        initializeUI();

    }

    private void initializeUI() {

        setLayout(new BorderLayout());

        setBorder(BorderFactory.createTitledBorder("Activity Log"));

        logArea = new JTextArea();
        logArea.setLineWrap(true);

        logArea.setWrapStyleWord(true);

        logArea.setBackground(
                new Color(245,245,245));

        logArea.setEditable(false);

        logArea.setFont(new Font(
                "Consolas",
                Font.PLAIN,
                13));

        JScrollPane scrollPane =
                new JScrollPane(logArea);

        add(scrollPane,BorderLayout.CENTER);

    }

    public void addLog(String message){

        logArea.append(
                Logger.log(message)
                        + "\n");

        logArea.setCaretPosition(
                logArea.getDocument().getLength());

    }

}