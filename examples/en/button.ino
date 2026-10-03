const int BUTTON_PIN = 4;
const int LED_PIN = 23;

bool last = false;

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // released = HIGH, pressed = LOW
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  bool pressed = digitalRead(BUTTON_PIN) == LOW;
  digitalWrite(LED_PIN, pressed ? HIGH : LOW);

  if (pressed != last) {
    Serial.println(pressed ? "Button pressed" : "Button released");
    last = pressed;
  }
  delay(20);  // simple debounce
}
