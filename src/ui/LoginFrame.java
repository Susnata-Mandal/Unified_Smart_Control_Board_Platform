package ui;

import utils.Constants;

import javax.swing.*;
import java.awt.*;

public class LoginFrame extends JFrame {

    private JTextField usernameField;
    private JPasswordField passwordField;
    private JButton loginButton;

    public LoginFrame() {

        setTitle(Constants.APP_NAME + " - Login");
        setSize(Constants.LOGIN_WIDTH, Constants.LOGIN_HEIGHT);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(false);

        initializeUI();

        setVisible(true);

    }

    private void initializeUI() {

        JPanel panel = new JPanel();
        panel.setLayout(null);
        panel.setBackground(Constants.BACKGROUND_COLOR);

        JLabel title = new JLabel(Constants.APP_NAME);
        title.setFont(Constants.TITLE_FONT);
        title.setBounds(50, 25, 400, 40);

        JLabel welcome = new JLabel("Welcome");
        welcome.setFont(Constants.HEADER_FONT);
        welcome.setBounds(190, 70, 120, 30);

        JLabel usernameLabel = new JLabel("Username");
        usernameLabel.setBounds(70, 130, 100, 25);
        usernameLabel.setFont(Constants.NORMAL_FONT);

        usernameField = new JTextField();
        usernameField.setBounds(180,130,220,30);

        JLabel passwordLabel = new JLabel("Password");
        passwordLabel.setBounds(70,180,100,25);
        passwordLabel.setFont(Constants.NORMAL_FONT);

        passwordField = new JPasswordField();
        passwordField.setBounds(180,180,220,30);

        loginButton = new JButton("LOGIN");
        loginButton.setBounds(170,250,140,40);

        JLabel version = new JLabel(Constants.VERSION);
        version.setBounds(195,320,120,20);

        panel.add(title);
        panel.add(welcome);
        panel.add(usernameLabel);
        panel.add(usernameField);
        panel.add(passwordLabel);
        panel.add(passwordField);
        panel.add(loginButton);
        panel.add(version);

        add(panel);

        loginButton.addActionListener(e -> login());

    }

    private void login() {

        String username = usernameField.getText().trim();
        String password = String.valueOf(passwordField.getPassword());

        if(username.equals(Constants.DEFAULT_USERNAME)
                && password.equals(Constants.DEFAULT_PASSWORD)){

            dispose();

            new Dashboard();

        }

        else{

            JOptionPane.showMessageDialog(
                    this,
                    "Invalid Username or Password",
                    "Login Failed",
                    JOptionPane.ERROR_MESSAGE
            );

            passwordField.setText("");

        }

    }

}