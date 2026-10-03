#include <ESP32Servo.h>

Servo servo;
const int SERVO_PIN = 13;

void setup() {
  servo.attach(SERVO_PIN, 500, 2400);  // lebar pulsa min/max (mikrodetik)
}

void loop() {
  for (int sudut = 0; sudut <= 180; sudut += 2) {
    servo.write(sudut);
    delay(15);
  }
  for (int sudut = 180; sudut >= 0; sudut -= 2) {
    servo.write(sudut);
    delay(15);
  }
}
