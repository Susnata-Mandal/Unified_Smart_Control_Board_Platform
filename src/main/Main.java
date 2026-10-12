package main;

import javax.swing.SwingUtilities;
import ui.Dashboard;
import ui.LoginFrame;

public class Main {

    public static void main(String[] args) {

        SwingUtilities.invokeLater(() -> {
            if (args.length > 0 && (args[0].equalsIgnoreCase("--dashboard") || args[0].equalsIgnoreCase("-d"))) {
                new Dashboard();
            } else {
                new LoginFrame();
            }
        });

    }

}