const int LIGHT_PIN = 2;
const int FAN_PIN = 3;
const int AIR_FRYER_PIN = 4;
const int AC_PIN = 5;

void setup() {

  pinMode(LIGHT_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(AIR_FRYER_PIN, OUTPUT);
  pinMode(AC_PIN, OUTPUT);

  digitalWrite(LIGHT_PIN, LOW);
  digitalWrite(FAN_PIN, LOW);
  digitalWrite(AIR_FRYER_PIN, LOW);
  digitalWrite(AC_PIN, LOW);

  Serial.begin(9600);

  Serial.println("READY");

}

void loop() {

  if (Serial.available() > 0) {

    String command = Serial.readStringUntil('\n');

    command.trim();

    if (command == "LIGHT_ON") {

      digitalWrite(LIGHT_PIN, HIGH);
      Serial.println("LIGHT_ON_OK");

    }

    else if (command == "LIGHT_OFF") {

      digitalWrite(LIGHT_PIN, LOW);
      Serial.println("LIGHT_OFF_OK");

    }

    else if (command == "FAN_ON") {

      digitalWrite(FAN_PIN, HIGH);
      Serial.println("FAN_ON_OK");

    }

    else if (command == "FAN_OFF") {

      digitalWrite(FAN_PIN, LOW);
      Serial.println("FAN_OFF_OK");

    }

    else if (command == "AIR_FRYER_ON") {

      digitalWrite(AIR_FRYER_PIN, HIGH);
      Serial.println("AIR_FRYER_ON_OK");

    }

    else if (command == "AIR_FRYER_OFF") {

      digitalWrite(AIR_FRYER_PIN, LOW);
      Serial.println("AIR_FRYER_OFF_OK");

    }

    else if (command == "AC_ON") {

      digitalWrite(AC_PIN, HIGH);
      Serial.println("AC_ON_OK");

    }

    else if (command == "AC_OFF") {

      digitalWrite(AC_PIN, LOW);
      Serial.println("AC_OFF_OK");

    }

    else if (command == "ALL_OFF") {

      digitalWrite(LIGHT_PIN, LOW);
      digitalWrite(FAN_PIN, LOW);
      digitalWrite(AIR_FRYER_PIN, LOW);
      digitalWrite(AC_PIN, LOW);

      Serial.println("ALL_OFF_OK");

    }

    else {

      Serial.println("UNKNOWN_COMMAND");

    }

  }

}
