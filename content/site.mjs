// Teks umum untuk halaman yang dibuat tools/build.mjs (beranda, daftar, panduan project, pelajaran, artikel).
// Setiap teks punya versi Indonesia (id) dan Inggris (en).

export const SITE = {
  name: 'ESP32 Lab',
  // alamat situs yang sudah online, dipakai untuk canonical, og:url, dan sitemap
  url: 'https://zakycahyohadi.github.io/learn-esp32/',
  repo: 'https://github.com/zakycahyohadi/learn-esp32',
  ogImage: 'img/og.jpg', ogImageW: 1200, ogImageH: 630,
};

export const HOME = {
  id: {
    title: 'Belajar ESP32 dari Nol: Simulator Online & Pinout 3D',
    desc: 'Belajar ESP32 gratis di browser: simulator breadboard yang menjalankan kode Arduino, pinout 3D 30 pin, 11 project, dan 9 pelajaran dari nol.',
    ogAlt: 'Simulator breadboard ESP32 di laptop dan pinout 3D di HP',
  },
  en: {
    title: 'Learn ESP32 from Scratch: Online Simulator & 3D Pinout',
    desc: 'Learn the ESP32 free in your browser: a breadboard simulator that runs Arduino code, a 3D 30-pin pinout, 11 projects and 9 lessons from zero.',
    ogAlt: 'ESP32 breadboard simulator on a laptop and the 3D pinout on a phone',
  },
};

export const UI = {
  id: {
    home: 'Beranda', projects: 'Project', lessons: 'Belajar', pitfalls: 'Jebakan ESP32', simulator: 'Simulator', pinout: 'Pinout 3D',
    projectsTitle: '11 Project ESP32 untuk Pemula, Lengkap dengan Kode',
    projectsDesc: 'Daftar 11 project ESP32 dari LED berkedip sampai motor DC: daftar alat, sambungan kabel, kode Arduino, dan solusi masalah umum. Bisa dicoba di simulator.',
    projectsH1: '11 Project ESP32 untuk Pemula',
    projectsLede: 'Mulai dari LED berkedip, lanjut ke sensor, WiFi, sampai motor. Tiap project berisi daftar alat, tabel kabel, kode Arduino lengkap, dan solusi masalah yang paling sering muncul.',
    lessonsTitle: 'Belajar ESP32 dari Nol: 9 Pelajaran Bertahap',
    lessonsDesc: '9 pelajaran ESP32 bertahap untuk pemula: listrik, breadboard, LED, kode blink, tombol, analogRead, PWM, sensor DHT11, motor L298N, sampai mobil robot.',
    lessonsH1: 'Belajar ESP32 dari Nol: 9 Pelajaran',
    lessonsLede: 'Urutan belajar dari yang paling dasar. Tiap pelajaran bisa langsung dipraktikkan di simulator, dan setiap langkah dicek otomatis.',
    youNeed: 'Yang kamu butuhkan', libs: 'Library yang perlu diinstall', libsHow: 'Install lewat Arduino IDE: Sketch → Include Library → Manage Libraries.',
    wiring: 'Sambungan kabel', from: 'Dari', to: 'Ke', code: 'Kode Arduino lengkap', how: 'Cara kerjanya', problems: 'Masalah yang sering terjadi',
    note: 'Catatan penting', related: 'Project terkait', prev: 'Sebelumnya', next: 'Berikutnya',
    trySim: '▶ Coba di simulator', seeCode: 'Lihat kode', copy: 'Salin kode', copied: 'Tersalin',
    noSim: 'Project WiFi ini tidak bisa dijalankan di simulator. Upload kodenya ke board asli, lalu buka alamat IP-nya dari HP.',
    openProjectPage: 'Buka di halaman project',
    board: 'Ditulis untuk paket board <b>esp32 by Espressif</b> versi 3.x di Arduino IDE, board <b>ESP32 Dev Module</b>.',
    goal: 'Yang dipelajari', steps: 'Langkah di simulator', rule: 'Aturan penting', hint: 'Petunjuk', lessonOf: (n, t) => `Pelajaran ${n} dari ${t}`,
    projectN: n => `Project ${n}`, startLesson: '▶ Mulai pelajaran ini di simulator', allProjects: 'Semua project', allLessons: 'Semua pelajaran',
    relatedProject: 'Project yang berkaitan', readPitfalls: 'Baca juga: 6 jebakan ESP32 yang sering bikin pemula bingung',
    feedback: 'Ada yang kurang jelas atau salah? Kirim saran', source: 'Kode sumber di GitHub',
    footer: 'ESP32 Lab: belajar ESP32 gratis di browser, dengan simulator breadboard, pinout 3D, dan project siap coba.',
    switchLang: 'English', theme: 'Ganti tema terang/gelap', menu: 'Navigasi utama', crumbs: 'Breadcrumb',
  },
  en: {
    home: 'Home', projects: 'Projects', lessons: 'Lessons', pitfalls: 'ESP32 pitfalls', simulator: 'Simulator', pinout: '3D pinout',
    projectsTitle: '11 ESP32 Projects for Beginners, with Full Code',
    projectsDesc: '11 ESP32 projects from a blinking LED to a DC motor: parts lists, wiring tables, Arduino code and fixes for common problems. Try each one in the simulator.',
    projectsH1: '11 ESP32 Projects for Beginners',
    projectsLede: 'Start with a blinking LED, then move on to sensors, WiFi and motors. Every project has a parts list, a wiring table, full Arduino code and fixes for the problems people hit most.',
    lessonsTitle: 'Learn ESP32 from Scratch: 9 Step-by-Step Lessons',
    lessonsDesc: '9 step-by-step ESP32 lessons for beginners: power, breadboards, LEDs, blink code, buttons, analogRead, PWM, the DHT11, an L298N motor and a robot car.',
    lessonsH1: 'Learn ESP32 from Scratch: 9 Lessons',
    lessonsLede: 'A learning path that starts from the very basics. Every lesson runs in the simulator, and each step is checked automatically.',
    youNeed: 'What you need', libs: 'Libraries to install', libsHow: 'Install them in the Arduino IDE: Sketch → Include Library → Manage Libraries.',
    wiring: 'Wiring', from: 'From', to: 'To', code: 'Full Arduino code', how: 'How it works', problems: 'Common problems',
    note: 'Important note', related: 'Related projects', prev: 'Previous', next: 'Next',
    trySim: '▶ Try it in the simulator', seeCode: 'See the code', copy: 'Copy code', copied: 'Copied',
    noSim: 'This WiFi project cannot run in the simulator. Upload the code to a real board, then open its IP address from your phone.',
    openProjectPage: 'Open it on the projects page',
    board: 'Written for the <b>esp32 by Espressif</b> board package 3.x in the Arduino IDE, board <b>ESP32 Dev Module</b>.',
    goal: 'What you will learn', steps: 'Steps in the simulator', rule: 'Key rule', hint: 'Hint', lessonOf: (n, t) => `Lesson ${n} of ${t}`,
    projectN: n => `Project ${n}`, startLesson: '▶ Start this lesson in the simulator', allProjects: 'All projects', allLessons: 'All lessons',
    relatedProject: 'Related project', readPitfalls: 'Also read: 6 ESP32 pitfalls that trip up beginners',
    feedback: 'Something unclear or wrong? Send feedback', source: 'Source code on GitHub',
    footer: 'ESP32 Lab: learn the ESP32 free in your browser, with a breadboard simulator, a 3D pinout and ready-to-try projects.',
    switchLang: 'Bahasa Indonesia', theme: 'Toggle light/dark theme', menu: 'Main navigation', crumbs: 'Breadcrumb',
  },
};
