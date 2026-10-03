# ESP32 Lab 3D

Media belajar ESP32 interaktif yang berjalan langsung di browser, tanpa perlu install apa pun.

**Buka website:** https://zakycahyohadi.github.io/learn-esp32/ (tombol ID/EN di pojok kanan atas mengganti bahasa seketika, tanpa memuat ulang)

## Isi

- **Pinout 3D.** Board ESP32 DevKit V1 (30 pin) bisa diputar. Klik tiap pin untuk melihat fungsi, nomor GPIO, dan tingkat keamanannya.
- **Cara kerja.** Animasi 3D untuk WiFi (mode Station dan Access Point), ADC (membaca analog), dan PWM.
- **11 project.** LED, tombol, PWM, DHT11, HC-SR04, PIR, web server, monitor suhu via WiFi, relay, servo, dan motor DC dengan L298N. Tiap project berisi daftar alat, tabel sambungan kabel, dan kode Arduino, plus tombol **Buka di simulator** yang langsung memuat rangkaiannya beserta kode project itu (kecuali dua project WiFi).
- **Mode belajar dari nol** (tab *Belajar* di simulator). 9 pelajaran bertahap: listrik ke breadboard, LED + resistor, blink, tombol, analogRead, PWM, sensor DHT11, motor lewat L298N, dan mobil robot 2 roda. Tiap langkah dicek otomatis dari rangkaian dan kode, ada petunjuk, titik awal, dan tombol lihat jawaban. Progres tersimpan di browser.
- **Simulator lengkap** (menu *Simulator*, atau langsung `…/learn-esp32/#simulator`). Pasang komponen di breadboard 400 titik, tarik kabel dari titik ke titik, lalu tulis dan jalankan kode Arduino untuk ESP32. Rangkaian dihitung secara listrik, jadi kabel yang salah membuat alat tidak jalan dan LED tanpa resistor bisa rusak. Kabel bisa dipasang dengan klik-klik atau ditarik, ujungnya bisa digeser ke titik lain, dan ada "magnet" yang menempelkan kabel ke lubang/pin terdekat. Komponen berkaki hanya bisa ditancapkan di lubang breadboard yang kosong, dan modul tidak bisa menumpuk. Yang dipilih bisa dihapus dengan tombol Delete atau tombol Hapus di layar. Tampilan bisa 3D atau 2D dari atas. Ada 15 komponen (termasuk motor DC kuning dengan roda, driver L298N, modul relay, dan lampu DC), 11 contoh siap pakai termasuk mobil robot 2 roda dengan remote (tombol di layar atau W A S D) dan peta jalan, Serial Monitor, multimeter lewat kursor, dan pemeriksa rangkaian.

## Teknis

- Semuanya dalam satu file: `index.html`, berisi materi, simulator, dan dua bahasa (Indonesia & English). Ganti bahasa tidak memuat ulang halaman, jadi rakitan dan program yang sedang jalan tetap aman. Tanpa build step dan tanpa server.
- 3D baru dibuat saat bagiannya hampir terlihat, dan resolusi render otomatis turun di perangkat yang lambat.
- Memakai [three.js](https://threejs.org) r128 dari CDN, jadi butuh koneksi internet.
- Rakitan dan progres belajar tersimpan di `localStorage` browser masing-masing pengunjung.
- Kode contoh ditulis untuk paket board **esp32 by Espressif versi 3.x** di Arduino IDE.

## Menjalankan di komputer sendiri

Buka `index.html` langsung di browser, atau jalankan server lokal:

```bash
python3 -m http.server 8000
```

Setelah itu buka http://localhost:8000.

## Batasan simulator

- Mendukung sebagian besar sintaks Arduino C++ untuk pemula: variabel, fungsi, `if`/`for`/`while`/`switch`, array, `String`, `Serial`, `delay`, `millis`, `analogRead`, `ledcAttach`/`ledcWrite`, `pulseIn`, library `DHT` dan `ESP32Servo`.
- Belum mendukung `class`/`struct`, pointer lanjutan, dan library lain. WiFi hanya disimulasikan pura-pura berhasil.
