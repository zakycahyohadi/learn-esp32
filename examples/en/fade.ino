const int LED_PIN = 18;
const int FREQ = 5000;       // 5 kHz
const int RESOLUTION = 8;    // 8-bit: 0-255

void setup() {
  ledcAttach(LED_PIN, FREQ, RESOLUTION);
}

void loop() {
  for (int duty = 0; duty <= 255; duty++) {
    ledcWrite(LED_PIN, duty);
    delay(8);
  }
  for (int duty = 255; duty >= 0; duty--) {
    ledcWrite(LED_PIN, duty);
    delay(8);
  }
}
