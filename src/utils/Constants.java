package utils;

import java.awt.Color;
import java.awt.Font;

public final class Constants {

    private Constants() {
    }

    // Application

    public static final String APP_NAME = "Unified Smart Control Board";
    public static final String VERSION = "Version 1.0";

    // Login

    public static final String DEFAULT_USERNAME = "admin";
    public static final String DEFAULT_PASSWORD = "admin123";

    // Theme Colors

    public static final Color PRIMARY_COLOR = new Color(25, 42, 86);
    public static final Color SUCCESS_COLOR = new Color(46, 204, 113);
    public static final Color DANGER_COLOR = new Color(231, 76, 60);
    public static final Color BACKGROUND_COLOR = Color.WHITE;

    // Fonts

    public static final Font TITLE_FONT =
            new Font("Segoe UI", Font.BOLD, 26);

    public static final Font HEADER_FONT =
            new Font("Segoe UI", Font.BOLD, 18);

    public static final Font NORMAL_FONT =
            new Font("Segoe UI", Font.PLAIN, 15);

    // Window Size

    public static final int LOGIN_WIDTH = 500;
    public static final int LOGIN_HEIGHT = 400;

    public static final int DASHBOARD_WIDTH = 1200;
    public static final int DASHBOARD_HEIGHT = 750;

}