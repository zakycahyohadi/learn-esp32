// Teks tambahan untuk halaman tiap pelajaran (/belajar/<slug>/ dan /en/learn/<slug>/).
// Judul, tujuan, aturan, langkah, dan petunjuk diambil dari LESSONS di js/sim.js;
// kode jawaban diambil dari contoh simulator yang dipakai pelajaran itu.
// Urutan kunci di sini mengikuti urutan pelajaran di simulator.
// project: project yang berkaitan (halaman /project/...). parts dan wiring ditulis di sini karena
// pelajaran di simulator tidak punya daftar alat tertulis.

export const LESSON_TEXT = {
  power: {
    slug: { id: 'listrik-breadboard-esp32', en: 'esp32-breadboard-power' }, project: 'blink',
    id: {
      title: 'Listrik ESP32 ke Breadboard: Pin 3V3, GND & Jalur +/−',
      h1: 'Pelajaran 1: Membawa Listrik ESP32 ke Breadboard',
      desc: 'Pelajaran pertama ESP32 untuk pemula: kenali pin 3V3 dan GND, jalur + dan − di breadboard, dan cara menghindari korsleting. Bisa dipraktikkan di simulator.',
      intro: 'Sebelum menyalakan apa pun, kamu perlu tahu dari mana listriknya datang. Di pelajaran ini kamu membawa 3.3 V dan GND dari ESP32 ke jalur pinggir breadboard, langkah pertama hampir semua rangkaian.',
      parts: ['ESP32 DevKit V1', 'Breadboard 400 titik', 'Kabel jumper male-male ×2'],
      wiring: [['3V3', 'Jalur + breadboard (garis merah)'], ['GND', 'Jalur − breadboard (garis biru)']],
      problems: [
        ['Board panas atau mati setelah kabel dipasang', 'Kemungkinan 3V3 tersambung langsung ke GND (korsleting). Cabut USB, lalu cek kabel tidak ada yang menyambung jalur + ke jalur −.'],
        ['Jalur + di sisi lain breadboard tidak ada tegangannya', 'Jalur kiri dan kanan breadboard tidak tersambung. Di beberapa breadboard panjang, jalur bahkan terputus di tengah. Sambungkan dengan kabel tambahan kalau perlu.'],
      ],
    },
    en: {
      title: 'ESP32 Breadboard Power: 3V3, GND and the + / − Rails',
      h1: 'Lesson 1: Bringing ESP32 Power to the Breadboard',
      desc: 'The first ESP32 lesson for beginners: meet the 3V3 and GND pins, the breadboard + and − rails, and how to avoid a short circuit. Practise it in the simulator.',
      intro: 'Before you light anything up, you need to know where the power comes from. In this lesson you bring 3.3 V and GND from the ESP32 to the breadboard edge rails, the first step of almost every circuit.',
      parts: ['ESP32 DevKit V1', '400-point breadboard', 'Male-male jumper wires ×2'],
      wiring: [['3V3', 'Breadboard + rail (red line)'], ['GND', 'Breadboard − rail (blue line)']],
      problems: [
        ['The board gets hot or dies after wiring', '3V3 is probably connected straight to GND (a short circuit). Unplug the USB and check that no wire joins the + rail to the − rail.'],
        ['The + rail on the other side has no voltage', 'The left and right rails of a breadboard are not connected. On some long breadboards the rails are even split in the middle. Bridge them with an extra wire if needed.'],
      ],
    },
  },

  led: {
    slug: { id: 'led-resistor-pemula', en: 'led-resistor-basics' }, project: 'blink',
    id: {
      title: 'LED dan Resistor untuk Pemula: Rangkaian Tanpa Kode',
      h1: 'Pelajaran 2: LED Pertama, Tanpa Kode',
      desc: 'Pelajari arah LED (anoda dan katoda) dan kenapa LED selalu butuh resistor 220–330 Ω di 3.3 V. Rangkaian LED pertama dengan ESP32, tanpa menulis kode.',
      intro: 'LED adalah komponen yang paling sering dipakai, tapi juga paling sering salah pasang. Di pelajaran ini kamu menyalakan LED langsung dari jalur 3.3 V lewat resistor, tanpa kode, supaya paham dulu arah dan arusnya.',
      parts: ['ESP32 DevKit V1', 'Breadboard', 'LED 5 mm', 'Resistor 220 Ω', 'Kabel jumper ×4'],
      wiring: [['3V3', 'Jalur +'], ['GND', 'Jalur −'], ['Jalur +', 'Resistor 220 Ω, lalu kaki panjang LED (anoda)'], ['Kaki pendek LED (katoda)', 'Jalur −']],
      problems: [
        ['LED tidak menyala', 'LED terpasang terbalik. Kaki panjang (anoda) ke arah +, kaki pendek (katoda) ke arah −. Sisi casing LED yang rata juga menandakan katoda.'],
        ['LED menyala sangat terang lalu mati', 'LED dipasang tanpa resistor sehingga arusnya terlalu besar dan LED rusak. Selalu pasang resistor 220–330 Ω.'],
      ],
    },
    en: {
      title: 'LED and Resistor Basics: Your First Circuit, No Code',
      h1: 'Lesson 2: Your First LED, No Code',
      desc: 'Learn LED direction (anode and cathode) and why an LED always needs a 220–330 Ω resistor at 3.3 V. Your first ESP32 LED circuit, without writing any code.',
      intro: 'The LED is the most common part, and also the one most often wired wrong. In this lesson you light an LED straight from the 3.3 V rail through a resistor, with no code, so you understand direction and current first.',
      parts: ['ESP32 DevKit V1', 'Breadboard', '5 mm LED', '220 Ω resistor', 'Jumper wires ×4'],
      wiring: [['3V3', '+ rail'], ['GND', '− rail'], ['+ rail', '220 Ω resistor, then the LED long leg (anode)'], ['LED short leg (cathode)', '− rail']],
      problems: [
        ['The LED does not light', 'It is in backwards. The long leg (anode) goes towards +, the short leg (cathode) towards −. The flat side of the LED case also marks the cathode.'],
        ['The LED flashes very bright and dies', 'It was wired without a resistor, so too much current flowed and the LED burned out. Always use a 220–330 Ω resistor.'],
      ],
    },
  },

  blink: {
    slug: { id: 'blink-esp32-kode', en: 'esp32-blink-code' }, project: 'blink',
    id: {
      title: 'Kode Blink ESP32: digitalWrite, pinMode & delay',
      h1: 'Pelajaran 3: Kedipkan LED dengan Kode',
      desc: 'Tulis program pertama ESP32: pinMode, digitalWrite, dan delay untuk mengedipkan LED di GPIO 23. Langkah dicek otomatis di simulator, lengkap dengan kode jawaban.',
      intro: 'Sekarang LED dikendalikan oleh program. Kamu memindahkan kabel LED dari jalur + ke pin D23, lalu menulis kode yang menyalakan dan mematikannya bergantian.',
      problems: [
        ['LED tetap menyala tanpa berkedip', 'Kabel resistor masih tersambung ke jalur +, bukan ke pin D23. Pindahkan kabelnya ke D23.'],
        ['LED tidak menyala sama sekali', 'Nomor pin di kode harus sama dengan pin yang disambung. D23 ditulis 23 di kode. Pastikan juga ada <code>pinMode(23, OUTPUT)</code> di <code>setup()</code>.'],
      ],
    },
    en: {
      title: 'ESP32 Blink Code: digitalWrite, pinMode and delay',
      h1: 'Lesson 3: Blink the LED with Code',
      desc: 'Write your first ESP32 program: pinMode, digitalWrite and delay to blink an LED on GPIO 23. Each step is checked in the simulator, with the answer code included.',
      intro: 'Now the LED is controlled by a program. You move the LED wire from the + rail to pin D23, then write code that switches it on and off in turn.',
      problems: [
        ['The LED stays on without blinking', 'The resistor wire is still on the + rail instead of pin D23. Move it to D23.'],
        ['The LED never lights', 'The pin number in the code must match the wired pin. D23 is written 23 in code. Also make sure <code>pinMode(23, OUTPUT)</code> is in <code>setup()</code>.'],
      ],
    },
  },

  button: {
    slug: { id: 'membaca-tombol-esp32', en: 'esp32-read-button' }, project: 'button',
    id: {
      title: 'Membaca Tombol ESP32: digitalRead & INPUT_PULLUP',
      h1: 'Pelajaran 4: Membaca Tombol',
      desc: 'Belajar membaca push button di ESP32 dengan digitalRead dan INPUT_PULLUP, lalu menyalakan LED saat tombol ditekan. Praktik langsung di simulator.',
      intro: 'Program yang baik bisa menanggapi dunia luar. Di pelajaran ini ESP32 membaca sebuah tombol dan menyalakan LED hanya saat tombol ditekan.',
      problems: [
        ['Tombol tidak berpengaruh', 'Pakai dua kaki tombol yang diagonal, dan pasang tombol melintang di atas parit tengah breadboard.'],
        ['LED menyala saat tombol dilepas', 'Dengan <code>INPUT_PULLUP</code>, tombol ditekan terbaca LOW. Pakai kondisi <code>digitalRead(pin) == LOW</code> untuk arti "ditekan".'],
      ],
    },
    en: {
      title: 'Reading a Button on the ESP32: digitalRead & INPUT_PULLUP',
      h1: 'Lesson 4: Reading a Button',
      desc: 'Learn to read a push button on the ESP32 with digitalRead and INPUT_PULLUP, then light an LED while it is pressed. Practise in the simulator with automatic checks.',
      intro: 'A useful program reacts to the outside world. In this lesson the ESP32 reads a button and lights the LED only while the button is pressed.',
      problems: [
        ['The button does nothing', 'Use two diagonal button legs, and place the button across the centre gap of the breadboard.'],
        ['The LED lights when the button is released', 'With <code>INPUT_PULLUP</code> a pressed button reads LOW. Use <code>digitalRead(pin) == LOW</code> to mean "pressed".'],
      ],
    },
  },

  pot: {
    slug: { id: 'analogread-esp32', en: 'esp32-analogread' }, project: 'fade',
    id: {
      title: 'analogRead ESP32: Membaca Potensiometer 0–4095',
      h1: 'Pelajaran 5: Membaca Nilai Analog dengan analogRead',
      desc: 'Pelajari analogRead di ESP32: membaca potensiometer di GPIO 34 menjadi angka 0–4095 (ADC 12-bit), dan kenapa pin ADC1 lebih aman dipakai bersama WiFi.',
      intro: 'Tombol hanya punya dua keadaan, tapi banyak sensor memberi nilai di antaranya. Di pelajaran ini kamu membaca posisi potensiometer sebagai angka 0–4095 dengan <code>analogRead</code>.',
      parts: ['ESP32 DevKit V1', 'Breadboard', 'Potensiometer 10 kΩ', 'Kabel jumper ×5'],
      wiring: [['3V3', 'Jalur +, lalu kaki luar potensiometer'], ['GND', 'Jalur −, lalu kaki luar lainnya'], ['D34', 'Kaki tengah potensiometer']],
      problems: [
        ['Nilai tidak pernah sampai 0 atau 4095', 'ADC ESP32 kurang akurat di dekat 0 V dan 3.3 V. Itu normal. Untuk tegangan yang lebih tepat, pakai <code>analogReadMilliVolts()</code>.'],
        ['Nilainya selalu 0 atau 4095 saat WiFi menyala', 'Pin ADC2 (GPIO 0, 2, 4, 12–15, 25–27) tidak bisa dibaca saat WiFi aktif. Pakai pin ADC1 seperti GPIO 32–39.'],
      ],
    },
    en: {
      title: 'ESP32 analogRead: Reading a Potentiometer (0–4095)',
      h1: 'Lesson 5: Reading an Analog Value with analogRead',
      desc: 'Learn analogRead on the ESP32: read a potentiometer on GPIO 34 as a number from 0 to 4095 (12-bit ADC), and why ADC1 pins are safer to use alongside WiFi.',
      intro: 'A button only has two states, but many sensors give values in between. In this lesson you read a potentiometer position as a number from 0 to 4095 with <code>analogRead</code>.',
      parts: ['ESP32 DevKit V1', 'Breadboard', '10 kΩ potentiometer', 'Jumper wires ×5'],
      wiring: [['3V3', '+ rail, then one outer potentiometer leg'], ['GND', '− rail, then the other outer leg'], ['D34', 'Potentiometer middle leg']],
      problems: [
        ['The value never reaches 0 or 4095', 'The ESP32 ADC is less accurate near 0 V and 3.3 V. That is normal. For a more accurate voltage, use <code>analogReadMilliVolts()</code>.'],
        ['The value is stuck at 0 or 4095 with WiFi on', 'ADC2 pins (GPIO 0, 2, 4, 12–15, 25–27) cannot be read while WiFi is active. Use ADC1 pins such as GPIO 32–39.'],
      ],
    },
  },

  pwm: {
    slug: { id: 'pwm-esp32', en: 'esp32-pwm-dimming' }, project: 'fade',
    id: {
      title: 'PWM ESP32 untuk Pemula: Atur Terang LED',
      h1: 'Pelajaran 6: Mengatur Terang LED dengan PWM',
      desc: 'Pelajari PWM ESP32 dengan ledcAttach dan ledcWrite: putar potensiometer untuk mengatur terang LED. Penjelasan duty cycle, map(), dan kode untuk paket board 3.x.',
      intro: 'Di pelajaran ini dua hal digabung: potensiometer dibaca dengan <code>analogRead</code>, lalu nilainya dipakai untuk mengatur terang LED dengan PWM.',
      parts: ['ESP32 DevKit V1', 'Breadboard', 'Potensiometer 10 kΩ', 'LED 5 mm', 'Resistor 220 Ω', 'Kabel jumper ×6'],
      wiring: [['D34', 'Kaki tengah potensiometer (kaki luar ke 3V3 dan GND)'], ['D18', 'Resistor 220 Ω, lalu anoda LED'], ['Katoda LED', 'Jalur − (GND)']],
      problems: [
        ['LED hanya nyala atau mati, tidak redup', 'LED harus di pin yang diatur dengan <code>ledcAttach</code>. <code>digitalWrite</code> hanya bisa penuh atau mati.'],
        ['Error ledcSetup tidak dikenal', 'Di paket board ESP32 versi 3.x, pakai <code>ledcAttach(pin, frekuensi, resolusi)</code> dan <code>ledcWrite(pin, nilai)</code>.'],
      ],
    },
    en: {
      title: 'ESP32 PWM for Beginners: Dim an LED',
      h1: 'Lesson 6: Dimming an LED with PWM',
      desc: 'Learn ESP32 PWM with ledcAttach and ledcWrite: turn a potentiometer to set LED brightness. Duty cycle, map() and code for board package 3.x explained.',
      intro: 'This lesson combines two things: a potentiometer is read with <code>analogRead</code>, and its value sets the LED brightness through PWM.',
      parts: ['ESP32 DevKit V1', 'Breadboard', '10 kΩ potentiometer', '5 mm LED', '220 Ω resistor', 'Jumper wires ×6'],
      wiring: [['D34', 'Potentiometer middle leg (outer legs to 3V3 and GND)'], ['D18', '220 Ω resistor, then the LED anode'], ['LED cathode', '− (GND) rail']],
      problems: [
        ['The LED is only fully on or off', 'The LED must be on the pin set up with <code>ledcAttach</code>. <code>digitalWrite</code> can only switch fully on or off.'],
        ['ledcSetup is not recognised', 'In ESP32 board package 3.x, use <code>ledcAttach(pin, frequency, resolution)</code> and <code>ledcWrite(pin, value)</code>.'],
      ],
    },
  },

  dht: {
    slug: { id: 'sensor-suhu-dht11-pemula', en: 'esp32-dht11-lesson' }, project: 'dht',
    id: {
      title: 'Belajar Sensor Suhu DHT11 dengan ESP32 dari Nol',
      h1: 'Pelajaran 7: Sensor Suhu DHT11',
      desc: 'Pelajaran DHT11 untuk pemula: sambungkan sensor suhu dan kelembapan ke ESP32, pakai library DHT, dan baca hasilnya di Serial Monitor. Praktik di simulator.',
      intro: 'Sensor pertama yang sungguhan: DHT11 mengukur suhu dan kelembapan udara. Kamu menyambungkan tiga kabelnya ke ESP32 dan menampilkan hasilnya di Serial Monitor.',
      problems: [
        ['Muncul NaN atau gagal membaca', 'Cek kabel DATA ke pin yang sama dengan di kode, dan beri jeda minimal 1 detik antar pembacaan.'],
        ['Library DHT tidak ditemukan', 'Install <b>DHT sensor library</b> dari Adafruit dan <b>Adafruit Unified Sensor</b> lewat Manage Libraries.'],
      ],
    },
    en: {
      title: 'Learn the DHT11 Temperature Sensor with the ESP32',
      h1: 'Lesson 7: The DHT11 Temperature Sensor',
      desc: 'A DHT11 lesson for beginners: wire the temperature and humidity sensor to the ESP32, use the DHT library and read values in the Serial Monitor.',
      intro: 'Your first real sensor: the DHT11 measures air temperature and humidity. You connect its three wires to the ESP32 and print the readings in the Serial Monitor.',
      problems: [
        ['NaN or "failed to read"', 'Check that the DATA wire goes to the same pin as in the code, and wait at least 1 second between reads.'],
        ['The DHT library is missing', 'Install the Adafruit <b>DHT sensor library</b> and <b>Adafruit Unified Sensor</b> from Manage Libraries.'],
      ],
    },
  },

  motor: {
    slug: { id: 'motor-dc-l298n-pemula', en: 'esp32-l298n-lesson' }, project: 'motor',
    id: {
      title: 'Belajar Motor DC + L298N dengan ESP32 untuk Pemula',
      h1: 'Pelajaran 8: Motor DC dengan Driver L298N',
      desc: 'Pelajaran motor DC untuk pemula: kenapa motor butuh driver L298N, cara menyambung baterai dan GND bersama, serta mengatur arah dan kecepatan dengan ESP32.',
      intro: 'Motor butuh arus besar dan tidak boleh disambung langsung ke pin ESP32. Di pelajaran ini kamu memakai driver L298N dan baterai terpisah untuk memutar motor maju dan mundur.',
      problems: [
        ['Motor diam saja', 'GND baterai dan GND ESP32 harus disatukan, dan jumper ENA di modul L298N harus dilepas supaya PWM bekerja.'],
        ['ESP32 restart saat motor berputar', 'Motor jangan diberi daya dari ESP32. Pakai baterai terpisah untuk motor.'],
      ],
    },
    en: {
      title: 'Learn DC Motors with an L298N and the ESP32',
      h1: 'Lesson 8: A DC Motor with an L298N Driver',
      desc: 'A DC motor lesson for beginners: why a motor needs an L298N driver, how to wire the battery and a shared GND, and how to set direction and speed with the ESP32.',
      intro: 'A motor needs a lot of current and must never be connected straight to an ESP32 pin. In this lesson you use an L298N driver and a separate battery to run a motor forward and backward.',
      problems: [
        ['The motor does not move', 'The battery GND and ESP32 GND must be joined, and the ENA jumper on the L298N must be removed for PWM to work.'],
        ['The ESP32 restarts when the motor runs', 'Never power the motor from the ESP32. Use a separate battery for the motor.'],
      ],
    },
  },

  car: {
    slug: { id: 'mobil-robot-esp32', en: 'esp32-robot-car' }, project: 'motor',
    id: {
      title: 'Mobil Robot ESP32 2 Roda dengan L298N',
      h1: 'Pelajaran 9: Membuat Mobil Robot 2 Roda',
      desc: 'Pelajaran terakhir: rakit mobil robot 2 roda dengan ESP32, L298N, dan dua motor TT, lalu kendalikan maju, mundur, belok kiri dan kanan dari Serial Monitor.',
      intro: 'Semua yang sudah kamu pelajari digabung di sini. Dua motor dikendalikan satu driver L298N, dan ESP32 menerima perintah huruf dari Serial Monitor untuk maju, mundur, dan berbelok.',
      parts: ['ESP32 DevKit V1', 'Driver motor L298N', 'Motor DC gearbox (TT) + roda ×2', 'Baterai 2×18650 (7.4 V) + holder', 'Kabel jumper ×10'],
      wiring: [['D27, D26', 'IN1, IN2 L298N (motor kiri)'], ['D14', 'ENA L298N (lepas jumper ENA)'], ['D25, D33', 'IN3, IN4 L298N (motor kanan)'], ['D32', 'ENB L298N (lepas jumper ENB)'], ['GND ESP32', 'GND L298N dan − baterai'], ['Baterai +', 'Terminal 12V L298N']],
      problems: [
        ['Mobil berputar di tempat saat disuruh maju', 'Salah satu motor terpasang terbalik. Tukar dua kabel motor itu di terminal OUT L298N.'],
        ['Mobil berbelok sendiri saat maju', 'Dua motor TT jarang persis sama cepat. Kurangi sedikit nilai PWM motor yang lebih cepat.'],
      ],
    },
    en: {
      title: 'Build a 2-Wheel ESP32 Robot Car with an L298N',
      h1: 'Lesson 9: Build a Two-Wheel Robot Car',
      desc: 'The final lesson: build a two-wheel robot car with the ESP32, an L298N and two TT motors, then drive it forward, backward, left and right from the Serial Monitor.',
      intro: 'Everything you have learned comes together here. One L298N drives two motors, and the ESP32 takes letter commands from the Serial Monitor to go forward, backward and turn.',
      parts: ['ESP32 DevKit V1', 'L298N motor driver', 'DC gear motor (TT) + wheel ×2', '2×18650 battery (7.4 V) + holder', 'Jumper wires ×10'],
      wiring: [['D27, D26', 'L298N IN1, IN2 (left motor)'], ['D14', 'L298N ENA (remove the ENA jumper)'], ['D25, D33', 'L298N IN3, IN4 (right motor)'], ['D32', 'L298N ENB (remove the ENB jumper)'], ['ESP32 GND', 'L298N GND and battery −'], ['Battery +', 'L298N 12V terminal']],
      problems: [
        ['The car spins on the spot when told to go forward', 'One motor is wired backwards. Swap that motor\'s two wires on the L298N OUT terminals.'],
        ['The car drifts to one side', 'Two TT motors are rarely exactly the same speed. Lower the PWM value of the faster motor a little.'],
      ],
    },
  },
};
