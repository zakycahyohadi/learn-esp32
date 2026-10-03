#include <ESP32Servo.h>

Servo servo;
const int SERVO_PIN = 13;

void setup() {
  servo.attach(SERVO_PIN, 500, 2400);  // min/max pulse width (microseconds)
}

void loop() {
  for (int angle = 0; angle <= 180; angle += 2) {
    servo.write(angle);
    delay(15);
  }
  for (int angle = 180; angle >= 0; angle -= 2) {
    servo.write(angle);
    delay(15);
  }
}
