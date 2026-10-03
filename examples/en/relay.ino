const int RELAY_PIN = 26;

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);   // active-LOW module: HIGH = off
  Serial.println("Type 1 = on, 0 = off");
}

void loop() {
  if (Serial.available()) {
    char c = Serial.read();
    if (c == '1') {
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("Lamp ON");
    } else if (c == '0') {
      digitalWrite(RELAY_PIN, HIGH);
      Serial.println("Lamp OFF");
    }
  }
}
