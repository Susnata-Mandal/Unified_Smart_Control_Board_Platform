package voice;

import java.util.ArrayList;
import java.util.List;

public class VoiceCommandParser {

    public List<String> parse(String text) {

        List<String> commands =
                new ArrayList<>();

        if (text == null ||
                text.trim().isEmpty()) {

            return commands;
        }

        String command = text
                .toLowerCase()
                .trim();

        // Fix AC recognition
        command = command
                .replace("a c", "ac")
                .replace("air conditioner", "ac");

        // Check ALL devices first

        if (containsAny(
                command,
                "all devices",
                "all appliances",
                "everything",
                "all"
        )) {

            if (containsAny(
                    command,
                    "turn on",
                    "switch on",
                    "on all"
            )) {

                commands.add("ALL_ON");
                return commands;
            }

            if (containsAny(
                    command,
                    "turn off",
                    "switch off",
                    "off all"
            )) {

                commands.add("ALL_OFF");
                return commands;
            }
        }

        // Determine ON command

        boolean turnOn =
                containsAny(
                        command,
                        "turn on",
                        "switch on"
                );

        // Determine OFF command

        boolean turnOff =
                containsAny(
                        command,
                        "turn off",
                        "switch off"
                );

        // LIGHT

        if (containsAny(command, "light")) {

            if (turnOn) {

                commands.add("LIGHT_ON");

            } else if (turnOff) {

                commands.add("LIGHT_OFF");
            }
        }

        // FAN

        if (containsAny(command, "fan")) {

            if (turnOn) {

                commands.add("FAN_ON");

            } else if (turnOff) {

                commands.add("FAN_OFF");
            }
        }

        // AIR FRYER

        if (containsAny(
                command,
                "air fryer",
                "airfryer",
                "fryer"
        )) {

            if (turnOn) {

                commands.add("AIR_FRYER_ON");

            } else if (turnOff) {

                commands.add("AIR_FRYER_OFF");
            }
        }

        // AC

        if (containsAny(
                command,
                "ac"
        )) {

            if (turnOn) {

                commands.add("AC_ON");

            } else if (turnOff) {

                commands.add("AC_OFF");
            }
        }

        return commands;
    }

    private boolean containsAny(
            String text,
            String... words
    ) {

        for (String word : words) {

            if (text.contains(word)) {

                return true;
            }
        }

        return false;
    }
}