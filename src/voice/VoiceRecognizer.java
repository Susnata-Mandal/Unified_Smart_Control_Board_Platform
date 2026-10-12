package voice;

import controller.CommandManager;
import org.vosk.Model;
import org.vosk.Recognizer;

import javax.sound.sampled.*;
import java.io.IOException;

public class VoiceRecognizer {

    private final CommandManager commandManager;
    private final VoiceCommandParser parser;

    private boolean listening;
    private Thread voiceThread;

    private static final String PREFERRED_MICROPHONE =
            "Headset";

    public VoiceRecognizer(
            CommandManager commandManager) {

        this.commandManager = commandManager;
        this.parser = new VoiceCommandParser();
        this.listening = false;
    }

    public void startListening() {

        if (listening) {
            return;
        }

        listening = true;

        voiceThread = new Thread(() -> {

            try {

                startRecognition();

            } catch (Exception e) {

                System.out.println(
                        "[VOICE ERROR] "
                                + e.getMessage()
                );

                e.printStackTrace();

                listening = false;
            }

        });

        voiceThread.setDaemon(true);
        voiceThread.start();

        System.out.println(
                "[VOICE] Listening started..."
        );
    }

    private void startRecognition()
            throws IOException,
            LineUnavailableException {

        String modelPath =
                "vosk-model-small-en-us-0.15";

        Model model =
                new Model(modelPath);

        String grammar =
                "["
                        + "\"turn on light\","
                        + "\"turn off light\","

                        + "\"turn on fan\","
                        + "\"turn off fan\","

                        + "\"turn on ac\","
                        + "\"turn off ac\","
                        + "\"turn on a c\","
                        + "\"turn off a c\","

                        + "\"turn on air fryer\","
                        + "\"turn off air fryer\","

                        // TWO DEVICES
                        + "\"turn on light and fan\","
                        + "\"turn off light and fan\","
                        + "\"turn on fan and light\","
                        + "\"turn off fan and light\","

                        + "\"turn on light and ac\","
                        + "\"turn off light and ac\","
                        + "\"turn on fan and ac\","
                        + "\"turn off fan and ac\","

                        + "\"turn on light and air fryer\","
                        + "\"turn off light and air fryer\","

                        + "\"turn on fan and air fryer\","
                        + "\"turn off fan and air fryer\","

                        + "\"turn on ac and air fryer\","
                        + "\"turn off ac and air fryer\","

                        // THREE DEVICES
                        + "\"turn on light fan and ac\","
                        + "\"turn off light fan and ac\","

                        + "\"turn on light fan and air fryer\","
                        + "\"turn off light fan and air fryer\","

                        + "\"turn on light ac and air fryer\","
                        + "\"turn off light ac and air fryer\","

                        + "\"turn on fan ac and air fryer\","
                        + "\"turn off fan ac and air fryer\","

                        // ALL DEVICES
                        + "\"turn on everything\","
                        + "\"turn off everything\","
                        + "\"turn on all\","
                        + "\"turn off all\","
                        + "\"turn on all devices\","
                        + "\"turn off all devices\","
                        + "\"turn on all appliances\","
                        + "\"turn off all appliances\""
                        + "]";
        Recognizer recognizer =
                new Recognizer(
                        model,
                        16000,
                        grammar
                );

        AudioFormat format =
                new AudioFormat(
                        16000,
                        16,
                        1,
                        true,
                        false
                );

        TargetDataLine microphone =
                getPreferredMicrophone(format);

        microphone.open(format);
        microphone.start();

        byte[] buffer =
                new byte[4096];

        System.out.println(
                "[VOICE] Microphone ready"
        );

        while (listening) {

            int bytesRead =
                    microphone.read(
                            buffer,
                            0,
                            buffer.length
                    );

            if (bytesRead > 0) {

                if (recognizer.acceptWaveForm(
                        buffer,
                        bytesRead)) {

                    String result =
                            recognizer.getResult();

                    processVoskResult(result);
                }
            }
        }

        microphone.stop();
        microphone.close();

        recognizer.close();
        model.close();
    }

    private TargetDataLine getPreferredMicrophone(
            AudioFormat format)
            throws LineUnavailableException {

        DataLine.Info lineInfo =
                new DataLine.Info(
                        TargetDataLine.class,
                        format
                );

        Mixer.Info[] mixers =
                AudioSystem.getMixerInfo();

        System.out.println(
                "[VOICE] Available microphones:"
        );

        for (Mixer.Info mixerInfo : mixers) {

            System.out.println(
                    " - "
                            + mixerInfo.getName()
            );

            if (mixerInfo.getName()
                    .toLowerCase()
                    .contains(
                            PREFERRED_MICROPHONE
                                    .toLowerCase()
                    )) {

                Mixer mixer =
                        AudioSystem.getMixer(
                                mixerInfo
                        );

                if (mixer.isLineSupported(
                        lineInfo)) {

                    System.out.println(
                            "[VOICE] Using microphone: "
                                    + mixerInfo.getName()
                    );

                    return
                            (TargetDataLine)
                                    mixer.getLine(
                                            lineInfo
                                    );
                }
            }
        }

        System.out.println(
                "[VOICE] Preferred microphone not found."
        );

        System.out.println(
                "[VOICE] Using default microphone."
        );

        return (TargetDataLine)
                AudioSystem.getLine(
                        lineInfo
                );
    }

    private void processVoskResult(
            String voskResult) {

        String text =
                extractText(voskResult);

        if (text == null ||
                text.trim().isEmpty()) {

            return;
        }

        processRecognizedText(text);
    }

    private String extractText(
            String json) {

        String key =
                "\"text\"";

        int keyIndex =
                json.indexOf(key);

        if (keyIndex == -1) {
            return "";
        }

        int colonIndex =
                json.indexOf(
                        ":",
                        keyIndex
                );

        int firstQuote =
                json.indexOf(
                        "\"",
                        colonIndex + 1
                );

        int secondQuote =
                json.indexOf(
                        "\"",
                        firstQuote + 1
                );

        if (firstQuote == -1 ||
                secondQuote == -1) {

            return "";
        }

        return json.substring(
                firstQuote + 1,
                secondQuote
        );
    }

    public void stopListening() {

        listening = false;

        System.out.println(
                "[VOICE] Listening stopped."
        );
    }

    public boolean isListening() {

        return listening;
    }

    public boolean processRecognizedText(
            String text) {

        System.out.println(
                "[VOICE] Recognized: "
                        + text
        );

        java.util.List<String> commands =
                parser.parse(text);

        if (commands.isEmpty()) {

            System.out.println(
                    "[VOICE] Command not understood."
            );

            return false;
        }

        boolean executed = false;

        for (String command : commands) {

            System.out.println(
                    "[VOICE] Command: "
                            + command
            );

            boolean result =
                    commandManager.execute(
                            command
                    );

            if (result) {

                executed = true;
            }
        }

        return executed;
    }

    public void testVoiceCommand(
            String text) {

        processRecognizedText(text);
    }
}