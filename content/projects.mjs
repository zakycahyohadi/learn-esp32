// Teks tambahan untuk halaman panduan tiap project (/project/<slug>/ dan /en/project/<slug>/).
// Data dasar (judul pendek, alat, kabel, catatan, slug) diambil dari PROJECTS di js/main.js,
// kode dari examples/<bahasa>/<id>.ino. File ini hanya berisi teks yang belum ada di sana.
// Teks boleh memakai HTML sederhana (<code>, <b>, <a>).
// pitfall: id bagian di artikel jebakan ESP32 yang paling relevan.

export const PROJECT_TEXT = {
  blink: {
    related: ['button', 'fade', 'pir'], pitfall: 'upload-failed',
    id: {
      title: 'LED Berkedip ESP32: Rangkaian & Kode Blink Pemula',
      h1: 'Membuat LED Berkedip dengan ESP32',
      desc: 'Program pertama ESP32: LED berkedip tiap 1 detik di GPIO 23. Lengkap dengan daftar alat, sambungan kabel, kode Arduino, dan solusi kalau LED tidak menyala.',
      intro: 'Blink adalah "Hello World"-nya mikrokontroler. Kamu menyambung satu LED ke pin D23, lalu menulis program yang menyalakan dan mematikannya setiap detik. Kalau ini berhasil, berarti Arduino IDE, kabel USB, dan board ESP32 kamu sudah siap untuk project berikutnya.',
      how: [
        '<code>pinMode(LED_PIN, OUTPUT)</code> menjadikan pin 23 sebagai output. Setelah itu <code>digitalWrite(LED_PIN, HIGH)</code> memberi tegangan 3.3 V ke pin, dan arus mengalir lewat resistor ke LED sehingga LED menyala. <code>LOW</code> membuat pin 0 V dan LED padam.',
        'Resistor 220 Ω membatasi arus. Dengan LED merah (tegangan maju sekitar 2 V), arusnya kira-kira (3.3 − 2.0) / 220 ≈ 6 mA, aman untuk LED dan untuk pin ESP32. <code>delay(1000)</code> menahan program 1 detik, lalu <code>loop()</code> diulang terus selama board menyala.',
      ],
      problems: [
        ['LED sama sekali tidak menyala', 'Cek arah LED: kaki panjang (anoda) harus ke arah resistor dan D23, kaki pendek (katoda) ke GND. Pastikan juga resistor dan kaki LED ada di baris breadboard yang sama, dan nomor pin di kode (23) sama dengan pin yang disambung (D23).'],
        ['Upload berhenti di "Connecting......"', 'Tahan tombol <b>BOOT</b> di board saat tulisan Connecting muncul, lepas setelah persentase upload berjalan. Pastikan kabel USB-nya kabel data, bukan kabel charge saja.'],
        ['Serial Monitor menampilkan huruf acak', 'Kecepatan Serial Monitor harus sama dengan <code>Serial.begin(115200)</code>. Pilih 115200 baud di pojok kanan bawah Serial Monitor.'],
        ['LED biru kecil di board ikut berkedip atau tidak', 'LED biru bawaan board tersambung ke GPIO 2, bukan GPIO 23. Kalau ingin memakainya, ganti <code>LED_PIN</code> menjadi 2.'],
      ],
    },
    en: {
      title: 'ESP32 Blink LED: Circuit and Code for Beginners',
      h1: 'Blink an LED with the ESP32',
      desc: 'Your first ESP32 program: blink an LED every second on GPIO 23. Includes a parts list, wiring, Arduino code and fixes for when the LED stays dark.',
      intro: 'Blink is the "Hello World" of microcontrollers. You wire one LED to pin D23 and write a program that switches it on and off every second. Once this works, your Arduino IDE, USB cable and ESP32 board are ready for the next project.',
      how: [
        '<code>pinMode(LED_PIN, OUTPUT)</code> makes pin 23 an output. Then <code>digitalWrite(LED_PIN, HIGH)</code> puts 3.3 V on the pin, current flows through the resistor into the LED, and it lights up. <code>LOW</code> sets the pin to 0 V and the LED turns off.',
        'The 220 Ω resistor limits the current. With a red LED (about 2 V forward voltage) it is roughly (3.3 − 2.0) / 220 ≈ 6 mA, safe for both the LED and the ESP32 pin. <code>delay(1000)</code> pauses for one second, and <code>loop()</code> repeats for as long as the board has power.',
      ],
      problems: [
        ['The LED never lights up', 'Check the LED direction: the long leg (anode) goes towards the resistor and D23, the short leg (cathode) to GND. Also make sure the resistor and the LED leg share the same breadboard row, and that the pin number in the code (23) matches the wired pin (D23).'],
        ['Upload stops at "Connecting......"', 'Hold the <b>BOOT</b> button on the board when Connecting appears and release it once the upload percentage starts. Make sure your USB cable carries data and is not a charge-only cable.'],
        ['The Serial Monitor shows garbage characters', 'The Serial Monitor speed must match <code>Serial.begin(115200)</code>. Select 115200 baud in the bottom-right corner of the Serial Monitor.'],
        ['The small blue LED on the board does not blink', 'The built-in blue LED is wired to GPIO 2, not GPIO 23. To use it, change <code>LED_PIN</code> to 2.'],
      ],
    },
  },

  button: {
    related: ['blink', 'pir', 'relay'], pitfall: 'gpio-34-39',
    id: {
      title: 'Tombol dan LED ESP32: INPUT_PULLUP & digitalRead',
      h1: 'Membaca Tombol dengan ESP32 untuk Menyalakan LED',
      desc: 'Baca push button di ESP32 dengan INPUT_PULLUP tanpa resistor tambahan. LED menyala saat tombol ditekan. Ada rangkaian, kode, dan solusi tombol yang tidak terbaca.',
      intro: 'Di project ini ESP32 mulai menerima masukan. Sebuah push button di pin D4 dibaca terus-menerus, dan LED di D23 menyala selama tombol ditekan. Ini dasar untuk semua project yang punya tombol, saklar, atau sensor digital.',
      how: [
        '<code>INPUT_PULLUP</code> menyalakan resistor pull-up di dalam chip yang menarik pin ke 3.3 V. Saat tombol dilepas, pin terbaca <code>HIGH</code>. Saat ditekan, tombol menyambungkan pin ke GND sehingga terbaca <code>LOW</code>. Karena itu kode memakai <code>digitalRead(BUTTON_PIN) == LOW</code> untuk arti "ditekan".',
        'Saat ditekan, kontak logam tombol sempat memantul beberapa milidetik (bouncing) sehingga terbaca berganti-ganti. <code>delay(20)</code> di akhir loop adalah debounce sederhana supaya pesan di Serial Monitor tidak muncul berkali-kali.',
      ],
      problems: [
        ['LED selalu menyala atau selalu mati', 'Push button 4 kaki punya dua pasang kaki yang sudah tersambung di dalam. Pakai dua kaki yang <b>diagonal</b>, dan pasang tombol melintang di atas parit tengah breadboard.'],
        ['Hasil bacaan acak padahal tombol tidak disentuh', 'Pin dibiarkan mengambang. Pastikan <code>pinMode(BUTTON_PIN, INPUT_PULLUP)</code> sudah ditulis. Jangan memakai GPIO 34–39 untuk tombol, karena pin itu tidak punya pull-up internal.'],
        ['Logika terasa terbalik', 'Dengan pull-up, ditekan = LOW dan dilepas = HIGH. Itu normal. Kalau ingin kebalikannya, sambungkan tombol ke 3.3 V dan pakai resistor pull-down 10 kΩ ke GND.'],
      ],
    },
    en: {
      title: 'ESP32 Button and LED: INPUT_PULLUP and digitalRead',
      h1: 'Read a Button with the ESP32 to Light an LED',
      desc: 'Read a push button on the ESP32 with INPUT_PULLUP and no extra resistor. The LED lights while the button is held. Wiring, code and fixes for unreliable readings.',
      intro: 'In this project the ESP32 starts taking input. A push button on D4 is read continuously, and the LED on D23 stays on while the button is pressed. This is the basis for every project with buttons, switches or digital sensors.',
      how: [
        '<code>INPUT_PULLUP</code> turns on a pull-up resistor inside the chip that pulls the pin to 3.3 V. When the button is released the pin reads <code>HIGH</code>. When pressed, the button connects the pin to GND so it reads <code>LOW</code>. That is why the code uses <code>digitalRead(BUTTON_PIN) == LOW</code> to mean "pressed".',
        'When pressed, the metal contacts bounce for a few milliseconds, so the reading flips back and forth. The <code>delay(20)</code> at the end of the loop is a simple debounce that stops the Serial Monitor message from repeating.',
      ],
      problems: [
        ['The LED is always on or always off', 'A 4-leg push button has two pairs of legs that are already joined inside. Use two <b>diagonal</b> legs, and place the button across the centre gap of the breadboard.'],
        ['Random readings while nobody touches the button', 'The pin is floating. Make sure <code>pinMode(BUTTON_PIN, INPUT_PULLUP)</code> is in the code. Do not use GPIO 34–39 for buttons, because those pins have no internal pull-up.'],
        ['The logic feels upside down', 'With a pull-up, pressed = LOW and released = HIGH. That is normal. If you want the opposite, wire the button to 3.3 V and add a 10 kΩ pull-down resistor to GND.'],
      ],
    },
  },

  fade: {
    related: ['blink', 'motor', 'servo'], pitfall: null,
    id: {
      title: 'PWM ESP32: LED Redup-Terang dengan ledcWrite',
      h1: 'PWM ESP32: Membuat LED Redup-Terang',
      desc: 'Cara pakai PWM di ESP32 dengan ledcAttach dan ledcWrite (paket board 3.x) supaya LED menyala perlahan lalu meredup. Ada kode dan solusi error ledcSetup.',
      intro: 'ESP32 tidak punya output analog sungguhan di sebagian besar pin, tapi bisa meniru tegangan setengah dengan PWM: pin dinyalakan dan dimatikan ribuan kali per detik. Di project ini LED di D18 menyala perlahan lalu meredup seperti napas.',
      how: [
        'PWM (Pulse Width Modulation) mengatur berapa lama pin menyala dalam setiap siklus. Nilai <i>duty</i> 0 berarti selalu mati, 255 selalu menyala, dan 128 menyala setengah waktu. Karena berkedipnya 5000 kali per detik, mata kita melihatnya sebagai LED yang lebih redup.',
        '<code>ledcAttach(LED_PIN, 5000, 8)</code> menyiapkan PWM 5 kHz dengan resolusi 8-bit (nilai 0–255) di pin 18. <code>ledcWrite(LED_PIN, duty)</code> mengubah terangnya. Dua perulangan <code>for</code> menaikkan lalu menurunkan nilai duty secara bertahap.',
      ],
      problems: [
        ['Error: \'ledcSetup\' was not declared in this scope', 'Kode lama untuk paket board ESP32 versi 2.x memakai <code>ledcSetup</code> dan <code>ledcAttachPin</code>. Di versi 3.x keduanya diganti <code>ledcAttach(pin, frekuensi, resolusi)</code>, dan <code>ledcWrite</code> memakai nomor pin, bukan nomor channel.'],
        ['LED langsung terang lalu mati, tidak halus', 'Cek nilai maksimum duty. Dengan resolusi 8-bit, nilainya 0–255. Kalau resolusi diganti 10-bit, nilai maksimumnya menjadi 1023 dan perulangan harus ikut disesuaikan.'],
        ['analogWrite tidak bekerja seperti di Arduino Uno', 'Di paket board 3.x, <code>analogWrite</code> sudah ada dan memakai LEDC di belakang layar. Untuk mengatur frekuensi dan resolusi sendiri, tetap lebih jelas memakai <code>ledcAttach</code> dan <code>ledcWrite</code>.'],
      ],
    },
    en: {
      title: 'ESP32 PWM: Fade an LED with ledcAttach & ledcWrite',
      h1: 'ESP32 PWM: Fading an LED',
      desc: 'How to use PWM on the ESP32 with ledcAttach and ledcWrite (board package 3.x) to fade an LED in and out. Code, wiring and the fix for the ledcSetup error.',
      intro: 'Most ESP32 pins have no true analog output, but PWM can fake an in-between voltage by switching the pin on and off thousands of times per second. In this project the LED on D18 slowly brightens and dims, like breathing.',
      how: [
        'PWM (Pulse Width Modulation) controls how long the pin stays on in each cycle. A <i>duty</i> of 0 means always off, 255 always on, and 128 on half the time. Because it switches 5000 times per second, your eye sees a dimmer LED.',
        '<code>ledcAttach(LED_PIN, 5000, 8)</code> sets up 5 kHz PWM with 8-bit resolution (values 0–255) on pin 18. <code>ledcWrite(LED_PIN, duty)</code> changes the brightness. Two <code>for</code> loops raise and then lower the duty step by step.',
      ],
      problems: [
        ['Error: \'ledcSetup\' was not declared in this scope', 'Older code for ESP32 board package 2.x uses <code>ledcSetup</code> and <code>ledcAttachPin</code>. In 3.x both are replaced by <code>ledcAttach(pin, frequency, resolution)</code>, and <code>ledcWrite</code> takes the pin number, not a channel number.'],
        ['The LED jumps to full brightness instead of fading', 'Check the maximum duty. With 8-bit resolution the range is 0–255. If you switch to 10-bit, the maximum becomes 1023 and the loops must change too.'],
        ['analogWrite does not behave like on an Arduino Uno', 'Board package 3.x does provide <code>analogWrite</code>, using LEDC behind the scenes. To choose the frequency and resolution yourself, <code>ledcAttach</code> and <code>ledcWrite</code> are clearer.'],
      ],
    },
  },

  dht: {
    related: ['dhtweb', 'sonar', 'pir'], pitfall: null,
    id: {
      title: 'Cara Pakai DHT11 dengan ESP32: Rangkaian & Kode',
      h1: 'Cara Pakai Sensor DHT11 dengan ESP32',
      desc: 'Baca suhu dan kelembapan dari DHT11 dengan ESP32: library yang dibutuhkan, sambungan kabel, kode Arduino, dan solusi kalau hasilnya NaN atau "Gagal membaca DHT11".',
      intro: 'DHT11 adalah sensor suhu dan kelembapan murah yang paling sering dipakai pemula. Di project ini ESP32 membaca DHT11 di pin D4 setiap 2 detik dan menampilkan hasilnya di Serial Monitor. Project ini juga dasar untuk monitor suhu lewat WiFi.',
      how: [
        'DHT11 mengirim data lewat satu kabel (DATA) dengan protokol digitalnya sendiri, jadi kita tidak membaca tegangan analog. Library <b>DHT sensor library</b> dari Adafruit yang mengurus urutan sinyalnya, kita cukup memanggil <code>dht.readTemperature()</code> dan <code>dht.readHumidity()</code>.',
        'DHT11 hanya bisa diukur sekitar sekali per detik, karena itu ada <code>delay(2000)</code>. Rentangnya 0–50 °C dengan ketelitian sekitar ±2 °C, dan 20–90 % kelembapan dengan ketelitian sekitar ±5 %. Kalau pembacaan gagal, library mengembalikan NaN, dan kode memeriksanya dengan <code>isnan()</code>.',
      ],
      problems: [
        ['Muncul "Gagal membaca DHT11!" terus', 'Cek kabel DATA benar-benar ke D4 dan nomor di kode juga 4. Kalau memakai sensor DHT11 tanpa modul (4 kaki), tambahkan resistor 10 kΩ dari DATA ke VCC. Pastikan VCC dan GND tidak tertukar.'],
        ['Error: DHT.h: No such file or directory', 'Library belum diinstall. Buka Manage Libraries, cari <b>DHT sensor library</b> dari Adafruit, lalu install. Saat ditanya, install juga <b>Adafruit Unified Sensor</b>.'],
        ['Nilai suhu tidak berubah atau melompat-lompat', 'Jangan membaca lebih cepat dari sekali per detik. Jauhkan sensor dari regulator dan chip ESP32 yang hangat, karena panasnya ikut terbaca.'],
        ['Hasil sensor DHT22 salah', 'Kalau sensormu DHT22 (casing putih), ganti <code>#define DHTTYPE DHT11</code> menjadi <code>DHT22</code>.'],
      ],
    },
    en: {
      title: 'ESP32 DHT11 Tutorial: Wiring, Code and Fixes',
      h1: 'Using the DHT11 Sensor with the ESP32',
      desc: 'Read temperature and humidity from a DHT11 with the ESP32: required libraries, wiring, Arduino code, and fixes for NaN readings or "Failed to read DHT11".',
      intro: 'The DHT11 is the cheap temperature and humidity sensor beginners use most. In this project the ESP32 reads a DHT11 on pin D4 every 2 seconds and prints the result to the Serial Monitor. It is also the base for the WiFi temperature monitor.',
      how: [
        'The DHT11 sends its data over a single wire (DATA) with its own digital protocol, so you do not read an analog voltage. The Adafruit <b>DHT sensor library</b> handles the signal timing; you just call <code>dht.readTemperature()</code> and <code>dht.readHumidity()</code>.',
        'A DHT11 can only be read about once per second, hence the <code>delay(2000)</code>. Its range is 0–50 °C at about ±2 °C, and 20–90 % humidity at about ±5 %. When a read fails the library returns NaN, which the code checks with <code>isnan()</code>.',
      ],
      problems: [
        ['"Failed to read DHT11!" keeps appearing', 'Check that the DATA wire really goes to D4 and the code also says 4. With a bare 4-leg DHT11 (no module), add a 10 kΩ resistor from DATA to VCC. Make sure VCC and GND are not swapped.'],
        ['Error: DHT.h: No such file or directory', 'The library is not installed. Open Manage Libraries, search for the Adafruit <b>DHT sensor library</b> and install it. When asked, also install <b>Adafruit Unified Sensor</b>.'],
        ['The temperature never changes or jumps around', 'Do not read faster than once per second. Keep the sensor away from the warm regulator and ESP32 chip, because their heat gets measured too.'],
        ['Wrong values from a DHT22', 'If your sensor is a DHT22 (white case), change <code>#define DHTTYPE DHT11</code> to <code>DHT22</code>.'],
      ],
    },
  },

  sonar: {
    related: ['servo', 'pir', 'motor'], pitfall: '3v3-logic',
    id: {
      title: 'HC-SR04 ESP32: Sensor Jarak Ultrasonik & Kodenya',
      h1: 'Sensor Jarak Ultrasonik HC-SR04 dengan ESP32',
      desc: 'Ukur jarak dengan HC-SR04 dan ESP32: kenapa ECHO butuh pembagi tegangan, sambungan kabel, kode pulseIn, dan solusi kalau jaraknya selalu 0 cm.',
      intro: 'HC-SR04 mengukur jarak dengan bunyi ultrasonik, seperti kelelawar. Di project ini ESP32 memicu sensor lewat pin D5, mengukur lama pantulan di pin D18, lalu menghitung jaraknya dalam sentimeter. Ini dasar sensor parkir dan robot penghindar rintangan.',
      how: [
        'Pulsa HIGH selama 10 mikrodetik di TRIG membuat sensor memancarkan 8 gelombang bunyi 40 kHz. Pin ECHO lalu HIGH selama bunyi pergi dan kembali. <code>pulseIn(ECHO_PIN, HIGH, 30000)</code> mengukur lamanya dalam mikrodetik.',
        'Bunyi merambat sekitar 0.0343 cm per mikrodetik, dan jaraknya ditempuh dua kali (pergi dan pulang), jadi <code>jarak = durasi × 0.0343 / 2</code>. Batas 30000 µs berarti sekitar 5 meter. Kalau tidak ada pantulan, <code>pulseIn</code> mengembalikan 0.',
        'HC-SR04 bekerja di 5 V, sehingga ECHO juga mengeluarkan 5 V. Pin ESP32 hanya tahan 3.3 V, maka ECHO dilewatkan pembagi tegangan 1 kΩ dan 2 kΩ: 5 V × 2 / (1 + 2) ≈ 3.3 V.',
      ],
      problems: [
        ['Jarak selalu 0 cm', '<code>pulseIn</code> habis waktu karena tidak ada pantulan. Cek VCC sensor ke VIN (5 V), bukan 3V3, dan cek pembagi tegangan di ECHO. Benda yang terlalu dekat (di bawah 2 cm) atau permukaan miring juga tidak memantulkan bunyi dengan baik.'],
        ['Bolehkah ECHO langsung ke pin ESP32?', 'Sebaiknya tidak. Sinyal 5 V bisa merusak pin dalam jangka panjang. Pakai pembagi tegangan 1 kΩ / 2 kΩ, atau versi sensor yang mendukung 3.3 V (misalnya HC-SR04P).'],
        ['Angka jarak melompat-lompat', 'Ambil beberapa bacaan lalu rata-ratakan, dan beri jeda minimal 60 ms antar pengukuran supaya gema sebelumnya hilang. Benda lembut seperti kain menyerap bunyi.'],
      ],
    },
    en: {
      title: 'ESP32 HC-SR04 Ultrasonic Distance Sensor Tutorial',
      h1: 'HC-SR04 Ultrasonic Distance Sensor with the ESP32',
      desc: 'Measure distance with an HC-SR04 and the ESP32: why ECHO needs a voltage divider, the wiring, pulseIn code, and what to do when the distance is always 0 cm.',
      intro: 'The HC-SR04 measures distance with ultrasound, like a bat. In this project the ESP32 triggers the sensor on D5, times the echo on D18 and turns it into centimetres. It is the base for parking sensors and obstacle-avoiding robots.',
      how: [
        'A 10-microsecond HIGH pulse on TRIG makes the sensor send eight 40 kHz sound waves. ECHO then stays HIGH while the sound travels out and back. <code>pulseIn(ECHO_PIN, HIGH, 30000)</code> measures that time in microseconds.',
        'Sound travels about 0.0343 cm per microsecond and covers the distance twice (out and back), so <code>distance = duration × 0.0343 / 2</code>. The 30000 µs limit is roughly 5 metres. With no echo, <code>pulseIn</code> returns 0.',
        'The HC-SR04 runs on 5 V, so ECHO also outputs 5 V. ESP32 pins only tolerate 3.3 V, so ECHO goes through a 1 kΩ and 2 kΩ voltage divider: 5 V × 2 / (1 + 2) ≈ 3.3 V.',
      ],
      problems: [
        ['The distance is always 0 cm', '<code>pulseIn</code> timed out because no echo came back. Check that sensor VCC goes to VIN (5 V), not 3V3, and check the divider on ECHO. Objects closer than about 2 cm, or angled surfaces, also reflect poorly.'],
        ['Can ECHO go straight to an ESP32 pin?', 'Better not. A 5 V signal can damage the pin over time. Use the 1 kΩ / 2 kΩ divider, or a 3.3 V-capable version of the sensor such as the HC-SR04P.'],
        ['The distance jumps around', 'Average several readings and wait at least 60 ms between measurements so the previous echo dies out. Soft objects like fabric absorb sound.'],
      ],
    },
  },

  pir: {
    related: ['relay', 'button', 'webled'], pitfall: null,
    id: {
      title: 'Sensor PIR HC-SR501 ESP32: Deteksi Gerakan',
      h1: 'Deteksi Gerakan dengan Sensor PIR HC-SR501 dan ESP32',
      desc: 'Pakai sensor gerak PIR HC-SR501 dengan ESP32: sambungan kabel, kode Arduino, fungsi dua trimpot, dan solusi kalau PIR terus mendeteksi gerakan palsu.',
      intro: 'Sensor PIR mendeteksi panas tubuh yang bergerak. Di project ini OUT dari PIR dibaca di pin D27, dan LED di D23 menyala selama ada gerakan. Dari sini kamu bisa membuat lampu otomatis atau alarm sederhana.',
      how: [
        'PIR (Passive Infrared) membandingkan radiasi panas yang ditangkap dua elemen sensor di balik lensa putih. Saat ada orang lewat, perbedaannya berubah dan modul HC-SR501 menjadikan OUT HIGH (3.3 V) selama beberapa detik.',
        'Karena OUT sudah 3.3 V, pin ini aman langsung disambung ke ESP32. Kode cukup memakai <code>digitalRead(PIR_PIN)</code>, lalu mencetak pesan hanya saat statusnya berubah supaya Serial Monitor tidak penuh.',
      ],
      problems: [
        ['Mendeteksi gerakan terus padahal tidak ada orang', 'PIR butuh 30–60 detik setelah menyala untuk stabil. Jauhkan dari kipas, AC, dan sinar matahari langsung, dan putar trimpot sensitivitas (Sx) ke arah kecil.'],
        ['LED menyala terlalu lama setelah gerakan berhenti', 'Trimpot waktu (Tx) mengatur berapa lama OUT tetap HIGH, dari beberapa detik sampai beberapa menit. Putar ke arah minimum.'],
        ['OUT berkedip-kedip saat orang terus bergerak', 'Cek jumper mode di modul. Posisi H (repeat trigger) membuat OUT tetap HIGH selama masih ada gerakan, posisi L memicu sekali lalu menunggu.'],
      ],
    },
    en: {
      title: 'ESP32 PIR Motion Sensor (HC-SR501) Tutorial',
      h1: 'Motion Detection with an HC-SR501 PIR Sensor and the ESP32',
      desc: 'Use an HC-SR501 PIR motion sensor with the ESP32: wiring, Arduino code, what the two trimmers do, and how to stop false motion triggers.',
      intro: 'A PIR sensor detects moving body heat. In this project the PIR OUT pin is read on D27, and the LED on D23 lights while there is motion. From here you can build automatic lights or a simple alarm.',
      how: [
        'A PIR (Passive Infrared) sensor compares the heat seen by two sensing elements behind the white lens. When someone walks past, the difference changes and the HC-SR501 module drives OUT HIGH (3.3 V) for a few seconds.',
        'Because OUT is already 3.3 V, it can go straight to the ESP32. The code uses <code>digitalRead(PIR_PIN)</code> and only prints a message when the state changes, so the Serial Monitor does not flood.',
      ],
      problems: [
        ['It detects motion when nobody is there', 'A PIR needs 30–60 seconds after power-up to settle. Keep it away from fans, air conditioners and direct sunlight, and turn the sensitivity trimmer (Sx) down.'],
        ['The LED stays on too long after motion stops', 'The time trimmer (Tx) sets how long OUT stays HIGH, from a few seconds to several minutes. Turn it to the minimum.'],
        ['OUT flickers while someone keeps moving', 'Check the mode jumper. Position H (repeat trigger) keeps OUT HIGH while motion continues; position L triggers once and then waits.'],
      ],
    },
  },

  webled: {
    related: ['dhtweb', 'relay', 'blink'], pitfall: 'adc2-wifi',
    id: {
      title: 'Web Server ESP32: Kontrol LED dari HP lewat WiFi',
      h1: 'Web Server ESP32 untuk Kontrol LED dari HP',
      desc: 'Jadikan ESP32 web server: sambung ke WiFi rumah, buka alamat IP-nya di browser HP, lalu nyalakan LED dengan tombol ON/OFF. Ada kode lengkap dan solusi gagal konek.',
      intro: 'Di sinilah ESP32 terasa beda dari Arduino Uno. ESP32 tersambung ke WiFi rumah dan menjalankan halaman web kecil. Buka alamat IP-nya dari browser HP, tekan ON atau OFF, dan LED di D23 ikut menyala atau padam.',
      how: [
        '<code>WiFi.begin(ssid, password)</code> menyambungkan ESP32 ke router, lalu perulangan <code>while</code> menunggu sampai statusnya <code>WL_CONNECTED</code>. Router memberi alamat IP, yang dicetak dengan <code>WiFi.localIP()</code>.',
        '<code>WebServer server(80)</code> membuat server di port HTTP biasa. <code>server.on("/on", handleOn)</code> berarti: saat browser membuka <code>/on</code>, jalankan fungsi yang menyalakan LED lalu kirim ulang halaman. <code>server.handleClient()</code> di <code>loop()</code> harus terus dipanggil supaya permintaan dari browser dilayani.',
      ],
      problems: [
        ['Serial Monitor hanya menampilkan titik terus', 'ESP32 belum tersambung. Cek nama WiFi dan password (huruf besar-kecil berpengaruh), dan pastikan WiFi-nya 2.4 GHz. ESP32 tidak bisa tersambung ke WiFi 5 GHz.'],
        ['Alamat IP tidak bisa dibuka dari HP', 'HP harus tersambung ke WiFi yang sama, bukan data seluler. Beberapa WiFi publik atau WiFi tamu memblokir sesama perangkat saling terhubung (AP isolation).'],
        ['ESP32 restart saat mulai konek WiFi', 'WiFi menarik arus besar sesaat. Pakai kabel USB yang bagus dan port USB langsung di laptop, bukan hub tanpa daya. Pesan "Brownout detector was triggered" menandakan masalah daya ini.'],
        ['Alamat IP berubah-ubah', 'Router memberi IP lewat DHCP, jadi bisa berganti setelah restart. Atur DHCP reservation di router, atau cek ulang IP di Serial Monitor.'],
      ],
    },
    en: {
      title: 'ESP32 Web Server: Control an LED from Your Phone',
      h1: 'ESP32 Web Server to Control an LED from Your Phone',
      desc: 'Turn the ESP32 into a web server: join your home WiFi, open its IP in your phone browser and switch an LED with ON/OFF buttons. Full code and connection fixes.',
      intro: 'This is where the ESP32 really differs from an Arduino Uno. It joins your home WiFi and serves a small web page. Open its IP address in your phone browser, tap ON or OFF, and the LED on D23 follows.',
      how: [
        '<code>WiFi.begin(ssid, password)</code> connects the ESP32 to the router, and the <code>while</code> loop waits until the status is <code>WL_CONNECTED</code>. The router hands out an IP address, which is printed with <code>WiFi.localIP()</code>.',
        '<code>WebServer server(80)</code> creates a server on the normal HTTP port. <code>server.on("/on", handleOn)</code> means: when the browser opens <code>/on</code>, run the function that switches the LED on and send the page again. <code>server.handleClient()</code> in <code>loop()</code> must keep running so browser requests get answered.',
      ],
      problems: [
        ['The Serial Monitor just prints dots forever', 'The ESP32 has not connected. Check the WiFi name and password (they are case-sensitive) and make sure the network is 2.4 GHz. The ESP32 cannot join 5 GHz WiFi.'],
        ['The IP address will not open on the phone', 'The phone must be on the same WiFi, not mobile data. Some public or guest networks block devices from talking to each other (AP isolation).'],
        ['The ESP32 restarts when WiFi starts', 'WiFi draws a burst of current. Use a good USB cable and a USB port directly on the computer, not an unpowered hub. A "Brownout detector was triggered" message points to this power problem.'],
        ['The IP address keeps changing', 'The router assigns IPs over DHCP, so it can change after a restart. Set a DHCP reservation in the router, or check the IP again in the Serial Monitor.'],
      ],
    },
  },

  dhtweb: {
    related: ['dht', 'webled', 'relay'], pitfall: 'adc2-wifi',
    id: {
      title: 'Monitor Suhu WiFi ESP32 + DHT11 di Browser HP',
      h1: 'Monitor Suhu dan Kelembapan lewat WiFi dengan ESP32',
      desc: 'Gabungkan DHT11 dan web server ESP32: suhu dan kelembapan tampil di browser HP dan diperbarui tiap 5 detik, plus alamat /data berformat JSON untuk aplikasi lain.',
      intro: 'Project ini menggabungkan dua project sebelumnya: sensor DHT11 dan web server. ESP32 membaca suhu dan kelembapan, lalu menampilkannya di halaman web yang bisa dibuka dari HP di jaringan WiFi yang sama.',
      how: [
        'Setiap kali browser membuka alamat utama, <code>handleRoot()</code> membaca DHT11 dan menyusun halaman HTML berisi angka terbaru. Tag <code>&lt;meta http-equiv=\'refresh\' content=\'5\'&gt;</code> membuat browser memuat ulang halaman tiap 5 detik.',
        'Alamat <code>/data</code> mengirim data yang sama dalam format JSON, misalnya <code>{"suhu":28.0,"kelembapan":65}</code>. Format ini mudah dibaca aplikasi lain, dashboard, atau Home Assistant.',
      ],
      problems: [
        ['Halaman menampilkan "nan"', 'Pembacaan DHT11 gagal. Cek kabel DATA ke D4 dan library DHT sudah terinstall. Jangan membuka halaman berkali-kali dalam satu detik, karena DHT11 hanya bisa dibaca sekitar sekali per detik.'],
        ['Halaman tidak bisa dibuka', 'Pastikan HP di WiFi yang sama dan alamatnya diawali <code>http://</code>, bukan <code>https://</code>. ESP32 hanya melayani HTTP biasa.'],
        ['Mau dipantau dari luar rumah', 'Alamat IP ini hanya berlaku di jaringan lokal. Untuk akses dari internet, kirim data ke layanan cloud (misalnya lewat MQTT) daripada membuka port router.'],
      ],
    },
    en: {
      title: 'ESP32 WiFi Temperature Monitor with DHT11',
      h1: 'Temperature and Humidity Monitor over WiFi with the ESP32',
      desc: 'Combine a DHT11 with an ESP32 web server: temperature and humidity show in your phone browser, refreshed every 5 seconds, plus a /data JSON endpoint for other apps.',
      intro: 'This project combines two earlier ones: the DHT11 sensor and the web server. The ESP32 reads temperature and humidity and shows them on a web page you can open from a phone on the same WiFi.',
      how: [
        'Every time the browser opens the main address, <code>handleRoot()</code> reads the DHT11 and builds an HTML page with the latest values. The <code>&lt;meta http-equiv=\'refresh\' content=\'5\'&gt;</code> tag makes the browser reload the page every 5 seconds.',
        'The <code>/data</code> address returns the same values as JSON, for example <code>{"temperature":28.0,"humidity":65}</code>. Other apps, dashboards and Home Assistant can read this format easily.',
      ],
      problems: [
        ['The page shows "nan"', 'The DHT11 read failed. Check the DATA wire to D4 and that the DHT library is installed. Do not reload the page several times per second, because a DHT11 can only be read about once per second.'],
        ['The page will not open', 'Make sure the phone is on the same WiFi and the address starts with <code>http://</code>, not <code>https://</code>. The ESP32 only serves plain HTTP.'],
        ['You want to check it from outside the house', 'This IP address only works on your local network. For internet access, send the data to a cloud service (for example over MQTT) instead of opening router ports.'],
      ],
    },
  },

  relay: {
    related: ['pir', 'webled', 'motor'], pitfall: 'brownout',
    id: {
      title: 'Relay ESP32: Nyalakan Lampu dengan Modul Relay',
      h1: 'Menyalakan Lampu dengan Modul Relay dan ESP32',
      desc: 'Kendalikan lampu dengan modul relay 5 V dan ESP32: relay aktif LOW, sambungan COM dan NO, kode Arduino, dan solusi relay yang tidak mau mati.',
      intro: 'Pin ESP32 hanya kuat menyalakan LED. Untuk lampu, kipas, atau pompa, kita butuh relay: saklar yang digerakkan magnet listrik. Di project ini relay di pin D26 dinyalakan dengan mengetik 1 dan dimatikan dengan 0 di Serial Monitor.',
      how: [
        'Modul relay punya transistor dan dioda pengaman, jadi pin ESP32 cukup memberi sinyal kecil ke IN. Kebanyakan modul relay 1 channel bersifat <b>aktif LOW</b>: <code>digitalWrite(RELAY_PIN, LOW)</code> menyalakan relay, <code>HIGH</code> mematikannya. Karena itu di <code>setup()</code> pin langsung dibuat HIGH supaya lampu mati saat board menyala.',
        'Kontak relay bekerja seperti saklar biasa. COM adalah titik bersama, NO (Normally Open) tersambung ke COM hanya saat relay aktif, dan NC (Normally Closed) sebaliknya. Satu kabel lampu diputus lalu disambung lewat COM dan NO.',
      ],
      problems: [
        ['Relay selalu menyala atau tidak mau mati', 'Beberapa modul relay 5 V tidak benar-benar mati dengan sinyal HIGH 3.3 V dari ESP32. Coba modul dengan jumper JD-VCC terpisah, modul relay 3.3 V, atau modul yang bisa diatur ke high-level trigger.'],
        ['Lampu menyala saat diketik 0, mati saat 1', 'Modulmu aktif HIGH. Tukar <code>LOW</code> dan <code>HIGH</code> di kode.'],
        ['ESP32 restart saat relay bekerja', 'Kumparan relay menarik arus cukup besar. Ambil daya relay dari VIN (5 V), bukan dari 3V3, dan pakai kabel USB atau adaptor yang bagus.'],
        ['Aman untuk listrik 220 V?', 'Listrik PLN bisa mematikan. Untuk latihan, pakai lampu 12 V DC dengan adaptor. Kalau ingin ke 220 V, minta bantuan orang yang paham instalasi listrik dan tutup semua sambungan terbuka.'],
      ],
    },
    en: {
      title: 'ESP32 Relay Module Tutorial: Switch a Lamp',
      h1: 'Switch a Lamp with a Relay Module and the ESP32',
      desc: 'Switch a lamp with a 5 V relay module and the ESP32: active-LOW relays, COM and NO wiring, Arduino code, and a fix for relays that never switch off.',
      intro: 'An ESP32 pin is only strong enough for an LED. For a lamp, fan or pump you need a relay: a switch moved by an electromagnet. In this project a relay on D26 turns on when you type 1 in the Serial Monitor and off when you type 0.',
      how: [
        'A relay module has a transistor and a protection diode, so the ESP32 pin only sends a small signal to IN. Most 1-channel relay modules are <b>active LOW</b>: <code>digitalWrite(RELAY_PIN, LOW)</code> turns the relay on and <code>HIGH</code> turns it off. That is why <code>setup()</code> sets the pin HIGH right away, so the lamp starts off.',
        'The relay contacts behave like an ordinary switch. COM is the common point, NO (Normally Open) connects to COM only while the relay is on, and NC (Normally Closed) does the opposite. One lamp wire is cut and reconnected through COM and NO.',
      ],
      problems: [
        ['The relay is always on or never switches off', 'Some 5 V relay modules do not fully switch off with the ESP32\'s 3.3 V HIGH. Try a module with a separate JD-VCC jumper, a 3.3 V relay module, or one that can be set to high-level trigger.'],
        ['The lamp turns on with 0 and off with 1', 'Your module is active HIGH. Swap <code>LOW</code> and <code>HIGH</code> in the code.'],
        ['The ESP32 restarts when the relay clicks', 'The relay coil draws a fair amount of current. Power the relay from VIN (5 V), not 3V3, and use a good USB cable or power supply.'],
        ['Is it safe for mains power?', 'Mains electricity can kill. For practice, use a 12 V DC lamp with an adapter. If you want to switch mains, get help from someone qualified and cover every exposed connection.'],
      ],
    },
  },

  servo: {
    related: ['sonar', 'motor', 'fade'], pitfall: 'brownout',
    id: {
      title: 'Servo SG90 ESP32: Rangkaian & Kode ESP32Servo',
      h1: 'Menggerakkan Servo SG90 dengan ESP32',
      desc: 'Gerakkan servo SG90 dari 0° sampai 180° dengan ESP32 dan library ESP32Servo. Ada sambungan kabel, kode Arduino, dan solusi servo bergetar atau ESP32 restart.',
      intro: 'Servo adalah motor kecil yang bisa diputar ke sudut tertentu, bukan berputar terus. Di project ini servo SG90 di pin D13 bergerak bolak-balik dari 0° ke 180°. Servo dipakai untuk lengan robot, pintu otomatis, dan kemudi mobil RC.',
      how: [
        'Servo membaca lebar pulsa yang dikirim 50 kali per detik. Pulsa sekitar 500 µs berarti 0°, sekitar 2400 µs berarti 180°, dan nilai di antaranya untuk sudut di tengah. <code>servo.attach(SERVO_PIN, 500, 2400)</code> memberi tahu library rentang ini.',
        'Library <b>ESP32Servo</b> diperlukan karena library Servo bawaan Arduino tidak mendukung ESP32. <code>servo.write(sudut)</code> mengubah sudut, dan <code>delay(15)</code> memberi waktu servo bergerak sebelum langkah berikutnya.',
      ],
      problems: [
        ['Error: Servo.h atau ESP32Servo.h tidak ditemukan', 'Install library <b>ESP32Servo</b> (oleh Kevin Harrington) lewat Manage Libraries, dan pastikan kode memakai <code>#include &lt;ESP32Servo.h&gt;</code>.'],
        ['Servo bergetar atau bergerak tersendat', 'Daya kurang. Ambil 5 V dari VIN, bukan 3V3. Untuk lebih dari satu servo, pakai catu daya 5 V terpisah dan satukan GND-nya dengan GND ESP32.'],
        ['Servo tidak sampai 0° atau 180°', 'Rentang pulsa tiap servo sedikit berbeda. Coba ubah angka 500 dan 2400 sedikit demi sedikit, tapi jangan sampai servo terdengar memaksa di ujung.'],
      ],
    },
    en: {
      title: 'ESP32 Servo SG90 Tutorial with ESP32Servo',
      h1: 'Control an SG90 Servo with the ESP32',
      desc: 'Sweep an SG90 servo from 0° to 180° with the ESP32 and the ESP32Servo library. Wiring, Arduino code, and fixes for jittering servos or a restarting ESP32.',
      intro: 'A servo is a small motor that turns to a set angle instead of spinning freely. In this project an SG90 servo on D13 sweeps back and forth from 0° to 180°. Servos drive robot arms, automatic doors and RC car steering.',
      how: [
        'A servo reads the width of a pulse sent 50 times per second. About 500 µs means 0°, about 2400 µs means 180°, and values in between give angles in between. <code>servo.attach(SERVO_PIN, 500, 2400)</code> tells the library this range.',
        'The <b>ESP32Servo</b> library is needed because the standard Arduino Servo library does not support the ESP32. <code>servo.write(angle)</code> sets the angle, and <code>delay(15)</code> gives the servo time to move before the next step.',
      ],
      problems: [
        ['Error: Servo.h or ESP32Servo.h not found', 'Install the <b>ESP32Servo</b> library (by Kevin Harrington) from Manage Libraries, and make sure the code uses <code>#include &lt;ESP32Servo.h&gt;</code>.'],
        ['The servo jitters or moves in jerks', 'Not enough power. Take 5 V from VIN, not 3V3. For more than one servo, use a separate 5 V supply and connect its GND to the ESP32 GND.'],
        ['The servo does not reach 0° or 180°', 'Every servo\'s pulse range is a little different. Adjust 500 and 2400 in small steps, but stop if the servo strains audibly at the ends.'],
      ],
    },
  },

  motor: {
    related: ['servo', 'fade', 'sonar'], pitfall: 'brownout',
    id: {
      title: 'L298N ESP32: Atur Arah & Kecepatan Motor DC',
      h1: 'Mengendalikan Motor DC dengan L298N dan ESP32',
      desc: 'Atur arah dan kecepatan motor DC dengan driver L298N dan ESP32: sambungan IN1, IN2, ENA, baterai, kode PWM, dan solusi motor tidak berputar atau ESP32 restart.',
      intro: 'Motor DC butuh arus jauh lebih besar dari yang bisa diberikan pin ESP32, jadi kita memakai driver motor L298N. Di project ini ESP32 mengatur arah putar lewat IN1 dan IN2, serta kecepatan lewat PWM di ENA. Motor bergerak maju, berhenti, lalu mundur.',
      how: [
        'L298N berisi rangkaian H-bridge yang bisa membalik arah arus ke motor. IN1 HIGH dan IN2 LOW membuat motor maju, IN1 LOW dan IN2 HIGH membuatnya mundur, dan keduanya LOW membuat motor berhenti.',
        'Kecepatan diatur dengan PWM di pin ENA: <code>ledcAttach(ENA, 1000, 8)</code> lalu <code>ledcWrite(ENA, kecepatan)</code> dengan nilai 0–255. Jumper ENA bawaan di modul harus dilepas, kalau tidak motor selalu berputar penuh.',
        'L298N kehilangan sekitar 2 V di dalam chip-nya. Dengan baterai 2×18650 (7.4 V), motor menerima kira-kira 5–6 V, pas untuk motor TT kuning. GND baterai dan GND ESP32 wajib disatukan.',
      ],
      problems: [
        ['Motor tidak berputar sama sekali', 'Cek GND baterai dan GND ESP32 sudah disatukan, jumper ENA sudah dilepas, dan baterai terisi. Nilai PWM yang terlalu kecil (misalnya di bawah 80) sering tidak cukup untuk memutar motor dari diam.'],
        ['ESP32 restart saat motor mulai berputar', 'Lonjakan arus motor membuat tegangan turun (brownout). Jangan ambil daya motor dari USB ESP32. Pakai baterai terpisah untuk motor, dan tambahkan kapasitor 470–1000 µF di terminal daya L298N.'],
        ['Motor hanya berputar ke satu arah', 'Cek kabel IN1 (D27) dan IN2 (D26). Kalau arahnya terbalik dari yang diharapkan, tukar dua kabel motor di terminal OUT1 dan OUT2.'],
        ['Modul L298N terasa panas', 'Wajar karena L298N membuang banyak daya jadi panas. Untuk motor kecil dan baterai, driver modern seperti TB6612FNG lebih efisien.'],
      ],
    },
    en: {
      title: 'ESP32 L298N Tutorial: DC Motor Speed & Direction',
      h1: 'Control a DC Motor with an L298N and the ESP32',
      desc: 'Control DC motor direction and speed with an L298N and the ESP32: IN1, IN2, ENA and battery wiring, PWM code, and fixes for a stalled motor or resets.',
      intro: 'A DC motor needs far more current than an ESP32 pin can supply, so we use an L298N motor driver. In this project the ESP32 sets the direction with IN1 and IN2 and the speed with PWM on ENA. The motor runs forward, stops, then reverses.',
      how: [
        'The L298N contains an H-bridge that can reverse the current through the motor. IN1 HIGH and IN2 LOW drive it forward, IN1 LOW and IN2 HIGH drive it backward, and both LOW stop it.',
        'Speed comes from PWM on ENA: <code>ledcAttach(ENA, 1000, 8)</code>, then <code>ledcWrite(ENA, speed)</code> with a value from 0 to 255. The ENA jumper on the module must be removed, otherwise the motor always runs at full speed.',
        'The L298N drops about 2 V inside the chip. With a 2×18650 battery (7.4 V) the motor gets roughly 5–6 V, which suits the yellow TT motors. The battery GND and the ESP32 GND must be joined.',
      ],
      problems: [
        ['The motor does not turn at all', 'Check that the battery GND and ESP32 GND are joined, the ENA jumper is removed and the battery is charged. A small PWM value (say below 80) is often not enough to start the motor from rest.'],
        ['The ESP32 restarts when the motor starts', 'The motor\'s current surge drags the voltage down (brownout). Never power the motor from the ESP32\'s USB. Use a separate battery for the motor and add a 470–1000 µF capacitor across the L298N power terminals.'],
        ['The motor only turns one way', 'Check the IN1 (D27) and IN2 (D26) wires. If it turns the wrong way, swap the two motor wires on OUT1 and OUT2.'],
        ['The L298N module gets hot', 'That is expected: the L298N turns a lot of power into heat. For small motors on batteries, a modern driver such as the TB6612FNG is more efficient.'],
      ],
    },
  },
};
