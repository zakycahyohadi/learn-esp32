#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>

const char* ssid = "NAMA_WIFI";
const char* password = "PASSWORD_WIFI";

DHT dht(4, DHT11);
WebServer server(80);

void handleRoot() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  String html = "<!DOCTYPE html><html><head>";
  html += "<meta name='viewport' content='width=device-width'>";
  html += "<meta http-equiv='refresh' content='5'>";   // muat ulang tiap 5 detik
  html += "<style>body{font-family:sans-serif;text-align:center;margin-top:40px}";
  html += ".v{font-size:48px;font-weight:bold}</style></head><body>";
  html += "<h2>Monitor Ruangan</h2>";
  html += "<p>Suhu</p><div class='v'>" + String(t, 1) + " &deg;C</div>";
  html += "<p>Kelembapan</p><div class='v'>" + String(h, 0) + " %</div>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void handleData() {
  String json = "{\"suhu\":" + String(dht.readTemperature(), 1) +
                ",\"kelembapan\":" + String(dht.readHumidity(), 0) + "}";
  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);

  Serial.print("Dashboard: http://");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/data", handleData);
  server.begin();
}

void loop() {
  server.handleClient();
}
