#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(2000);  // DHT11 hanya boleh dibaca tiap 1-2 detik

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Gagal membaca DHT11!");
    return;
  }
  Serial.printf("Suhu: %.1f C  Kelembapan: %.0f %%\n", t, h);
}
