package ui;

import controller.AutoModeController;
import controller.DeviceController;
import controller.PowerCalculator;
import model.Appliance;
import utils.Constants;
import serial.SerialManager;
import javax.swing.*;
import java.awt.*;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import storage.StateManager;
import controller.CommandManager;
import voice.VoiceRecognizer;

public class Dashboard extends JFrame {
    private DevicePanel lightPanel;
    private DevicePanel fanPanel;
    private DevicePanel fryerPanel;
    private DevicePanel acPanel;
    private SerialManager serialManager;
    private volatile int currentTemperature = 0;
    private volatile int currentHumidity = 0;
    private StatusPanel statusPanel;
    private PowerPanel powerPanel;
    private LogPanel logPanel;
    private ControlPanel controlPanel;

    private DeviceController deviceController;
    private CommandManager commandManager;
    private PowerCalculator calculator;
    private AutoModeController autoController;
    private StateManager stateManager;

    private Appliance light;
    private Appliance fan;
    private Appliance fryer;
    private Appliance ac;
    private VoiceRecognizer voiceRecognizer;
    private VoicePanel voicePanel;

    public Dashboard() {

        deviceController = new DeviceController();

        commandManager =
                new CommandManager(
                        deviceController);
        voiceRecognizer =
                new VoiceRecognizer(
                        commandManager);
        calculator = new PowerCalculator();
        autoController =
                new AutoModeController(
                        deviceController
                );
        stateManager = new StateManager();
        serialManager = new SerialManager();

        serialManager.connect("COM9");
        serialManager.addListener(message -> {

            handleArduinoMessage(message);

        });

        deviceController.setSerialManager(
                serialManager
        );
        initializeAppliances();
        stateManager.loadStates(
                deviceController.getAppliances());

        setTitle(Constants.APP_NAME);
        setSize(Constants.DASHBOARD_WIDTH,
                Constants.DASHBOARD_HEIGHT);

        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        initializeUI();
        lightPanel.refresh();
        fanPanel.refresh();
        fryerPanel.refresh();
        acPanel.refresh();
        addWindowListener(new java.awt.event.WindowAdapter() {

            @Override
            public void windowClosing(java.awt.event.WindowEvent e) {

                stateManager.saveStates(
                        deviceController.getAppliances());

            }

        });

        addSystemLog("Real Hardware Mode Started");
        addSystemLog(
                "Welcome Admin");

        addSystemLog(
                "System Ready");

        if (serialManager.isConnected()) {

            addSystemLog("Serial Connected");

        }

        startSimulation();

        setVisible(true);


    }

    private void initializeAppliances(){

        light = new Appliance("Light",10);
        fan = new Appliance("Fan",80);
        fryer = new Appliance("Air Fryer",1500);
        ac = new Appliance("AC",1200);

        deviceController.addAppliance(light);
        deviceController.addAppliance(fan);
        deviceController.addAppliance(fryer);
        deviceController.addAppliance(ac);

    }

    private void initializeUI(){

        setLayout(new BorderLayout(10,10));
        ((JPanel)getContentPane())
                .setBorder(
                        BorderFactory.createEmptyBorder(
                                10,
                                10,
                                10,
                                10));

        JLabel heading =
                new JLabel(
                        "UNIFIED SMART CONTROL BOARD",
                        SwingConstants.CENTER);

        heading.setOpaque(true);

        heading.setBackground(
                new Color(25,42,86));

        heading.setForeground(Color.WHITE);

        heading.setPreferredSize(
                new Dimension(0,60));

        heading.setFont(Constants.TITLE_FONT);

        //add(heading,BorderLayout.NORTH);

        statusPanel = new StatusPanel();

        JPanel topPanel = new JPanel(new BorderLayout());

        topPanel.add(heading, BorderLayout.NORTH);
        topPanel.add(statusPanel, BorderLayout.SOUTH);

        add(topPanel, BorderLayout.NORTH);

        JPanel center = new JPanel();

        center.setLayout(new GridLayout(2,2,15,15));

        lightPanel =
                new DevicePanel(
                        light,
                        commandManager);

        fanPanel =
                new DevicePanel(
                        fan,
                        commandManager);

        fryerPanel =
                new DevicePanel(
                        fryer,
                        commandManager);

        acPanel =
                new DevicePanel(
                        ac,
                        commandManager);

        center.add(lightPanel);
        center.add(fanPanel);
        center.add(fryerPanel);
        center.add(acPanel);

        add(center,BorderLayout.CENTER);

        JPanel right = new JPanel(new BorderLayout());

        powerPanel = new PowerPanel();
        voicePanel =
                new VoicePanel(
                        voiceRecognizer);
        logPanel = new LogPanel();

        right.add(powerPanel, BorderLayout.NORTH);
        right.add(logPanel, BorderLayout.CENTER);
        right.add(
                voicePanel,
                BorderLayout.SOUTH);

        add(right,BorderLayout.EAST);

        controlPanel = new ControlPanel();

        add(controlPanel,BorderLayout.SOUTH);

        controlPanel.getEmergencyButton().addActionListener(e->{

            deviceController.emergencyOff();
            lightPanel.refresh();
            fanPanel.refresh();
            fryerPanel.refresh();
            acPanel.refresh();

            addSystemLog("Emergency OFF Activated");

            powerPanel.updatePower(0);

        });

        controlPanel.getAutoModeButton().addActionListener(e->{

            autoController.setAutoMode(
                    !autoController.isAutoMode());

            if(autoController.isAutoMode()){

                statusPanel.updateMode("AUTO");

                addSystemLog("Auto Mode Enabled");

            }

            else{

                statusPanel.updateMode("MANUAL");

                addSystemLog("Manual Mode Enabled");

            }

        });

    }

    private void startSimulation(){

        Timer timer = new Timer(3000,e->{


            int temperature = currentTemperature;

            statusPanel.updateTemperature(temperature);
            String time =
                    LocalTime.now()
                            .format(
                                    DateTimeFormatter.ofPattern("HH:mm:ss"));

            statusPanel.updateTime(time);

            autoController.updateDevices(
                    temperature,
                    fan,
                    ac);
            lightPanel.refresh();
            fanPanel.refresh();
            fryerPanel.refresh();
            acPanel.refresh();

            int power = calculator.calculateCurrentPower(
                    deviceController.getAppliances());

            powerPanel.updatePower(power);
            double energy =
                    calculator.calculateEnergy(
                            deviceController.getAppliances());

            powerPanel.updateEnergy(energy);

            addSystemLog(
                    "Temperature : "
                            + temperature
                            + "°C | Power : "
                            + power
                            + " W");

        });

        timer.start();

    }
    private void handleArduinoMessage(
            String message) {

        if (message.startsWith("TEMP:")) {

            try {

                currentTemperature =
                        (int) Double.parseDouble(
                                message.substring(5)
                        );

                SwingUtilities.invokeLater(() -> {

                    statusPanel.updateTemperature(
                            currentTemperature
                    );

                });

            } catch (NumberFormatException e) {

                System.out.println(
                        "[DHT] Invalid temperature"
                );
            }
        }

        else if (message.startsWith("HUMIDITY:")) {

            try {

                currentHumidity =
                        (int) Double.parseDouble(
                                message.substring(9)
                        );

                System.out.println(
                        "[DHT] Humidity: "
                                + currentHumidity
                                + "%"
                );

            } catch (NumberFormatException e) {

                System.out.println(
                        "[DHT] Invalid humidity"
                );
            }
        }

        else if (message.equals("SENSOR_ERROR")) {

            SwingUtilities.invokeLater(() ->
                    addSystemLog(
                            "DHT11 Sensor Error"
                    )
            );
        }
    }
    private void addSystemLog(String message){

        logPanel.addLog(message);

    }

}