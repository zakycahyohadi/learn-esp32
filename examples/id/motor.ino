const int IN1 = 27;
const int IN2 = 26;
const int ENA = 14;

void setup() {
  Serial.begin(115200);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  ledcAttach(ENA, 1000, 8);   // PWM 1 kHz, 0-255
}

void maju(int kecepatan) {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  ledcWrite(ENA, kecepatan);
}

void mundur(int kecepatan) {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  ledcWrite(ENA, kecepatan);
}

void berhenti() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  ledcWrite(ENA, 0);
}

void loop() {
  Serial.println("Maju");
  maju(200);
  delay(2000);

  Serial.println("Berhenti");
  berhenti();
  delay(1000);

  Serial.println("Mundur");
  mundur(150);
  delay(2000);

  berhenti();
  delay(1000);
}
