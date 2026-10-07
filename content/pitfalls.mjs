// Artikel "Jebakan ESP32" (/jebakan-esp32/ dan /en/esp32-pitfalls/).
// Isi bagian berupa HTML. {{project:id}} diganti alamat halaman project, {{home}} alamat beranda
// (sesuai bahasa) oleh tools/build.mjs. id bagian dipakai sebagai #anchor dari halaman project.

export const PITFALLS = {
  published: '2026-10-07',
  id: {
    slug: 'jebakan-esp32',
    title: '6 Jebakan ESP32 untuk Pemula: ADC2, Pin Boot & Brownout',
    h1: '6 Jebakan ESP32 yang Sering Bikin Pemula Bingung',
    desc: 'ADC2 mati saat WiFi aktif, GPIO 34–39 hanya input, strapping pin bikin gagal boot, logika 3.3 V, brownout, dan gagal upload: penyebab dan solusinya.',
    intro: 'ESP32 diprogram hampir sama seperti Arduino Uno, tapi ada beberapa aturan yang berbeda. Kalau tidak tahu, rangkaian yang terlihat benar bisa tidak jalan, board bisa restart sendiri, atau upload gagal terus. Berikut enam jebakan yang paling sering terjadi pada ESP32 DevKit V1 30 pin, lengkap dengan gejala dan cara mengatasinya.',
    toc: 'Daftar isi',
    sections: [
      { id: 'adc2-wifi', h2: '1. Pin ADC2 tidak bisa membaca analog saat WiFi aktif', html: `
<p><b>Gejala:</b> <code>analogRead</code> bekerja normal, tapi begitu <code>WiFi.begin()</code> dipanggil, nilainya jadi 0 atau tidak berubah.</p>
<p><b>Penyebab:</b> ESP32 punya dua ADC. ADC2 dipakai bersama oleh driver WiFi, jadi selama WiFi aktif, pin ADC2 tidak bisa dibaca dari program. Pin ADC2 di DevKit V1 adalah GPIO 0, 2, 4, 12, 13, 14, 15, 25, 26, dan 27.</p>
<p><b>Solusi:</b> untuk sensor analog di project WiFi, pakai pin ADC1: <b>GPIO 32, 33, 34, 35, 36 (VP), dan 39 (VN)</b>. Contohnya potensiometer atau sensor kelembapan tanah di GPIO 34.</p>
<pre><code>const int SENSOR_PIN = 34;   // ADC1, aman dipakai bersama WiFi
int nilai = analogRead(SENSOR_PIN);   // 0 - 4095</code></pre>
<p>Lihat juga project {{project:webled}} dan {{project:dhtweb}}.</p>` },
      { id: 'gpio-34-39', h2: '2. GPIO 34–39 hanya bisa input', html: `
<p><b>Gejala:</b> LED di GPIO 34 tidak pernah menyala, atau tombol di GPIO 35 terbaca acak walaupun sudah memakai <code>INPUT_PULLUP</code>.</p>
<p><b>Penyebab:</b> GPIO 34, 35, 36 (VP), dan 39 (VN) hanya bisa dipakai sebagai input. Pin ini tidak bisa mengeluarkan tegangan, dan juga tidak punya resistor pull-up atau pull-down internal, sehingga <code>INPUT_PULLUP</code> tidak berpengaruh.</p>
<p><b>Solusi:</b> pakai pin ini untuk sensor analog atau sinyal yang sudah punya tegangan tetap. Untuk tombol, pilih pin lain seperti GPIO 4 atau 13, atau tambahkan resistor pull-up 10 kΩ ke 3.3 V. Ingat juga GPIO 6–11 dipakai memori flash dan tidak boleh disentuh.</p>
<p>Contoh tombol yang benar ada di project {{project:button}}.</p>` },
      { id: 'strapping-pins', h2: '3. Strapping pin bikin ESP32 gagal boot atau gagal upload', html: `
<p><b>Gejala:</b> board tidak mau jalan setelah dicolok, Serial Monitor diam, atau upload hanya berhasil kalau kabel ke pin tertentu dicabut dulu.</p>
<p><b>Penyebab:</b> beberapa pin dibaca chip tepat saat menyala untuk menentukan mode boot. Pin ini disebut <i>strapping pin</i>:</p>
<ul>
<li><b>GPIO 0</b>: kalau LOW saat menyala, ESP32 masuk mode upload. Tombol BOOT di board menarik pin ini ke LOW.</li>
<li><b>GPIO 2</b>: harus LOW atau mengambang saat masuk mode upload. Di DevKit V1 pin ini juga tersambung ke LED biru.</li>
<li><b>GPIO 12</b>: kalau HIGH saat menyala, chip mengira memori flash bekerja di 1.8 V, sehingga modul ESP32-WROOM-32 gagal boot.</li>
<li><b>GPIO 15</b>: kalau LOW saat menyala, pesan boot di Serial Monitor tidak muncul.</li>
<li><b>GPIO 5</b> juga strapping pin, tapi aman untuk sinyal biasa seperti TRIG sensor ultrasonik.</li>
</ul>
<p><b>Solusi:</b> jangan pasang resistor pull-up di GPIO 12, dan hindari rangkaian yang menarik GPIO 0, 2, atau 15 ke level yang salah saat menyala. Pin output yang paling aman untuk pemula: <b>GPIO 4, 13, 16–19, 21–23, 25–27, 32, dan 33</b>. Warna tiap pin di {{home:pinout}} menunjukkan tingkat keamanannya.</p>` },
      { id: '3v3-logic', h2: '4. ESP32 bekerja di 3.3 V, bukan 5 V', html: `
<p><b>Gejala:</b> pin tertentu tidak lagi merespons, sensor terbaca aneh, atau ESP32 rusak setelah dipakai dengan modul 5 V.</p>
<p><b>Penyebab:</b> semua GPIO ESP32 bekerja di 3.3 V dan tidak dirancang menerima 5 V. Arduino Uno bekerja di 5 V, jadi banyak modul dan tutorial lama mengirim sinyal 5 V.</p>
<p><b>Solusi:</b> kalau sebuah modul mengeluarkan sinyal 5 V ke ESP32, turunkan dulu tegangannya. Contoh paling umum adalah pin ECHO sensor ultrasonik HC-SR04: sambungkan ECHO → resistor 1 kΩ → pin ESP32, lalu pin ESP32 → resistor 2 kΩ → GND. Hasilnya 5 V × 2 / (1 + 2) ≈ 3.3 V. Untuk sinyal dua arah seperti I2C ke modul 5 V, pakai modul level shifter.</p>
<p>Arah sebaliknya biasanya aman: banyak modul 5 V tetap membaca sinyal 3.3 V dari ESP32 sebagai HIGH. Rangkaian lengkapnya ada di project {{project:sonar}}.</p>` },
      { id: 'brownout', h2: '5. ESP32 restart terus karena brownout', html: `
<p><b>Gejala:</b> ESP32 restart sendiri saat motor mulai berputar, servo bergerak, relay berbunyi klik, atau WiFi baru menyala. Serial Monitor menampilkan <code>Brownout detector was triggered</code>.</p>
<p><b>Penyebab:</b> tegangan sesaat turun terlalu rendah, dan chip sengaja me-reset diri supaya tidak berjalan dengan daya yang tidak stabil. Motor, servo, dan WiFi menarik lonjakan arus yang tidak sanggup dipenuhi kabel USB tipis atau port USB yang lemah.</p>
<p><b>Solusi:</b></p>
<ul>
<li>Beri motor dan servo catu daya sendiri (misalnya baterai), lalu <b>satukan GND</b>-nya dengan GND ESP32.</li>
<li>Pakai kabel USB yang pendek dan bagus, langsung ke laptop atau adaptor 5 V minimal 1 A.</li>
<li>Pasang kapasitor elektrolit 470–1000 µF di terminal daya driver motor.</li>
<li>Jangan sekadar mematikan brownout detector. Masalah dayanya tetap ada dan program bisa berjalan kacau.</li>
</ul>
<p>Lihat project {{project:motor}}, {{project:servo}}, dan {{project:relay}}.</p>` },
      { id: 'upload-failed', h2: '6. Upload gagal: "Failed to connect to ESP32"', html: `
<p><b>Gejala:</b> Arduino IDE berhenti di <code>Connecting......</code> lalu muncul <code>Failed to connect to ESP32: Wrong boot mode detected</code> atau <code>Timed out waiting for packet header</code>. Kadang port tidak muncul sama sekali.</p>
<p><b>Penyebab dan solusi:</b></p>
<ul>
<li><b>Board tidak masuk mode upload otomatis.</b> Tahan tombol BOOT saat tulisan Connecting muncul, lepas setelah persentase upload berjalan.</li>
<li><b>Kabel USB hanya untuk charge.</b> Kabel ini tidak membawa data. Ganti dengan kabel data.</li>
<li><b>Driver USB belum terpasang.</b> Lihat tulisan di chip kecil dekat port USB: install driver <b>CP210x</b> atau <b>CH340</b> sesuai chip tersebut.</li>
<li><b>Port dipakai program lain.</b> Tutup Serial Monitor di jendela lain, Serial Plotter, atau aplikasi lain yang membuka port yang sama.</li>
<li><b>Rangkaian mengganggu strapping pin.</b> Cabut sementara kabel di GPIO 0, 2, 12, dan 15, lalu coba upload lagi.</li>
<li><b>Koneksi kurang stabil.</b> Turunkan Tools → Upload Speed ke 115200.</li>
</ul>
<p>Mulai dari project paling sederhana, {{project:blink}}, untuk memastikan upload sudah lancar.</p>` },
    ],
    outro: 'Masih ada masalah yang belum tercantum di sini? Kirim lewat form kritik dan saran di {{home:saran}}.',
    outroLink: 'beranda',
  },
  en: {
    slug: 'esp32-pitfalls',
    title: '6 ESP32 Pitfalls for Beginners: ADC2, Boot Pins & Brownout',
    h1: '6 ESP32 Pitfalls That Trip Up Beginners',
    desc: 'ADC2 stops working with WiFi, GPIO 34–39 are input only, strapping pins break booting, 3.3 V logic, brownouts and failed uploads: causes and fixes.',
    intro: 'You program the ESP32 almost like an Arduino Uno, but a few rules are different. Without knowing them, a circuit that looks right may not work, the board may keep restarting, or uploads may fail. Here are the six pitfalls that come up most on the 30-pin ESP32 DevKit V1, with symptoms and fixes.',
    toc: 'Contents',
    sections: [
      { id: 'adc2-wifi', h2: '1. ADC2 pins cannot read analog values while WiFi is on', html: `
<p><b>Symptom:</b> <code>analogRead</code> works, but as soon as <code>WiFi.begin()</code> runs the value drops to 0 or stops changing.</p>
<p><b>Cause:</b> the ESP32 has two ADCs. ADC2 is shared with the WiFi driver, so while WiFi is active your program cannot read ADC2 pins. On the DevKit V1 the ADC2 pins are GPIO 0, 2, 4, 12, 13, 14, 15, 25, 26 and 27.</p>
<p><b>Fix:</b> for analog sensors in WiFi projects, use ADC1 pins: <b>GPIO 32, 33, 34, 35, 36 (VP) and 39 (VN)</b>. For example, put a potentiometer or soil moisture sensor on GPIO 34.</p>
<pre><code>const int SENSOR_PIN = 34;   // ADC1, safe to use with WiFi
int value = analogRead(SENSOR_PIN);   // 0 - 4095</code></pre>
<p>See also the {{project:webled}} and {{project:dhtweb}} projects.</p>` },
      { id: 'gpio-34-39', h2: '2. GPIO 34–39 are input only', html: `
<p><b>Symptom:</b> an LED on GPIO 34 never lights, or a button on GPIO 35 reads randomly even with <code>INPUT_PULLUP</code>.</p>
<p><b>Cause:</b> GPIO 34, 35, 36 (VP) and 39 (VN) can only be inputs. They cannot output a voltage, and they have no internal pull-up or pull-down resistors, so <code>INPUT_PULLUP</code> has no effect.</p>
<p><b>Fix:</b> use these pins for analog sensors or signals that already have a defined level. For buttons, pick another pin such as GPIO 4 or 13, or add a 10 kΩ pull-up resistor to 3.3 V. Also remember GPIO 6–11 belong to the flash memory and must not be used.</p>
<p>A correctly wired button is in the {{project:button}} project.</p>` },
      { id: 'strapping-pins', h2: '3. Strapping pins stop the ESP32 from booting or uploading', html: `
<p><b>Symptom:</b> the board does nothing after power-up, the Serial Monitor stays silent, or uploads only work after unplugging a certain wire.</p>
<p><b>Cause:</b> some pins are sampled by the chip at power-up to choose the boot mode. They are called <i>strapping pins</i>:</p>
<ul>
<li><b>GPIO 0</b>: LOW at power-up puts the ESP32 into upload mode. The BOOT button pulls this pin LOW.</li>
<li><b>GPIO 2</b>: must be LOW or floating to enter upload mode. On the DevKit V1 it also drives the blue LED.</li>
<li><b>GPIO 12</b>: HIGH at power-up makes the chip assume 1.8 V flash, so an ESP32-WROOM-32 module fails to boot.</li>
<li><b>GPIO 15</b>: LOW at power-up silences the boot messages in the Serial Monitor.</li>
<li><b>GPIO 5</b> is also a strapping pin, but it is fine for ordinary signals such as an ultrasonic sensor TRIG.</li>
</ul>
<p><b>Fix:</b> never put a pull-up resistor on GPIO 12, and avoid circuits that pull GPIO 0, 2 or 15 to the wrong level at power-up. The safest output pins for beginners are <b>GPIO 4, 13, 16–19, 21–23, 25–27, 32 and 33</b>. The pin colours in the {{home:pinout}} show how safe each one is.</p>` },
      { id: '3v3-logic', h2: '4. The ESP32 runs at 3.3 V, not 5 V', html: `
<p><b>Symptom:</b> a pin stops responding, a sensor reads strangely, or the ESP32 dies after being used with 5 V modules.</p>
<p><b>Cause:</b> every ESP32 GPIO works at 3.3 V and is not designed to accept 5 V. The Arduino Uno runs at 5 V, so many modules and older tutorials send 5 V signals.</p>
<p><b>Fix:</b> when a module outputs 5 V towards the ESP32, bring the voltage down first. The classic case is the ECHO pin of an HC-SR04 ultrasonic sensor: wire ECHO → 1 kΩ resistor → ESP32 pin, then ESP32 pin → 2 kΩ resistor → GND. That gives 5 V × 2 / (1 + 2) ≈ 3.3 V. For two-way signals such as I2C to a 5 V module, use a level shifter module.</p>
<p>The other direction is usually fine: many 5 V modules still read the ESP32's 3.3 V as HIGH. The full circuit is in the {{project:sonar}} project.</p>` },
      { id: 'brownout', h2: '5. The ESP32 keeps restarting because of brownouts', html: `
<p><b>Symptom:</b> the ESP32 resets by itself when a motor starts, a servo moves, a relay clicks or WiFi switches on. The Serial Monitor shows <code>Brownout detector was triggered</code>.</p>
<p><b>Cause:</b> the supply voltage briefly drops too low, and the chip deliberately resets so it does not run on unstable power. Motors, servos and WiFi pull current spikes that a thin USB cable or a weak USB port cannot deliver.</p>
<p><b>Fix:</b></p>
<ul>
<li>Give motors and servos their own supply (for example a battery), and <b>join its GND</b> to the ESP32 GND.</li>
<li>Use a short, good USB cable straight into the computer or a 5 V adapter rated for at least 1 A.</li>
<li>Add a 470–1000 µF electrolytic capacitor across the motor driver's power terminals.</li>
<li>Do not just disable the brownout detector. The power problem stays, and the program can misbehave.</li>
</ul>
<p>See the {{project:motor}}, {{project:servo}} and {{project:relay}} projects.</p>` },
      { id: 'upload-failed', h2: '6. Upload fails: "Failed to connect to ESP32"', html: `
<p><b>Symptom:</b> the Arduino IDE stops at <code>Connecting......</code>, then shows <code>Failed to connect to ESP32: Wrong boot mode detected</code> or <code>Timed out waiting for packet header</code>. Sometimes the port does not appear at all.</p>
<p><b>Causes and fixes:</b></p>
<ul>
<li><b>The board does not enter upload mode on its own.</b> Hold the BOOT button when Connecting appears and release it once the upload percentage starts.</li>
<li><b>A charge-only USB cable.</b> It carries no data. Use a data cable.</li>
<li><b>The USB driver is missing.</b> Read the small chip next to the USB port and install the <b>CP210x</b> or <b>CH340</b> driver to match.</li>
<li><b>Another program holds the port.</b> Close Serial Monitors in other windows, the Serial Plotter, or any app using the same port.</li>
<li><b>The circuit disturbs a strapping pin.</b> Temporarily unplug wires on GPIO 0, 2, 12 and 15, then upload again.</li>
<li><b>An unstable connection.</b> Lower Tools → Upload Speed to 115200.</li>
</ul>
<p>Start with the simplest project, {{project:blink}}, to confirm uploads work.</p>` },
    ],
    outro: 'Hit a problem that is not listed here? Send it through the feedback form on the {{home:saran}}.',
    outroLink: 'home page',
  },
};
