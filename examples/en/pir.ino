const int PIR_PIN = 27;
const int LED_PIN = 23;

bool last = false;

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  bool motion = digitalRead(PIR_PIN) == HIGH;
  digitalWrite(LED_PIN, motion ? HIGH : LOW);

  if (motion != last) {
    Serial.println(motion ? "Motion detected!" : "Motion stopped");
    last = motion;
  }
  delay(100);
}
