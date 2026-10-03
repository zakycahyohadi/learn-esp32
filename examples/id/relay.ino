const int RELAY_PIN = 26;

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);   // modul aktif LOW: HIGH = mati
  Serial.println("Ketik 1 = nyala, 0 = mati");
}

void loop() {
  if (Serial.available()) {
    char c = Serial.read();
    if (c == '1') {
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("Lampu NYALA");
    } else if (c == '0') {
      digitalWrite(RELAY_PIN, HIGH);
      Serial.println("Lampu MATI");
    }
  }
}
