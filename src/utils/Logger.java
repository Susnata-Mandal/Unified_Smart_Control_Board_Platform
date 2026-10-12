package utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class Logger {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("HH:mm:ss");

    private Logger() {
    }

    public static String log(String message) {

        return "[" +
                LocalDateTime.now().format(FORMATTER) +
                "] " +
                message;

    }

}