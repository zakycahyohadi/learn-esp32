#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "NAMA_WIFI";
const char* password = "PASSWORD_WIFI";
const int LED_PIN = 23;

WebServer server(80);
bool ledOn = false;

String halaman() {
  String html = "<!DOCTYPE html><html><head>";
  html += "<meta name='viewport' content='width=device-width'>";
  html += "<style>body{font-family:sans-serif;text-align:center;margin-top:40px}";
  html += "a{display:inline-block;padding:16px 32px;margin:8px;border-radius:8px;";
  html += "color:#fff;text-decoration:none}.on{background:#2e7d32}.off{background:#c62828}";
  html += "</style></head><body><h2>Kontrol LED ESP32</h2>";
  html += "<p>Status: <b>" + String(ledOn ? "NYALA" : "MATI") + "</b></p>";
  html += "<a class='on' href='/on'>ON</a><a class='off' href='/off'>OFF</a>";
  html += "</body></html>";
  return html;
}

void handleRoot() { server.send(200, "text/html", halaman()); }
void handleOn()   { ledOn = true;  digitalWrite(LED_PIN, HIGH); handleRoot(); }
void handleOff()  { ledOn = false; digitalWrite(LED_PIN, LOW);  handleRoot(); }

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);

  WiFi.begin(ssid, password);
  Serial.print("Menghubungkan ke WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Buka di browser: http://");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/on", handleOn);
  server.on("/off", handleOff);
  server.begin();
}

void loop() {
  server.handleClient();
}
