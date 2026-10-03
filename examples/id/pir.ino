const int PIR_PIN = 27;
const int LED_PIN = 23;

bool terakhir = false;

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  bool gerak = digitalRead(PIR_PIN) == HIGH;
  digitalWrite(LED_PIN, gerak ? HIGH : LOW);

  if (gerak != terakhir) {
    Serial.println(gerak ? "Gerakan terdeteksi!" : "Gerakan berhenti");
    terakhir = gerak;
  }
  delay(100);
}
