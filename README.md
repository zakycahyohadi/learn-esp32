# ESP32 Lab 3D

**Learn the ESP32 in your browser — no board, no wiring kit, no install.**

👉 **Open it here: https://zakycahyohadi.github.io/learn-esp32/**

ESP32 Lab 3D is a free, interactive learning tool for anyone starting out with the ESP32 and Arduino. You can spin a 3D board to learn its pins, watch how WiFi, ADC and PWM work, follow step-by-step lessons, and build real circuits on a virtual breadboard that actually runs your Arduino code.

It's made for students, teachers, and hobbyists who want to understand *why* a circuit works before buying parts — or who want to practice without the risk of burning a component.

Available in **English** and **Bahasa Indonesia** (toggle ID/EN in the top-right corner, switches instantly).

---

## What you can learn

| Section | What it teaches |
|---|---|
| **3D Pinout** | An ESP32 DevKit V1 (30 pins) you can rotate. Click any pin to see its function, GPIO number, and whether it's safe to use. |
| **How it works** | 3D animations of WiFi (Station & Access Point), ADC (reading analog values), and PWM. |
| **11 Projects** | LED, button, PWM, DHT11, HC-SR04, PIR, web server, WiFi temperature monitor, relay, servo, and DC motor with L298N. Each comes with a parts list, wiring table, Arduino code, and an **Open in simulator** button. |
| **Learn from zero** | 9 guided lessons: electricity & breadboards → LED + resistor → blink → button → `analogRead` → PWM → DHT11 sensor → motors with L298N → a 2-wheel robot car. Every step is checked automatically, with hints and an answer button. Your progress is saved. |
| **Simulator** | A 400-point breadboard with 15 components. Place parts, draw wires, write code, and run it. |

## The simulator

The simulator is the heart of the lab. It isn't just a drawing — circuits are actually evaluated electrically:

- A wrong wire means the device won't work.
- An LED without a resistor can burn out.
- Includes a Serial Monitor, a hover multimeter, and a circuit checker to help you debug.
- 3D or 2D top-down view.
- 11 ready-made examples, including a remote-controlled 2-wheel robot car (on-screen buttons or W A S D).

Jump straight in: https://zakycahyohadi.github.io/learn-esp32/#simulator

**Supported code:** most beginner Arduino C++ — variables, functions, `if`/`for`/`while`/`switch`, arrays, `String`, `Serial`, `delay`, `millis`, `analogRead`, `ledcAttach`/`ledcWrite`, `pulseIn`, plus the `DHT` and `ESP32Servo` libraries.

**Not yet supported:** `class`/`struct`, advanced pointers, and other libraries. WiFi is simulated (it always "connects").

## Moving to real hardware

The example code targets the **esp32 by Espressif v3.x** board package in the Arduino IDE, so what you write in the lab can be uploaded to a real ESP32. The site includes a setup guide for the Arduino IDE.

## Run it locally

Everything lives in a single `index.html` file — no build step, no server needed. Just open it in a browser, or serve it:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

Notes:
- Uses [three.js](https://threejs.org) r128 from a CDN, so an internet connection is required.
- Your circuits and lesson progress are stored in your browser's `localStorage`.

## Contributing

Found a bug, a wrong pin description, or have an idea for a new lesson or project? Open an issue or pull request — contributions are welcome.

---

## 🇮🇩 Bahasa Indonesia

**ESP32 Lab 3D** adalah media belajar ESP32 gratis yang berjalan langsung di browser, tanpa perlu install apa pun dan tanpa perlu punya board.

👉 **Buka di sini: https://zakycahyohadi.github.io/learn-esp32/**

Di sini kamu bisa:

- **Mengenal pin ESP32** lewat board 3D yang bisa diputar dan diklik.
- **Melihat cara kerja** WiFi, ADC, dan PWM lewat animasi.
- **Mencoba 11 project**, dari LED sampai motor DC, lengkap dengan daftar alat, tabel kabel, dan kode Arduino.
- **Belajar dari nol** lewat 9 pelajaran bertahap yang dicek otomatis, sampai bisa membuat mobil robot 2 roda.
- **Merakit di simulator breadboard** yang benar-benar menjalankan kode Arduino. Kabel yang salah membuat alat tidak jalan, dan LED tanpa resistor bisa rusak, persis seperti aslinya.

Cocok untuk pelajar, guru, dan siapa saja yang ingin belajar elektronika dan pemrograman ESP32 sebelum membeli komponen. Kode contohnya bisa langsung dipakai di ESP32 asli (Arduino IDE, paket board **esp32 by Espressif versi 3.x**).

Tombol **ID/EN** di pojok kanan atas mengganti bahasa tanpa memuat ulang halaman.
