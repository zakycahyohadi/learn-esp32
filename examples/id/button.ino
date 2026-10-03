const int BUTTON_PIN = 4;
const int LED_PIN = 23;

bool terakhir = false;

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // dilepas = HIGH, ditekan = LOW
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  bool ditekan = digitalRead(BUTTON_PIN) == LOW;
  digitalWrite(LED_PIN, ditekan ? HIGH : LOW);

  if (ditekan != terakhir) {
    Serial.println(ditekan ? "Tombol ditekan" : "Tombol dilepas");
    terakhir = ditekan;
  }
  delay(20);  // debounce sederhana
}
