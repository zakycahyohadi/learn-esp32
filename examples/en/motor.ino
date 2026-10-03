const int IN1 = 27;
const int IN2 = 26;
const int ENA = 14;

void setup() {
  Serial.begin(115200);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  ledcAttach(ENA, 1000, 8);   // 1 kHz PWM, 0-255
}

void forward(int speed) {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  ledcWrite(ENA, speed);
}

void backward(int speed) {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  ledcWrite(ENA, speed);
}

void stopMotor() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  ledcWrite(ENA, 0);
}

void loop() {
  Serial.println("Forward");
  forward(200);
  delay(2000);

  Serial.println("Stop");
  stopMotor();
  delay(1000);

  Serial.println("Backward");
  backward(150);
  delay(2000);

  stopMotor();
  delay(1000);
}
