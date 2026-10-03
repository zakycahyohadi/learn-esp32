(function(){
'use strict';
/* ============ utilitas ============ */
const TAU=Math.PI*2;
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const cssv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function store(k,v){try{if(v===undefined){const s=localStorage.getItem(k);return s?JSON.parse(s):null;}localStorage.setItem(k,JSON.stringify(v));}catch(e){return null;}}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

/* ============ bahasa (ganti instan tanpa memuat ulang) ============ */
let LANG=(function(){try{const w=window.__esp32lab||(window.parent!==window&&window.parent.__esp32lab);return (w&&w.lang)==='en'?'en':'id';}catch(e){return 'id';}})();
class BiStr{constructor(a,b){this.a=a;this.b=b;}toString(){return LANG==='en'?this.b:this.a;}valueOf(){return this.toString();}toJSON(){return this.toString();}get length(){return this.toString().length;}}
['indexOf','includes','startsWith','endsWith','slice','substring','split','replace','toLowerCase','toUpperCase','trim','charAt','charCodeAt','padStart','padEnd','match','concat','localeCompare'].forEach(m=>{BiStr.prototype[m]=function(){return String.prototype[m].apply(this.toString(),arguments);};});
const _L=(a,b)=>new BiStr(a,b);
const LANG_FNS=[];const onLang=f=>LANG_FNS.push(f);
const I18N={recs:[],base:LANG,
  pair(live,alt){const skip=n=>n.nodeType===1&&((n.tagName==='SCRIPT'&&(!n.type||n.type==='text/javascript'))||n.tagName==='TEMPLATE'||n.tagName==='TEXTAREA');
    const kids=n=>Array.prototype.filter.call(n.childNodes,c=>(c.nodeType===1||c.nodeType===3)&&!skip(c));
    const AT=['aria-label','title','placeholder','aria-pressed','content'];const recs=this.recs;
    (function walk(a,b){
      if(a.nodeType===3){if(b.nodeType===3&&a.data!==b.data)recs.push({t:0,n:a,x:a.data,y:b.data});return;}
      if(b.getAttribute)AT.forEach(k=>{const x=a.getAttribute(k),y=b.getAttribute(k);if(x!==y)recs.push({t:1,n:a,k:k,x:x,y:y});});
      const ka=kids(a),kb=kids(b);
      if(ka.length!==kb.length||ka.some((c,i)=>c.nodeType!==kb[i].nodeType||(c.nodeType===1&&c.tagName!==kb[i].tagName))){if(a.innerHTML!==b.innerHTML)recs.push({t:2,n:a,x:a.innerHTML,y:b.innerHTML});return;}
      ka.forEach((c,i)=>walk(c,kb[i]));})(live,alt);},
  apply(){const k=LANG===this.base?'x':'y';for(const r of this.recs){const v=r[k];if(r.t===0){if(r.n.data!==v)r.n.data=v;}else if(r.t===1){if(v==null)r.n.removeAttribute(r.k);else r.n.setAttribute(r.k,v);}else r.n.innerHTML=v;}document.documentElement.lang=LANG;}};
(function(){try{const w=window.__esp32lab;if(w&&w.alt)I18N.pair(document.getElementById('app-root'),w.alt);else{const t=document.getElementById('alt-static');if(t)I18N.pair(document.body,t.content);}}catch(e){console.error(e);}})();
window.__langHook=function(l){LANG=l==='en'?'en':'id';I18N.apply();LANG_FNS.forEach(f=>{try{f();}catch(e){console.error(e);}});};

/* ============ tema ============ */
const themeFns=[];
function isDark(){const a=document.documentElement.getAttribute('data-theme');if(a)return a==='dark';return matchMedia('(prefers-color-scheme: dark)').matches;}
(function(){const s=store('esp32lab-theme');if(s==='dark'||s==='light')document.documentElement.setAttribute('data-theme',s);})();
function fireTheme(){themeFns.forEach(f=>{try{f()}catch(e){}});}
$('#themeBtn').addEventListener('click',()=>{const n=isDark()?'light':'dark';document.documentElement.setAttribute('data-theme',n);store('esp32lab-theme',n);});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',fireTheme);
new MutationObserver(fireTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

/* ============ data pin ============ */
const PIN_L=[
 {id:'EN',label:'EN',gpio:null,fn:['Reset / Enable'],tags:['power'],safe:'bad',note:_L('Pin reset. Kalau disambung ke GND, ESP32 restart. Fungsinya sama dengan tombol EN di board. Bukan GPIO.','Reset pin. Connecting it to GND restarts the ESP32, just like the EN button on the board. Not a GPIO.')},
 {id:'VP',label:'VP',gpio:36,fn:['ADC1_CH0','SENSOR_VP'],tags:['adc','input'],safe:'warn',note:_L('Hanya bisa input dan tidak punya pull-up internal. Bagus untuk sensor analog karena ADC1 tetap bisa dipakai saat WiFi aktif.','Input-only, with no internal pull-up. Good for analog sensors because ADC1 keeps working while WiFi is on.')},
 {id:'VN',label:'VN',gpio:39,fn:['ADC1_CH3','SENSOR_VN'],tags:['adc','input'],safe:'warn',note:_L('Hanya input, tanpa pull-up internal. Cocok untuk sensor analog bersama WiFi.','Input-only, no internal pull-up. Suits analog sensors alongside WiFi.')},
 {id:'D34',label:'D34',gpio:34,fn:['ADC1_CH6'],tags:['adc','input'],safe:'warn',note:_L('Hanya input. Pilihan favorit untuk potensiometer dan sensor analog, termasuk saat WiFi menyala.','Input-only. A favourite for potentiometers and analog sensors, even with WiFi on.')},
 {id:'D35',label:'D35',gpio:35,fn:['ADC1_CH7'],tags:['adc','input'],safe:'warn',note:_L('Hanya input, tanpa pull-up internal. Pakai untuk sensor analog.','Input-only, no internal pull-up. Use it for analog sensors.')},
 {id:'D32',label:'D32',gpio:32,fn:['ADC1_CH4','TOUCH9','PWM'],tags:['adc','touch','pwm'],safe:'ok',note:_L('Serba bisa: digital input/output, analog lewat ADC1 (aman bersama WiFi), dan sensor sentuh.','All-rounder: digital input/output, analog through ADC1 (safe with WiFi), and touch sensing.')},
 {id:'D33',label:'D33',gpio:33,fn:['ADC1_CH5','TOUCH8','PWM'],tags:['adc','touch','pwm'],safe:'ok',note:_L('Serba bisa seperti D32: digital, analog ADC1, dan sentuh.','An all-rounder like D32: digital, ADC1 analog, and touch.')},
 {id:'D25',label:'D25',gpio:25,fn:['DAC1','ADC2_CH8','PWM'],tags:['dac','adc','pwm'],safe:'ok',note:_L('Punya DAC: bisa mengeluarkan tegangan analog sungguhan 0–3.3 V (8-bit) dengan dacWrite. ADC2 tidak bisa dipakai saat WiFi aktif.','Has a DAC: it can output a true analog voltage from 0–3.3 V (8-bit) with dacWrite. ADC2 cannot be used while WiFi is on.')},
 {id:'D26',label:'D26',gpio:26,fn:['DAC2','ADC2_CH9','PWM'],tags:['dac','adc','pwm'],safe:'ok',note:_L('DAC kedua. Juga pin output biasa yang aman, misalnya untuk relay.','The second DAC. Also a safe general output pin, for example for a relay.')},
 {id:'D27',label:'D27',gpio:27,fn:['ADC2_CH7','TOUCH7','PWM'],tags:['adc','touch','pwm'],safe:'ok',note:_L('Pin digital yang aman untuk input maupun output.','A safe digital pin for both input and output.')},
 {id:'D14',label:'D14',gpio:14,fn:['ADC2_CH6','TOUCH6','HSPI CLK','PWM'],tags:['adc','touch','spi','pwm'],safe:'warn',note:_L('Bisa dipakai, tapi mengeluarkan sinyal PWM sesaat ketika boot. Hindari untuk beban yang tidak boleh bergerak saat board menyala.','Usable, but it outputs a brief PWM signal at boot. Avoid it for loads that must not move when the board powers up.')},
 {id:'D12',label:'D12',gpio:12,fn:['ADC2_CH5','TOUCH5','HSPI MISO','PWM','Strapping'],tags:['adc','touch','spi','pwm','strap'],safe:'warn',note:_L('Strapping pin: harus LOW saat boot. Kalau ada rangkaian yang menariknya ke HIGH waktu menyala, ESP32 bisa gagal boot.','Strapping pin: must be LOW at boot. If your circuit pulls it HIGH at power-up, the ESP32 may fail to boot.')},
 {id:'D13',label:'D13',gpio:13,fn:['ADC2_CH4','TOUCH4','HSPI MOSI','PWM'],tags:['adc','touch','spi','pwm'],safe:'ok',note:_L('Pin digital yang aman. Sering dipakai untuk sinyal servo.','A safe digital pin. Often used for servo signals.')},
 {id:'GND_L',label:'GND',gpio:null,fn:['Ground'],tags:['power'],safe:'ok',note:_L('Ground (0 V). Semua ground rangkaian harus tersambung ke sini, termasuk ground catu daya eksternal.','Ground (0 V). Every ground in the circuit must connect here, including the ground of external power supplies.')},
 {id:'VIN',label:'VIN',gpio:null,fn:['5 V'],tags:['power'],safe:'ok',note:_L('Jalur 5 V. Saat dicolok USB, pin ini mengeluarkan sekitar 5 V dari USB, cukup untuk sensor 5 V atau servo kecil. Bisa juga dipakai sebagai input daya 5 V eksternal.','The 5 V line. When plugged into USB this pin gives about 5 V from USB, enough for 5 V sensors or a small servo. It can also be used as an external 5 V power input.')}
];
const PIN_R=[
 {id:'D23',label:'D23',gpio:23,fn:['VSPI MOSI','PWM'],tags:['spi','pwm'],safe:'ok',note:_L('Pin output yang aman dan tidak punya perilaku khusus saat boot. Dipakai untuk LED di banyak project di halaman ini.','A safe output pin with no special boot behaviour. Used for the LED in many projects on this page.')},
 {id:'D22',label:'D22',gpio:22,fn:['I2C SCL','PWM'],tags:['i2c','pwm'],safe:'ok',note:_L('Jalur clock I2C bawaan (Wire). Pasangkan dengan D21 untuk OLED, BME280, dan modul I2C lain.','Default I2C clock line (Wire). Pair it with D21 for OLEDs, BME280s, and other I2C modules.')},
 {id:'TX0',label:'TX0',gpio:1,fn:['UART0 TX'],tags:['uart'],safe:'bad',note:_L('Dipakai untuk upload program dan Serial Monitor lewat USB. Kalau dipakai untuk hal lain, upload dan Serial bisa terganggu.','Used for uploading and the Serial Monitor over USB. Using it for anything else can break uploads and Serial.')},
 {id:'RX0',label:'RX0',gpio:3,fn:['UART0 RX'],tags:['uart'],safe:'bad',note:_L('Pasangan TX0 untuk komunikasi USB. Hindari untuk project.','Partner of TX0 for USB communication. Avoid it in projects.')},
 {id:'D21',label:'D21',gpio:21,fn:['I2C SDA','PWM'],tags:['i2c','pwm'],safe:'ok',note:_L('Jalur data I2C bawaan (Wire). Pasangkan dengan D22.','Default I2C data line (Wire). Pair it with D22.')},
 {id:'D19',label:'D19',gpio:19,fn:['VSPI MISO','PWM'],tags:['spi','pwm'],safe:'ok',note:_L('Jalur MISO untuk SPI (VSPI). Juga aman sebagai GPIO biasa.','MISO line for SPI (VSPI). Also safe as a regular GPIO.')},
 {id:'D18',label:'D18',gpio:18,fn:['VSPI CLK','PWM'],tags:['spi','pwm'],safe:'ok',note:_L('Jalur clock SPI (VSPI). Juga aman sebagai GPIO biasa dan PWM.','SPI clock line (VSPI). Also safe as a regular GPIO and for PWM.')},
 {id:'D5',label:'D5',gpio:5,fn:['VSPI CS','PWM','Strapping'],tags:['spi','pwm','strap'],safe:'warn',note:_L('Strapping pin, dan mengeluarkan PWM sesaat ketika boot. Aman untuk sinyal biasa seperti TRIG sensor ultrasonik.','Strapping pin that outputs a brief PWM signal at boot. Fine for simple signals like an ultrasonic sensor TRIG.')},
 {id:'TX2',label:'TX2',gpio:17,fn:['UART2 TX','PWM'],tags:['uart','pwm'],safe:'ok',note:_L('Serial kedua (Serial2). Cocok untuk modul GPS, SIM800L, atau komunikasi dengan mikrokontroler lain.','The second serial port (Serial2). Good for GPS modules, SIM800L, or talking to another microcontroller.')},
 {id:'RX2',label:'RX2',gpio:16,fn:['UART2 RX','PWM'],tags:['uart','pwm'],safe:'ok',note:_L('Pasangan TX2 untuk Serial2.','Partner of TX2 for Serial2.')},
 {id:'D4',label:'D4',gpio:4,fn:['ADC2_CH0','TOUCH0','PWM'],tags:['adc','touch','pwm'],safe:'ok',note:_L('Pin digital serba guna, aman untuk tombol dan sensor digital seperti DHT11.','General-purpose digital pin, safe for buttons and digital sensors like the DHT11.')},
 {id:'D2',label:'D2',gpio:2,fn:[_L('LED bawaan','Built-in LED'),'ADC2_CH2','TOUCH2','PWM','Strapping'],tags:['adc','touch','pwm','strap'],safe:'warn',note:_L('Terhubung ke LED biru di board (lihat LED-nya berkedip). Strapping pin: harus LOW atau mengambang saat masuk mode upload, jadi jangan beri pull-up.','Connected to the blue LED on the board (watch it blink). Strapping pin: must be LOW or floating to enter upload mode, so do not add a pull-up.')},
 {id:'D15',label:'D15',gpio:15,fn:['ADC2_CH3','TOUCH3','HSPI CS','PWM','Strapping'],tags:['adc','touch','spi','pwm','strap'],safe:'warn',note:_L('Strapping pin: kalau LOW saat boot, pesan boot di Serial tidak muncul. Mengeluarkan PWM sesaat ketika boot.','Strapping pin: if LOW at boot, the boot messages on Serial are silenced. Outputs a brief PWM signal at boot.')},
 {id:'GND_R',label:'GND',gpio:null,fn:['Ground'],tags:['power'],safe:'ok',note:_L('Ground (0 V). Sama dengan GND di sisi seberang.','Ground (0 V). Same as the GND on the other side.')},
 {id:'3V3',label:'3V3',gpio:null,fn:['3.3 V'],tags:['power'],safe:'ok',note:_L('Output 3.3 V dari regulator di board. Pakai untuk sensor 3.3 V, jangan untuk motor atau beban besar.','3.3 V output from the on-board regulator. Use it for 3.3 V sensors, not for motors or heavy loads.')}
];
const PINS=[];
PIN_L.forEach((p,i)=>{p.side='L';p.idx=i;PINS.push(p);});
PIN_R.forEach((p,i)=>{p.side='R';p.idx=i;PINS.push(p);});
const PIN_BY={};PINS.forEach(p=>PIN_BY[p.id]=p);
const PIN_X=i=>1.55-i*0.254;
const PIN_Z={L:-1.15,R:1.15};
const SAFE_TXT={ok:_L('Aman','Safe'),warn:_L('Ada syarat','Conditions'),bad:_L('Hindari','Avoid')};
function pinExample(p){
  if(p.gpio===null||p.safe==='bad')return '';
  if(p.tags.includes('dac'))return `dacWrite(${p.gpio}, 128);      // ~1.65 V\npinMode(${p.gpio}, OUTPUT);`;
  if(p.tags.includes('input'))return _L(`int nilai = analogRead(${p.gpio});  // 0–4095`,`int value = analogRead(${p.gpio});  // 0–4095`);
  if(p.tags.includes('i2c'))return `Wire.begin(21, 22);  // SDA, SCL`;
  return `pinMode(${p.gpio}, OUTPUT);\ndigitalWrite(${p.gpio}, HIGH);`;
}

/* ============ highlight kode ============ */
function hl(src){
  const re=/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])')|(^[ \t]*#\w+)|\b(\d+(?:\.\d+)?)\b|\b(void|int|float|long|bool|char|const|String|return|if|else|for|while|static|true|false|unsigned|double|HIGH|LOW|OUTPUT|INPUT|INPUT_PULLUP)\b|\b([A-Za-z_]\w*)(?=\s*\()/gm;
  let out='',last=0,m;
  while((m=re.exec(src))){
    out+=esc(src.slice(last,m.index));const t=esc(m[0]);
    const cls=m[1]?'c':m[2]?'s':m[3]?'p':m[4]?'n':m[5]?'k':'f';
    out+=`<span class="${cls}">${t}</span>`;last=m.index+m[0].length;
  }
  return out+esc(src.slice(last));
}
function codeOf(id){const el=document.getElementById('code-'+id);return el?el.textContent.replace(/^\s*\n/,'').replace(/\s+$/,'')+'\n':'';}
function copyText(text,btn,sel){
  const done=ok=>{const o=btn.textContent;btn.textContent=ok?_L('Tersalin','Copied'):_L('Pilih teks lalu salin','Select the text and copy');setTimeout(()=>btn.textContent=o,1500);};
  try{navigator.clipboard.writeText(text).then(()=>done(true),()=>{selectEl(sel);done(false);});}catch(e){selectEl(sel);done(false);}
}
function selectEl(el){if(!el)return;const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);}

/* ============ bagian non-3D: setup, jalur belajar ============ */
$('#copyUrl').addEventListener('click',e=>copyText($('#boardUrl').textContent,e.currentTarget,$('#boardUrl')));

/* ============ PROJECT meta (teks) ============ */
const K='#26292d',RED='#d63a2f',YEL='#f0b429',GRN='#2fa85a',BLU='#2f7fd6',ORG='#f07c1a',PUR='#8a5cd6',WHT='#e4e4e4',BRN='#7a4a26';
const PROJECTS=[
 {id:'blink',cat:_L('Dasar','Basics'),title:_L('LED berkedip','Blinking LED'),desc:_L('Program pertama di mikrokontroler mana pun: nyalakan dan matikan LED setiap detik lewat GPIO 23.','The first program on any microcontroller: turn an LED on and off every second through GPIO 23.'),
  parts:['ESP32 DevKit V1','LED 5 mm','Resistor 220 Ω','Breadboard',_L('Kabel jumper male-male ×3','Male-male jumper wires ×3')],libs:[],
  wiring:[['D23',_L('Resistor 220 Ω, lanjut ke kaki panjang LED (anoda)','220 Ω resistor, then the LED long leg (anode)'),YEL],[_L('Kaki pendek LED (katoda)','LED short leg (cathode)'),_L('Jalur – (GND) breadboard','Breadboard – (GND) rail'),K],['GND',_L('Jalur – (GND) breadboard','Breadboard – (GND) rail'),K]],
  note:_L('Resistor membatasi arus supaya LED dan pin tidak rusak. Kaki panjang LED adalah anoda (+).','The resistor limits the current so the LED and the pin are not damaged. The LED long leg is the anode (+).')},
 {id:'button',cat:_L('Dasar','Basics'),title:_L('Tombol dan LED','Button and LED'),desc:_L('Baca tombol dengan pull-up internal. LED menyala selama tombol ditekan.','Read a button with the internal pull-up. The LED stays on while the button is held.'),
  parts:['ESP32 DevKit V1',_L('Push button 4 kaki','4-leg push button'),'LED 5 mm','Resistor 220 Ω','Breadboard',_L('Kabel jumper ×5','Jumper wires ×5')],libs:[],
  wiring:[['D4',_L('Kaki tombol (sisi seberang parit)','Button leg (across the centre gap)'),BLU],[_L('Kaki tombol diagonalnya','The diagonal button leg'),_L('Jalur – (GND)','– (GND) rail'),K],['D23',_L('Resistor 220 Ω → anoda LED','220 Ω resistor → LED anode'),YEL],[_L('Katoda LED','LED cathode'),_L('Jalur – (GND)','– (GND) rail'),K],['GND',_L('Jalur – (GND)','– (GND) rail'),K]],
  note:_L('INPUT_PULLUP menyalakan resistor pull-up di dalam chip, jadi tidak perlu resistor tambahan. Dilepas = HIGH, ditekan = LOW.','INPUT_PULLUP turns on the pull-up resistor inside the chip, so no extra resistor is needed. Released = HIGH, pressed = LOW.')},
 {id:'fade',cat:_L('Dasar','Basics'),title:_L('LED redup-terang (PWM)','Fading LED (PWM)'),desc:_L('Pakai PWM (ledcWrite) supaya LED menyala perlahan lalu meredup, seperti napas.','Use PWM (ledcWrite) so the LED slowly brightens and dims, like breathing.'),
  parts:['ESP32 DevKit V1','LED 5 mm','Resistor 220 Ω','Breadboard',_L('Kabel jumper ×3','Jumper wires ×3')],libs:[],
  wiring:[['D18',_L('Resistor 220 Ω → anoda LED','220 Ω resistor → LED anode'),YEL],[_L('Katoda LED','LED cathode'),_L('Jalur – (GND)','– (GND) rail'),K],['GND',_L('Jalur – (GND)','– (GND) rail'),K]],
  note:_L('Di paket board ESP32 versi 3.x, pakai ledcAttach(pin, frekuensi, resolusi) lalu ledcWrite(pin, nilai). Versi 2.x memakai ledcSetup dan ledcAttachPin.','In the ESP32 board package 3.x, use ledcAttach(pin, frequency, resolution) and then ledcWrite(pin, value). Version 2.x uses ledcSetup and ledcAttachPin.')},
 {id:'dht',cat:_L('Sensor','Sensors'),title:_L('Suhu & kelembapan DHT11','DHT11 temperature & humidity'),desc:_L('Baca suhu dan kelembapan setiap 2 detik, lalu tampilkan di Serial Monitor.','Read temperature and humidity every 2 seconds and show them in the Serial Monitor.'),
  parts:['ESP32 DevKit V1',_L('Modul DHT11 (3 pin)','DHT11 module (3 pins)'),'Breadboard',_L('Kabel jumper ×5','Jumper wires ×5')],libs:['DHT sensor library (Adafruit)','Adafruit Unified Sensor'],
  wiring:[['D4',_L('DATA (atau S) DHT11','DHT11 DATA (or S)'),GRN],['3V3',_L('VCC (+) DHT11 lewat jalur + breadboard','DHT11 VCC (+) through the breadboard + rail'),RED],['GND',_L('GND (–) DHT11 lewat jalur –','DHT11 GND (–) through the – rail'),K]],
  note:_L('Kalau memakai sensor DHT11 tanpa modul (4 kaki), tambahkan resistor 10 kΩ dari DATA ke VCC. Rentang DHT11: 0–50 °C dan 20–90 %.','If you use a bare DHT11 sensor (4 legs), add a 10 kΩ resistor from DATA to VCC. DHT11 range: 0–50 °C and 20–90 %.')},
 {id:'sonar',cat:_L('Sensor','Sensors'),title:_L('Sensor jarak HC-SR04','HC-SR04 distance sensor'),desc:_L('Kirim bunyi ultrasonik, ukur waktu pantulnya, lalu hitung jaraknya dalam cm.','Send an ultrasonic ping, time the echo, and work out the distance in cm.'),
  parts:['ESP32 DevKit V1','HC-SR04',_L('Resistor 1 kΩ dan 2 kΩ (pembagi tegangan)','1 kΩ and 2 kΩ resistors (voltage divider)'),'Breadboard',_L('Kabel jumper ×6','Jumper wires ×6')],libs:[],
  wiring:[['VIN (5 V)','VCC HC-SR04',RED],['D5','TRIG',ORG],['D18',_L('ECHO lewat pembagi tegangan 1 kΩ / 2 kΩ','ECHO through a 1 kΩ / 2 kΩ voltage divider'),PUR],['GND','GND HC-SR04',K]],
  note:_L('ECHO mengeluarkan 5 V, sedangkan GPIO ESP32 hanya tahan 3.3 V. Sambungkan ECHO → 1 kΩ → D18, lalu D18 → 2 kΩ → GND. Rumus: jarak = waktu × 0.0343 / 2.','ECHO outputs 5 V, but ESP32 GPIOs only tolerate 3.3 V. Wire ECHO → 1 kΩ → D18, then D18 → 2 kΩ → GND. Formula: distance = time × 0.0343 / 2.')},
 {id:'pir',cat:_L('Sensor','Sensors'),title:_L('Detektor gerak PIR','PIR motion detector'),desc:_L('Sensor PIR HC-SR501 mendeteksi gerakan tubuh. LED menyala selama ada gerakan.','The HC-SR501 PIR sensor detects body movement. The LED stays on while there is motion.'),
  parts:['ESP32 DevKit V1',_L('Sensor PIR HC-SR501','HC-SR501 PIR sensor'),_L('LED + resistor 220 Ω','LED + 220 Ω resistor'),'Breadboard',_L('Kabel jumper ×6','Jumper wires ×6')],libs:[],
  wiring:[['VIN (5 V)','VCC PIR',RED],['D27','OUT PIR',PUR],['GND','GND PIR',K],['D23',_L('Resistor 220 Ω → anoda LED','220 Ω resistor → LED anode'),YEL]],
  note:_L('PIR butuh sekitar 30–60 detik setelah menyala untuk stabil. Dua trimpot oranye di bawahnya mengatur jarak deteksi dan lama OUT tetap HIGH. Output OUT sudah 3.3 V, aman untuk ESP32.','The PIR needs about 30–60 seconds after power-up to settle. The two orange trimmers underneath set the detection range and how long OUT stays HIGH. OUT is already 3.3 V, so it is safe for the ESP32.')},
 {id:'webled',cat:'IoT / WiFi',title:_L('Web server kontrol LED','LED control web server'),desc:_L('ESP32 tersambung ke WiFi rumah dan menjalankan halaman web. Buka IP-nya di browser HP, tekan ON atau OFF.','The ESP32 joins your home WiFi and serves a web page. Open its IP in your phone browser and tap ON or OFF.'),
  parts:['ESP32 DevKit V1',_L('LED + resistor 220 Ω','LED + 220 Ω resistor'),'Breadboard',_L('Router WiFi 2.4 GHz','2.4 GHz WiFi router'),_L('HP di jaringan WiFi yang sama','A phone on the same WiFi network')],libs:[_L('WiFi dan WebServer (sudah termasuk paket board)','WiFi and WebServer (included with the board package)')],
  wiring:[['D23',_L('Resistor 220 Ω → anoda LED','220 Ω resistor → LED anode'),YEL],[_L('Katoda LED','LED cathode'),'GND',K]],
  note:_L('Ganti NAMA_WIFI dan PASSWORD_WIFI. Setelah upload, buka Serial Monitor untuk melihat alamat IP, lalu ketik alamat itu di browser HP yang tersambung ke WiFi yang sama.','Replace WIFI_NAME and WIFI_PASSWORD. After uploading, open the Serial Monitor to see the IP address, then type that address into a phone browser on the same WiFi.')},
 {id:'dhtweb',cat:'IoT / WiFi',title:_L('Monitor suhu lewat WiFi','Temperature monitor over WiFi'),desc:_L('Gabungkan DHT11 dan web server: HP menampilkan suhu dan kelembapan yang diperbarui tiap 5 detik.','Combine the DHT11 with a web server: your phone shows temperature and humidity, updated every 5 seconds.'),
  parts:['ESP32 DevKit V1',_L('Modul DHT11','DHT11 module'),'Breadboard',_L('Kabel jumper ×5','Jumper wires ×5'),_L('Router WiFi 2.4 GHz','2.4 GHz WiFi router')],libs:['DHT sensor library (Adafruit)','Adafruit Unified Sensor'],
  wiring:[['D4','DATA DHT11',GRN],['3V3','VCC DHT11',RED],['GND','GND DHT11',K]],
  note:_L('Alamat /data mengembalikan JSON, misalnya {"suhu":28.0,"kelembapan":65}. Format ini yang nanti dipakai aplikasi atau dashboard lain.','The /data address returns JSON, for example {"temperature":28.0,"humidity":65}. Apps and dashboards use this format.')},
 {id:'relay',cat:_L('Smart home & robot','Smart home & robots'),title:_L('Relay untuk lampu','Relay for a lamp'),desc:_L('Nyalakan lampu lewat modul relay. Perintah dikirim dari Serial Monitor: 1 untuk nyala, 0 untuk mati.','Switch a lamp through a relay module. Commands come from the Serial Monitor: 1 for on, 0 for off.'),
  parts:['ESP32 DevKit V1',_L('Modul relay 1 channel 5 V','1-channel 5 V relay module'),_L('Lampu + fitting','Lamp + socket'),_L('Kabel jumper female-male ×3','Female-male jumper wires ×3')],libs:[],
  wiring:[['VIN (5 V)','VCC relay',RED],['GND','GND relay',K],['D26','IN relay',GRN],[_L('COM & NO relay','Relay COM & NO'),_L('Memutus salah satu kabel lampu','Break one of the lamp wires'),WHT]],
  note:_L('Listrik 220 V bisa mematikan. Untuk latihan, pakai lampu LED 12 V DC dengan adaptor. Kalau ingin ke 220 V, minta bantuan orang yang paham instalasi listrik dan pastikan semua sambungan tertutup.','Mains electricity can kill. For practice, use a 12 V DC LED lamp with an adapter. If you want to switch mains, get help from someone qualified in electrical work and make sure every connection is enclosed.')},
 {id:'servo',cat:_L('Smart home & robot','Smart home & robots'),title:_L('Menggerakkan servo','Moving a servo'),desc:_L('Servo SG90 bergerak bolak-balik 0° sampai 180°. Sudut ditentukan oleh lebar pulsa.','An SG90 servo sweeps back and forth from 0° to 180°. The angle is set by the pulse width.'),
  parts:['ESP32 DevKit V1','Servo SG90',_L('Kabel jumper ×3','Jumper wires ×3')],libs:['ESP32Servo (Kevin Harrington)'],
  wiring:[['VIN (5 V)',_L('Kabel merah servo','Servo red wire'),RED],['GND',_L('Kabel coklat servo','Servo brown wire'),BRN],['D13',_L('Kabel oranye (sinyal)','Orange wire (signal)'),ORG]],
  note:_L('Servo menarik arus besar saat bergerak. Satu SG90 masih aman dari VIN lewat USB. Untuk lebih dari satu servo, pakai catu daya 5 V terpisah dan satukan GND-nya.','Servos draw a lot of current while moving. One SG90 is fine from VIN over USB. For more than one servo, use a separate 5 V supply and join the grounds.')},
 {id:'motor',cat:_L('Smart home & robot','Smart home & robots'),title:_L('Motor DC dengan L298N','DC motor with L298N'),desc:_L('Atur arah dan kecepatan motor DC lewat driver L298N: maju, berhenti, mundur.','Control the direction and speed of a DC motor through an L298N driver: forward, stop, backward.'),
  parts:['ESP32 DevKit V1',_L('Driver motor L298N','L298N motor driver'),_L('Motor DC gearbox (TT)','DC gear motor (TT)'),_L('Baterai 2×18650 (7.4 V) + holder','2×18650 battery (7.4 V) + holder'),_L('Kabel jumper ×6','Jumper wires ×6')],libs:[],
  wiring:[['D27','IN1 L298N',BLU],['D26','IN2 L298N',GRN],['D14',_L('ENA L298N (lepas jumper ENA)','L298N ENA (remove the ENA jumper)'),YEL],[_L('GND ESP32','ESP32 GND'),_L('GND L298N','L298N GND'),K],[_L('Baterai +','Battery +'),_L('Terminal 12V L298N','L298N 12V terminal'),RED],[_L('Baterai –','Battery –'),_L('GND L298N','L298N GND'),K],['OUT1 & OUT2',_L('Dua kabel motor','The two motor wires'),WHT]],
  note:_L('GND baterai dan GND ESP32 wajib disatukan, kalau tidak sinyal IN1/IN2 tidak punya acuan. Jangan ambil daya motor dari pin ESP32.','The battery GND and ESP32 GND must be joined, otherwise the IN1/IN2 signals have no reference. Never power the motor from an ESP32 pin.')}
];
PROJECTS.forEach((p,i)=>p.n=i+1);
const PROJ_BY={};PROJECTS.forEach(p=>PROJ_BY[p.id]=p);

/* ============ jalur belajar ============ */
const PATH=[
 {t:_L('Persiapan','Preparation'),d:_L('Install paket board ESP32 dan coba upload sketsa kosong.','Install the ESP32 board package and try uploading an empty sketch.'),items:[],anchor:'setup'},
 {t:_L('Output & input digital','Digital output & input'),d:_L('Kendalikan pin, baca tombol, dan kenali PWM.','Control pins, read buttons, and get to know PWM.'),items:['blink','button','fade']},
 {t:_L('Membaca sensor','Reading sensors'),d:_L('Sensor digital, waktu pantul, dan sensor gerak.','Digital sensors, echo timing, and motion sensors.'),items:['dht','sonar','pir']},
 {t:_L('Masuk ke WiFi','Going online with WiFi'),d:_L('Jadikan ESP32 web server yang bisa dibuka dari HP.','Turn the ESP32 into a web server you can open from your phone.'),items:['webled','dhtweb']},
 {t:_L('Menggerakkan dunia nyata','Moving the real world'),d:_L('Relay, servo, dan motor lewat driver.','Relays, servos, and motors through drivers.'),items:['relay','servo','motor']},
 {t:_L('Topik lanjutan','Advanced topics'),d:_L('MQTT dan Home Assistant, Bluetooth BLE, deep sleep untuk baterai, update program lewat WiFi (OTA), dan ESP-NOW untuk komunikasi antar-ESP32 tanpa router.','MQTT and Home Assistant, Bluetooth BLE, deep sleep for batteries, over-the-air updates (OTA), and ESP-NOW for ESP32-to-ESP32 messaging without a router.'),items:[]}
];
let done=store('esp32lab-done')||{};
function renderPath(){
  const el=$('#path');el.innerHTML='';
  PATH.forEach((s,i)=>{
    const all=s.items.length&&s.items.every(id=>done[id]);
    const row=document.createElement('div');row.className='stage-row'+(all?' done':'');row.id=i===5?'path-adv':'';
    const chips=s.items.map(id=>`<button class="chip" type="button" data-go="${id}" aria-pressed="${done[id]?'true':'false'}">#${PROJ_BY[id].n} ${esc(PROJ_BY[id].title)}${done[id]?' ✓':''}</button>`).join('');
    row.innerHTML=`<span class="n">${i+1}</span><div><b>${esc(s.t)}</b><p>${esc(s.d)}</p>${chips?`<div class="chips">${chips}</div>`:''}${s.anchor?_L('<a href="#setup" style="font-size:14px">Lihat langkah setup</a>','<a href="#setup" style="font-size:14px">See the setup steps</a>'):''}</div>`;
    el.appendChild(row);
  });
  const n=PROJECTS.filter(p=>done[p.id]).length;
  $('#progBar').style.width=(n/PROJECTS.length*100)+'%';
  $('#progText').textContent=_L(`${n} dari ${PROJECTS.length} project selesai`,`${n} of ${PROJECTS.length} projects done`);
}
renderPath();onLang(renderPath);

/* ============ cek Three.js ============ */
const HAS3D=!!(window.THREE&&THREE.OrbitControls)&&(()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl')||c.getContext('experimental-webgl'));}catch(e){return false;}})();

/* ============ helper 3D ============ */
let std,stdU,box,cyl,sph,put,ctex,glow,anchor,wp,shown;
if(HAS3D){
  const mc={};
  std=(color,o)=>{const k=color+'|'+(o?JSON.stringify(o):'');return mc[k]||(mc[k]=new THREE.MeshStandardMaterial(Object.assign({color:color,roughness:.6,metalness:.05},o||{})));};
  stdU=(color,o)=>new THREE.MeshStandardMaterial(Object.assign({color:color,roughness:.6,metalness:.05},o||{}));
  box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  cyl=(rt,rb,h,m,s)=>new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,s||20),m);
  sph=(r,m,ws,hs)=>new THREE.Mesh(new THREE.SphereGeometry(r,ws||20,hs||14),m);
  put=(o,x,y,z,parent)=>{o.position.set(x,y,z);if(parent)parent.add(o);return o;};
  ctex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;};
  let gt=null;
  glow=(color,size)=>{if(!gt)gt=ctex(128,128,g=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);});
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,color:color,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.setScalar(size||1);return s;};
  anchor=(parent,x,y,z)=>{const o=new THREE.Object3D();o.position.set(x,y,z);parent.add(o);return o;};
  wp=o=>{const v=new THREE.Vector3();o.getWorldPosition(v);return v;};
  shown=o=>{while(o){if(!o.visible)return false;o=o.parent;}return true;};
}

/* ---------- Viewer ---------- */
const viewers=[];
let DPR_MAX=1.5;
class Viewer{
  constructor(host,o){
    this.host=host;this.o=o||{};
    const r=this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    r.setPixelRatio(Math.min(window.devicePixelRatio||1,DPR_MAX));r.setClearColor(0x000000,0);
    host.insertBefore(r.domElement,host.firstChild);
    this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera(this.o.fov||38,1,.1,300);
    this.controls=new THREE.OrbitControls(this.camera,r.domElement);
    this.controls.enableDamping=true;this.controls.dampingFactor=.08;this.controls.screenSpacePanning=true;
    this.controls.minDistance=this.o.minDist||2;this.controls.maxDistance=this.o.maxDist||40;
    this.controls.maxPolarAngle=this.o.maxPolar||Math.PI*.48;
    const hemi=new THREE.HemisphereLight(0xffffff,0x3d4a55,.8);
    const d1=new THREE.DirectionalLight(0xffffff,.8);d1.position.set(5,10,7);
    const d2=new THREE.DirectionalLight(0xcfe3ff,.3);d2.position.set(-6,5,-6);
    this.scene.add(hemi,d1,d2);
    this.labelLayer=document.createElement('div');this.labelLayer.className='labels';host.appendChild(this.labelLayer);
    this.tip=document.createElement('div');this.tip.className='tip';this.tip.hidden=true;host.appendChild(this.tip);
    this.labels=[];this.clickables=[];this.showLabels=true;this.visible=false;this.onFrame=null;
    this.ray=new THREE.Raycaster();this.ptr=new THREE.Vector2();this.pressed=null;this.downAt=null;
    const el=r.domElement;
    el.addEventListener('pointerdown',e=>this._down(e),{capture:true});
    el.addEventListener('pointermove',e=>this._move(e));
    window.addEventListener('pointerup',e=>this._up(e));
    window.addEventListener('pointercancel',e=>this._up(e));
    el.addEventListener('pointerleave',()=>{this.tip.hidden=true;el.style.cursor='';});
    new ResizeObserver(()=>this.resize()).observe(host);
    new IntersectionObserver(es=>{this.visible=es[0].isIntersecting;},{rootMargin:'120px'}).observe(host);
    this.resize();viewers.push(this);
  }
  resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.w=w;this.h=h;this.fit();}
  setView(cam,target,fitW){this.view={cam:cam,target:target};if(fitW)this.o.fitWidth=fitW;this.controls.target.set(target[0],target[1],target[2]);this.camera.position.set(cam[0],cam[1],cam[2]);this.baseDist=this.camera.position.distanceTo(this.controls.target);this.fit();this.controls.update();}
  reset(){if(this.view)this.setView(this.view.cam,this.view.target);}
  fit(){
    if(!this.o.fitWidth||!this.baseDist)return;
    const vf=this.camera.fov*Math.PI/180,hf=2*Math.atan(Math.tan(vf/2)*this.camera.aspect);
    const need=(this.o.fitWidth*(this.camera.aspect<1?.78:1)/2)/Math.tan(hf/2)*1.16;
    const dir=this.camera.position.clone().sub(this.controls.target);
    dir.setLength(Math.max(need,this.baseDist));
    this.camera.position.copy(this.controls.target).add(dir);
  }
  addLabel(obj,html,cls,off){const el=document.createElement('div');el.className='lbl '+(cls||'');el.innerHTML=html;this.labelLayer.appendChild(el);const L={obj:obj,el:el,off:new THREE.Vector3().fromArray(off||[0,0,0]),set:h=>{if(L._h!==h){L._h=h;el.innerHTML=h;}},cls:cls||''};L._h=html;this.labels.push(L);return L;}
  relabel(){this.labels.forEach(L=>{if(L._h&&typeof L._h==='object')L.el.innerHTML=String(L._h);});}
  removeLabel(L){const i=this.labels.indexOf(L);if(i>=0)this.labels.splice(i,1);L.el.remove();}
  _xy(e){const r=this.renderer.domElement.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top,r];}
  _pick(e){
    const [x,y,r]=this._xy(e);this.ptr.set(x/r.width*2-1,-(y/r.height)*2+1);this.ray.setFromCamera(this.ptr,this.camera);
    const list=this.clickables.filter(c=>shown(c.obj));if(!list.length)return null;
    const hits=this.ray.intersectObjects(list.map(c=>c.obj),true);
    for(const h of hits){let o=h.object;while(o){const c=list.find(c=>c.obj===o);if(c)return {c:c,hit:h};o=o.parent;}}
    return null;
  }
  floorPt(e){const [x,y,r]=this._xy(e);this.ptr.set(x/r.width*2-1,-(y/r.height)*2+1);this.ray.setFromCamera(this.ptr,this.camera);const t=new THREE.Vector3();return this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),t)?t:null;}
  _down(e){this.downAt=[e.clientX,e.clientY];const p=this._pick(e);if(p&&p.c.onDown){this.pressed=p.c;this.controls.enabled=false;p.c.onDown(p.hit,this.floorPt(e));}}
  _up(e){
    if(this.pressed){const c=this.pressed;this.pressed=null;this.controls.enabled=true;c.onUp&&c.onUp();this.downAt=null;return;}
    if(!this.downAt||e.target!==this.renderer.domElement){this.downAt=null;return;}
    const moved=Math.hypot(e.clientX-this.downAt[0],e.clientY-this.downAt[1]);this.downAt=null;
    if(moved<6){const p=this._pick(e);if(p&&p.c.onClick)p.c.onClick(p.hit);}
  }
  _move(e){
    if(this.pressed&&this.pressed.onDrag){const pt=this.floorPt(e);if(pt)this.pressed.onDrag(pt);return;}
    if(e.buttons&&!this.pressed){this.tip.hidden=true;return;}
    const p=this._pick(e);const el=this.renderer.domElement;
    if(p){el.style.cursor='pointer';const t=typeof p.c.tip==='function'?p.c.tip(p.hit):p.c.tip;if(t){const [x,y]=this._xy(e);this.tip.textContent=t;this.tip.hidden=false;this.tip.style.transform=`translate(${Math.min(x+14,this.w-140)}px,${y+16}px)`;}else this.tip.hidden=true;}
    else{el.style.cursor='';this.tip.hidden=true;}
  }
  _labels(){
    const v=new THREE.Vector3();
    for(const L of this.labels){
      if(!this.showLabels&&!L.cls.includes('keep')){L.el.hidden=true;continue;}
      if(!shown(L.obj)){L.el.hidden=true;continue;}
      L.obj.getWorldPosition(v);v.add(L.off);v.project(this.camera);
      if(v.z>1||v.z<-1){L.el.hidden=true;continue;}
      if(L.el.hidden)L.el.hidden=false;const tf=`translate(${((v.x+1)/2*this.w).toFixed(1)}px,${((1-v.y)/2*this.h).toFixed(1)}px) translate(-50%,-100%)`;if(L._tf!==tf){L._tf=tf;L.el.style.transform=tf;}
    }
  }
}
onLang(()=>viewers.forEach(v=>v.relabel()));
let lastT=performance.now();const perf={n:0,sum:0};
function tick(now){
  const raw=now-lastT;const dt=Math.min(.05,raw/1000);lastT=now;const t=now/1000;
  let any=false;
  for(const v of viewers){if(!v.visible)continue;any=true;v.controls.update();if(v.onFrame)v.onFrame(dt,t);v.renderer.render(v.scene,v.camera);v._labels();}
  // kalau perangkat keteteran, turunkan resolusi render sekali saja
  if(any&&!document.hidden&&raw<250&&DPR_MAX>1&&(window.devicePixelRatio||1)>1){perf.n++;perf.sum+=raw;if(perf.n>=90){if(perf.sum/perf.n>24){DPR_MAX=1;viewers.forEach(v=>{v.renderer.setPixelRatio(1);v.resize();});}perf.n=0;perf.sum=0;}}
  requestAnimationFrame(tick);
}

function addFloor(v){
  const dots=ctex(64,64,c=>{c.fillStyle='#ffffff';c.fillRect(0,0,64,64);c.fillStyle='#b9b9b9';c.beginPath();c.arc(32,32,3.2,0,TAU);c.fill();});
  dots.wrapS=dots.wrapT=THREE.RepeatWrapping;dots.repeat.set(400,400);dots.anisotropy=8;
  const m=new THREE.MeshStandardMaterial({color:cssv('--floor')||'#d2dbdf',roughness:1,map:dots});
  const f=new THREE.Mesh(new THREE.PlaneGeometry(200,200),m);f.rotation.x=-Math.PI/2;f.position.y=-.012;v.scene.add(f);
  let grid=null;
  const upd=()=>{
    m.color.set(cssv('--floor')||'#d2dbdf');
    const sc=cssv('--stage')||'#e3eaed';v.scene.background=new THREE.Color(sc);v.scene.fog=new THREE.Fog(sc,20,46);
  };
  upd();themeFns.push(upd);
}

/* ---------- model: ESP32 DevKit ---------- */
function makeESP32(){
  const g=new THREE.Group();
  const PX=200,W=1020,H=560,wx=x=>(x+2.55)*PX,wz=z=>(z+1.4)*PX;
  const topTex=ctex(W,H,c=>{
    c.fillStyle='#17232d';c.fillRect(0,0,W,H);
    c.strokeStyle='rgba(96,150,180,.3)';c.lineWidth=5;c.lineCap='round';c.lineJoin='round';
    let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
    for(let i=0;i<30;i++){const s=i%2?1:-1,idx=Math.floor(rnd()*15),x=wx(PIN_X(idx)),y=wz(s*1.15),ty=wz(s*(.45+rnd()*.3));c.beginPath();c.moveTo(x,y);c.lineTo(x,ty);c.lineTo(x+(rnd()-.5)*300,ty);c.stroke();}
    c.strokeStyle='rgba(236,241,243,.8)';c.lineWidth=3;c.strokeRect(12,12,W-24,H-24);
    for(const p of PINS){const x=wx(PIN_X(p.idx)),y=wz(PIN_Z[p.side]);
      c.fillStyle='#c9a14c';c.beginPath();c.arc(x,y,17,0,TAU);c.fill();
      c.fillStyle='#0e151a';c.beginPath();c.arc(x,y,7,0,TAU);c.fill();
      c.save();c.fillStyle='#eef3f5';c.font='bold 21px monospace';c.textBaseline='middle';c.textAlign='left';
      c.translate(x,y+(p.side==='L'?26:-26));c.rotate(p.side==='L'?Math.PI/2:-Math.PI/2);c.fillText(p.label,0,0);c.restore();}
    c.fillStyle='#eef3f5';c.font='bold 22px monospace';c.textAlign='center';c.textBaseline='middle';
    c.fillText('EN',wx(-2.25),wz(-.75)+52);c.fillText('BOOT',wx(-2.25),wz(.75)-52);
    c.save();c.translate(wx(-.35),wz(0));c.rotate(-Math.PI/2);c.font='bold 20px monospace';c.fillText('ESP32 DEVKIT V1',0,0);c.restore();
    c.font='15px monospace';c.fillText('PWR',wx(-1.75),wz(-.2)-24);c.fillText('IO2',wx(-1.75),wz(.2)+26);
  });
  const side=std('#10181e');
  g.add(new THREE.Mesh(new THREE.BoxGeometry(5.1,.16,2.8),[side,side,new THREE.MeshStandardMaterial({map:topTex,roughness:.55}),side,side,side]));
  const modTex=ctex(510,360,c=>{c.fillStyle='#1c2b37';c.fillRect(0,0,510,360);c.strokeStyle='#c9a14c';c.lineWidth=7;c.beginPath();let y=50;c.moveTo(405,y);for(let i=0;i<5;i++){c.lineTo(495,y);y+=26;c.lineTo(495,y);c.lineTo(420,y);y+=26;c.lineTo(420,y);}c.stroke();c.fillStyle='#c9a14c';for(let i=0;i<18;i++){c.fillRect(8+i*21,3,10,14);c.fillRect(8+i*21,343,10,14);}});
  const ms=std('#1c2b37');
  put(new THREE.Mesh(new THREE.BoxGeometry(2.55,.06,1.8),[ms,ms,new THREE.MeshStandardMaterial({map:modTex,roughness:.5}),ms,ms,ms]),1.3,.11,0,g);
  const shTex=ctex(360,300,c=>{c.fillStyle='#c3c9cc';c.fillRect(0,0,360,300);c.strokeStyle='rgba(0,0,0,.14)';c.lineWidth=2;c.strokeRect(10,10,340,280);c.fillStyle='#3b4247';c.textAlign='center';c.font='bold 30px monospace';c.fillText('ESP32-WROOM-32',180,125);c.font='20px monospace';c.fillText('WiFi · BT · BLE',180,170);c.font='16px monospace';c.fillText('2 core · 240 MHz · 4 MB',180,210);});
  const shs=std('#b4bbbf',{metalness:.5,roughness:.35});
  put(new THREE.Mesh(new THREE.BoxGeometry(1.8,.2,1.5),[shs,shs,new THREE.MeshStandardMaterial({map:shTex,metalness:.3,roughness:.4}),shs,shs,shs]),1.0,.24,0,g);
  const metal=std('#c3c9cd',{metalness:.65,roughness:.3});
  put(box(.55,.24,.76,metal),-2.52,.2,0,g);put(box(.02,.1,.5,std('#0c0f11')),-2.8,.2,0,g);
  for(const z of [-.75,.75]){put(box(.38,.12,.38,metal),-2.25,.14,z,g);put(cyl(.1,.1,.1,std('#1d1f22'),16),-2.25,.25,z,g);}
  put(box(.5,.08,.5,std('#15181b',{roughness:.5})),-1.2,.12,.35,g);
  put(box(.55,.14,.32,std('#15181b')),-1.0,.15,-.45,g);put(box(.2,.04,.34,metal),-.66,.1,-.45,g);
  for(const [x,z] of [[-.6,.55],[-.6,-.05],[-1.55,-.52],[-.3,.62],[-1.62,.86],[-.25,-.62]])put(box(.14,.08,.08,std('#b58a52')),x,.12,z,g);
  put(box(.12,.06,.08,stdU('#ff3b30',{emissive:'#ff3b30',emissiveIntensity:1.1})),-1.75,.11,-.2,g);
  const io2M=stdU('#3a86ff',{emissive:'#3a86ff',emissiveIntensity:0});put(box(.12,.06,.08,io2M),-1.75,.11,.2,g);
  const io2G=glow('#3a86ff',.9);put(io2G,-1.75,.22,.2,g);
  const plastic=std('#111417',{roughness:.7}),gold=std('#d4a93f',{metalness:.8,roughness:.3}),solder=std('#c9ced2',{metalness:.7,roughness:.35});
  const pinGeo=new THREE.BoxGeometry(.064,.9,.064),solGeo=new THREE.SphereGeometry(.055,10,8),hitGeo=new THREE.BoxGeometry(.24,.5,.34),capGeo=new THREE.BoxGeometry(.17,.07,.17);
  const hitMat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
  for(const s of ['L','R'])put(box(15*.254,.22,.26,plastic),PIN_X(7),-.19,PIN_Z[s],g);
  const pins={};
  for(const p of PINS){const x=PIN_X(p.idx),z=PIN_Z[p.side];
    put(new THREE.Mesh(pinGeo,gold),x,-.3,z,g);put(new THREE.Mesh(solGeo,solder),x,.1,z,g);
    const hit=put(new THREE.Mesh(hitGeo,hitMat),x,.05,z,g);
    const cap=put(new THREE.Mesh(capGeo,new THREE.MeshBasicMaterial({color:'#ffffff'})),x,.19,z,g);cap.visible=false;
    pins[p.id]={data:p,hit:hit,cap:cap,anchor:anchor(g,x,.16,z)};
  }
  return {group:g,pins:pins,antenna:anchor(g,2.3,.25,0),setIO2(l){io2M.emissiveIntensity=l*1.8;io2G.material.opacity=l*.8;}};
}

/* ---------- model: komponen ---------- */
const LEGM=()=>std('#b9c0c5',{metalness:.7,roughness:.3});
function makeLED(color){
  const g=new THREE.Group();
  const m=stdU(color,{transparent:true,opacity:.9,roughness:.25,emissive:new THREE.Color(color),emissiveIntensity:.08});
  put(cyl(.12,.12,.26,m,20),.127,.5,0,g);put(sph(.12,m,20,12),.127,.63,0,g);put(cyl(.14,.14,.04,m,20),.127,.37,0,g);
  const leg=LEGM();put(cyl(.013,.013,.37,leg,6),0,.185,0,g);put(cyl(.013,.013,.37,leg,6),.254,.185,0,g);
  const light=new THREE.PointLight(color,0,3,2);put(light,.127,.62,0,g);
  const gl=glow(color,1.3);put(gl,.127,.6,0,g);
  const api={group:g,level:0,set(l){l=clamp(l,0,1);api.level=l;m.emissiveIntensity=.08+l*1.8;light.intensity=l*1.5;gl.material.opacity=l*.85;}};
  return api;
}
const BANDS_220=['#d12d2d','#d12d2d','#6b3a1e','#c9a227'],BANDS_10K=['#6b3a1e','#111111','#e07b1a','#c9a227'];
function makeResistor(span,bands){
  const g=new THREE.Group(),L=span*.254,leg=LEGM();
  put(cyl(.012,.012,.28,leg,6),0,.14,0,g);put(cyl(.012,.012,.28,leg,6),L,.14,0,g);
  const h=cyl(.012,.012,L,leg,6);h.rotation.z=Math.PI/2;put(h,L/2,.28,0,g);
  const b=cyl(.075,.075,.52,std('#d9c49a',{roughness:.5}),16);b.rotation.z=Math.PI/2;put(b,L/2,.28,0,g);
  bands.forEach((c,i)=>{const bb=cyl(.079,.079,.035,std(c),16);bb.rotation.z=Math.PI/2;put(bb,L/2-.17+i*.1+(i===3?.05:0),.28,0,g);});
  return {group:g};
}
function makeButton(){
  const g=new THREE.Group(),leg=LEGM();
  for(const x of [0,.508])for(const z of [-.3,.3])put(box(.03,.14,.03,leg),x,.07,z,g);
  put(box(.62,.2,.62,std('#2b2f33',{roughness:.5})),.254,.2,0,g);
  put(box(.56,.02,.56,std('#b8bec2',{metalness:.6,roughness:.35})),.254,.31,0,g);
  const capM=stdU('#d9453a',{roughness:.45});const cap=put(cyl(.17,.17,.16,capM,24),.254,.4,0,g);
  const api={group:g,cap:cap,pressed:false,press(p){api.pressed=p;cap.position.y=p?.34:.4;capM.emissive.set(p?'#5a1510':'#000000');}};
  return api;
}
function makeDHT11(){
  const g=new THREE.Group(),leg=LEGM();
  for(const x of [-.254,0,.254])put(box(.04,.34,.04,leg),x,.17,0,g);
  put(box(.85,.1,.12,std('#111417')),0,.32,0,g);
  put(box(1.0,1.15,.06,std('#1f3f7a')),0,.93,-.04,g);
  const tex=ctex(132,168,c=>{c.fillStyle='#4a8fe0';c.fillRect(0,0,132,168);c.fillStyle='#2b67b3';for(let y=14;y<156;y+=16)for(let x=12;x<122;x+=16)c.fillRect(x,y,9,9);});
  const bm=std('#4a8fe0');
  const shell=new THREE.Mesh(new THREE.BoxGeometry(.66,.84,.3),[bm,bm,bm,bm,new THREE.MeshStandardMaterial({map:tex,roughness:.6}),bm]);put(shell,0,1.0,.14,g);
  put(box(.08,.05,.03,stdU('#ff4030',{emissive:'#ff4030',emissiveIntensity:.8})),.38,.47,.0,g);
  return {group:g,shell:shell};
}
function makeHCSR04(){
  const g=new THREE.Group(),leg=LEGM();
  for(const x of [-.381,-.127,.127,.381])put(box(.04,.36,.04,leg),x,.18,0,g);
  put(box(1.1,.1,.12,std('#111417')),0,.32,0,g);
  put(box(2.0,.85,.06,std('#1d5fa8')),0,.79,-.02,g);
  const can=std('#c7ccd0',{metalness:.55,roughness:.35}),mesh=std('#2a2e33',{roughness:.9});
  for(const x of [-.55,.55]){const c=cyl(.3,.3,.32,can,28);c.rotation.x=Math.PI/2;put(c,x,.8,.17,g);const d=cyl(.24,.24,.02,mesh,24);d.rotation.x=Math.PI/2;put(d,x,.8,.34,g);}
  put(box(.36,.14,.12,can),0,1.1,.05,g);
  return {group:g,emit:anchor(g,0,.8,.36)};
}
function makePIR(){
  const g=new THREE.Group(),leg=LEGM();
  for(const x of [-.254,0,.254])put(box(.04,.38,.04,leg),x,.19,.42,g);
  put(box(.85,.1,.12,std('#111417')),0,.33,.42,g);
  put(box(1.3,.06,1.3,std('#1f6b3a')),0,.41,0,g);
  put(cyl(.52,.52,.1,std('#e9ecee')),0,.49,0,g);
  const domeM=stdU('#f2f4f5',{roughness:.35,transparent:true,opacity:.95,flatShading:true,emissive:'#ffb347',emissiveIntensity:0});
  put(new THREE.Mesh(new THREE.SphereGeometry(.5,10,6,0,TAU,0,Math.PI/2),domeM),0,.53,0,g);
  put(cyl(.1,.1,.06,std('#e8892b')),-.42,.46,-.45,g);put(cyl(.1,.1,.06,std('#e8892b')),.42,.46,-.45,g);
  return {group:g,domeM:domeM};
}
function makeRelay(){
  const g=new THREE.Group(),leg=LEGM();
  put(box(1.4,.06,2.6,std('#1c3552')),0,.25,0,g);
  for(const x of [-.6,.6])for(const z of [-1.2,1.2])put(cyl(.05,.05,.22,std('#c9ced2',{metalness:.6})),x,.11,z,g);
  const relay=put(box(.95,.8,1.1,std('#2f64c9',{roughness:.4})),0,.68,.15,g);
  put(box(1.0,.45,.45,std('#2e7fd1')),0,.5,1.0,g);
  for(const x of [-.3,0,.3])put(cyl(.09,.09,.04,std('#c9ced2',{metalness:.7})),x,.74,1.0,g);
  const a={};
  ['VCC','GND','IN'].forEach((n,i)=>{const x=-.254+i*.254;put(box(.04,.3,.04,leg),x,.4,-1.1,g);a[n]=anchor(g,x,.55,-1.1);});
  put(box(.85,.1,.12,std('#111417')),0,.33,-1.1,g);
  const ledM=stdU('#ff3030',{emissive:'#ff3030',emissiveIntensity:0});put(box(.1,.06,.1,ledM),.45,.31,-.6,g);
  put(box(.1,.06,.1,stdU('#3ddc84',{emissive:'#3ddc84',emissiveIntensity:.9})),-.45,.31,-.6,g);
  a.COM=anchor(g,0,.76,1.0);a.NO=anchor(g,-.3,.76,1.0);
  let kick=0;
  return {group:g,a:a,set(on){ledM.emissiveIntensity=on?1.3:0;kick=.12;},update(dt){if(kick>0){kick-=dt;relay.position.x=Math.sin(kick*120)*.012;}else relay.position.x=0;}};
}
function makeLamp(){
  const g=new THREE.Group();
  put(cyl(.5,.6,.2,std('#2b3036')),0,.1,0,g);put(cyl(.07,.07,1.2,std('#8a9096',{metalness:.6})),0,.8,0,g);
  put(cyl(.22,.26,.4,std('#d8d2c2')),0,1.55,0,g);
  const bm=stdU('#fff4d6',{transparent:true,opacity:.55,roughness:.1,emissive:'#ffb547',emissiveIntensity:0});put(sph(.42,bm,28,20),0,2.07,0,g);
  const fm=stdU('#ffcf7a',{emissive:'#ffa630',emissiveIntensity:0});put(new THREE.Mesh(new THREE.TorusGeometry(.1,.014,6,20,Math.PI),fm),0,2.02,0,g);
  const light=new THREE.PointLight('#ffc670',0,8,2);put(light,0,2.07,0,g);
  const gl=glow('#ffc670',3.2);put(gl,0,2.07,0,g);
  return {group:g,inA:anchor(g,-.45,.12,0),inB:anchor(g,.45,.12,0),set(l){bm.emissiveIntensity=l*1.4;bm.opacity=.55+l*.35;fm.emissiveIntensity=l*2;light.intensity=l*2;gl.material.opacity=l*.8;}};
}
function makeServo(){
  const g=new THREE.Group();
  const blue=stdU('#3564c8',{transparent:true,opacity:.93,roughness:.35});
  put(box(1.15,.95,.55,blue),0,.475,0,g);put(box(1.6,.06,.55,blue),0,.72,0,g);
  put(cyl(.26,.26,.18,blue,24),.25,1.04,0,g);put(cyl(.09,.09,.14,std('#f2f2f2'),16),.25,1.18,0,g);
  const horn=new THREE.Group();put(horn,.25,1.26,0,g);
  const white=std('#f4f4f2',{roughness:.5});
  put(cyl(.15,.15,.07,white,20),0,0,0,horn);put(box(.66,.06,.16,white),.33,0,0,horn);put(cyl(.08,.08,.06,white,16),.66,0,0,horn);
  const arc=new THREE.Mesh(new THREE.RingGeometry(.86,.9,48,1,0,Math.PI),new THREE.MeshBasicMaterial({color:'#8aa0ab',side:THREE.DoubleSide}));arc.rotation.x=-Math.PI/2;put(arc,.25,1.2,0,g);
  for(let i=0;i<=4;i++){const a=i*Math.PI/4;const t=box(.12,.02,.02,std('#8aa0ab'));t.rotation.y=a;put(t,.25+Math.cos(a)*.94,1.2,-Math.sin(a)*.94,g);}
  const cols=['#7a4a26','#d63a2f','#f08c1a'];const a={};
  const conn=put(box(.14,.1,.34,std('#111417')),-1.5,.07,0,g);
  cols.forEach((c,i)=>{const z=-.1+i*.1;const pts=[new THREE.Vector3(-.58,.2,z*.6),new THREE.Vector3(-.9,.08,z),new THREE.Vector3(-1.2,.12,z),new THREE.Vector3(-1.44,.08,z)];
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),20,.02,6,false),std(c)));});
  a.GND=anchor(g,-1.5,.12,-.1);a.VCC=anchor(g,-1.5,.12,0);a.SIG=anchor(g,-1.5,.12,.1);
  return {group:g,a:a,setAngle(d){horn.rotation.y=(d*Math.PI/180);}};
}
function makeL298N(){
  const g=new THREE.Group(),leg=LEGM();
  put(box(1.9,.06,1.9,std('#b8261f')),0,.2,0,g);
  for(const x of [-.85,.85])for(const z of [-.85,.85])put(cyl(.05,.05,.18,std('#c9ced2',{metalness:.6})),x,.09,z,g);
  const hs=std('#1a1d20',{metalness:.4,roughness:.5});
  put(box(1.0,.12,.5,hs),0,.29,-.45,g);for(let i=0;i<7;i++)put(box(1.0,.7,.04,hs),0,.65,-.66+i*.07,g);
  const tb=std('#2b7bd6');
  put(box(.35,.35,.6,tb),-.78,.4,-.35,g);put(box(.35,.35,.6,tb),.78,.4,-.35,g);put(box(.8,.35,.35,tb),-.42,.4,.72,g);
  const a={OUT1:anchor(g,-.78,.6,-.5),OUT2:anchor(g,-.78,.6,-.2),'12V':anchor(g,-.68,.6,.72),GND:anchor(g,-.42,.6,.72),'5V':anchor(g,-.16,.6,.72)};
  ['ENA','IN1','IN2','IN3','IN4','ENB'].forEach((n,i)=>{const x=.05+i*.16;put(box(.04,.3,.04,leg),x,.35,.8,g);a[n]=anchor(g,x,.5,.8);});
  put(box(1.0,.1,.12,std('#111417')),.45,.28,.8,g);
  put(box(.1,.06,.1,stdU('#ff3030',{emissive:'#ff3030',emissiveIntensity:1})),.7,.26,.3,g);
  return {group:g,a:a};
}
function makeMotor(){
  const g=new THREE.Group();const y=std('#f2c12e',{roughness:.5});
  put(box(1.5,.5,.5,y),0,.7,0,g);
  const c=cyl(.22,.22,.6,std('#c7ccd0',{metalness:.6,roughness:.35}),20);c.rotation.z=Math.PI/2;put(c,-1.0,.7,0,g);
  const tab=std('#d4a93f',{metalness:.8});put(box(.04,.14,.06,tab),-1.32,.78,.1,g);put(box(.04,.14,.06,tab),-1.32,.78,-.1,g);
  const s=cyl(.05,.05,.5,std('#f4f4f2'));s.rotation.x=Math.PI/2;put(s,.35,.7,.4,g);
  const wheel=new THREE.Group();put(wheel,.35,.7,.62,g);
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(.52,.14,12,36),std('#1d1f22',{roughness:.9})));
  const hub=cyl(.42,.42,.2,y,28);hub.rotation.x=Math.PI/2;wheel.add(hub);
  for(let i=0;i<3;i++){const sp=box(.84,.08,.24,std('#e0ad1d'));sp.rotation.z=i*Math.PI/3;wheel.add(sp);}
  return {group:g,a:{M1:anchor(g,-1.32,.86,.1),M2:anchor(g,-1.32,.86,-.1)},spin(dt,w){wheel.rotation.z-=w*dt;}};
}
function makeBattery(){
  const g=new THREE.Group();put(box(1.7,.3,.95,std('#1d2023')),0,.15,0,g);
  for(const z of [-.22,.22]){const c=cyl(.2,.2,1.4,std('#3a7d5d',{roughness:.4}),20);c.rotation.z=Math.PI/2;put(c,0,.36,z,g);}
  return {group:g,a:{P:anchor(g,.86,.3,.3),N:anchor(g,.86,.3,-.3)}};
}
function makeRouter(){
  const g=new THREE.Group();put(box(2.0,.36,1.3,std('#2c3740',{roughness:.45})),0,.18,0,g);
  const leds=[];for(let i=0;i<4;i++){const m=stdU('#3ddc84',{emissive:'#3ddc84',emissiveIntensity:.6});put(box(.08,.04,.04,m),-.45+i*.3,.28,.66,g);leds.push(m);}
  for(const x of [-.75,.75]){const a=cyl(.05,.06,1.5,std('#1f282f'));a.rotation.z=x<0?.18:-.18;put(a,x,1.0,-.5,g);}
  return {group:g,leds:leds,top:anchor(g,0,.6,0),blink(t){leds.forEach((m,i)=>m.emissiveIntensity=(Math.sin(t*(7+i*3)+i)>.2)?.9:.15);}};
}
function makeCloud(){const g=new THREE.Group();const m=std('#e3ecf0',{roughness:.9});[[0,0,0,.62],[.62,-.12,0,.45],[-.62,-.14,0,.45],[.3,.32,0,.46],[-.26,.28,.05,.42]].forEach(q=>put(sph(q[3],m,18,12),q[0],q[1],q[2],g));return {group:g};}
function makePhone(){
  const g=new THREE.Group(),W=360,H=720;
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d');const tex=new THREE.CanvasTexture(cv);tex.anisotropy=4;
  const body=new THREE.Group();put(body,0,1.48,0,g);body.rotation.x=-.22;
  put(box(1.34,2.7,.1,std('#1b1f24',{roughness:.3,metalness:.3})),0,0,0,body);
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.22,2.44),new THREE.MeshBasicMaterial({map:tex}));put(screen,0,0,.052,body);
  put(box(1.0,.1,.7,std('#2a2f35')),0,.05,.05,g);put(box(.9,1.3,.08,std('#2a2f35')),0,.7,-.45,g).rotation.x=.35;
  return {group:g,screen:screen,W:W,H:H,anchor:anchor(g,0,2.9,-.25),draw(fn){fn(ctx,W,H);tex.needsUpdate=true;}};
}
function makePot(){
  const g=new THREE.Group(),leg=LEGM();
  put(box(.9,.35,.9,std('#2f5fb3',{roughness:.5})),0,.3,0,g);
  const a={};['gnd','sig','vcc'].forEach((n,i)=>{const x=-.3+i*.3;put(box(.05,.03,.35,leg),x,.14,.55,g);put(box(.05,.14,.03,leg),x,.07,.72,g);a[n]=anchor(g,x,.16,.72);});
  const knob=new THREE.Group();put(knob,0,.48,0,g);
  put(cyl(.1,.1,.2,std('#c7ccd0',{metalness:.6})),0,.1,0,knob);put(cyl(.3,.32,.35,std('#22262a',{roughness:.6}),28),0,.35,0,knob);
  put(box(.05,.03,.24,std('#f2f2f2')),0,.535,-.14,knob);
  return {group:g,a:a,setAngle(r){knob.rotation.y=r;}};
}
function makeMiniBB(w,d){
  const PX=100,W=Math.round(w*PX),H=Math.round(d*PX);
  const t=ctex(W,H,c=>{c.fillStyle='#ece8de';c.fillRect(0,0,W,H);c.fillStyle='#3b3a36';for(let x=12;x<W-6;x+=25.4)for(let y=12;y<H-6;y+=25.4)c.fillRect(x-4,y-4,8,8);});
  const s=std('#e3dfd4');return new THREE.Mesh(new THREE.BoxGeometry(w,.3,d),[s,s,new THREE.MeshStandardMaterial({map:t,roughness:.8}),s,s,s]);
}

/* ---------- kabel, lintasan, efek ---------- */
const wireMats={};
function makeWire(a,b,color,o){
  o=o||{};const P0=a.isVector3?a.clone():wp(a),P1=b.isVector3?b.clone():wp(b);
  const dist=P0.distanceTo(P1),lift=o.lift!=null?o.lift:.35+dist*.1,up=o.up!=null?o.up:.3;
  const m=P0.clone().lerp(P1,.5);m.y=Math.max(P0.y,P1.y)+lift;
  const U=new THREE.Vector3(0,up,0);
  const curve=new THREE.CatmullRomCurve3([P0,P0.clone().add(U),m,P1.clone().add(U),P1],false,'centripetal');
  const mat=o.unique?stdU(color,{roughness:.45}):(wireMats[color]||(wireMats[color]=new THREE.MeshStandardMaterial({color:color,roughness:.45})));
  const g=new THREE.Group();
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(24,Math.round(dist*12)),o.r||.028,6,false),mat));
  if(o.heads!==false)for(const P of [P0,P1]){const h=box(.075,.2,.075,std('#1d2226'));h.position.copy(P).add(new THREE.Vector3(0,.13,0));g.add(h);}
  g.userData={curve:curve,mat:mat};return g;
}
function arcCurve(a,b,h){const m=a.clone().lerp(b,.5);m.y+=h;return new THREE.QuadraticBezierCurve3(a.clone(),m,b.clone());}
function dashLine(curve,color){const geo=new THREE.BufferGeometry().setFromPoints(curve.getPoints(60));const l=new THREE.Line(geo,new THREE.LineDashedMaterial({color:color,dashSize:.18,gapSize:.12,transparent:true,opacity:.8}));l.computeLineDistances();return l;}
function makeRings(parent,pos,color,n){
  n=n||4;const arr=[];
  for(let i=0;i<n;i++){const r=new THREE.Mesh(new THREE.RingGeometry(.94,1,64),new THREE.MeshBasicMaterial({color:color,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));r.rotation.x=-Math.PI/2;r.position.copy(pos);parent.add(r);arr.push(r);}
  return {update(t,strength,speed,max){arr.forEach((r,i)=>{const s=((t*(speed||.5))+i/n)%1;r.scale.setScalar(.2+s*(max||4));r.material.opacity=(1-s)*.55*(strength==null?1:strength);});}};
}
function makeTraveler(parent,color){const g=new THREE.Group();g.add(sph(.12,new THREE.MeshBasicMaterial({color:color}),12,10));const gl=glow(color,1.1);gl.material.opacity=.9;g.add(gl);g.visible=false;parent.add(g);return g;}
const SIG='#35c4d8',PKT='#ffab40';

/* ---------- layar HP ---------- */
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
const FS='"IBM Plex Sans",system-ui,sans-serif',FM='"JetBrains Mono",monospace';
function scr(ph,o){ph.draw((c,W,H)=>{
  c.fillStyle='#f3f5f6';c.fillRect(0,0,W,H);c.fillStyle='#1b1f24';c.fillRect(0,0,W,38);
  c.fillStyle='#fff';c.font='600 17px '+FS;c.textBaseline='middle';c.textAlign='left';c.fillText('09:41',18,19);c.textAlign='right';c.fillText(o.wifi||'',W-18,19);
  if(o.url!=null){c.fillStyle='#e1e6e9';rr(c,16,52,W-32,42,21);c.fill();c.fillStyle='#4b5862';c.font='17px '+FM;c.textAlign='center';c.fillText(o.url,W/2,73);}
  c.textAlign='center';if(o.body)o.body(c,W,H);
});}
const PBTN={on:[36,430,132,96],off:[192,430,132,96]};
function ledPage(ph,on,ready,url){
  scr(ph,{wifi:'WiFi',url:ready?(url||'192.168.1.23'):'',body:(c,W,H)=>{
    if(!ready){c.fillStyle='#5b6770';c.font='600 22px '+FS;c.fillText(_L('Menunggu ESP32…','Waiting for ESP32…'),W/2,H/2);return;}
    c.fillStyle='#1b1f24';c.font='700 28px '+FS;c.fillText(_L('Kontrol LED ESP32','ESP32 LED Control'),W/2,180);
    c.fillStyle='#5b6770';c.font='20px '+FS;c.fillText('Status:',W/2,258);
    c.fillStyle=on?'#2e7d32':'#c62828';c.font='700 44px '+FS;c.fillText(on?_L('NYALA','ON'):_L('MATI','OFF'),W/2,318);
    [['on','ON','#2e7d32'],['off','OFF','#c62828']].forEach(b=>{const r=PBTN[b[0]];c.fillStyle=b[2];rr(c,r[0],r[1],r[2],r[3],14);c.fill();c.fillStyle='#fff';c.font='700 30px '+FS;c.fillText(b[1],r[0]+r[2]/2,r[1]+r[3]/2);});
    c.fillStyle='#8a969e';c.font='18px '+FS;c.fillText(_L('Ketuk tombol di layar','Tap a button on screen'),W/2,600);
  }});
}
function dashPage(ph,d){
  scr(ph,{wifi:'WiFi',url:d.ready?'192.168.1.23':'',body:(c,W,H)=>{
    if(!d.ready){c.fillStyle='#5b6770';c.font='600 22px '+FS;c.fillText(_L('Menunggu ESP32…','Waiting for ESP32…'),W/2,H/2);return;}
    c.fillStyle='#1b1f24';c.font='700 28px '+FS;c.fillText(_L('Monitor Ruangan','Room Monitor'),W/2,160);
    c.fillStyle='#5b6770';c.font='20px '+FS;c.fillText(_L('Suhu','Temperature'),W/2,225);
    c.fillStyle='#1b1f24';c.font='700 56px '+FS;c.fillText(d.t==null?'nan':d.t.toFixed(1)+' °C',W/2,285);
    c.fillStyle='#5b6770';c.font='20px '+FS;c.fillText(_L('Kelembapan','Humidity'),W/2,360);
    c.fillStyle='#1b1f24';c.font='700 56px '+FS;c.fillText(d.h==null?'nan':Math.round(d.h)+' %',W/2,420);
    const x0=30,y0=500,w=W-60,h=130;c.strokeStyle='#d6dde1';c.lineWidth=2;c.strokeRect(x0,y0,w,h);
    if(d.hist.length>1){c.strokeStyle='#e0782a';c.lineWidth=4;c.beginPath();d.hist.forEach((v,i)=>{const x=x0+i/(d.hist.length-1)*w,y=y0+h-(v/50)*h;i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();}
    c.fillStyle='#8a969e';c.font='16px '+FS;c.fillText(_L('grafik suhu 0–50 °C · refresh 5 detik','temperature chart 0–50 °C · refresh 5 s'),W/2,660);
  }});
}

/* ================= 1. PINOUT EXPLORER ================= */
const FILTERS=[['safe',_L('Keamanan','Safety')],['pwm','PWM'],['adc','Analog (ADC)'],['touch',_L('Sentuh','Touch')],['dac','DAC'],['i2c','I2C'],['spi','SPI'],['uart','UART'],['input',_L('Hanya input','Input-only')],['strap','Strapping'],['power',_L('Daya','Power')]];
let pinMode='safe',selPin='D2',exp=null;
function renderPinCard(){
  const p=PIN_BY[selPin];const ex=pinExample(p);
  $('#pinCard').innerHTML=`<div class="pin-head"><span class="pin-name">${esc(p.label)}</span><span class="pill ${p.safe}">${SAFE_TXT[p.safe]}</span></div>
  <div class="pin-gpio">${p.gpio!==null?_L(`GPIO ${p.gpio} · di kode Arduino tulis <b>${p.gpio}</b>`,`GPIO ${p.gpio} · in Arduino code write <b>${p.gpio}</b>`):_L('Bukan pin GPIO','Not a GPIO pin')}</div>
  <div class="fns">${p.fn.map(f=>`<span class="fn">${esc(f)}</span>`).join('')}</div>
  <p class="pin-note">${esc(p.note)}</p>${ex?`<div class="pin-ex">${esc(ex)}</div>`:''}`;
  $$('.pinbtn').forEach(b=>b.setAttribute('aria-current',b.dataset.pin===selPin?'true':'false'));
}
function renderPinUI(){
  const fEl=$('#pinFilters');
  fEl.innerHTML=FILTERS.map(f=>`<button class="chip" type="button" data-f="${f[0]}" aria-pressed="${f[0]===pinMode}">${f[1]}</button>`).join('');
  fEl.onclick=e=>{const b=e.target.closest('[data-f]');if(!b)return;pinMode=b.dataset.f;renderPinUI();if(exp)exp.paint();};
  $('#safeLegend').hidden=pinMode!=='safe';
  const row=p=>{const dim=pinMode!=='safe'&&!p.tags.includes(pinMode);return `<li><button class="pinbtn${dim?' dimmed':''}" type="button" data-pin="${p.id}"><i class="dot ${p.safe}"></i>${esc(p.label)}<span class="g">${p.gpio!==null?'GPIO '+p.gpio:esc(p.fn[0])}</span></button></li>`;};
  $('#pinListL').innerHTML=PIN_L.map(row).join('');$('#pinListR').innerHTML=PIN_R.map(row).join('');
  renderPinCard();
}
function selectPin(id){selPin=id;renderPinCard();if(exp)exp.select(id);}
document.addEventListener('click',e=>{const b=e.target.closest('.pinbtn');if(b)selectPin(b.dataset.pin);});
renderPinUI();onLang(renderPinUI);

function initExplorer(){
  const host=$('#stage-board');
  const v=new Viewer(host,{fov:34,fitWidth:6.6,minDist:2.2,maxDist:16,maxPolar:Math.PI*.92});
  v.setView([.3,4.6,5.8],[0,.55,0]);
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(8,5),new THREE.MeshBasicMaterial({map:ctex(256,160,(c,w,h)=>{const gr=c.createRadialGradient(w/2,h/2,8,w/2,h/2,w/2);gr.addColorStop(0,'rgba(0,0,0,.32)');gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(0,0,w,h);}),transparent:true,depthWrite:false}));
  sh.rotation.x=-Math.PI/2;v.scene.add(sh);
  const b=makeESP32();b.group.position.y=.74;v.scene.add(b.group);
  const ringM=new THREE.MeshBasicMaterial({color:cssv('--accent')||'#b15f19'});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.2,.024,8,40),ringM);ring.rotation.x=-Math.PI/2;b.group.add(ring);
  const beamM=new THREE.MeshBasicMaterial({color:cssv('--accent')||'#b15f19',transparent:true,opacity:.3,depthWrite:false});
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1,12,1,true),beamM);b.group.add(beam);
  const tag=anchor(b.group,0,0,0);const selL=v.addLabel(tag,'','sel keep');
  const lblMod=v.addLabel(anchor(b.group,1.0,.4,0),'Modul ESP32-WROOM-32','dim');
  const lblUsb=v.addLabel(anchor(b.group,-2.6,.4,0),'USB','dim');
  const lblAnt=v.addLabel(anchor(b.group,2.3,.2,0),_L('Antena WiFi/BT','WiFi/BT antenna'),'dim');
  const lblBtn=v.addLabel(anchor(b.group,-2.25,.35,.75),'BOOT','dim');
  const lblEn=v.addLabel(anchor(b.group,-2.25,.35,-.75),'EN','dim');
  themeFns.push(()=>{const a=cssv('--accent');ringM.color.set(a);beamM.color.set(a);paint();});
  for(const p of PINS){const P=b.pins[p.id];v.clickables.push({obj:P.hit,onClick:()=>selectPin(p.id),tip:()=>p.label+(p.gpio!==null?' · GPIO '+p.gpio:'')});}
  function paint(){
    for(const p of PINS){const P=b.pins[p.id];let show=false,col=cssv('--signal');
      if(pinMode==='safe'){show=true;col=cssv('--'+p.safe);}else show=p.tags.includes(pinMode);
      P.cap.visible=show;P.cap.material.color.set(col||'#35c4d8');}
  }
  function select(id){const P=b.pins[id];const x=P.anchor.position.x,z=P.anchor.position.z;ring.position.set(x,.22,z);beam.position.set(x,.72,z);tag.position.set(x,1.3,z);selL.set(esc(PIN_BY[id].label)+(PIN_BY[id].gpio!==null?' · GPIO '+PIN_BY[id].gpio:''));}
  v.onFrame=(dt,t)=>{const s=1+Math.sin(t*4)*.12;ring.scale.set(s,s,s);b.setIO2(selPin==='D2'?(Math.sin(t*6)>0?1:0):0);};
  paint();select(selPin);
  exp={paint:paint,select:select,v:v};
}

/* ================= 2. CARA KERJA ================= */
const WIFI_STEPS={
 sta:[[_L('Tersambung ke router','Join the router'),_L('ESP32 mencari nama WiFi dan login dengan password.','The ESP32 looks for the WiFi name and logs in with the password.')],[_L('Dapat alamat IP','Get an IP address'),_L('Router memberi alamat lewat DHCP, misalnya 192.168.1.23.','The router assigns an address over DHCP, for example 192.168.1.23.')],[_L('Kirim data ke internet','Send data to the internet'),_L('Data sensor dikirim lewat router ke server cloud (HTTP atau MQTT).','Sensor data travels through the router to a cloud server (HTTP or MQTT).')],[_L('HP menerima data','The phone receives it'),_L('Aplikasi di HP mengambil data dari cloud, dari mana saja.','An app on the phone pulls the data from the cloud, from anywhere.')]],
 ap:[[_L('ESP32 jadi hotspot','The ESP32 becomes a hotspot'),_L('ESP32 memancarkan WiFi sendiri bernama ESP32-AP.','The ESP32 broadcasts its own WiFi called ESP32-AP.')],[_L('HP tersambung ke ESP32-AP','The phone joins ESP32-AP'),_L('Tanpa router dan tanpa internet.','No router and no internet.')],[_L('HP membuka 192.168.4.1','The phone opens 192.168.4.1'),_L('Browser mengirim permintaan ke web server di ESP32.','The browser sends a request to the web server on the ESP32.')],[_L('ESP32 membalas halaman','The ESP32 replies with a page'),_L('Halaman kontrol tampil di HP.','The control page appears on the phone.')]]
};
const WIFI_CODE={sta:'WiFi.begin(_L("NAMA_WIFI","WIFI_NAME"), "PASSWORD");\nwhile (WiFi.status() != WL_CONNECTED) delay(500);\nSerial.println(WiFi.localIP());',ap:'WiFi.softAP("ESP32-AP", "12345678");\nSerial.println(WiFi.softAPIP());  // 192.168.4.1'};
function buildWifi(v){
  const G=new THREE.Group();v.scene.add(G);
  const b=makeESP32();b.group.position.set(-4.3,.74,1.1);b.group.rotation.y=.2;G.add(b.group);
  const router=makeRouter();router.group.position.set(-.3,0,-1.9);G.add(router.group);
  const cloud=makeCloud();cloud.group.position.set(3.4,3.6,-3.4);G.add(cloud.group);
  const phone=makePhone();phone.group.position.set(4.6,0,1.3);phone.group.rotation.y=-.45;G.add(phone.group);
  const bL=v.addLabel(b.group,'ESP32','hot',[0,1.0,0]);
  v.addLabel(router.group,_L('Router WiFi','WiFi router'),'',[0,1.9,0]);v.addLabel(cloud.group,'Internet / cloud','',[0,1.0,0]);v.addLabel(phone.group,_L('HP kamu','Your phone'),'',[0,3.3,0]);
  const ant=wp(b.antenna),rt=wp(router.top),cl=wp(cloud.group),ph=wp(phone.anchor);
  const C={BR:arcCurve(ant,rt,1.2),RB:arcCurve(rt,ant,1.2),RC:arcCurve(rt,cl,.6),CP:arcCurve(cl,ph,.8),BP:arcCurve(ant,ph,1.8),PB:arcCurve(ph,ant,1.8)};
  const lines={BR:dashLine(C.BR,SIG),RC:dashLine(C.RC,SIG),CP:dashLine(C.CP,SIG),BP:dashLine(C.BP,SIG)};Object.values(lines).forEach(l=>G.add(l));
  const rings=makeRings(G,ant,SIG);const trav=makeTraveler(G,PKT);
  let mode='sta',el=0,lastStep=-1,key='';
  const stepsEl=$('#wifiSteps');
  function renderSteps(){stepsEl.innerHTML=WIFI_STEPS[mode].map((s,i)=>`<li data-i="${i}"><span class="n">${i+1}</span><div><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div></li>`).join('');$('#wifiCode').innerHTML=hl(WIFI_CODE[mode]);lastStep=-1;}
  function setMode(m){mode=m;el=0;renderSteps();$$('#wifiMode .chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.mode===m));router.group.visible=cloud.group.visible=m==='sta';}
  $('#wifiMode').addEventListener('click',e=>{const c=e.target.closest('[data-mode]');if(c)setMode(c.dataset.mode);});
  function screen(k){if(k===key)return;key=k;
    if(k==='wait')scr(phone,{wifi:'WiFi',body:(c,W,H)=>{c.fillStyle='#5b6770';c.font='600 22px '+FS;c.fillText(_L('Menunggu data…','Waiting for data…'),W/2,H/2);}});
    else if(k==='val')scr(phone,{wifi:'WiFi',url:'app.cloud',body:(c,W,H)=>{c.fillStyle='#5b6770';c.font='22px '+FS;c.fillText(_L('Suhu ruangan','Room temperature'),W/2,250);c.fillStyle='#1b1f24';c.font='700 68px '+FS;c.fillText('27.4 °C',W/2,330);c.fillStyle='#8a969e';c.font='18px '+FS;c.fillText(_L('dari ESP32 lewat internet','from the ESP32 over the internet'),W/2,400);}});
    else if(k==='list'||k==='conn')scr(phone,{wifi:k==='conn'?'ESP32-AP':'',body:(c,W,H)=>{c.textAlign='left';c.fillStyle='#1b1f24';c.font='700 30px '+FS;c.fillText('WiFi',26,100);
      [['ESP32-AP',k==='conn'?_L('Tersambung, tanpa internet','Connected, no internet'):_L('Ketuk untuk sambung','Tap to connect'),true],[_L('Rumah_2.4G','Home_2.4G'),_L('Tersimpan','Saved'),false],[_L('Kantor-5G','Office-5G'),'',false]].forEach((r,i)=>{const y=150+i*84;if(r[2]){c.fillStyle='#fde7d2';rr(c,14,y,W-28,72,12);c.fill();}c.fillStyle='#1b1f24';c.font='600 22px '+FS;c.fillText(r[0],30,y+28);c.fillStyle='#6b7780';c.font='16px '+FS;c.fillText(r[1],30,y+54);});}});
    else if(k==='load')scr(phone,{wifi:'ESP32-AP',url:'192.168.4.1',body:(c,W,H)=>{c.fillStyle='#5b6770';c.font='600 22px '+FS;c.fillText(_L('Memuat…','Loading…'),W/2,H/2);}});
    else if(k==='page')ledPage(phone,true,true,'192.168.4.1');
  }
  setMode('sta');
  return {relang(){renderSteps();key='';$$('li',stepsEl).forEach((li,i)=>li.classList.toggle('on',i===lastStep));},group:G,cam:[.2,6.4,10.2],target:[-.1,1.2,-.4],fit:14,
    update(dt,t){
      el+=dt*(RM?.6:1);const T=8,tt=el%T,step=Math.floor(tt/2),p=(tt%2)/2,sta=mode==='sta';
      if(step!==lastStep){lastStep=step;$$('li',stepsEl).forEach((li,i)=>li.classList.toggle('on',i===step));}
      rings.update(el,step===0?1:.3);router.blink(t);
      lines.BR.visible=lines.RC.visible=lines.CP.visible=sta;lines.BP.visible=!sta;
      if(sta){lines.BR.material.opacity=step===0?p*.8:.8;lines.RC.material.opacity=step>=2?.8:.15;lines.CP.material.opacity=step>=3?.8:.15;}
      else lines.BP.material.opacity=step>=1?.8:p*.4;
      let pos=null;
      if(sta){if(step===1)pos=C.RB.getPointAt(p);else if(step===2)pos=p<.5?C.BR.getPointAt(p*2):C.RC.getPointAt(p*2-1);else if(step===3)pos=C.CP.getPointAt(p);}
      else{if(step===1||step===2)pos=C.PB.getPointAt(p);else if(step===3)pos=C.BP.getPointAt(p);}
      trav.visible=!!pos;if(pos)trav.position.copy(pos);
      if(sta){screen(step===3&&p>.9?'val':'wait');bL.set(step>=1&&!(step===1&&p<.9)?'ESP32 · 192.168.1.23':'ESP32');}
      else{screen(step===0?'list':step===1?(p>.9?'conn':'list'):step===2?'load':(p>.9?'page':'load'));bL.set('ESP32 · hotspot 192.168.4.1');}
    }};
}
function buildAdc(v){
  const G=new THREE.Group();v.scene.add(G);
  const b=makeESP32();b.group.position.set(-2.4,.74,.5);G.add(b.group);
  const pot=makePot();pot.group.position.set(2.6,0,1.7);pot.group.rotation.y=-.25;G.add(pot.group);
  v.addLabel(pot.group,_L('Potensiometer 10 kΩ','10 kΩ potentiometer'),'',[0,1.25,0]);
  G.add(makeWire(b.pins['3V3'].anchor,pot.a.vcc,RED));G.add(makeWire(b.pins.GND_R.anchor,pot.a.gnd,K));
  const wSig=makeWire(b.pins.D34.anchor,pot.a.sig,YEL,{unique:true,lift:1.2});G.add(wSig);
  v.addLabel(anchor(G,b.group.position.x+PIN_X(3),1.25,b.group.position.z-1.15),'D34','hot');
  const bits=[],geo=new THREE.BoxGeometry(.42,.42,.42);
  for(let i=0;i<12;i++){const m=new THREE.MeshStandardMaterial({color:'#3a4852',emissive:SIG,emissiveIntensity:0,roughness:.5});put(new THREE.Mesh(geo,m),-3.0+i*.55,3.3,-1.5,G);bits.push(m);}
  const valL=v.addLabel(anchor(G,0,3.8,-1.5),'','big');
  v.addLabel(anchor(G,-3.0,2.55,-1.5),'bit 11','dim');v.addLabel(anchor(G,3.05,2.55,-1.5),'bit 0','dim');
  const colX=5.3;
  const frame=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.6,3,.6)),new THREE.LineBasicMaterial({color:'#8aa0ab'}));frame.position.set(colX,1.5,-.7);G.add(frame);
  const fill=put(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#e0782a',emissive:'#e0782a',emissiveIntensity:.3})),colX,0,-.7,G);
  const vL=v.addLabel(anchor(G,colX,3.3,-.7),'','hot');
  const slider=$('#adcSlider'),autoC=$('#adcAuto');let lastRaw=-1;
  slider.addEventListener('input',()=>{autoC.checked=false;});
  return {relang(){lastRaw=-1;},group:G,cam:[.8,6.2,9.6],target:[.8,1.6,-.2],fit:12.8,update(dt,t){
    let pos=slider.value/1000;if(autoC.checked){pos=.5+.5*Math.sin(t*.7);slider.value=Math.round(pos*1000);}
    pot.setAngle(lerp(2.36,-2.36,pos));
    const V=pos*3.3,raw=Math.round(pos*4095);
    fill.scale.set(.56,Math.max(.001,pos*3),.56);fill.position.y=pos*1.5;
    wSig.userData.mat.emissive.set(YEL);wSig.userData.mat.emissiveIntensity=pos*.9;
    if(raw!==lastRaw){lastRaw=raw;const bin=raw.toString(2).padStart(12,'0');
      bits.forEach((m,i)=>{const on=bin[i]==='1';m.color.set(on?'#1aa6bb':'#3a4852');m.emissiveIntensity=on?.7:0;});
      valL.set('analogRead(34) = '+raw);vL.set(V.toFixed(2)+' V');
      $('#adcPct').textContent=Math.round(pos*100)+'%';$('#adcV').textContent=V.toFixed(2)+' V';$('#adcRaw').textContent=raw;$('#adcBin').textContent=bin;}
  }};
}
function buildPwm(v){
  const G=new THREE.Group();v.scene.add(G);
  const b=makeESP32();b.group.position.set(-3.6,.74,.9);G.add(b.group);
  const bb=makeMiniBB(2.8,1.5);bb.position.set(2.0,.15,1.5);G.add(bb);
  const R=makeResistor(4,BANDS_220);R.group.position.set(1.0,.3,1.2);G.add(R.group);
  const L=makeLED('#ff3b30');L.group.position.set(1.0+1.016,.3,1.5);G.add(L.group);
  G.add(makeWire(b.pins.D18.anchor,anchor(G,1.0,.3,1.95),YEL));
  G.add(makeWire(b.pins.GND_R.anchor,anchor(G,1.0+1.27,.3,1.95),K));
  v.addLabel(L.group,'LED','',[.13,1.0,0]);
  const xs=-3.4,xe=3.6,yL=1.8,yH=3.0,z=-1.4;
  const segM=new THREE.MeshBasicMaterial({color:SIG}),unit=new THREE.BoxGeometry(1,1,1),pool=[];
  const seg=i=>{if(!pool[i]){pool[i]=new THREE.Mesh(unit,segM);G.add(pool[i]);}return pool[i];};
  const base=new THREE.Mesh(new THREE.BoxGeometry(xe-xs,.015,.015),new THREE.MeshBasicMaterial({color:'#8aa0ab'}));base.position.set((xs+xe)/2,yL,z);G.add(base);
  const avg=new THREE.Mesh(new THREE.BoxGeometry(xe-xs,.035,.035),new THREE.MeshBasicMaterial({color:'#e0782a'}));G.add(avg);
  v.addLabel(anchor(G,(xs+xe)/2,yH+.55,z),_L('Sinyal di pin D18','Signal on pin D18'),'big');
  v.addLabel(anchor(G,xs-.45,yH+.12,z),'3.3 V','dim');v.addLabel(anchor(G,xs-.45,yL+.12,z),'0 V','dim');
  const avgA=anchor(G,xe+.1,0,z);const avgL=v.addLabel(avgA,'','hot');
  const slider=$('#pwmSlider'),slow=$('#pwmSlow');let off=0,lastD=-1;
  function draw(P,d){let i=0;const th=.06;
    const add=(x1,y1,x2,y2)=>{const m=seg(i++);m.visible=true;if(y1===y2){m.position.set((x1+x2)/2,y1,z);m.scale.set(Math.max(x2-x1,.001)+th,th,th);}else{m.position.set(x1,(y1+y2)/2,z);m.scale.set(th,Math.abs(y2-y1)+th,th);}};
    const n=Math.ceil((xe-xs)/P)+2;
    for(let k=-1;k<n;k++){const x0=xs+(k-1)*P+off,x1=x0+d*P,x2=x0+P;
      let a=Math.max(x0,xs),c=Math.min(x1,xe);if(d>0&&c>a)add(a,yH,c,yH);
      a=Math.max(x1,xs);c=Math.min(x2,xe);if(d<1&&c>a)add(a,yL,c,yL);
      if(d>0&&d<1){if(x0>=xs&&x0<=xe)add(x0,yL,x0,yH);if(x1>=xs&&x1<=xe)add(x1,yL,x1,yH);}}
    for(let j=i;j<pool.length;j++)pool[j].visible=false;}
  return {relang(){lastD=-1;},group:G,cam:[.4,6,9.8],target:[.2,1.6,0],fit:12.6,update(dt){
    const d=slider.value/100,isSlow=slow.checked,P=isSlow?1.75:.45;
    off=(off+dt*(isSlow?.875:6))%P;draw(P,d);
    const yA=yL+d*(yH-yL);avg.position.set((xs+xe)/2,yA,z+.02);avgA.position.y=yA;
    if(isSlow){const u=(((xe-xs-off)%P)+P)%P/P;L.set(u<d?1:0);}else L.set(d);
    if(d!==lastD){lastD=d;const val=Math.round(d*255);$('#pwmPct').textContent=Math.round(d*100)+'%';$('#pwmVal').textContent=val;$('#pwmAvg').textContent=(d*3.3).toFixed(2)+' V';avgL.set(_L('rata-rata ','average ')+(d*3.3).toFixed(2)+' V');}
  }};
}
function initHow(){
  const host=$('#stage-how');const v=new Viewer(host,{fov:38,maxDist:30});addFloor(v);
  const S={wifi:buildWifi(v),adc:buildAdc(v),pwm:buildPwm(v)};let cur='wifi';
  function show(k){cur=k;Object.keys(S).forEach(n=>S[n].group.visible=n===k);$$('[data-how-panel]').forEach(p=>p.hidden=p.dataset.howPanel!==k);$$('#howTabs .tab').forEach(t=>t.setAttribute('aria-selected',t.dataset.how===k));v.setView(S[k].cam,S[k].target,S[k].fit);}
  $('#howTabs').addEventListener('click',e=>{const t=e.target.closest('[data-how]');if(t)show(t.dataset.how);});
  v.onFrame=(dt,t)=>S[cur].update(dt,t);show('wifi');
  onLang(()=>Object.values(S).forEach(x=>x.relang&&x.relang()));
  return v;
}

/* --- DOM project list, tab, kode --- */
// rangkaian simulator yang cocok untuk tiap project (kode project ikut dimuat)
const SIM_OF={blink:'blink',button:'button',fade:'pot',dht:'dht',sonar:'parkir',pir:'pir',relay:'relay',servo:'servo',motor:'motor'};
let curProj=store('esp32lab-proj');if(!PROJ_BY[curProj])curProj='blink';
function renderPList(){
  const groups={};PROJECTS.forEach(p=>(groups[p.cat]=groups[p.cat]||[]).push(p));
  $('#plist').innerHTML=Object.keys(groups).map(g=>`<div class="pgroup"><div class="pgroup-t">${esc(g)}</div>${groups[g].map(p=>`<button class="pitem" type="button" data-proj="${p.id}" aria-current="${p.id===curProj}"><span class="num">#${String(p.n).padStart(2,'0')}</span><span>${esc(p.title)}</span><span class="ck${done[p.id]?' done':''}">✓</span></button>`).join('')}</div>`).join('');
}
function renderProjText(){
  const P=PROJ_BY[curProj];
  $('#pCat').textContent=`Project ${P.n} · ${P.cat}`;$('#pTitle').textContent=P.title;$('#pDesc').textContent=P.desc;
  $('#pDone').textContent=done[P.id]?_L('Selesai ✓','Done ✓'):_L('Tandai selesai','Mark as done');$('#pDone').className='btn '+(done[P.id]?'on':'ghost');
  $('#pParts').innerHTML=P.parts.map(x=>`<li>${esc(x)}</li>`).join('');
  $('#pLibsWrap').hidden=!P.libs.length;$('#pLibs').innerHTML=P.libs.map(x=>`<li>${esc(x)}</li>`).join('');
  $('#pWiring').innerHTML=P.wiring.map(w=>`<tr><td><span class="sw" style="background:${w[2]}"></span>${esc(w[0])}</td><td>${esc(w[1])}</td></tr>`).join('');
  $('#pNote').textContent=P.note;
  $('#codeName').textContent=`${String(P.n).padStart(2,'0')}_${P.id}.ino`;
  $('#codeOut').innerHTML=hl(codeOf(P.id));
  $('#pSim').hidden=!SIM_OF[P.id];$('#pNoSim').hidden=!!SIM_OF[P.id];
}
function selectProj(id,scroll){
  if(!PROJ_BY[id])return;curProj=id;store('esp32lab-proj',id);renderPList();renderProjText();
  if(scroll)$('#project').scrollIntoView({behavior:RM?'auto':'smooth'});
}
onLang(()=>{renderPList();renderProjText();});
$('#plist').addEventListener('click',e=>{const b=e.target.closest('[data-proj]');if(!b)return;selectProj(b.dataset.proj);
  // di HP daftar project ada di atas detailnya, jadi gulir ke detail yang baru dipilih
  if(innerWidth<=1020)$('.lab-main').scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});});
// daftar semua pin: terbuka di layar lebar, tertutup di HP supaya halaman tidak terlalu panjang
{const d=$('#pinAll');if(d&&innerWidth>760)d.open=true;}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');if(g){selectProj(g.dataset.go,true);return;}
  const gp=e.target.closest('[data-go-path]');if(gp){const el=$('#path-adv');if(el)el.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});}
});
$('#pDone').addEventListener('click',()=>{done[curProj]=!done[curProj];store('esp32lab-done',done);renderPList();renderProjText();renderPath();});
$('#labTabs').addEventListener('click',e=>{const t=e.target.closest('[data-lab]');if(!t)return;$$('#labTabs .tab').forEach(x=>x.setAttribute('aria-selected',x===t));$$('[data-lab-panel]').forEach(p=>p.hidden=p.dataset.labPanel!==t.dataset.lab);});
$('#copyBtn').addEventListener('click',e=>copyText(codeOf(curProj),e.currentTarget,$('#codeOut')));
$('#pSim').addEventListener('click',()=>{const k=SIM_OF[curProj];const w=window.__esp32lab;if(k&&w&&w.openSim)w.openSim(k,codeOf(curProj));});

/* ============ kritik & saran (dikirim ke email lewat Web3Forms) ============ */
(function(){
  const f=$('#fbForm');if(!f)return;
  const st=$('#fbStatus'),btn=$('#fbSend'),msgEl=$('#fbMsg'),emailEl=$('#fbEmail');
  const say=(t,c)=>{st.textContent=t;st.className='fb-status'+(c?' '+c:'');};
  onLang(()=>say(''));
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    if(btn.disabled)return;
    const msg=msgEl.value.trim(),email=emailEl.value.trim();
    if(msg.length<5){say(_L('Tulis pesannya dulu, minimal beberapa kata.','Please write a message first.'),'err');msgEl.focus();return;}
    if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){say(_L('Format email belum benar.','That email address doesn\'t look right.'),'err');emailEl.focus();return;}
    // honeypot: kolom tersembunyi ini hanya diisi bot
    if(f.botcheck.checked){f.reset();say(_L('Terima kasih! Pesanmu sudah terkirim.','Thanks! Your message has been sent.'),'ok');return;}
    const key=(window.ESP32LAB_CONFIG||{}).web3formsKey;
    if(!key){say(_L('Form belum aktif. Coba lagi nanti.','The form isn\'t active yet. Please try again later.'),'err');return;}
    const r=f.querySelector('input[name=jenis]:checked');const jenis=r?r.nextElementSibling.textContent:'';
    btn.disabled=true;say(_L('Mengirim…','Sending…'));
    try{
      const res=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify({access_key:key,subject:'[ESP32 Lab] '+jenis+': '+msg.slice(0,60),from_name:'ESP32 Lab',
          name:$('#fbName').value.trim()||'(anonim)',email:email||undefined,message:msg,
          jenis:jenis,bahasa:LANG,layar:innerWidth+'×'+innerHeight,perangkat:navigator.userAgent})});
      const d=await res.json().catch(()=>({}));
      if(!res.ok||!d.success)throw new Error(d.message||res.status);
      f.reset();say(_L('Terima kasih! Pesanmu sudah terkirim.','Thanks! Your message has been sent.'),'ok');
    }catch(err){
      console.error(err);say(_L('Gagal mengirim. Cek koneksi internet lalu coba lagi.','Couldn\'t send it. Check your connection and try again.'),'err');
    }finally{btn.disabled=false;}
  });
})();

/* ============ start ============ */
let howV=null;
if(HAS3D){
  // bangun tampilan 3D hanya saat bagiannya mendekati layar
  const lazy=(sel,fn)=>{const el=$(sel);if(!el)return;const io=new IntersectionObserver(es=>{if(es.some(x=>x.isIntersecting)){io.disconnect();try{fn();}catch(err){console.error(err);}}},{rootMargin:'400px 0px'});io.observe(el);};
  lazy('#stage-board',()=>initExplorer());
  lazy('#stage-how',()=>{howV=initHow();});
  document.addEventListener('click',e=>{const r=e.target.closest('[data-reset]');if(!r)return;const k=r.dataset.reset;if(k==='board'&&exp)exp.v.reset();if(k==='how'&&howV)howV.reset();});
  requestAnimationFrame(tick);
}else{
  $$('.stage').forEach(s=>{s.insertAdjacentHTML('beforeend',_L('<div class="stage-err">Tampilan 3D butuh WebGL, dan browser ini tidak mendukungnya. Materi lain di halaman tetap bisa dibaca.</div>','<div class="stage-err">The 3D view needs WebGL, which this browser does not support. The rest of the page still works.</div>'));});
}
selectProj(curProj,false);
})();
