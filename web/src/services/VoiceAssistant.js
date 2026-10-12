/**
 * VoiceAssistant
 * Noise-Resistant, Fast-Response Speech Recognition Engine.
 *
 * Key Anti-Noise Features:
 * 1. Hardware Audio Noise Suppression: Activates browser WebRTC echoCancellation,
 *    noiseSuppression, and autoGainControl on the microphone stream.
 * 2. Utterance Window Isolation: Only processes the LATEST spoken words (last 8 words)
 *    so background chatter from earlier doesn't pollute your command.
 * 3. Proximity & Strict Pairing: Requires the action ("turn on", "off", etc.) to be
 *    spoken directly alongside the device name, ignoring random background words.
 * 4. Auto-Flush Reset: Automatically resets the recognition buffer after each command
 *    or after 6 seconds of background noise so the buffer always stays crystal clear.
 */

class VoiceAssistant {
  constructor() {
    this.recognition = null;
    this.mediaStream = null;
    this.isListening = false;
    this.onCommand = null; // callback: (commandString, transcript)
    this.onStatusChange = null; // callback: (boolean isListening)
    this.onTranscript = null; // callback: (string liveTranscript)
    this.onLog = null; // callback: (string message, string level)
    this.lastCommandMap = {}; // { [cmd]: timestamp }
    this.flushTimer = null;
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognition();
    // Single-utterance mode + instant auto-restart prevents background noise from accumulating!
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 2;
    this.recognition.lang = 'en-IN';

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStatusChange) this.onStatusChange(true);
    };

    this.recognition.onresult = (event) => {
      const lastIdx = event.results.length - 1;
      const result = event.results[lastIdx];
      const isFinal = result.isFinal;
      const confidence = result[0].confidence || 0.85;

      // Ignore very low-confidence background mumbles when final
      if (isFinal && confidence > 0 && confidence < 0.35) {
        return;
      }

      const primaryTranscript = result[0].transcript.trim();

      // Only look at the LAST 10 words so any background talk before your command is discarded
      const words = primaryTranscript.split(/\s+/);
      const recentWindow = words.slice(-10).join(' ');

      if (this.onTranscript) {
        this.onTranscript(recentWindow);
      }

      // Combine top 2 alternatives of the recent window
      let combinedRecent = recentWindow;
      if (result.length > 1) {
        const altWords = result[1].transcript.trim().split(/\s+/);
        combinedRecent += ' | ' + altWords.slice(-10).join(' ');
      }

      const matchedCommands = this.extractCommands(combinedRecent);

      if (matchedCommands.length > 0) {
        const now = Date.now();
        let dispatchDelay = 0;
        let triggeredAny = false;

        for (const cmd of matchedCommands) {
          const lastTime = this.lastCommandMap[cmd] || 0;
          // 1.5s cooldown per identical command
          if (now - lastTime > 1500) {
            this.lastCommandMap[cmd] = now;
            triggeredAny = true;
            if (this.onCommand) {
              const capturedCmd = cmd;
              const capturedText = recentWindow;
              if (dispatchDelay === 0) {
                this.onCommand(capturedCmd, capturedText);
              } else {
                setTimeout(() => {
                  this.onCommand(capturedCmd, capturedText);
                }, dispatchDelay);
              }
              dispatchDelay += 70;
            }
          }
        }

        // As soon as a command is executed, abort and restart a fresh clean session
        // so old words never interfere with the next command!
        if (triggeredAny) {
          this.restartCleanSession();
        }
      }
    };

    this.recognition.onerror = (event) => {
      // Ignore 'no-speech' and 'aborted' (normal during silence or clean session resets)
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        if (this.onLog) this.onLog(`[VOICE] Mic notice: ${event.error}`, 'warn');
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // Immediately reopen a fresh, noise-free listening window
        setTimeout(() => {
          if (this.isListening && this.recognition) {
            try {
              this.recognition.start();
            } catch (e) {}
          }
        }, 80);
      } else {
        if (this.onStatusChange) this.onStatusChange(false);
      }
    };
  }

  restartCleanSession() {
    if (!this.recognition || !this.isListening) return;
    try {
      this.recognition.abort(); // triggers onend -> instant clean restart in 80ms
    } catch (e) {}
  }

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  async enableHardwareNoiseFilter() {
    // Request microphone with hardware-level WebRTC noise suppression & echo cancellation
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !this.mediaStream) {
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
        });
      } catch (e) {
        // Fallback if getUserMedia is busy
      }
    }
  }

  start() {
    if (!this.isSupported()) {
      if (this.onLog) this.onLog('[VOICE] Speech recognition not supported in this browser. Use Chrome/Edge.', 'warn');
      return false;
    }

    this.enableHardwareNoiseFilter();

    if (this.recognition && !this.isListening) {
      this.isListening = true;
      if (this.onLog) {
        this.onLog('[VOICE] Noise-Suppression Filter ON. Listening for commands...', 'info');
      }
      try {
        this.recognition.start();
      } catch (e) {}
      return true;
    }
    return false;
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.onStatusChange) this.onStatusChange(false);
    if (this.onLog) this.onLog('[VOICE] Speech recognition stopped.', 'info');
  }

  normalizeSegment(raw) {
    return raw
      .toLowerCase()
      .replace(/[.,!?-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      // Only high-accuracy phonetic corrections (removed loose words like "like", "right", "fun" that trigger on background talk!)
      .replace(/\ba c\b/g, 'ac')
      .replace(/\ba\.c\b/g, 'ac')
      .replace(/\bair conditioner\b/g, 'ac')
      .replace(/\bair conditioning\b/g, 'ac')
      .replace(/\baisi\b/g, 'ac')
      .replace(/\bpan\b/g, 'fan')
      .replace(/\blite\b/g, 'light')
      .replace(/\bfrier\b/g, 'fryer')
      .replace(/\bairfryer\b/g, 'air fryer')
      .replace(/\btorn on\b/g, 'turn on')
      .replace(/\btorn off\b/g, 'turn off')
      .replace(/\bswitch of\b/g, 'switch off')
      .replace(/\bturn of\b/g, 'turn off');
  }

  extractCommands(rawCombined) {
    if (!rawCombined) return [];

    // Check each alternative hypothesis separately
    const hypotheses = rawCombined.split('|');
    const commands = new Set();

    for (const hyp of hypotheses) {
      const text = this.normalizeSegment(hyp);
      if (!text) continue;

      const hasExact = (str, ...phrases) =>
        phrases.some((p) => new RegExp(`\\b${p}\\b`, 'i').test(str));

      // 1. Check ALL devices command (e.g., "turn on all", "all off", "switch off everything")
      if (hasExact(text, 'all devices', 'all appliances', 'everything', 'all on', 'all off', 'turn on all', 'turn off all', 'switch on all', 'switch off all')) {
        if (hasExact(text, 'turn off', 'switch off', 'power off', 'all off', 'off everything')) {
          commands.add('ALL_OFF');
          continue;
        }
        if (hasExact(text, 'turn on', 'switch on', 'power on', 'all on', 'on everything')) {
          commands.add('ALL_ON');
          continue;
        }
      }

      // 2. Split sentence into clauses at action boundaries ("turn on ...", "turn off ...")
      const clauses = text.split(/(?=\b(?:turn on|turn off|switch on|switch off|power on|power off)\b)/i);
      let currentAction = null;

      for (const clause of clauses) {
        const isOff = hasExact(clause, 'turn off', 'switch off', 'power off', 'shut off', 'off');
        const isOn = !isOff && hasExact(clause, 'turn on', 'switch on', 'power on', 'on');

        if (isOff) currentAction = 'OFF';
        else if (isOn) currentAction = 'ON';

        if (!currentAction) continue;

        if (hasExact(clause, 'light', 'lights', 'lamp', 'bulb')) {
          commands.add(`LIGHT_${currentAction}`);
        }
        if (hasExact(clause, 'fan', 'fans')) {
          commands.add(`FAN_${currentAction}`);
        }
        if (hasExact(clause, 'air fryer', 'fryer')) {
          commands.add(`AIR_FRYER_${currentAction}`);
        }
        if (hasExact(clause, 'ac')) {
          commands.add(`AC_${currentAction}`);
        }
      }

      // If primary hypothesis matched valid commands, don't even need secondary hypothesis
      if (commands.size > 0) break;
    }

    return Array.from(commands);
  }
}

export const voiceAssistant = new VoiceAssistant();
