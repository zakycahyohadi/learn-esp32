(function(){
'use strict';
try{if(window.parent!==window&&window.parent.__esp32lab){document.documentElement.classList.add('embedded');const t=window.parent.document.documentElement.getAttribute('data-theme');if(t)document.documentElement.setAttribute('data-theme',t);}}catch(e){}
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

const K='#26292d',RED='#d63a2f',YEL='#f0b429',GRN='#2fa85a',BLU='#2f7fd6',ORG='#f07c1a',PUR='#8a5cd6',WHT='#e4e4e4',BRN='#7a4a26';
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


/* ===== Penerjemah Arduino C++ (subset) -> JavaScript generator ===== */
const TR=(function(){
  const TYPE_WORDS='(?:(?:unsigned|signed)\\s+)?(?:long\\s+long|long\\s+int|long\\s+double|long|int|short|float|double|bool|boolean|byte|char|String|word|size_t|auto|uint8_t|uint16_t|uint32_t|uint64_t|int8_t|int16_t|int32_t|int64_t)';
  const INT_T=/^(?:(?:unsigned|signed)\s+)?(?:long\s+long|long\s+int|long|int|short|byte|word|size_t|uint\d+_t|int\d+_t)$/;
  const INT_FN=new Set(['millis','micros','analogRead','digitalRead','map','random','__i','__idiv','constrain','pulseIn','touchRead','abs','analogReadMilliVolts','available']);
  const CLASSES='DHT|Servo|WebServer|WiFiServer|WiFiClient';

  function matchParen(s,i){ // s[i] === '(' or '[' or '{'
    const open=s[i],close=open==='('?')':open==='['?']':'}';let d=0;
    for(let k=i;k<s.length;k++){const c=s[k];if(c===open)d++;else if(c===close){d--;if(d===0)return k;}}
    return -1;
  }
  function matchParenBack(s,i){ // s[i] === ')'
    let d=0;for(let k=i;k>=0;k--){const c=s[k];if(c===')')d++;else if(c==='('){d--;if(d===0)return k;}}return -1;
  }
  // operand yang dimulai di posisi i (setelah spasi)
  function operandEnd(s,i){
    while(i<s.length&&/[ \t]/.test(s[i]))i++;
    let k=i;
    if(s[k]==='-'||s[k]==='!'||s[k]==='~')k++;
    if(s[k]==='('){const e=matchParen(s,k);return e<0?-1:e+1;}
    const m=/^[A-Za-z_$][\w$]*|^\d[\w.]*/.exec(s.slice(k));
    if(!m)return -1;k+=m[0].length;
    for(;;){
      if(s[k]==='('||s[k]==='['){const e=matchParen(s,k);if(e<0)return -1;k=e+1;continue;}
      if(s[k]==='.'&&/[A-Za-z_]/.test(s[k+1]||'')){const mm=/^\.[A-Za-z_$][\w$]*/.exec(s.slice(k));k+=mm[0].length;continue;}
      break;
    }
    return k;
  }
  function operandStartBack(s,i){ // i = index terakhir operand (bukan spasi)
    let k=i;
    for(;;){
      if(s[k]===')'||s[k]===']'){const o=s[k]===')'?matchParenBack(s,k):(()=>{let d=0;for(let q=k;q>=0;q--){if(s[q]===']')d++;else if(s[q]==='['){d--;if(d===0)return q;}}return -1;})();if(o<0)return -1;k=o-1;
        // nama fungsi / array sebelum kurung
        let q=k;while(q>=0&&/[\w$.]/.test(s[q]))q--;if(q<k){k=q;}
        if(s[k]===')'||s[k]===']')continue;return k+1;}
      let q=k;while(q>=0&&/[\w$.]/.test(s[q]))q--;return q<k?q+1:-1;
    }
  }
  function splitTopComma(s){const out=[];let d=0,st=0;for(let i=0;i<s.length;i++){const c=s[i];if('([{'.includes(c))d++;else if(')]}'.includes(c))d--;else if(c===','&&d===0){out.push(s.slice(st,i));st=i+1;}}out.push(s.slice(st));return out;}
  function stmtEnd(s,i){ // cari ; atau , di kedalaman 0, atau ) penutup
    let d=0;for(let k=i;k<s.length;k++){const c=s[k];if('([{'.includes(c))d++;else if(')]}'.includes(c)){if(d===0)return k;d--;}else if((c===';'||c===',')&&d===0)return k;}return s.length;
  }

  function lint(src){
    const errs=[];
    const lines=src.replace(/\r/g,'').split('\n');
    // buang komentar & string (kasar) per baris
    let inBlock=false;
    const clean=lines.map(l=>{let o='',i=0;while(i<l.length){if(inBlock){const j=l.indexOf('*/',i);if(j<0){i=l.length;}else{inBlock=false;i=j+2;}continue;}
      if(l[i]==='/'&&l[i+1]==='/')break;if(l[i]==='/'&&l[i+1]==='*'){inBlock=true;i+=2;continue;}
      if(l[i]==='"'||l[i]==="'"){const q=l[i];let j=i+1;while(j<l.length&&l[j]!==q){if(l[j]==='\\')j++;j++;}o+=q+q;i=j+1;continue;}
      o+=l[i];i++;}return o.replace(/\s+$/,'');});
    // keseimbangan kurung
    let d={'{':0,'(':0},lastOpen=0;
    clean.forEach((l,n)=>{for(const c of l){if(c==='{'){d['{']++;lastOpen=n;}else if(c==='}'){d['{']--;if(d['{']<0&&!errs.length)errs.push({line:n+1,msg:_L('Ada "}" yang tidak punya pasangan "{".','There is a "}" without a matching "{".')});}}});
    if(!errs.length&&d['{']>0)errs.push({line:lastOpen+1,msg:_L('Kurung kurawal "{" belum ditutup dengan "}".','A "{" is never closed with "}".')});
    clean.forEach((l,n)=>{let p=0;for(const c of l){if(c==='(')p++;else if(c===')')p--;}
      if(p!==0&&!errs.length){const nx=(clean[n+1]||'').trim();if(p>0&&/[,&|+\-*\/(]$/.test(l.trim()))return;if(p<0&&/^[)]/.test(l.trim()))return;if(p>0&&nx&&!/^[;{]/.test(nx))return;errs.push({line:n+1,msg:p>0?_L('Kurung "(" belum ditutup.','A "(" is never closed.'):_L('Ada ")" yang berlebih.','There is an extra ")".')});}});
    if(errs.length)return errs;
    // titik koma yang hilang
    for(let n=0;n<clean.length;n++){
      const t=clean[n].trim();if(!t||t.startsWith('#'))continue;
      if(/[;{},:]$/.test(t))continue;
      if(/^(if|else|for|while|switch|do|case|default)\b/.test(t)||/^\}/.test(t))continue;
      if(/[(+\-*\/%&|=<>?!,]$/.test(t))continue;
      let nx='';for(let q=n+1;q<clean.length;q++){if(clean[q].trim()){nx=clean[q].trim();break;}}
      if(/^[{.+\-*\/&|?:)\]]/.test(nx)||/^(<<|>>)/.test(nx))continue;
      if(/\)\s*$/.test(t)&&/^\{/.test(nx))continue;
      if(/^(void|int|float|long|bool|String|double|char|byte|unsigned)\b.*\)\s*$/.test(t))continue;
      errs.push({line:n+1,msg:_L('Sepertinya kurang titik koma ";" di akhir baris ini.','This line looks like it is missing a semicolon ";" at the end.')});break;
    }
    return errs;
  }

  function transpile(src){
    const errs=[],warns=[];const strs=[];
    let s=src.replace(/\r/g,'');
    if(/\bclass\s+\w+/.test(s)||/\bstruct\s+\w+/.test(s)||/\btemplate\s*</.test(s))errs.push({line:0,msg:_L('class, struct, dan template belum didukung simulator.','class, struct, and templates are not supported by the simulator yet.')});
    // 1. samarkan string, komentar, char
    let o='',i=0;
    while(i<s.length){
      const c=s[i],n=s[i+1];
      if(c==='/'&&n==='/'){let j=s.indexOf('\n',i);if(j<0)j=s.length;strs.push(s.slice(i,j));o+=`__Q${strs.length-1}__`;i=j;continue;}
      if(c==='/'&&n==='*'){let j=s.indexOf('*/',i+2);j=j<0?s.length:j+2;const blk=s.slice(i,j);strs.push(blk.replace(/\n/g,' '));o+=`__Q${strs.length-1}__`+'\n'.repeat((blk.match(/\n/g)||[]).length);i=j;continue;}
      if(c==='"'){let j=i+1;while(j<s.length&&s[j]!=='"'&&s[j]!=='\n'){if(s[j]==='\\')j++;j++;}strs.push(s.slice(i,j+1));o+=`__Q${strs.length-1}__`;i=j+1;continue;}
      if(c==="'"){let j=i+1,code;if(s[j]==='\\'){const e=s[j+1];code={n:10,t:9,r:13,'0':0,'\\':92,"'":39,'"':34}[e];if(code===undefined)code=e.charCodeAt(0);j+=2;}else{code=s.charCodeAt(j);j+=1;}
        if(s[j]==="'"){o+=`__ch(${code})`;i=j+1;continue;}}
      o+=c;i++;
    }
    s=o;
    const libs=new Set(),intVars=new Set(),charVars=new Set(),declared=new Set(),defaults=new Map(),stringVars=new Set();
    // 2. preprocessor
    s=s.split('\n').map(l=>{const t=l.trim();let m;
      if((m=t.match(/^#include\s*(?:<([^>]+)>|__Q(\d+)__)/))){libs.add(m[1]||strs[+m[2]].replace(/"/g,''));return '';}
      if((m=t.match(/^#define\s+(\w+)\(([^)]*)\)\s+(.+)$/))){declared.add(m[1]);return `const ${m[1]} = (${m[2]}) => (${m[3].replace(/__Q\d+__\s*$/,'')});`;}
      if((m=t.match(/^#define\s+(\w+)\s+(.+)$/))){declared.add(m[1]);const v=m[2].replace(/__Q\d+__\s*$/,'').trim();if(/^-?\d+[uUlL]*$/.test(v))intVars.add(m[1]);return `const ${m[1]} = ${v};`;}
      if(t.startsWith('#'))return '';
      return l;}).join('\n');
    // 3. akhiran angka
    s=s.replace(/\b(\d+)(?:UL|ul|LL|ll|L|l|U|u)\b/g,'$1').replace(/\b(\d+\.\d*|\.\d+)[fF]\b/g,'$1');
    // 4. static lokal -> global
    const hoisted=[];
    {let depth=0,out='',k=0;const re=new RegExp(`\\bstatic\\s+(?:const\\s+)?(${TYPE_WORDS})\\s*\\*?\\s*(\\w+)\\s*(?:=\\s*([^;]+))?;`,'y');
      while(k<s.length){const c=s[k];if(c==='{')depth++;else if(c==='}')depth--;
        if(c==='s'&&s.startsWith('static',k)&&!/[\w$]/.test(s[k-1]||'')){re.lastIndex=k;const m=re.exec(s);
          if(m&&depth>0){hoisted.push(`let ${m[2]} = ${m[3]!=null?(INT_T.test(m[1].trim())?`__i(${m[3]})`:m[3]):'0'};`);declared.add(m[2]);if(INT_T.test(m[1].trim()))intVars.add(m[2]);k+=m[0].length;continue;}
          if(!m||depth===0){if(s.startsWith('static ',k)){k+=7;continue;}}}
        out+=c;k++;}
      s=out;}
    // 5. definisi fungsi
    const fnNames=new Set();
    const FN=new RegExp(`(^|[;}\\n])([ \\t]*)(?:inline\\s+|IRAM_ATTR\\s+)*(void|${TYPE_WORDS})\\s*[*&]?\\s+(?:IRAM_ATTR\\s+)?([A-Za-z_]\\w*)\\s*\\(([^()]*)\\)\\s*(\\{|;)`,'g');
    s=s.replace(FN,(m,pre,ws,type,name,params,end)=>{
      if(/^(if|while|for|switch|return|else)$/.test(name))return m;
      if(end===';')return pre+ws+m.slice(pre.length+ws.length).replace(/[^\n]/g,'');
      fnNames.add(name);declared.add(name);
      if(INT_T.test(type.trim()))INT_FN.add(name);
      const p=params.trim();
      const ps=(p===''||p==='void')?'':splitTopComma(p).map(x=>{x=x.trim();const mm=x.match(/([A-Za-z_]\w*)\s*(\[\s*\])?\s*(=\s*([\s\S]+))?$/);if(!mm)return x;
        const typ=x.slice(0,mm.index).replace(/\bconst\b/g,'').replace(/[*&]/g,'').trim();if(INT_T.test(typ))intVars.add(mm[1]);if(typ==='char')charVars.add(mm[1]);
        return mm[1]+(mm[3]?' = '+mm[4]:'');}).join(', ');
      return `${pre}${ws}function* ${name}(${ps}) {`;
    });
    // 6. objek library
    s=s.replace(new RegExp(`(^|[;{}\\n])([ \\t]*)(${CLASSES})\\s+([A-Za-z_]\\w*)\\s*(\\(([^;]*)\\))?\\s*;`,'g'),(m,pre,ws,cls,name,_p,args)=>{declared.add(name);return `${pre}${ws}let ${name} = new ${cls}(${args||''});`;});
    s=s.replace(new RegExp(`(^|[;{}\\n])([ \\t]*)(${CLASSES})\\s+([A-Za-z_][\\w\\s,]*);`,'g'),(m,pre,ws,cls,list)=>{const names=list.split(',').map(x=>x.trim()).filter(Boolean);names.forEach(n=>declared.add(n));return `${pre}${ws}let ${names.map(n=>`${n} = new ${cls}()`).join(', ')};`;});
    // 7. array
    s=s.replace(new RegExp(`\\b(?:const\\s+)?(${TYPE_WORDS})\\s*\\*?\\s*([A-Za-z_]\\w*)\\s*((?:\\[[^\\]]*\\]\\s*)+)(?=(\\s*=\\s*\\{)?)`,'g'),(m,type,name,dims,init,off,str)=>{
      declared.add(name);
      if(init){return `let ${name} __ARR_OPEN__`;}
      const ds=dims.match(/\[([^\]]*)\]/g).map(x=>x.slice(1,-1).trim());
      if(str.slice(off+m.length).trimStart().startsWith(';'))return ds.length>1?`let ${name} = __arr2(${ds[0]}, ${ds[1]})`:`let ${name} = __arr(${ds[0]||0})`;
      return m;});
    // ganti { } inisialisasi array jadi [ ]
    for(let k=s.indexOf('__ARR_OPEN__');k>=0;k=s.indexOf('__ARR_OPEN__')){
      const rest=s.slice(k+12);const brace=rest.indexOf('{');const start=k+12+brace;const end=matchParen(s,start);
      let inner=s.slice(start,end+1).replace(/\{/g,'[').replace(/\}/g,']');
      s=s.slice(0,k)+s.slice(k+12,start)+inner+s.slice(end+1);
    }
    // 8. deklarasi variabel
    s=s.replace(new RegExp(`\\b(?:const\\s+)?(?:volatile\\s+)?(${TYPE_WORDS})(?:\\s*[*&]\\s*|\\s+)(?=[A-Za-z_])`,'g'),(m,type,off,str)=>{
      const after=str.slice(off+m.length);const nm=(after.match(/^([A-Za-z_]\w*)/)||[])[1];
      if(!nm||/^(if|while|for|return|else)$/.test(nm))return m;
      // kumpulkan semua nama dalam deklarasi
      const end=stmtEnd(after,0);const decl=after.slice(0,end);
      splitTopComma(decl).forEach(part=>{const q=part.trim().match(/^\*?\s*([A-Za-z_]\w*)/);if(q){declared.add(q[1]);defaults.set(q[1],type.trim()==='String'||/\*/.test(m)?'""':'0');if(type.trim()==='String')stringVars.add(q[1]);if(INT_T.test(type.trim()))intVars.add(q[1]);if(type.trim()==='char'&&!/\*/.test(m))charVars.add(q[1]);}});
      return 'let ';});
    // nilai awal untuk deklarasi tanpa '='
    {let k=0;while((k=s.indexOf('let ',k))>=0){if(/[\w$]/.test(s[k-1]||'')){k+=4;continue;}const st=k+4;let d=0,q=st;for(;q<s.length;q++){const c=s[q];if('([{'.includes(c))d++;else if(')]}'.includes(c)){if(d===0)break;d--;}else if(c===';'&&d===0)break;}
      const body=s.slice(st,q);const parts=splitTopComma(body);let changed=false;
      const np=parts.map(pt=>{if(/=/.test(pt))return pt;const nm=pt.trim();if(!/^[A-Za-z_]\w*$/.test(nm))return pt;changed=true;return `${pt.replace(/\s+$/,'')} = ${defaults.get(nm)||'0'}`;});
      if(changed)s=s.slice(0,st)+np.join(',')+s.slice(q);k=st;}}
    // 9. cast
    s=castPass(s);
    // 10. pembagian bilangan bulat
    s=idivPass(s,intVars);
    // 11. pembulatan saat mengisi variabel int
    s=intAssignPass(s,intVars);
    // 11b. char & String
    s=wrapAssign(s,charVars,'__toChar');
    if(stringVars.size){const names=[...stringVars].join('|');const re=new RegExp(`(^|[^\\w$.])(${names})\\s*\\+=`,'g');let m;
      while((m=re.exec(s))){const st=m.index+m[0].length;const end=stmtEnd(s,st);const ex=s.slice(st,end);const rep=` __sc(${ex.trim()})`;s=s.slice(0,st)+rep+s.slice(end);re.lastIndex=st+rep.length;}}
    s=s.replace(/\bSerial\.(print|println|write)\(\s*__ch\((\d+)\)\s*\)/g,'Serial.$1(__toChar($2))');
    // 12. lain-lain
    s=s.replace(/\.length\s*\(\s*\)/g,'.length').replace(/\bString\s*\(/g,'__Str(').replace(/\bF\s*\(/g,'(').replace(/\b(NULL|nullptr)\b/g,'null').replace(/->/g,'.').replace(/\bsizeof\s*\(/g,'__sizeof(');
    s=s.replace(/\bcase\s+__ch\((\d+)\)/g,'case $1');
    s=s.replace(/\bSerial\.(print|println)\(\s*([A-Za-z_]\w*)\s*\)/g,(m,f,v)=>charVars.has(v)?`Serial.${f}(__toChar(${v}))`:m);
    // 13. panggilan fungsi user & delay -> yield
    s=yieldPass(s,fnNames);
    // 14. penjaga loop
    s=guardPass(s);
    // kembalikan string
    s=s.replace(/__Q(\d+)__/g,(m,k)=>strs[+k]);
    const hoistedJs=hoisted.map(h=>h.replace(/__Q(\d+)__/g,(m,k)=>strs[+k])).join(' ');
    if(!fnNames.has('setup'))errs.push({line:0,msg:_L('Fungsi void setup() tidak ditemukan.','The void setup() function was not found.')});
    if(!fnNames.has('loop'))errs.push({line:0,msg:_L('Fungsi void loop() tidak ditemukan.','The void loop() function was not found.')});
    return {js:s,hoisted:hoistedJs,libs:[...libs],errs,warns,declared,fnNames};
  }

  function castPass(s){
    const re=/\(\s*(unsigned\s+long|unsigned\s+int|unsigned\s+char|long|int|byte|short|word|uint8_t|uint16_t|uint32_t|int16_t|int32_t|float|double|char|bool|boolean|String)\s*\)/g;
    let m;
    while((m=re.exec(s))){
      const st=m.index,after=st+m[0].length;const e=operandEnd(s,after);if(e<0)continue;
      const opnd=s.slice(after,e).trim();const t=m[1].replace(/\s+/g,' ');
      let rep;
      if(/^(float|double)$/.test(t))rep=`Number(${opnd})`;
      else if(t==='char')rep=`__toChar(${opnd})`;
      else if(/^(bool|boolean)$/.test(t))rep=`!!(${opnd})`;
      else if(t==='String')rep=`__Str(${opnd})`;
      else rep=`__i(${opnd})`;
      s=s.slice(0,st)+rep+s.slice(e);re.lastIndex=st+rep.length;
    }
    return s;
  }
  function isIntExpr(e,intVars){
    e=e.trim();if(/^\d+$/.test(e))return true;
    if(/\d\.\d|\.\d|\d\./.test(e))return false;
    const ids=e.match(/[A-Za-z_$][\w$]*(\s*\()?/g)||[];if(!ids.length)return false;
    return ids.every(id=>{const n=id.replace(/\s*\($/,'');if(/\($/.test(id))return INT_FN.has(n);return intVars.has(n)||n==='HIGH'||n==='LOW';});
  }
  function idivPass(s,intVars){
    let k=0;
    while((k=s.indexOf('/',k))>=0){
      if(s[k+1]==='='||s[k+1]==='/'||s[k+1]==='*'||s[k-1]==='*'){k++;continue;}
      let lb=k-1;while(lb>=0&&/[ \t]/.test(s[lb]))lb--;
      const ls=operandStartBack(s,lb);const re=operandEnd(s,k+1);
      if(ls<0||re<0){k++;continue;}
      const L=s.slice(ls,lb+1),R=s.slice(k+1,re);
      if(isIntExpr(L,intVars)&&isIntExpr(R,intVars)){const rep=`__idiv(${L}, ${R.trim()})`;s=s.slice(0,ls)+rep+s.slice(re);k=ls+rep.length;}
      else k++;
    }
    return s;
  }
  function intAssignPass(s,intVars){
    if(!intVars.size)return s;
    const names=[...intVars].map(n=>n.replace(/\$/g,'\\$')).join('|');
    const re=new RegExp(`(^|[^\\w$.])(${names})\\s*(=(?!=)|\\/=)`,'g');let m;
    while((m=re.exec(s))){
      const nameStart=m.index+m[1].length;
      // lewati jika ini parameter bawaan fungsi (function* f(a = 1))
      const before=s.slice(Math.max(0,nameStart-200),nameStart);
      if(/function\*\s+\w+\s*\([^)]*$/.test(before)){continue;}
      const opEnd=m.index+m[0].length;const end=stmtEnd(s,opEnd);
      const expr=s.slice(opEnd,end);if(!expr.trim()||/^\s*__i\(/.test(expr)){continue;}
      let rep;
      if(m[3]==='/=')rep=`${m[2]} = __idiv(${m[2]}, ${expr.trim()})`;
      else rep=`${m[2]} = __i(${expr.trim()})`;
      s=s.slice(0,nameStart)+rep+s.slice(end);re.lastIndex=nameStart+rep.length;
    }
    return s;
  }
  function wrapAssign(s,vars,fn){
    if(!vars.size)return s;const names=[...vars].join('|');
    const re=new RegExp(`(^|[^\\w$.])(${names})\\s*=(?!=)`,'g');let m;
    while((m=re.exec(s))){const st=m.index+m[0].length;const end=stmtEnd(s,st);const ex=s.slice(st,end);if(!ex.trim()){continue;}const rep=` ${fn}(${ex.trim()})`;s=s.slice(0,st)+rep+s.slice(end);re.lastIndex=st+rep.length;}
    return s;
  }
  function yieldPass(s,fnNames){
    const names=[...fnNames,'delay','delayMicroseconds','yield'];
    const re=new RegExp(`(?<![\\w$.])(${names.join('|')})\\s*\\(`,'g');
    const hits=[];let m;while((m=re.exec(s))){const pre=s.slice(Math.max(0,m.index-12),m.index);if(/function\*\s*$/.test(pre))continue;hits.push({i:m.index,name:m[1],p:m.index+m[0].length-1});}
    for(let h=hits.length-1;h>=0;h--){const {i,name,p}=hits[h];const e=matchParen(s,p);if(e<0)continue;
      const args=s.slice(p+1,e);let rep;
      if(name==='delay')rep=`(yield __delay(${args}))`;
      else if(name==='delayMicroseconds')rep=`(yield __delayUs(${args}))`;
      else if(name==='yield')rep=`(yield 0)`;
      else rep=`(yield* ${name}(${args}))`;
      s=s.slice(0,i)+rep+s.slice(e+1);}
    return s;
  }
  function guardPass(s){
    const G=' if(__g()) yield 0; ';
    const re=/(?<![\w$])(for|while)\s*\(/g;let m;const hits=[];
    while((m=re.exec(s)))hits.push({i:m.index,kw:m[1],p:m.index+m[0].length-1});
    for(let h=hits.length-1;h>=0;h--){const {i,kw,p}=hits[h];const e=matchParen(s,p);if(e<0)continue;
      if(kw==='while'){let b=i-1;while(b>=0&&/\s/.test(s[b]))b--;if(s[b]==='}'){let d=0,q=b;for(;q>=0;q--){if(s[q]==='}')d++;else if(s[q]==='{'){d--;if(d===0)break;}}let r=q-1;while(r>=0&&/\s/.test(s[r]))r--;if(s.slice(Math.max(0,r-1),r+1)==='do')continue;}}
      let k=e+1;while(k<s.length&&/[ \t\n]/.test(s[k]))k++;
      if(s[k]==='{'){s=s.slice(0,k+1)+G+s.slice(k+1);}
      else if(s[k]===';'){s=s.slice(0,k)+'{'+G+'}'+s.slice(k+1);}
      else{let d=0,q=k;for(;q<s.length;q++){const c=s[q];if('([{'.includes(c))d++;else if(')]}'.includes(c))d--;else if(c===';'&&d===0)break;}s=s.slice(0,k)+'{'+G+s.slice(k,q+1)+'}'+s.slice(q+1);}
    }
    s=s.replace(/\bdo\s*\{/g,'do {'+G);
    return s;
  }
  return {transpile,lint};
})();
if(typeof module!=='undefined')module.exports=TR;

/* ===================== SIMULATOR ESP32 ===================== */
const GP2ID={};PINS.forEach(p=>{if(p.gpio!==null)GP2ID[p.gpio]=p.id;});
const INPUT_ONLY=new Set([34,35,36,39]);
const clampN=(x,a,b)=>Math.max(a,Math.min(b,x));

/* ---------- breadboard 400 titik ---------- */
const BBS={cols:30,p:.254,cx:2.6,top:.32,d:4.6};
BBS.w=(BBS.cols-1)*BBS.p+1.1;
const bx=ix=>BBS.cx-(BBS.cols-1)*BBS.p/2+ix*BBS.p;
const bz=iz=>Math.sign(iz)*(.3+(Math.abs(iz)-1)*.254);
const rz=(side,kind)=>(side==='far'?-1:1)*(kind==='gnd'?1.75:2.0);
const ROW_IZ=[-5,-4,-3,-2,-1,1,2,3,4,5];
const rowLetter=iz=>'abcdefghij'[ROW_IZ.indexOf(iz)];
const railHole=ix=>ix%6!==5;
function makeSimBreadboard(){
  const PX=100,W=Math.round(BBS.w*PX),H=Math.round(BBS.d*PX),x0=BBS.cx-BBS.w/2,cx=x=>(x-x0)*PX,cy=z=>(z+BBS.d/2)*PX;
  const tex=ctex(W,H,c=>{
    c.fillStyle='#ece8de';c.fillRect(0,0,W,H);c.fillStyle='#d4cfc2';c.fillRect(0,cy(-.1),W,.2*PX);
    c.fillStyle='#3b3a36';for(let ix=0;ix<BBS.cols;ix++)for(const iz of ROW_IZ)c.fillRect(cx(bx(ix))-4,cy(bz(iz))-4,8,8);
    for(const side of ['near','far'])for(const kind of ['gnd','vcc']){const z=rz(side,kind);c.fillStyle='#3b3a36';for(let ix=0;ix<BBS.cols;ix++){if(!railHole(ix))continue;c.fillRect(cx(bx(ix))-4,cy(z)-4,8,8);}
      const outer=kind==='vcc';const lz=z+(side==='near'?(outer?.14:-.14):(outer?-.14:.14));c.fillStyle=kind==='gnd'?'#2f6fd6':'#d63a2f';c.fillRect(14,cy(lz)-1.5,W-28,3);
      c.font='bold 20px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(kind==='gnd'?'–':'+',cx(bx(0))-26,cy(z));c.fillText(kind==='gnd'?'–':'+',cx(bx(BBS.cols-1))+26,cy(z));}
    c.fillStyle='#8a867c';c.font='13px monospace';c.textAlign='center';c.textBaseline='middle';
    for(let ix=0;ix<BBS.cols;ix++)if(ix===0||(ix+1)%5===0){c.fillText(String(ix+1),cx(bx(ix)),cy(bz(-5))-20);c.fillText(String(ix+1),cx(bx(ix)),cy(bz(5))+20);}
    ROW_IZ.forEach(iz=>{c.fillText(rowLetter(iz),cx(bx(0))-22,cy(bz(iz)));c.fillText(rowLetter(iz),cx(bx(BBS.cols-1))+22,cy(bz(iz)));});
  });
  const s=std('#e3dfd4');const m=new THREE.Mesh(new THREE.BoxGeometry(BBS.w,.32,BBS.d),[s,s,new THREE.MeshStandardMaterial({map:tex,roughness:.8}),s,s,s]);m.position.set(BBS.cx,.16,0);return m;
}
function holeNear(x,z,tol){
  tol=tol||.12;const ix=Math.round((x-bx(0))/BBS.p);
  if(ix<0||ix>=BBS.cols||Math.abs(x-bx(ix))>tol)return null;
  for(const iz of ROW_IZ)if(Math.abs(z-bz(iz))<tol)return `h:${ix}:${iz}`;
  for(const side of ['near','far'])for(const kind of ['gnd','vcc'])if(Math.abs(z-rz(side,kind))<tol&&railHole(ix))return `r:${side}:${kind}:${ix}`;
  return null;
}
const stripOf=h=>{const s=h.split(':');return s[0]==='h'?`S:${s[1]}:${+s[2]<0?'t':'b'}`:`R:${s[1]}:${s[2]}`;};

/* ---------- model tambahan ---------- */
const LED_VF={'#ff3b30':1.9,'#ffcc00':2.0,'#2fd158':2.1,'#3a86ff':2.9,'#f5f5f5':3.0};
const LED_COLORS=[['#ff3b30',_L('Merah','Red')],['#ffcc00',_L('Kuning','Yellow')],['#2fd158',_L('Hijau','Green')],['#3a86ff',_L('Biru','Blue')],['#f5f5f5',_L('Putih','White')]];
const RES_VALUES=[[100,'100 Ω'],[220,'220 Ω'],[330,'330 Ω'],[1000,'1 kΩ'],[10000,'10 kΩ']];
function bandsFor(o){const D=['#111111','#6b3a1e','#d12d2d','#e07b1a','#e8c21a','#2f9e44','#2f6fd6','#8a5cd6','#8a8a8a','#f2f2f2'];const s=String(o);const d1=+s[0],d2=+(s[1]||0),mul=s.length-2;return [D[d1],D[d2],D[Math.max(0,mul)],'#c9a227'];}
function makeSimLED(color){
  const g=new THREE.Group();
  const m=stdU(color,{transparent:true,opacity:.9,roughness:.25,emissive:new THREE.Color(color),emissiveIntensity:.06});
  put(cyl(.12,.12,.26,m,20),.127,.5,0,g);put(sph(.12,m,20,12),.127,.63,0,g);put(cyl(.14,.14,.04,m,20),.127,.37,0,g);
  const leg=LEGM();put(cyl(.013,.013,.37,leg,6),0,.185,0,g);put(cyl(.013,.013,.3,leg,6),.254,.15,0,g);put(box(.03,.02,.03,leg),.254,.31,0,g);
  const light=new THREE.PointLight(color,0,3,2);put(light,.127,.62,0,g);
  const gl=glow(color,1.3);put(gl,.127,.6,0,g);
  const smoke=glow('#555555',1.2);smoke.material.blending=THREE.NormalBlending;put(smoke,.127,1.0,0,g);
  return {group:g,set(l){l=clampN(l,0,1);m.emissiveIntensity=.06+l*1.8;light.intensity=l*1.5;gl.material.opacity=l*.85;},
    burn(b){if(b){m.color.set('#4a4540');m.emissive.set('#000000');m.opacity=1;light.intensity=0;gl.material.opacity=0;}},
    smoke(t,on){smoke.material.opacity=on?.35+.2*Math.sin(t*3):0;smoke.position.y=1.0+(on?(t*.3)%0.5:0);}};
}
function makeBBPot(){
  const g=new THREE.Group(),leg=LEGM();
  for(const x of [-.254,0,.254])put(box(.04,.32,.04,leg),x,.16,0,g);
  put(box(.9,.5,.5,std('#2f5fb3',{roughness:.5})),0,.56,-.05,g);
  const knob=new THREE.Group();put(knob,0,.81,-.05,g);
  put(cyl(.26,.28,.3,std('#22262a',{roughness:.6}),24),0,.15,0,knob);put(box(.05,.03,.22,std('#f2f2f2')),0,.31,-.13,knob);
  return {group:g,setPos(f){knob.rotation.y=lerp(2.36,-2.36,f);}};
}
function makeLDR(){
  const g=new THREE.Group(),leg=LEGM();
  put(cyl(.012,.012,.5,leg,6),0,.25,0,g);put(cyl(.012,.012,.5,leg,6),.254,.25,0,g);
  const tex=ctex(64,64,c=>{c.fillStyle='#d9a066';c.fillRect(0,0,64,64);c.strokeStyle='#7a3b12';c.lineWidth=5;c.beginPath();c.moveTo(14,12);for(let i=0;i<5;i++){c.lineTo(50,12+i*9);c.lineTo(50,16+i*9);c.lineTo(14,16+i*9);c.lineTo(14,21+i*9);}c.stroke();});
  const side=std('#e8d9c0');put(new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.07,24),[side,new THREE.MeshStandardMaterial({map:tex,roughness:.4}),side]),.127,.53,0,g);
  const sun=new THREE.Group();put(sun,.127,1.7,0,g);
  const coreM=new THREE.MeshBasicMaterial({color:'#ffd24a',transparent:true,opacity:.3});sun.add(sph(.15,coreM,16,12));const gl=glow('#ffd24a',1.8);sun.add(gl);
  return {group:g,setLight(l){coreM.opacity=.12+l*.88;gl.material.opacity=l*.9;}};
}
function makeBuzzerBB(){
  const g=new THREE.Group(),leg=LEGM();
  put(cyl(.012,.012,.22,leg,6),0,.11,0,g);put(cyl(.012,.012,.22,leg,6),.508,.11,0,g);
  const body=put(cyl(.4,.4,.38,std('#141618',{roughness:.5}),28),.254,.41,0,g);
  put(cyl(.06,.06,.01,std('#3a3f45'),16),.254,.605,0,g);put(box(.1,.01,.03,std('#f2f2f2')),.06,.605,0,g);put(box(.03,.01,.1,std('#f2f2f2')),.06,.605,0,g);
  const rings=makeRings(g,new THREE.Vector3(.254,.62,0),'#e0782a',3);let on=0;
  return {group:g,set(v){on=v?1:0;},update(dt,t){rings.update(t,on,1.4,2.2);body.position.x=.254+(on?Math.sin(t*90)*.01:0);}};
}

/* ---------- katalog komponen ---------- */
const CAT={
 res:{name:'Resistor',grp:_L('Dasar','Basics'),legs:[['1',0,0],['2',1.016,0]],props:{ohm:220},hint:_L('Membatasi arus','Limits current')},
 led:{name:'LED',grp:_L('Dasar','Basics'),legs:[['A',0,0],['K',.254,0]],pinLabel:{A:_L('anoda + (kaki panjang)','anode + (long leg)'),K:_L('katoda − (kaki pendek)','cathode − (short leg)')},props:{color:'#ff3b30'},hint:_L('Lampu kecil','Small light')},
 btn:{name:_L('Tombol','Button'),grp:_L('Dasar','Basics'),legs:[['1a',0,-.3],['2a',.508,-.3],['1b',0,.3],['2b',.508,.3]],links:[['1a','1b'],['2a','2b']],props:{},hint:_L('Taruh di tengah breadboard','Straddles the centre gap')},
 pot:{name:_L('Potensiometer','Potentiometer'),grp:'Input',legs:[['1',-.254,0],['W',0,0],['2',.254,0]],pinLabel:{'1':_L('kaki 1','leg 1'),'W':_L('wiper (tengah)','wiper (middle)'),'2':_L('kaki 2','leg 2')},props:{pos:50},hint:'10 kΩ'},
 ldr:{name:'LDR',grp:'Input',legs:[['1',0,0],['2',.254,0]],props:{light:60},hint:_L('Sensor cahaya','Light sensor')},
 dht:{name:'DHT11',grp:'Input',legs:[['DATA',-.254,0],['VCC',0,0],['GND',.254,0]],props:{t:28,h:65},hint:_L('Suhu & kelembapan','Temperature & humidity')},
 sonar:{name:'HC-SR04',grp:'Input',legs:[['VCC',-.381,0],['TRIG',-.127,0],['ECHO',.127,0],['GND',.381,0]],props:{cm:40},hint:_L('Sensor jarak','Distance sensor')},
 pir:{name:'PIR',grp:'Input',legs:[['VCC',-.254,.42],['OUT',0,.42],['GND',.254,.42]],props:{motion:false},hint:_L('Sensor gerak','Motion sensor')},
 buz:{name:'Buzzer',grp:'Output',legs:[['+',0,0],['-',.508,0]],props:{},hint:_L('Buzzer aktif','Active buzzer')},
 servo:{name:'Servo SG90',grp:'Output',pins:['GND','VCC','SIG'],pinLabel:{GND:_L('GND (kabel coklat)','GND (brown wire)'),VCC:_L('VCC (kabel merah)','VCC (red wire)'),SIG:_L('sinyal (kabel oranye)','signal (orange wire)')},props:{},hint:_L('Sudut 0–180°','Angle 0–180°')},
 l298:{name:_L('Driver L298N','L298N driver'),grp:_L('Motor & daya','Motors & power'),pins:['IN1','IN2','IN3','IN4','ENA','ENB','12V','GND','5V','OUT1','OUT2','OUT3','OUT4'],props:{jumperA:false,jumperB:false},hint:_L('Pengendali motor','Motor controller')},
 motor:{name:_L('Motor DC + roda','DC motor + wheel'),grp:_L('Motor & daya','Motors & power'),pins:['M1','M2'],props:{},hint:_L('Dinamo kuning TT','Yellow TT gear motor')},
 bat:{name:_L('Baterai 2×18650','2×18650 battery'),grp:_L('Motor & daya','Motors & power'),pins:['+','-'],props:{on:true},hint:_L('7,4 V','7.4 V')},
 relay:{name:_L('Modul relay','Relay module'),grp:_L('Motor & daya','Motors & power'),pins:['VCC','GND','IN','COM','NO','NC'],pinLabel:{IN:_L('IN (aktif LOW)','IN (active LOW)'),COM:_L('COM (tengah)','COM (common)'),NO:'NO (normally open)',NC:'NC (normally closed)'},props:{},hint:_L('Saklar, aktif LOW','Switch, active LOW')},
 lamp:{name:_L('Lampu DC','DC lamp'),grp:_L('Motor & daya','Motors & power'),pins:['A','B'],props:{},hint:_L('Lampu 7–12 V','7–12 V lamp')}
};
const CAT_ORDER=['res','led','btn','pot','ldr','dht','sonar','pir','buz','servo','l298','motor','bat','relay','lamp'];

/* ---------- contoh ---------- */
const LEDKIT=(pin)=>({parts:[{type:'res',hole:[4,2]},{type:'led',hole:[8,3]}],wires:[[`m:${pin}`,'h:4:4',YEL],['h:9:5','r:near:gnd:9',K]]});
function ex(parts,wires,code,name){return {name,parts,wires,code};}
const EXAMPLES=[
 ['blink',_L('1. LED berkedip','1. Blinking LED'),()=>{const k=LEDKIT('D23');return ex(k.parts,[...k.wires,['m:GND_R','r:near:gnd:1',K]],_L(String.raw`// Contoh 1: LED berkedip
// Rangkaian: D23 -> resistor 220 ohm -> LED -> GND
const int LED_PIN = 23;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("Mulai berkedip!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED nyala");
  delay(500);
  digitalWrite(LED_PIN, LOW);
  Serial.println("LED mati");
  delay(500);
}
`,String.raw`// Example 1: blinking LED
// Circuit: D23 -> 220 ohm resistor -> LED -> GND
const int LED_PIN = 23;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("Starting to blink!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED on");
  delay(500);
  digitalWrite(LED_PIN, LOW);
  Serial.println("LED off");
  delay(500);
}
`));}],
 ['button',_L('2. Tombol menyalakan LED','2. Button turns on LED'),()=>{const k=LEDKIT('D23');return ex([...k.parts,{type:'btn',hole:[16,-1]}],[...k.wires,['m:GND_R','r:near:gnd:1',K],['m:D4','h:16:-3',BLU],['h:18:3','r:near:gnd:18',K]],_L(String.raw`// Contoh 2: tombol dengan INPUT_PULLUP
// Tombol dilepas = HIGH, ditekan = LOW
const int BUTTON_PIN = 4;
const int LED_PIN = 23;

int terakhir = HIGH;

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int tombol = digitalRead(BUTTON_PIN);
  if (tombol == LOW) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  if (tombol != terakhir) {
    Serial.println(tombol == LOW ? "Ditekan" : "Dilepas");
    terakhir = tombol;
  }
  delay(20);
}
`,String.raw`// Example 2: button with INPUT_PULLUP
// Button released = HIGH, pressed = LOW
const int BUTTON_PIN = 4;
const int LED_PIN = 23;

int last = HIGH;

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int button = digitalRead(BUTTON_PIN);
  if (button == LOW) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  if (button != last) {
    Serial.println(button == LOW ? "Pressed" : "Released");
    last = button;
  }
  delay(20);
}
`));}],
 ['pot',_L('3. Potensiometer mengatur terang LED','3. Potentiometer sets LED brightness'),()=>{const k=LEDKIT('D18');return ex([...k.parts,{type:'pot',hole:[20,3]}],[...k.wires,['m:GND_R','r:near:gnd:1',K],['m:3V3','r:near:vcc:0',RED],['h:20:5','r:near:vcc:20',RED],['h:22:5','r:near:gnd:22',K],['h:21:5','m:D34',GRN]],_L(String.raw`// Contoh 3: baca potensiometer, atur terang LED dengan PWM
const int POT_PIN = 34;
const int LED_PIN = 18;

void setup() {
  Serial.begin(115200);
  ledcAttach(LED_PIN, 5000, 8);   // PWM 5 kHz, 8-bit (0-255)
}

void loop() {
  int nilai = analogRead(POT_PIN);          // 0 - 4095
  int terang = map(nilai, 0, 4095, 0, 255);
  ledcWrite(LED_PIN, terang);
  Serial.printf("pot = %d  ->  PWM = %d\n", nilai, terang);
  delay(200);
}
`,String.raw`// Example 3: read a potentiometer, set LED brightness with PWM
const int POT_PIN = 34;
const int LED_PIN = 18;

void setup() {
  Serial.begin(115200);
  ledcAttach(LED_PIN, 5000, 8);   // 5 kHz PWM, 8-bit (0-255)
}

void loop() {
  int value = analogRead(POT_PIN);            // 0 - 4095
  int brightness = map(value, 0, 4095, 0, 255);
  ledcWrite(LED_PIN, brightness);
  Serial.printf("pot = %d  ->  PWM = %d\n", value, brightness);
  delay(200);
}
`));}],
 ['ldr',_L('4. Lampu malam (LDR)','4. Night light (LDR)'),()=>{const k=LEDKIT('D23');return ex([...k.parts,{type:'ldr',hole:[14,3]},{type:'res',hole:[15,2],props:{ohm:10000}}],[...k.wires,['m:GND_R','r:near:gnd:1',K],['m:3V3','r:near:vcc:0',RED],['h:14:5','r:near:vcc:14',RED],['h:19:4','r:near:gnd:19',K],['h:15:5','m:D34',GRN]],_L(String.raw`// Contoh 4: LED menyala saat gelap
// 3V3 -> LDR -> (titik ke D34) -> resistor 10k -> GND
const int LDR_PIN = 34;
const int LED_PIN = 23;
const int BATAS_GELAP = 1500;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int cahaya = analogRead(LDR_PIN);
  Serial.print("cahaya = ");
  Serial.println(cahaya);

  if (cahaya < BATAS_GELAP) {
    digitalWrite(LED_PIN, HIGH);   // gelap: nyalakan
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  delay(300);
}
`,String.raw`// Example 4: LED turns on when it gets dark
// 3V3 -> LDR -> (point to D34) -> 10k resistor -> GND
const int LDR_PIN = 34;
const int LED_PIN = 23;
const int DARK_LIMIT = 1500;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int light = analogRead(LDR_PIN);
  Serial.print("light = ");
  Serial.println(light);

  if (light < DARK_LIMIT) {
    digitalWrite(LED_PIN, HIGH);   // dark: turn on
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  delay(300);
}
`));}],
 ['dht',_L('5. Suhu & kelembapan (DHT11)','5. Temperature & humidity (DHT11)'),()=>ex([{type:'dht',hole:[12,3]}],[['m:GND_R','r:near:gnd:1',K],['m:3V3','r:near:vcc:0',RED],['m:D4','h:12:5',GRN],['h:13:5','r:near:vcc:13',RED],['h:14:4','r:near:gnd:14',K]],_L(String.raw`// Contoh 5: baca DHT11 tiap 2 detik
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(2000);
  float suhu = dht.readTemperature();
  float lembap = dht.readHumidity();

  if (isnan(suhu) || isnan(lembap)) {
    Serial.println("Gagal membaca DHT11!");
    return;
  }
  Serial.printf("Suhu: %.1f C   Kelembapan: %.0f %%\n", suhu, lembap);
}
`,String.raw`// Example 5: read the DHT11 every 2 seconds
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(2000);
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (isnan(temp) || isnan(hum)) {
    Serial.println("Failed to read DHT11!");
    return;
  }
  Serial.printf("Temperature: %.1f C   Humidity: %.0f %%\n", temp, hum);
}
`))],
 ['parkir',_L('6. Sensor parkir (HC-SR04 + buzzer)','6. Parking sensor (HC-SR04 + buzzer)'),()=>ex([{type:'sonar',hole:[14,-3],rot:2},{type:'buz',hole:[20,3]}],[['m:VIN','r:far:vcc:0',RED],['m:GND_L','r:far:gnd:1',K],['h:14:-5','r:far:vcc:14',RED],['h:11:-5','r:far:gnd:12',K],['h:13:-1','m:D5',ORG],['h:12:-1','m:D18',PUR],['m:D25','h:20:5',YEL],['h:22:5','r:near:gnd:22',K],['m:GND_R','r:near:gnd:1',K]],_L(String.raw`// Contoh 6: sensor parkir
// Semakin dekat, bunyi buzzer semakin cepat
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;
const int BUZZER_PIN = 25;

float bacaJarak() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long durasi = pulseIn(ECHO_PIN, HIGH, 30000);
  return durasi * 0.0343 / 2;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  float jarak = bacaJarak();
  Serial.printf("Jarak: %.1f cm\n", jarak);

  if (jarak > 0 && jarak < 50) {
    int jeda = map(jarak, 2, 50, 40, 400);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(60);
    digitalWrite(BUZZER_PIN, LOW);
    delay(jeda);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    delay(200);
  }
}
`,String.raw`// Example 6: parking sensor
// The closer the object, the faster the buzzer beeps
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;
const int BUZZER_PIN = 25;

float readDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  return duration * 0.0343 / 2;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  float distance = readDistance();
  Serial.printf("Distance: %.1f cm\n", distance);

  if (distance > 0 && distance < 50) {
    int pause = map(distance, 2, 50, 40, 400);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(60);
    digitalWrite(BUZZER_PIN, LOW);
    delay(pause);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    delay(200);
  }
}
`))],
 ['pir',_L('7. Alarm gerak (PIR)','7. Motion alarm (PIR)'),()=>{const k=LEDKIT('D23');return ex([...k.parts,{type:'pir',hole:[16,3]}],[...k.wires,['m:GND_R','r:near:gnd:1',K],['m:VIN','r:near:vcc:0',RED],['h:16:5','r:near:vcc:16',RED],['h:17:5','m:D27',PUR],['h:18:5','r:near:gnd:18',K]],_L(String.raw`// Contoh 7: LED menyala saat ada gerakan
const int PIR_PIN = 27;
const int LED_PIN = 23;

bool terakhir = false;

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("Siap mendeteksi gerakan");
}

void loop() {
  bool gerak = digitalRead(PIR_PIN) == HIGH;
  digitalWrite(LED_PIN, gerak ? HIGH : LOW);

  if (gerak != terakhir) {
    Serial.println(gerak ? "Gerakan terdeteksi!" : "Aman");
    terakhir = gerak;
  }
  delay(100);
}
`,String.raw`// Example 7: LED turns on when there is motion
const int PIR_PIN = 27;
const int LED_PIN = 23;

bool last = false;

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("Ready to detect motion");
}

void loop() {
  bool motion = digitalRead(PIR_PIN) == HIGH;
  digitalWrite(LED_PIN, motion ? HIGH : LOW);

  if (motion != last) {
    Serial.println(motion ? "Motion detected!" : "All clear");
    last = motion;
  }
  delay(100);
}
`));}],
 ['servo',_L('8. Servo diputar potensiometer','8. Servo turned by potentiometer'),()=>ex([{type:'pot',hole:[20,3]},{type:'servo',at:[3.2,4.4]}],[['m:GND_R','r:near:gnd:1',K],['m:3V3','r:near:vcc:0',RED],['h:20:5','r:near:vcc:20',RED],['h:22:5','r:near:gnd:22',K],['h:21:5','m:D34',GRN],['m:VIN','p:#1:VCC',RED],['m:GND_R','p:#1:GND',BRN],['m:D13','p:#1:SIG',ORG]],_L(String.raw`// Contoh 8: servo mengikuti potensiometer
#include <ESP32Servo.h>

Servo servo;
const int POT_PIN = 34;
const int SERVO_PIN = 13;

void setup() {
  Serial.begin(115200);
  servo.attach(SERVO_PIN, 500, 2400);
}

void loop() {
  int nilai = analogRead(POT_PIN);
  int sudut = map(nilai, 0, 4095, 0, 180);
  servo.write(sudut);
  Serial.printf("sudut = %d\n", sudut);
  delay(50);
}
`,String.raw`// Example 8: servo follows the potentiometer
#include <ESP32Servo.h>

Servo servo;
const int POT_PIN = 34;
const int SERVO_PIN = 13;

void setup() {
  Serial.begin(115200);
  servo.attach(SERVO_PIN, 500, 2400);
}

void loop() {
  int value = analogRead(POT_PIN);
  int angle = map(value, 0, 4095, 0, 180);
  servo.write(angle);
  Serial.printf("angle = %d\n", angle);
  delay(50);
}
`))],
 ['motor',_L('9. Motor DC + roda (L298N)','9. DC motor + wheel (L298N)'),()=>ex([{type:'l298',at:[3.0,-4.4]},{type:'motor',at:[7.2,-4.6]},{type:'bat',at:[.2,-6.2]}],[['m:D27','p:#0:IN1',BLU],['m:D26','p:#0:IN2',GRN],['m:D14','p:#0:ENA',YEL],['m:GND_L','p:#0:GND',K],['p:#2:+','p:#0:12V',RED],['p:#2:-','p:#0:GND',K],['p:#0:OUT1','p:#1:M1',RED],['p:#0:OUT2','p:#1:M2',K]],_L(String.raw`// Contoh 9: motor DC maju, berhenti, mundur
const int IN1 = 27;
const int IN2 = 26;
const int ENA = 14;

void maju(int kecepatan) {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  ledcWrite(ENA, kecepatan);
}

void mundur(int kecepatan) {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  ledcWrite(ENA, kecepatan);
}

void berhenti() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  ledcWrite(ENA, 0);
}

void setup() {
  Serial.begin(115200);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  ledcAttach(ENA, 1000, 8);
}

void loop() {
  Serial.println("Maju");
  maju(200);
  delay(2000);

  Serial.println("Berhenti");
  berhenti();
  delay(1000);

  Serial.println("Mundur");
  mundur(150);
  delay(2000);

  berhenti();
  delay(1000);
}
`,String.raw`// Example 9: DC motor forward, stop, backward
const int IN1 = 27;
const int IN2 = 26;
const int ENA = 14;

void forward(int speed) {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  ledcWrite(ENA, speed);
}

void backward(int speed) {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  ledcWrite(ENA, speed);
}

void stopMotor() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  ledcWrite(ENA, 0);
}

void setup() {
  Serial.begin(115200);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  ledcAttach(ENA, 1000, 8);
}

void loop() {
  Serial.println("Forward");
  forward(200);
  delay(2000);

  Serial.println("Stop");
  stopMotor();
  delay(1000);

  Serial.println("Backward");
  backward(150);
  delay(2000);

  stopMotor();
  delay(1000);
}
`))],
 ['mobil',_L('10. Mobil robot 2 roda (remote)','10. Two-wheel robot car (remote)'),()=>ex([{type:'l298',at:[3.0,-4.4]},{type:'motor',at:[7.4,-3.9]},{type:'motor',at:[7.4,-6.9]},{type:'bat',at:[.2,-6.4]}],[['m:D27','p:#0:IN1',BLU],['m:D26','p:#0:IN2',GRN],['m:D14','p:#0:ENA',YEL],['m:D25','p:#0:IN3',PUR],['m:D33','p:#0:IN4',ORG],['m:D32','p:#0:ENB',WHT],['m:GND_L','p:#0:GND',K],['p:#3:+','p:#0:12V',RED],['p:#3:-','p:#0:GND',K],['p:#0:OUT1','p:#1:M1',RED],['p:#0:OUT2','p:#1:M2',K],['p:#0:OUT3','p:#2:M1',RED],['p:#0:OUT4','p:#2:M2',K]],_L(String.raw`// Contoh 10: mobil robot 2 roda, dikendalikan lewat Serial
// Kirim huruf: w = maju, s = mundur, a = kiri, d = kanan, x = berhenti
// (atau pakai tombol remote di pojok layar 3D)
const int IN1 = 27;   // motor kiri
const int IN2 = 26;
const int ENA = 14;
const int IN3 = 25;   // motor kanan
const int IN4 = 33;
const int ENB = 32;
int kecepatan = 200;  // 0 - 255

void motor(int pinA, int pinB, int pinEn, int arah) {
  if (arah > 0) {
    digitalWrite(pinA, HIGH);
    digitalWrite(pinB, LOW);
  } else if (arah < 0) {
    digitalWrite(pinA, LOW);
    digitalWrite(pinB, HIGH);
  } else {
    digitalWrite(pinA, LOW);
    digitalWrite(pinB, LOW);
  }
  if (arah == 0) {
    ledcWrite(pinEn, 0);
  } else {
    ledcWrite(pinEn, kecepatan);
  }
}

void jalan(int kiri, int kanan) {
  motor(IN1, IN2, ENA, kiri);
  motor(IN3, IN4, ENB, kanan);
}

void setup() {
  Serial.begin(115200);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  ledcAttach(ENA, 1000, 8);
  ledcAttach(ENB, 1000, 8);
  Serial.println("Siap! Kirim w / a / s / d / x");
}

void loop() {
  if (Serial.available() > 0) {
    char c = Serial.read();
    if (c == 'w') {
      jalan(1, 1);
      Serial.println("Maju");
    } else if (c == 's') {
      jalan(-1, -1);
      Serial.println("Mundur");
    } else if (c == 'a') {
      jalan(-1, 1);
      Serial.println("Belok kiri");
    } else if (c == 'd') {
      jalan(1, -1);
      Serial.println("Belok kanan");
    } else if (c == 'x') {
      jalan(0, 0);
      Serial.println("Berhenti");
    }
  }
}
`,String.raw`// Example 10: two-wheel robot car, driven over Serial
// Send a letter: w = forward, s = back, a = left, d = right, x = stop
// (or use the remote buttons in the corner of the 3D view)
const int IN1 = 27;   // left motor
const int IN2 = 26;
const int ENA = 14;
const int IN3 = 25;   // right motor
const int IN4 = 33;
const int ENB = 32;
int speed = 200;      // 0 - 255

void motor(int pinA, int pinB, int pinEn, int dir) {
  if (dir > 0) {
    digitalWrite(pinA, HIGH);
    digitalWrite(pinB, LOW);
  } else if (dir < 0) {
    digitalWrite(pinA, LOW);
    digitalWrite(pinB, HIGH);
  } else {
    digitalWrite(pinA, LOW);
    digitalWrite(pinB, LOW);
  }
  if (dir == 0) {
    ledcWrite(pinEn, 0);
  } else {
    ledcWrite(pinEn, speed);
  }
}

void drive(int left, int right) {
  motor(IN1, IN2, ENA, left);
  motor(IN3, IN4, ENB, right);
}

void setup() {
  Serial.begin(115200);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  ledcAttach(ENA, 1000, 8);
  ledcAttach(ENB, 1000, 8);
  Serial.println("Ready! Send w / a / s / d / x");
}

void loop() {
  if (Serial.available() > 0) {
    char c = Serial.read();
    if (c == 'w') {
      drive(1, 1);
      Serial.println("Forward");
    } else if (c == 's') {
      drive(-1, -1);
      Serial.println("Back");
    } else if (c == 'a') {
      drive(-1, 1);
      Serial.println("Turn left");
    } else if (c == 'd') {
      drive(1, -1);
      Serial.println("Turn right");
    } else if (c == 'x') {
      drive(0, 0);
      Serial.println("Stop");
    }
  }
}
`))],
 ['relay',_L('11. Relay menyalakan lampu','11. Relay switches a lamp'),()=>ex([{type:'relay',at:[3.0,-4.6]},{type:'lamp',at:[7.0,-4.6]},{type:'bat',at:[.2,-6.4]}],[['m:VIN','p:#0:VCC',RED],['m:GND_L','p:#0:GND',K],['m:D26','p:#0:IN',GRN],['p:#2:+','p:#0:COM',RED],['p:#0:NO','p:#1:A',YEL],['p:#1:B','p:#2:-',K]],_L(String.raw`// Contoh 11: relay menyalakan lampu
// Ketik 1 di Serial Monitor = nyala, 0 = mati
const int RELAY_PIN = 26;

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);   // modul aktif LOW: HIGH = mati
  Serial.println("Ketik 1 = nyala, 0 = mati");
}

void loop() {
  if (Serial.available()) {
    char c = Serial.read();
    if (c == '1') {
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("Lampu NYALA");
    } else if (c == '0') {
      digitalWrite(RELAY_PIN, HIGH);
      Serial.println("Lampu MATI");
    }
  }
}
`,String.raw`// Example 11: a relay switches a lamp
// Type 1 in the Serial Monitor = on, 0 = off
const int RELAY_PIN = 26;

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);   // active-LOW module: HIGH = off
  Serial.println("Type 1 = on, 0 = off");
}

void loop() {
  if (Serial.available()) {
    char c = Serial.read();
    if (c == '1') {
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("Lamp ON");
    } else if (c == '0') {
      digitalWrite(RELAY_PIN, HIGH);
      Serial.println("Lamp OFF");
    }
  }
}
`))],
 ['kosong',_L('Meja kosong','Empty bench'),()=>ex([],[],_L(String.raw`void setup() {
  Serial.begin(115200);
  Serial.println("Halo dari ESP32!");
}

void loop() {

}
`,String.raw`void setup() {
  Serial.begin(115200);
  Serial.println("Hello from the ESP32!");
}

void loop() {

}
`))]
];

/* ======================= ENGINE ======================= */
function initSim(){
  const host=$('#stage-sim');
  const v=new Viewer(host,{fov:36,maxDist:45,maxPolar:Math.PI*.47});addFloor(v);
  const board=makeESP32();board.group.position.set(-4.6,.74,0);v.scene.add(board.group);
  v.addLabel(board.group,'ESP32 DevKit V1','',[0,.75,0]);
  PINS.forEach(p=>{board.pins[p.id].hit.userData.pt='m:'+p.id;});
  const bbMesh=makeSimBreadboard();v.scene.add(bbMesh);
  const root=new THREE.Group();v.scene.add(root);
  v.setView([-.5,11.5,9.2],[-.5,0,-.3],14.2);

  const S={parts:[],wires:[],uid:1,wid:1,sel:null,uf:null,V:new Map(),driven:new Set(),members:new Map(),dirty:true,topo:true,probs:[],tick:0};
  const partBy=u=>S.parts.find(p=>p.uid===u);

  /* ---- titik sambungan ---- */
  function pointPos(id){const s=id.split(':');
    if(s[0]==='h')return new THREE.Vector3(bx(+s[1]),BBS.top,bz(+s[2]));
    if(s[0]==='r')return new THREE.Vector3(bx(+s[3]),BBS.top,rz(s[1],s[2]));
    if(s[0]==='m')return board.pins[s[1]]?wp(board.pins[s[1]].anchor):null;
    if(s[0]==='p'){const P=partBy(+s[1]);return P?pinWorld(P,s.slice(2).join(':')):null;}
    return null;}
  function pointName(id){const s=id.split(':');
    if(s[0]==='h')return _L(`Lubang ${+s[1]+1}${rowLetter(+s[2])}`,`Hole ${+s[1]+1}${rowLetter(+s[2])}`);
    if(s[0]==='r')return _L(`Jalur ${s[2]==='vcc'?'+':'−'} ${s[1]==='near'?'depan':'belakang'}`,`${s[1]==='near'?'Front':'Back'} ${s[2]==='vcc'?'+':'−'} rail`);
    if(s[0]==='m'){const P=PIN_BY[s[1]];return `ESP32 ${P.label}${P.gpio!==null?' (GPIO '+P.gpio+')':''}`;}
    if(s[0]==='p'){const P=partBy(+s[1]);if(!P)return id;const nm=s.slice(2).join(':');const lb=(CAT[P.type].pinLabel||{})[nm]||nm;return `${P.label} · ${lb}`;}
    return id;}
  function pinWorld(P,nm){const C=CAT[P.type];
    if(C.legs){const L=C.legs.find(l=>l[0]===nm);if(!L)return null;P.group.updateMatrixWorld(true);return P.group.localToWorld(new THREE.Vector3(L[1],0,L[2]));}
    const a=P.anchors[nm];return a?wp(a):null;}

  /* ---- komponen ---- */
  const hitMat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
  function createPart(type,props,rot){
    const C=CAT[type];let n=1;while(S.parts.some(q=>q.type===type&&q.n===n))n++;
    const P={uid:S.uid++,type:type,n:n,props:Object.assign({},C.props,props||{}),rot:rot||0,x:0,z:0,snapped:false,holes:{},anchors:{},cur:{}};
    Object.defineProperty(P,'label',{get(){return `${C.name} ${n}`;},configurable:true});buildVisual(P);S.parts.push(P);return P;}
  function buildVisual(P){
    if(P.group){root.remove(P.group);P.group.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
    if(P.lbl){v.removeLabel(P.lbl);P.lbl=null;}
    const C=CAT[P.type];let g,vis={};
    switch(P.type){
      case 'led':vis=makeSimLED(P.props.color);g=vis.group;if(P.props.burnt)vis.burn(true);break;
      case 'res':g=makeResistor(4,bandsFor(P.props.ohm)).group;break;
      case 'btn':vis=makeButton();g=vis.group;break;
      case 'pot':vis=makeBBPot();g=vis.group;break;
      case 'ldr':vis=makeLDR();g=vis.group;break;
      case 'buz':vis=makeBuzzerBB();g=vis.group;break;
      case 'dht':g=makeDHT11().group;break;
      case 'sonar':{const Sm=makeHCSR04();g=Sm.group;const obj=put(box(1.2,.9,.2,std('#c9803a',{roughness:.5})),0,.8,2,g);const ring=new THREE.Mesh(new THREE.TorusGeometry(.3,.03,8,32),new THREE.MeshBasicMaterial({color:PKT,transparent:true,opacity:.85}));g.add(ring);let ph=0;
        vis={update(dt,cm,on){const dz=.45+cm*.03;obj.position.z=dz+.1;ring.visible=on;if(!on)return;ph=(ph+dt*.9)%1;const go=ph<.5,k=go?ph*2:(ph-.5)*2;ring.position.set(0,.8,.36+(go?k:1-k)*(dz-.36));ring.material.color.set(go?PKT:SIG);ring.scale.setScalar(1+k*.6);}};break;}
      case 'pir':{const Pm=makePIR();g=Pm.group;const person=new THREE.Group();const pm=std('#7d8b95',{roughness:.7});put(cyl(.3,.26,1.3,pm,16),0,.65,0,person);put(sph(.24,pm),0,1.55,0,person);put(person,0,-BBS.top,2.6,g);
        vis={update(t,mo,out){person.visible=mo;person.position.x=Math.sin(t*1.3)*1.3;Pm.domeM.emissiveIntensity=out?.45:0;}};break;}
      case 'servo':{const Sv=makeServo();g=Sv.group;P.anchors=Sv.a;vis=Sv;break;}
      case 'l298':{const D=makeL298N();g=D.group;P.anchors=Object.assign({},D.a,{OUT3:anchor(g,.78,.6,-.5),OUT4:anchor(g,.78,.6,-.2)});break;}
      case 'motor':{const M=makeMotor();g=M.group;P.anchors=M.a;vis=M;break;}
      case 'bat':{const B=makeBattery();g=B.group;P.anchors={'+':B.a.P,'-':B.a.N};const sw=put(box(.22,.12,.3,std('#d63a2f')),-.6,.36,0,g);vis={sw:sw};break;}
      case 'relay':{const Rm=makeRelay();g=Rm.group;P.anchors=Object.assign({},Rm.a,{NC:anchor(g,.3,.76,1.0)});vis=Rm;break;}
      case 'lamp':{const Lm=makeLamp();g=Lm.group;P.anchors={A:Lm.inA,B:Lm.inB};vis=Lm;break;}
    }
    g.userData.part=P;P.group=g;P.vis=vis;
    // kotak sentuh untuk pin
    const hitGeoL=new THREE.BoxGeometry(.14,.36,.14),hitGeoA=new THREE.BoxGeometry(.17,.2,.17);
    if(C.legs)C.legs.forEach(([nm,lx,lz])=>{const h=new THREE.Mesh(hitGeoL,hitMat);h.position.set(lx,.12,lz);h.userData.pt=`p:${P.uid}:${nm}`;g.add(h);});
    else Object.keys(P.anchors).forEach(nm=>{const a=P.anchors[nm];const h=new THREE.Mesh(hitGeoA,hitMat);h.position.copy(a.position);h.userData.pt=`p:${P.uid}:${nm}`;a.parent.add(h);});
    root.add(g);
    const off={led:1.1,res:.6,btn:.9,pot:1.3,ldr:2.1,buz:1,dht:1.7,sonar:1.45,pir:1.2,servo:1.75,l298:1.3,motor:1.6,bat:.9,relay:1.4,lamp:2.8}[P.type]||1;
    P.lbl=v.addLabel(g,esc(P.label),'',[0,off,0]);
    g.position.set(P.x,P.snapped?BBS.top:0,P.z);g.rotation.y=P.rot*Math.PI/2;
  }
  function placeAt(P,x,z,trySnap){
    const C=CAT[P.type];const g=P.group;g.rotation.y=P.rot*Math.PI/2;g.position.set(x,0,z);P.snapped=false;P.holes={};
    if(C.legs&&trySnap){
      g.position.y=BBS.top;g.updateMatrixWorld(true);
      const l0=g.localToWorld(new THREE.Vector3(C.legs[0][1],0,C.legs[0][2]));
      const h=holeNear(l0.x,l0.z,.22);
      if(h&&h[0]==='h'){const hp=pointPos(h);g.position.x+=hp.x-l0.x;g.position.z+=hp.z-l0.z;g.updateMatrixWorld(true);
        const holes={};let ok=true;
        for(const [nm,lx,lz] of C.legs){const w=g.localToWorld(new THREE.Vector3(lx,0,lz));const hh=holeNear(w.x,w.z,.07);if(!hh){ok=false;break;}holes[nm]=hh;}
        if(ok){P.snapped=true;P.holes=holes;}}
      if(!P.snapped)g.position.set(x,0,z);
    }
    P.x=g.position.x;P.z=g.position.z;g.updateMatrixWorld(true);
  }
  function placeAtHole(P,ix,iz){
    const C=CAT[P.type];const g=P.group;g.rotation.y=P.rot*Math.PI/2;g.position.set(0,0,0);g.updateMatrixWorld(true);
    const l0=g.localToWorld(new THREE.Vector3(C.legs[0][1],0,C.legs[0][2]));
    placeAt(P,bx(ix)-l0.x,bz(iz)-l0.z,true);
  }
  function stripsOf(P){const set=new Set();Object.values(P.holes).forEach(h=>{if(h[0]==='h')set.add(stripOf(h));});return set;}
  function overlaps(P){const mine=stripsOf(P);const near=new Set();mine.forEach(k=>{const s=k.split(':');for(const d of [-1,0,1])near.add(`S:${+s[1]+d}:${s[2]}`);});
    return S.parts.some(q=>q!==P&&q.snapped&&[...stripsOf(q)].some(k=>near.has(k)));}
  function autoPlace(P){
    const C=CAT[P.type];
    if(C.legs){for(const iz of (P.type==='btn'?[-1]:[3,-3,2,-2]))for(let ix=2;ix<BBS.cols-1;ix++){placeAtHole(P,ix,iz);if(P.snapped&&!overlaps(P))return;}}
    const spots=[[1.5,-4.6],[5,-4.6],[8.3,-4.6],[1.5,4.4],[5,4.4],[8.3,4.4],[9.6,0],[-3,-4.4],[-3,4.4],[-7,-4.2],[-7,4.2]];
    for(const [x,z] of spots)if(!S.parts.some(q=>q!==P&&Math.hypot(q.x-x,q.z-z)<2.2)){placeAt(P,x,z,false);if(legalPlace(P))return;}
    placeAt(P,2,5.5,false);
  }
  function addPart(type){const P=createPart(type);autoPlace(P);S.topo=true;select({kind:'part',P});save();return P;}
  function removePart(P){
    S.wires.filter(w=>w.a.startsWith(`p:${P.uid}:`)||w.b.startsWith(`p:${P.uid}:`)).forEach(removeWire);
    root.remove(P.group);P.group.traverse(o=>{if(o.geometry)o.geometry.dispose();});if(P.lbl)v.removeLabel(P.lbl);
    S.parts=S.parts.filter(q=>q!==P);if(S.sel&&S.sel.P===P)select(null);S.topo=true;save();}

  /* ---- kabel ---- */
  function autoColor(a,b){const t=a+' '+b;if(/vcc|m:3V3|m:VIN|:\+(\s|$)|p:\d+:(VCC|12V)\b/.test(t))return RED;if(/gnd|GND/.test(t))return K;const pal=[YEL,GRN,BLU,ORG,PUR,WHT];return pal[S.wid%pal.length];}
  function addWire(a,b,color){
    if(a===b||S.wires.some(w=>(w.a===a&&w.b===b)||(w.a===b&&w.b===a)))return null;
    const W={id:S.wid++,a,b,color:color||autoColor(a,b)};S.wires.push(W);drawWire(W);S.topo=true;save();return W;}
  function drawWire(W){
    if(W.g){root.remove(W.g);W.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
    const pa=pointPos(W.a),pb=pointPos(W.b);if(!pa||!pb)return;
    const g=makeWire(pa,pb,W.color,{unique:true,lift:.25+pa.distanceTo(pb)*.08});g.userData.wire=W;g.traverse(o=>o.userData.wire=W);W.g=g;W.mat=g.userData.mat;root.add(g);
    if(S.sel&&S.sel.W===W){W.mat.emissive.set('#e0782a');W.mat.emissiveIntensity=.6;placeEnds();}}
  function removeWire(W){if(W.g){root.remove(W.g);W.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});}S.wires=S.wires.filter(w=>w!==W);if(S.sel&&S.sel.W===W)select(null);S.topo=true;save();}
  function redrawWiresOf(P){const k=`p:${P.uid}:`;S.wires.forEach(w=>{if(w.a.startsWith(k)||w.b.startsWith(k))drawWire(w);});}

  /* ---- netlist ---- */
  class UF{constructor(){this.p=new Map();}f(a){let r=a,p;while((p=this.p.get(r))!==undefined&&p!==r)r=p;let c=a;while((p=this.p.get(c))!==undefined&&p!==r){this.p.set(c,r);c=p;}return r;}u(a,b){const x=this.f(a),y=this.f(b);if(x!==y)this.p.set(x,y);}}
  function buildNets(){
    const uf=new UF();
    for(let ix=0;ix<BBS.cols;ix++){for(const iz of ROW_IZ)uf.u(`h:${ix}:${iz}`,stripOf(`h:${ix}:${iz}`));for(const side of ['near','far'])for(const kind of ['gnd','vcc'])if(railHole(ix))uf.u(`r:${side}:${kind}:${ix}`,`R:${side}:${kind}`);}
    uf.u('m:GND_L','m:GND_R');
    S.parts.forEach(P=>{const C=CAT[P.type];if(P.snapped)Object.entries(P.holes).forEach(([nm,h])=>uf.u(`p:${P.uid}:${nm}`,h));(C.links||[]).forEach(([a,b])=>uf.u(`p:${P.uid}:${a}`,`p:${P.uid}:${b}`));});
    S.wires.forEach(w=>uf.u(w.a,w.b));
    S.uf=uf;
    const mem=new Map();const addM=(id)=>{const n=uf.f(id);if(!mem.has(n))mem.set(n,[]);mem.get(n).push(id);};
    PINS.forEach(p=>addM('m:'+p.id));
    S.parts.forEach(P=>{const C=CAT[P.type];(C.legs?C.legs.map(l=>l[0]):C.pins).forEach(nm=>addM(`p:${P.uid}:${nm}`));});
    S.members=mem;S.topo=false;S.dirty=true;
  }
  const net=id=>S.uf.f(id);
  const netOfPin=g=>net('m:'+GP2ID[g]);
  const volt=n=>S.V.has(n)?S.V.get(n):0;
  const vOf=id=>volt(net(id));

  /* ---- solver listrik (analisis nodal) ---- */
  function gauss(A,b,m){
    for(let c=0;c<m;c++){let piv=c,mx=Math.abs(A[c*m+c]);for(let r=c+1;r<m;r++){const v2=Math.abs(A[r*m+c]);if(v2>mx){mx=v2;piv=r;}}
      if(mx<1e-18)continue;
      if(piv!==c){for(let k=0;k<m;k++){const t=A[c*m+k];A[c*m+k]=A[piv*m+k];A[piv*m+k]=t;}const t=b[c];b[c]=b[piv];b[piv]=t;}
      const d=A[c*m+c];for(let r=c+1;r<m;r++){const f=A[r*m+c]/d;if(f===0)continue;for(let k=c;k<m;k++)A[r*m+k]-=f*A[c*m+k];b[r]-=f*b[c];}}
    const x=new Float64Array(m);for(let r=m-1;r>=0;r--){let s=b[r];for(let k=r+1;k<m;k++)s-=A[r*m+k]*x[k];const d=A[r*m+r];x[r]=Math.abs(d)<1e-18?0:s/d;}return x;
  }
  function solve(){
    if(S.topo)buildNets();
    const gnd=net('m:GND_L'),E=[],D=[];
    const R=(a,b,ohm,tag)=>{if(a!==b)E.push({a,b,g:1/Math.max(ohm,1e-4),J:0,tag});};
    const N=(a,b,V,ohm,tag)=>{if(a!==b){const g=1/ohm;E.push({a,b,g,J:V*g,tag});}};
    N(net('m:3V3'),gnd,3.3,.3,{src:'3V3'});N(net('m:VIN'),gnd,5,.3,{src:'VIN'});N(net('m:EN'),gnd,3.3,10000);
    for(const g in RT.pins){const s=RT.pins[g];const id=GP2ID[g];if(!id)continue;const a=net('m:'+id);
      if(s.mode==='out'||s.mode==='pwm'||s.mode==='dac'||s.mode==='servo')N(a,gnd,s.v,30,{gpio:+g});
      else if(s.mode==='pullup')N(a,gnd,3.3,45000);else if(s.mode==='pulldown')R(a,gnd,45000);}
    for(const P of S.parts){const pn=nm=>net(`p:${P.uid}:${nm}`);const pr=P.props;
      switch(P.type){
        case 'led':if(!pr.burnt)D.push({a:pn('A'),b:pn('K'),Vf:LED_VF[pr.color]||2,rs:15,on:!!P.dOn,P});break;
        case 'res':R(pn('1'),pn('2'),pr.ohm);break;
        case 'btn':if(P.pressed)R(pn('1a'),pn('2a'),.05);break;
        case 'pot':{const f=pr.pos/100;R(pn('1'),pn('W'),Math.max(1,f*10000));R(pn('W'),pn('2'),Math.max(1,(1-f)*10000));break;}
        case 'ldr':R(pn('1'),pn('2'),Math.pow(10,5-2*pr.light/100));break;
        case 'buz':R(pn('+'),pn('-'),110,{buz:P});break;
        case 'dht':R(pn('VCC'),pn('GND'),20000);break;
        case 'sonar':R(pn('VCC'),pn('GND'),600);if(P.pw)N(pn('ECHO'),pn('GND'),0,1000);break;
        case 'pir':R(pn('VCC'),pn('GND'),5000);if(P.pw)N(pn('OUT'),pn('GND'),pr.motion?3.3:0,100);break;
        case 'servo':R(pn('VCC'),pn('GND'),800);break;
        case 'l298':R(pn('12V'),pn('GND'),2000);['IN1','IN2','IN3','IN4','ENA','ENB'].forEach(x=>R(pn(x),pn('GND'),47000));
          if(P.v12>=7)N(pn('5V'),pn('GND'),5,1);
          if(P.enA>0){N(pn('OUT1'),pn('GND'),P.oA[0],1,{drv:P});N(pn('OUT2'),pn('GND'),P.oA[1],1,{drv:P});}
          if(P.enB>0){N(pn('OUT3'),pn('GND'),P.oB[0],1,{drv:P});N(pn('OUT4'),pn('GND'),P.oB[1],1,{drv:P});}break;
        case 'motor':R(pn('M1'),pn('M2'),6,{motor:P});break;
        case 'bat':if(pr.on)N(pn('+'),pn('-'),7.4,.15,{bat:P});break;
        case 'relay':R(pn('VCC'),pn('GND'),70);R(pn('VCC'),pn('IN'),1000);R(pn('COM'),pn(P.on?'NO':'NC'),.05);break;
        case 'lamp':R(pn('A'),pn('B'),20);break;
      }}
    const idx=new Map([[gnd,-1]]);const add=x=>{if(!idx.has(x))idx.set(x,idx.size-1);};
    E.forEach(e=>{add(e.a);add(e.b);});D.forEach(d=>{add(d.a);add(d.b);});
    const m=idx.size-1;let X;const vv=n=>n===gnd?0:X[idx.get(n)];
    const vx=(Y,n)=>n===gnd?0:Y[idx.get(n)];
    const iterate=Dx=>{let Y=new Float64Array(Math.max(m,0));
      for(let it=0;it<12;it++){
        const G=new Float64Array(m*m),I=new Float64Array(m);
        const st=(a,b,g,J)=>{const i=idx.get(a),j=idx.get(b);if(i>=0){G[i*m+i]+=g;I[i]+=J;}if(j>=0){G[j*m+j]+=g;I[j]-=J;}if(i>=0&&j>=0){G[i*m+j]-=g;G[j*m+i]-=g;}};
        E.forEach(e=>st(e.a,e.b,e.g,e.J));
        Dx.forEach(d=>{if(d.on){const g=1/d.rs;st(d.a,d.b,g,d.Vf*g);}else st(d.a,d.b,1e-9,0);});
        for(let i=0;i<m;i++)G[i*m+i]+=1e-9;
        Y=gauss(G,I,m);
        let ch=false;Dx.forEach(d=>{const vd=vx(Y,d.a)-vx(Y,d.b);const on=d.on?(vd-d.Vf)>-1e-6:vd>d.Vf+1e-6;if(on!==d.on){d.on=on;ch=true;}});
        if(!ch)break;}
      return Y;};
    X=iterate(D);
    const V=new Map();idx.forEach((i,n)=>V.set(n,i<0?0:X[i]));S.V=V;
    // jalur ke sumber (mana yang tidak mengambang)
    const adj=new Map();const link=(a,b)=>{if(!adj.has(a))adj.set(a,[]);if(!adj.has(b))adj.set(b,[]);adj.get(a).push(b);adj.get(b).push(a);};
    E.forEach(e=>{if(e.g>1e-7)link(e.a,e.b);});D.forEach(d=>{if(d.on)link(d.a,d.b);});
    const drv=new Set([gnd]);const q=[gnd];while(q.length){const x=q.pop();(adj.get(x)||[]).forEach(y=>{if(!drv.has(y)){drv.add(y);q.push(y);}});}
    S.driven=drv;
    // hasil per elemen
    S.gpioI={};S.srcI={};S.batI=0;
    E.forEach(e=>{if(!e.tag)return;const i=e.J-e.g*(vv(e.a)-vv(e.b));
      if(e.tag.gpio!==undefined)S.gpioI[e.tag.gpio]=i;if(e.tag.src)S.srcI[e.tag.src]=i;if(e.tag.bat)S.batI=i;});
    D.forEach(d=>{const vd=vv(d.a)-vv(d.b);d.P.dOn=d.on;d.P.cur.I=d.on?Math.max(0,(vd-d.Vf)/d.rs):0;d.P.cur.vd=vd;d.P.cur.peak=0;});
    // PWM: pin berkedip cepat antara 0 V dan 3.3 V, jadi arus LED = rata-rata arus saat ON dan OFF (bukan arus pada tegangan rata-rata)
    {const pw=[];for(const g in RT.pins){const s2=RT.pins[g];if(s2.mode==='pwm'&&s2.duty>.001&&s2.duty<.999&&GP2ID[g])pw.push({g:+g,d:s2.duty});}
     if(pw.length&&D.length){const src=E.filter(e=>e.tag&&e.tag.gpio!==undefined&&pw.some(q=>q.g===e.tag.gpio));
      const setV=g=>src.forEach(e=>{e.J=(e.tag.gpio===g?3.3:0)*e.g;});
      const curr=()=>{const D2=D.map(d=>Object.assign({},d));const Y=iterate(D2);return D2.map(d=>{const vd=vx(Y,d.a)-vx(Y,d.b);return d.on?Math.max(0,(vd-d.Vf)/d.rs):0;});};
      setV(-1);const base=curr(),tot=base.slice(),peak=base.slice();
      pw.forEach(q=>{setV(q.g);const on=curr();on.forEach((x,i)=>{tot[i]+=q.d*(x-base[i]);peak[i]=Math.max(peak[i],x);});});
      src.forEach(e=>{e.J=RT.pins[e.tag.gpio].v*e.g;});
      D.forEach((d,i)=>{d.P.cur.I=Math.max(0,tot[i]);d.P.cur.peak=peak[i];});}}
    D.forEach(d=>{
      if(Math.max(d.P.cur.I,d.P.cur.peak||0)>.06&&!d.P.props.burnt){d.P.props.burnt=true;d.P.vis.burn(true);d.P.burnT=performance.now();S.dirty=true;}});
    // status modul untuk langkah berikutnya
    for(const P of S.parts){const pd=(a,b)=>vOf(`p:${P.uid}:${a}`)-vOf(`p:${P.uid}:${b}`);
      switch(P.type){
        case 'dht':P.vcc=pd('VCC','GND');P.pw=P.vcc>=3&&P.vcc<=5.8;break;
        case 'sonar':{P.vcc=pd('VCC','GND');const pw=P.vcc>=4.4;if(pw!==P.pw){P.pw=pw;S.dirty=true;}break;}
        case 'pir':{P.vcc=pd('VCC','GND');const pw=P.vcc>=4.4;if(pw!==P.pw){P.pw=pw;S.dirty=true;}break;}
        case 'servo':P.vcc=pd('VCC','GND');break;
        case 'relay':{P.vcc=pd('VCC','GND');const on=P.vcc>=4&&pd('VCC','IN')>2;if(on!==!!P.on){P.on=on;S.dirty=true;if(P.vis.set)P.vis.set(on);}break;}
        case 'lamp':P.vl=pd('A','B');break;
        case 'buz':P.vd=pd('+','-');break;
        case 'motor':P.vm=pd('M1','M2');break;
        case 'l298':{const v12=pd('12V','GND');P.v12=v12;P.common=net(`p:${P.uid}:GND`)===net('m:GND_L');
          const hi=x=>pd(x,'GND')>2.3;const duty=(pin,jumper)=>{if(jumper)return 1;const n=net(`p:${P.uid}:${pin}`);const pwm=pwmOfNet(n);return pwm!==null?pwm:(hi(pin)?1:0);};
          const ok=v12>=5;const hv=Math.max(0,v12-1.4);
          const eA=ok?duty('ENA',P.props.jumperA):0,eB=ok?duty('ENB',P.props.jumperB):0;
          const oA=[hi('IN1')?hv*eA:0,hi('IN2')?hv*eA:0],oB=[hi('IN3')?hv*eB:0,hi('IN4')?hv*eB:0];
          const key=[eA,eB,...oA,...oB].map(x=>x.toFixed(2)).join();if(key!==P.key){P.key=key;P.enA=eA;P.enB=eB;P.oA=oA;P.oB=oB;S.dirty=true;}break;}
      }}
  }
  function pwmOfNet(n){for(const g in RT.pins){const s=RT.pins[g];if((s.mode==='pwm')&&netOfPin(+g)===n)return s.duty;}return null;}

  /* ======================= RUNTIME ======================= */
  const RT={running:false,t:0,target:0,pins:{},ledcPin:{},ledcCh:{},servos:[],inBuf:[],out:'',warn:new Map(),gc:0,lastHigh:{},gen:null,wifi:false,tones:{},begun:false,solves:0};
  function rtWarn(msg,key){key=key||String(msg);if(!RT.warn.has(key)){RT.warn.set(key,msg);S.probDirty=true;}}
  function ensureSolved(){if((S.dirty||S.topo)&&RT.solves<30){RT.solves++;solve();S.dirty=false;}}
  function gpioOK(g,fn){if(GP2ID[g]===undefined){rtWarn(_L(`${fn}(${g}): GPIO ${g} tidak ada di board ESP32 DevKit 30 pin.`,`${fn}(${g}): GPIO ${g} is not on the 30-pin ESP32 DevKit board.`));return false;}return true;}
  function setPin(g,st){RT.pins[g]=st;S.dirty=true;}
  function setPwm(g,d,res){const duty=clampN(d/((1<<res)-1),0,1);setPin(g,{mode:'pwm',v:duty*3.3,duty});}
  function out(s){if(!RT.begun){rtWarn(_L('Serial.print dipanggil sebelum Serial.begin(115200), jadi tidak ada yang tampil di Serial Monitor.','Serial.print was called before Serial.begin(115200), so nothing shows in the Serial Monitor.'),'nobegin');return;}RT.out+=s;}
  function fmtVal(x,f){
    if(x instanceof Number&&x.__c)return String.fromCharCode(+x);
    if(typeof x==='boolean')return x?'1':'0';
    if(typeof x==='number'||x instanceof Number){x=+x;if(isNaN(x))return 'nan';if(!isFinite(x))return x>0?'inf':'-inf';
      if(Number.isInteger(x)){if(f===16||f===2||f===8)return (x>>>0).toString(f).toUpperCase();return String(x);}
      return x.toFixed(f!==undefined&&f<10?f:2);}
    if(x===undefined||x===null)return '';return String(x);}
  function cfmt(f,a){let i=0;return String(f).replace(/%([-+ 0#]*)(\d+)?(?:\.(\d+))?(ll|l|hh|h|z)?([diufFeEgGxXoscp%])/g,(m,fl,w,pr,len,t)=>{
    if(t==='%')return '%';let v=a[i++];if(v instanceof Number)v=+v;let s;
    switch(t){case 'd':case 'i':case 'u':s=String(Math.trunc(Number(v)||0));break;case 'f':case 'F':s=isNaN(v)?'nan':Number(v).toFixed(pr!==undefined?+pr:6);break;
      case 'e':case 'E':s=Number(v).toExponential(pr!==undefined?+pr:6);break;case 'g':case 'G':s=String(Number(v));break;
      case 'x':s=(Math.trunc(v)>>>0).toString(16);break;case 'X':s=(Math.trunc(v)>>>0).toString(16).toUpperCase();break;case 'o':s=(Math.trunc(v)>>>0).toString(8);break;
      case 's':s=v==null?'(null)':String(v);break;case 'c':s=String.fromCharCode(+v);break;default:s=String(v);}
    if(w&&s.length<+w){const z=fl.includes('0')&&!fl.includes('-')&&t!=='s';s=fl.includes('-')?s.padEnd(+w):(z&&s[0]==='-'?'-'+s.slice(1).padStart(+w-1,'0'):s.padStart(+w,z?'0':' '));}
    if(fl.includes('+')&&/[dif]/.test(t)&&Number(v)>=0)s='+'+s;return s;});}
  const mkChar=c=>{const o=new Number((+c)&255);o.__c=true;return o;};
  class DHT{constructor(pin,type){this.pin=pin;this.type=type;}begin(){this.ok=true;}
    _r(f){ensureSolved();const n=netOfPin(this.pin);const P=S.parts.find(q=>q.type==='dht'&&net(`p:${q.uid}:DATA`)===n);
      if(!P){rtWarn(_L(`DHT di pin ${this.pin}: kaki DATA DHT11 belum tersambung ke GPIO ${this.pin}.`,`DHT on pin ${this.pin}: the DHT11 DATA leg is not connected to GPIO ${this.pin}.`),'dht'+this.pin);return NaN;}
      if(!P.pw){rtWarn(_L(`${P.label} belum dapat daya. Sambungkan VCC ke 3V3 dan GND ke GND.`,`${P.label} has no power. Connect VCC to 3V3 and GND to GND.`),'dhtpw'+P.uid);return NaN;}
      return f==='h'?Math.round(P.props.h):Math.round(P.props.t);}
    readTemperature(fh){const v=this._r('t');return fh&&!isNaN(v)?v*1.8+32:v;}readHumidity(){return this._r('h');}read(){return true;}computeHeatIndex(t){return t;}}
  class Servo{constructor(){this.pin=-1;this.a=90;this.mn=544;this.mx=2400;}
    attach(pin,mn,mx){if(!gpioOK(pin,'servo.attach'))return 0;if(INPUT_ONLY.has(pin)){rtWarn(_L(`servo.attach(${pin}): GPIO ${pin} hanya bisa input.`,`servo.attach(${pin}): GPIO ${pin} is input-only.`));return 0;}this.pin=pin;if(mn)this.mn=mn;if(mx)this.mx=mx;if(!RT.servos.includes(this))RT.servos.push(this);setPin(pin,{mode:'servo',v:.25,duty:.075});return 1;}
    write(a){a=+a;if(a>200){this.writeMicroseconds(a);return;}this.a=clampN(a,0,180);}
    writeMicroseconds(us){this.a=clampN((us-this.mn)/(this.mx-this.mn)*180,0,180);}
    read(){return Math.round(this.a);}attached(){return this.pin>=0;}detach(){this.pin=-1;}setPeriodHertz(){}}
  const wifiNote=()=>rtWarn(_L('WiFi belum disimulasikan. Fungsi WiFi hanya pura-pura berhasil supaya program tetap jalan. Coba bagian WiFi di board asli.','WiFi is not simulated. WiFi functions only pretend to succeed so the program keeps running. Try the WiFi parts on a real board.'),'wifi');
  const WiFi={begin(){RT.wifi=true;wifiNote();},status(){return 3;},localIP(){return '192.168.1.23';},softAP(){RT.wifi=true;wifiNote();return true;},softAPIP(){return '192.168.4.1';},mode(){},disconnect(){},RSSI(){return -55;},macAddress(){return '24:6F:28:AA:BB:CC';},setHostname(){}};
  class WebServer{constructor(){wifiNote();}on(){}begin(){}handleClient(){}send(){}arg(){return '';}hasArg(){return false;}}
  const Serial={begin(){RT.begun=true;},end(){},print(x,f){out(fmtVal(x,f));return 1;},println(x,f){out((arguments.length?fmtVal(x,f):'')+'\n');return 1;},printf(f,...a){out(cfmt(f,a));return 1;},
    write(x){out(typeof x==='number'?String.fromCharCode(x):String(x));return 1;},available(){return RT.inBuf.length;},read(){return RT.inBuf.length?RT.inBuf.shift():-1;},peek(){return RT.inBuf.length?RT.inBuf[0]:-1;},
    readString(){const s=String.fromCharCode(...RT.inBuf);RT.inBuf=[];return s;},
    readStringUntil(c){c=+c;const i=RT.inBuf.indexOf(c);const take=i<0?RT.inBuf.length:i;const s=String.fromCharCode(...RT.inBuf.slice(0,take));RT.inBuf=RT.inBuf.slice(i<0?take:take+1);return s;},
    parseInt(){return parseInt(Serial.readStringUntil(10))||0;},parseFloat(){return parseFloat(Serial.readStringUntil(10))||0;},flush(){},setTimeout(){},availableForWrite(){return 128;}};
  const api={
    HIGH:1,LOW:0,INPUT:1,OUTPUT:3,INPUT_PULLUP:5,INPUT_PULLDOWN:9,OUTPUT_OPEN_DRAIN:19,LED_BUILTIN:2,DHT11:11,DHT22:22,DEC:10,HEX:16,BIN:2,OCT:8,
    WL_CONNECTED:3,WL_DISCONNECTED:6,WIFI_STA:1,WIFI_AP:2,WIFI_AP_STA:3,
    A0:36,A3:39,A4:32,A5:33,A6:34,A7:35,A10:4,A11:0,A12:2,A13:15,A14:13,A15:12,A16:14,A17:27,A18:25,A19:26,
    PI:Math.PI,TWO_PI:2*Math.PI,HALF_PI:Math.PI/2,DEG_TO_RAD:Math.PI/180,RAD_TO_DEG:180/Math.PI,
    pinMode(g,m){if(!gpioOK(g,'pinMode'))return;
      if((m===3||m===19)&&INPUT_ONLY.has(g)){rtWarn(_L(`GPIO ${g} hanya bisa input. pinMode(${g}, OUTPUT) tidak berpengaruh.`,`GPIO ${g} is input-only. pinMode(${g}, OUTPUT) has no effect.`));setPin(g,{mode:'in'});return;}
      if(g===1||g===3)rtWarn(_L('GPIO 1 dan 3 dipakai Serial (USB). Memakainya bisa mengganggu Serial Monitor.','GPIO 1 and 3 are used by Serial (USB). Using them can disturb the Serial Monitor.'));
      let mode=m===3||m===19?'out':m===5?'pullup':m===9?'pulldown':'in';
      if((m===5||m===9)&&INPUT_ONLY.has(g)){rtWarn(_L(`GPIO ${g} tidak punya pull-up/pull-down internal, jadi INPUT_PULLUP di pin ini tidak bekerja.`,`GPIO ${g} has no internal pull-up/pull-down, so INPUT_PULLUP does not work on this pin.`));mode='in';}
      setPin(g,{mode,v:0,duty:0});},
    digitalWrite(g,val){if(!gpioOK(g,'digitalWrite'))return;const s=RT.pins[g];
      if(!s||(s.mode!=='out'&&s.mode!=='pwm')){if(INPUT_ONLY.has(g))rtWarn(_L(`GPIO ${g} hanya bisa input, digitalWrite tidak berpengaruh.`,`GPIO ${g} is input-only, so digitalWrite has no effect.`));else rtWarn(_L(`digitalWrite(${g}) dipanggil sebelum pinMode(${g}, OUTPUT), jadi pin belum mengeluarkan tegangan.`,`digitalWrite(${g}) was called before pinMode(${g}, OUTPUT), so the pin does not output any voltage yet.`),'nopm'+g);return;}
      const hi=!!(+val);if(hi&&!(s.v>1.6))RT.lastHigh[g]=RT.t;setPin(g,{mode:'out',v:hi?3.3:0,duty:hi?1:0});},
    digitalRead(g){if(!gpioOK(g,'digitalRead'))return 0;const s=RT.pins[g];if(s&&s.mode==='out')return s.v>1.6?1:0;
      ensureSolved();const n=netOfPin(g);if(!S.driven.has(n)){rtWarn(_L(`digitalRead(${g}): pin mengambang (tidak tersambung ke tegangan apa pun), jadi nilainya acak. Pakai INPUT_PULLUP atau resistor pull-down.`,`digitalRead(${g}): the pin is floating (not connected to any voltage), so its value is random. Use INPUT_PULLUP or a pull-down resistor.`),'fl'+g);return Math.random()<.5?1:0;}
      return volt(n)>1.65?1:0;},
    analogRead(g){if(!gpioOK(g,'analogRead'))return 0;const P=PIN_BY[GP2ID[g]];
      if(!P.tags.includes('adc')){rtWarn(_L(`analogRead(${g}): GPIO ${g} bukan pin analog. Pakai GPIO 32–39.`,`analogRead(${g}): GPIO ${g} is not an analog pin. Use GPIO 32–39.`));return 0;}
      if(RT.wifi&&P.fn.some(f=>f.indexOf('ADC2')===0)){rtWarn(_L(`analogRead(${g}): pin ADC2 tidak bisa dibaca saat WiFi aktif.`,`analogRead(${g}): ADC2 pins cannot be read while WiFi is on.`));return 0;}
      ensureSolved();const n=netOfPin(g);if(!S.driven.has(n)){rtWarn(_L(`analogRead(${g}): pin mengambang, nilainya acak.`,`analogRead(${g}): the pin is floating, so the value is random.`),'afl'+g);return Math.floor(Math.random()*4096);}
      return clampN(Math.round(clampN(volt(n),0,3.3)/3.3*4095+(Math.random()-.5)*6),0,4095);},
    analogReadMilliVolts(g){ensureSolved();return Math.round(clampN(volt(netOfPin(g)),0,3.3)*1000);},
    analogReadResolution(){},analogSetAttenuation(){},analogWriteResolution(){},analogWriteFrequency(){},
    analogWrite(g,val){if(!gpioOK(g,'analogWrite'))return;if(INPUT_ONLY.has(g)){rtWarn(_L(`GPIO ${g} hanya bisa input.`,`GPIO ${g} is input-only.`));return;}setPwm(g,clampN(+val,0,255),8);},
    ledcAttach(g,f,r){if(!gpioOK(g,'ledcAttach'))return false;if(INPUT_ONLY.has(g)){rtWarn(_L(`ledcAttach(${g}): GPIO ${g} hanya bisa input.`,`ledcAttach(${g}): GPIO ${g} is input-only.`));return false;}RT.ledcPin[g]={res:r||8};setPin(g,{mode:'pwm',v:0,duty:0});return true;},
    ledcAttachChannel(g,f,r){return api.ledcAttach(g,f,r);},
    ledcSetup(ch,f,r){RT.ledcCh[ch]={res:r||8,pins:(RT.ledcCh[ch]||{pins:[]}).pins};return f;},
    ledcAttachPin(g,ch){const c=RT.ledcCh[ch]||(RT.ledcCh[ch]={res:8,pins:[]});c.pins.push(g);setPin(g,{mode:'pwm',v:0,duty:0});},
    ledcWrite(x,d){if(RT.ledcPin[x])setPwm(x,+d,RT.ledcPin[x].res);else if(RT.ledcCh[x])RT.ledcCh[x].pins.forEach(p=>setPwm(p,+d,RT.ledcCh[x].res));else rtWarn(_L(`ledcWrite(${x}): pin belum disiapkan dengan ledcAttach(${x}, frekuensi, resolusi).`,`ledcWrite(${x}): the pin was not set up with ledcAttach(${x}, frequency, resolution).`),'ledc'+x);return true;},
    ledcWriteTone(x,f){const ps=RT.ledcPin[x]?[x]:RT.ledcCh[x]?RT.ledcCh[x].pins:[];ps.forEach(p=>setPin(p,{mode:'pwm',v:f>0?1.65:0,duty:f>0?.5:0}));return f;},
    ledcDetach(g){delete RT.ledcPin[g];setPin(g,{mode:'in'});},ledcDetachPin(g){api.ledcDetach(g);},ledcRead(x){return 0;},
    dacWrite(g,val){if(g!==25&&g!==26){rtWarn(_L('dacWrite hanya bisa di GPIO 25 dan 26.','dacWrite only works on GPIO 25 and 26.'));return;}setPin(g,{mode:'dac',v:clampN(+val,0,255)/255*3.3,duty:0});},
    tone(g,f,d){if(!gpioOK(g,'tone'))return;setPin(g,{mode:'pwm',v:f>0?1.65:0,duty:f>0?.5:0});if(d)RT.tones[g]=RT.t+d;},
    noTone(g){setPin(g,{mode:'out',v:0,duty:0});delete RT.tones[g];},
    pulseIn(g,lvl,to){to=to||1000000;ensureSolved();const n=netOfPin(g);
      for(const P of S.parts){if(P.type!=='sonar'||net(`p:${P.uid}:ECHO`)!==n)continue;
        if(!P.pw){rtWarn(_L(`${P.label} belum dapat daya 5 V (VCC ke VIN, GND ke GND).`,`${P.label} has no 5 V power (VCC to VIN, GND to GND).`),'snpw'+P.uid);continue;}
        const tn=net(`p:${P.uid}:TRIG`);let trig=false;for(const g2 in RT.lastHigh){if(netOfPin(+g2)===tn&&RT.t-RT.lastHigh[g2]<60)trig=true;}
        if(!trig){rtWarn(_L(`${P.label}: pin TRIG belum diberi pulsa HIGH dari ESP32, jadi sensor tidak mengukur.`,`${P.label}: the TRIG pin never got a HIGH pulse from the ESP32, so the sensor does not measure.`),'sntr'+P.uid);continue;}
        const us=Math.round(P.props.cm*58.3*(1+(Math.random()-.5)*.01));if(us<=to){RT.t+=us/1000+.3;return lvl===0?0:us;}}
      RT.t+=Math.min(to,1e6)/1000;return 0;},
    touchRead(){return 60+Math.floor(Math.random()*4);},hallRead(){return 0;},temperatureRead(){return 45;},
    millis(){return Math.floor(RT.t);},micros(){return Math.floor(RT.t*1000);},
    map(x,a,b,c,d){return Math.trunc((x-a)*(d-c)/(b-a)+c);},constrain(x,a,b){return Math.min(Math.max(x,a),b);},
    abs:Math.abs,min:Math.min,max:Math.max,pow:Math.pow,sqrt:Math.sqrt,sq:x=>x*x,sin:Math.sin,cos:Math.cos,tan:Math.tan,atan:Math.atan,atan2:Math.atan2,floor:Math.floor,ceil:Math.ceil,round:Math.round,fabs:Math.abs,exp:Math.exp,log:Math.log,log10:Math.log10,
    random(a,b){if(b===undefined){b=a;a=0;}return Math.floor(a+Math.random()*(b-a));},randomSeed(){},
    isnan:x=>isNaN(x),isinf:x=>!isFinite(x)&&!isNaN(x),bitRead:(x,n)=>(x>>n)&1,bitSet:(x,n)=>x|(1<<n),bitClear:(x,n)=>x&~(1<<n),bit:n=>1<<n,lowByte:x=>x&255,highByte:x=>(x>>8)&255,
    radians:x=>x*Math.PI/180,degrees:x=>x*180/Math.PI,
    Serial,Serial2:Object.assign({},Serial,{print(){},println(){},printf(){},available(){return 0;},read(){return -1;}}),DHT,Servo,WiFi,WebServer,
    __delay:ms=>Math.max(0,+ms||0),__delayUs:us=>Math.max(0,+us||0)/1000,__g:()=>((++RT.gc)&255)===0,
    __i:x=>{x=+x;return isFinite(x)?Math.trunc(x):0;},__idiv:(a,b)=>{if(+b===0){throw new Error(_L('Pembagian dengan nol (divide by zero).','Division by zero.'));}return Math.trunc(a/b);},
    __Str:(x,d)=>{if(x instanceof Number&&x.__c)return String.fromCharCode(+x);if(typeof x==='number'||x instanceof Number){x=+x;if(d===16||d===2||d===8)return (x>>>0).toString(d).toUpperCase();if(d!==undefined)return x.toFixed(d);return Number.isInteger(x)?String(x):(isNaN(x)?'nan':x.toFixed(2));}if(typeof x==='boolean')return x?'1':'0';return x==null?'':String(x);},
    __sc:x=>(x instanceof Number&&x.__c)?String.fromCharCode(+x):api.__Str(x),
    __toChar:mkChar,__ch:c=>c,__sizeof:x=>Array.isArray(x)?x.length*4:typeof x==='string'?x.length+1:4,
    __arr:n=>new Array(Math.max(0,n|0)).fill(0),__arr2:(a,b)=>Array.from({length:a|0},()=>new Array(b|0).fill(0))
  };
  const API_NAMES=Object.keys(api);
  if(!String.prototype.toInt){String.prototype.toInt=function(){return parseInt(this)||0;};String.prototype.toFloat=function(){return parseFloat(this)||0;};String.prototype.c_str=function(){return String(this);};String.prototype.equals=function(o){return String(this)===String(o);};String.prototype.equalsIgnoreCase=function(o){return String(this).toLowerCase()===String(o).toLowerCase();};}
  let LINE_OFF=2;try{new Function('__api','"use strict";\nthrow new Error("x")')();}catch(e){const m=/<anonymous>:(\d+):/.exec(e.stack||'');if(m)LINE_OFF=+m[1]-1;}
  function errLine(e){const m=/<anonymous>:(\d+):/.exec(e&&e.stack||'');return m?Math.max(1,+m[1]-LINE_OFF):0;}
  function translateErr(e){let m=String(e&&e.message||e);let r;
    if((r=/^(\w+) is not defined/.exec(m)))return _L(`"${r[1]}" belum dideklarasikan. Cek salah ketik (huruf besar/kecil berpengaruh) atau library yang belum didukung.`,`"${r[1]}" is not declared. Check for typos (upper/lower case matters) or an unsupported library.`);
    if((r=/(\S+) is not a function/.exec(m)))return _L(`${r[1].replace(/^__api\./,'')} bukan fungsi. Mungkin salah ketik, atau fungsi ini belum didukung simulator.`,`${r[1].replace(/^__api\./,'')} is not a function. It may be a typo, or the simulator does not support it yet.`);
    if(/Cannot read prop/.test(m))return _L('Memakai objek yang belum dibuat: ','Using an object that was not created: ')+m;
    if(/Maximum call stack/.test(m))return _L('Fungsi memanggil dirinya sendiri terus-menerus (rekursi tanpa henti).','A function keeps calling itself forever (endless recursion).');
    if(/Identifier '(\w+)' has already been declared/.test(m))return _L(`Nama "${/'(\w+)'/.exec(m)[1]}" dideklarasikan dua kali.`,`The name "${/'(\w+)'/.exec(m)[1]}" is declared twice.`);
    return m;}

  function* mainGen(prog){if(prog.setup)yield* prog.setup();for(;;){yield* prog.loop();yield -1;}}
  function run(){
    stop(true);clearCodeErr();RT.warn.clear();
    const src=ed.value;const lint=TR.lint(src);if(lint.length){codeErr(lint[0]);return;}
    const T=TR.transpile(src);if(T.errs.length){codeErr(T.errs[0]);return;}
    const SUP=['Arduino.h','DHT.h','DHT_U.h','Adafruit_Sensor.h','ESP32Servo.h','Servo.h','WiFi.h','WebServer.h'];
    T.libs.filter(l=>!SUP.includes(l)).forEach(l=>rtWarn(_L(`Library <${l}> belum didukung simulator. Kode yang memakainya bisa error di sini, tapi bisa tetap jalan di board asli.`,`Library <${l}> is not supported by the simulator. Code that uses it may fail here but can still work on a real board.`)));
    const names=API_NAMES.filter(x=>!T.declared.has(x));
    Object.assign(RT,{t:0,target:0,pins:{},ledcPin:{},ledcCh:{},servos:[],inBuf:[],out:'',gc:0,lastHigh:{},wifi:false,tones:{},begun:false});
    let prog;
    try{prog=new Function('__api',`"use strict";const {${names.join(',')}}=__api;${T.hoisted}\n${T.js}\nreturn {setup:typeof setup==="function"?setup:null,loop:typeof loop==="function"?loop:null};`)(api);}
    catch(e){codeErr({line:e instanceof SyntaxError?0:errLine(e),msg:(e instanceof SyntaxError?_L('Ada penulisan yang belum bisa dibaca simulator: ','The simulator cannot read part of this code: '):'')+translateErr(e)});return;}
    RT.gen=mainGen(prog);RT.running=true;S.dirty=true;
    serialLine(_L('— program mulai —','— program started —'),'sim');setRunUI(true);
  }
  function stop(silent){if(RT.running&&!silent)serialLine(_L('— program dihentikan —','— program stopped —'),'sim');RT.running=false;RT.gen=null;RT.pins={};RT.servos=[];S.dirty=true;setRunUI(false);}
  function step(dtMs){
    RT.solves=0;RT.target+=dtMs;const t0=performance.now();let n=0;
    while(RT.running&&RT.t<RT.target){
      let r;try{r=RT.gen.next();}catch(e){const ln=errLine(e);codeErr({line:ln,msg:_L('Error saat program berjalan: ','Error while running: ')+translateErr(e)});serialLine(_L('— program berhenti karena error —','— program stopped because of an error —'),'err');stop(true);return;}
      if(r.done){stop();return;}
      const y=r.value;if(y===-1)RT.t+=.02;else if(y===0)RT.t+=.004;else RT.t+=+y||0;
      for(const g in RT.tones){if(RT.t>=RT.tones[g]){setPin(+g,{mode:'out',v:0,duty:0});delete RT.tones[g];}}
      if(++n>6000||performance.now()-t0>14){if(RT.target-RT.t>80)RT.target=RT.t;break;}
    }
  }

  /* ======================= UI ======================= */
  const ed=$('#code'),edHL=$('#codeHL'),gut=$('#gutter'),serialEl=$('#simSerial');
  let errLineNo=0;
  function paintEditor(){edHL.innerHTML=hl(ed.value)+'\n';const n=ed.value.split('\n').length;let h='';for(let i=1;i<=n;i++)h+=`<div${i===errLineNo?' class="bad"':''}>${i}</div>`;gut.innerHTML=h;syncScroll();}
  function syncScroll(){edHL.parentElement.style.transform=`translate(${-ed.scrollLeft}px,${-ed.scrollTop}px)`;gut.style.transform=`translateY(${-ed.scrollTop}px)`;}
  ed.addEventListener('input',()=>{S.exKey=null;paintEditor();save();});ed.addEventListener('scroll',syncScroll);
  // sisipkan teks lewat execCommand supaya Undo (Cmd/Ctrl+Z) tetap jalan dan event input (simpan + warnai) ikut terpicu
  function edInsert(t){if(!document.execCommand('insertText',false,t)){ed.setRangeText(t,ed.selectionStart,ed.selectionEnd,'end');ed.dispatchEvent(new Event('input'));}}
  ed.addEventListener('keydown',e=>{
    if(e.isComposing)return;
    if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();run();}
    else if(e.key==='Tab'&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();edInsert('  ');}
    else if(e.key==='Enter'&&!e.shiftKey&&!e.altKey){const s=ed.selectionStart;const line=ed.value.slice(0,s).split('\n').pop();let ind=(line.match(/^\s*/)||[''])[0];if(/\{\s*$/.test(line))ind+='  ';e.preventDefault();edInsert('\n'+ind);}});
  function codeErr(er){errLineNo=er.line||0;paintEditor();const b=$('#codeErr');b.hidden=false;b.textContent=(er.line?_L(`Baris ${er.line}: `,`Line ${er.line}: `):'')+er.msg;
    if(er.line){const lh=parseFloat(getComputedStyle(ed).lineHeight)||20;ed.scrollTop=Math.max(0,(er.line-4)*lh);syncScroll();}}
  function clearCodeErr(){errLineNo=0;$('#codeErr').hidden=true;paintEditor();}
  function serialLine(t,cls){if(openLine&&!openLine.textContent){openLine.remove();openLine=null;}const d=document.createElement('div');d.className=cls||'';d.textContent=t;serialEl.appendChild(d);trimSerial();}
  let openLine=null;
  function serialFlush(){if(!RT.out)return;const parts=RT.out.split('\n');RT.out='';
    parts.forEach((p,i)=>{if(!openLine){openLine=document.createElement('div');serialEl.appendChild(openLine);}openLine.textContent+=p;if(i<parts.length-1)openLine=null;});trimSerial();}
  function trimSerial(){while(serialEl.childNodes.length>300)serialEl.removeChild(serialEl.firstChild);if($('#autoScroll').checked)serialEl.scrollTop=serialEl.scrollHeight;}
  $('#serialClear2').addEventListener('click',()=>{serialEl.innerHTML='';openLine=null;});
  $('#serialForm2').addEventListener('submit',e=>{e.preventDefault();const i=$('#serialIn2');const txt=i.value+($('#lineEnd').value==='nl'?'\n':'');for(const ch of txt)RT.inBuf.push(ch.charCodeAt(0));serialLine('» '+i.value,'in');i.value='';});
  function setRunUI(on){$('#runBtn').hidden=on;$('#stopBtn').hidden=!on;$('#runState').textContent=on?_L('Berjalan','Running'):_L('Berhenti','Stopped');$('#runState').className='state'+(on?' on':'');}
  $('#runBtn').addEventListener('click',run);$('#stopBtn').addEventListener('click',()=>stop());
  $('#copyCode').addEventListener('click',e=>copyText(ed.value,e.currentTarget,edHL));

  /* rak komponen */
  function renderRack(){const groups={};CAT_ORDER.forEach(t=>{const g=String(CAT[t].grp);(groups[g]=groups[g]||[]).push(t);});$('#rack').innerHTML=Object.keys(groups).map(g=>`<div class="rack-g"><span class="rack-t">${esc(g)}</span>${groups[g].map(t=>`<button class="add" type="button" data-add="${t}"><i>+</i><span>${esc(CAT[t].name)}</span><small>${esc(CAT[t].hint)}</small></button>`).join('')}</div>`).join('');}
  renderRack();
  $('#rack').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b)addPart(b.dataset.add);});
  /* contoh */
  function renderEx(){$('#exSel').innerHTML=_L('<option value="">Buka contoh…</option>','<option value="">Open an example…</option>')+EXAMPLES.map(x=>`<option value="${x[0]}">${esc(x[1])}</option>`).join('');}
  renderEx();
  $('#exSel').addEventListener('change',e=>{const x=EXAMPLES.find(q=>q[0]===e.target.value);e.target.value='';if(!x)return;stop(true);loadDesign(x[2](),true);S.exKey=x[0];save();serialEl.innerHTML='';openLine=null;serialLine(_L(`[contoh dimuat: ${x[1]}. Tekan Jalankan.]`,`[example loaded: ${x[1]}. Press Run.]`),'sim');});
  /* warna kabel */
  let wireColor='auto';
  const WC=[['auto',_L('Otomatis','Automatic')],[RED,_L('Merah','Red')],[K,_L('Hitam','Black')],[YEL,_L('Kuning','Yellow')],[GRN,_L('Hijau','Green')],[BLU,_L('Biru','Blue')],[ORG,_L('Oranye','Orange')],[PUR,_L('Ungu','Purple')],[WHT,_L('Putih','White')]];
  function renderWC(){$('#wireColors').innerHTML=WC.map(c=>`<button type="button" class="swatch${c[0]==='auto'?' auto':''}" data-wc="${c[0]}" title="${c[1]}" aria-label="${_L('Warna kabel','Wire colour')} ${c[1]}" aria-pressed="${c[0]===wireColor}" style="${c[0]==='auto'?'':'background:'+c[0]}">${c[0]==='auto'?'A':''}</button>`).join('');}
  renderWC();
  $('#wireColors').addEventListener('click',e=>{const b=e.target.closest('[data-wc]');if(!b)return;wireColor=b.dataset.wc;$$('[data-wc]').forEach(x=>x.setAttribute('aria-pressed',x===b));if(S.sel&&S.sel.W&&wireColor!=='auto'){S.sel.W.color=wireColor;drawWire(S.sel.W);save();}});
  $('#labelsOn').addEventListener('change',e=>v.showLabels=e.target.checked);
  $('#clearBtn').addEventListener('click',()=>{stop(true);loadDesign({parts:[],wires:[],code:ed.value},false);});
  $('#insTabs').addEventListener('click',e=>{const t=e.target.closest('[data-ins]');if(!t)return;$$('#insTabs .tab').forEach(x=>x.setAttribute('aria-selected',x===t));$$('[data-ins-panel]').forEach(p=>p.hidden=p.dataset.insPanel!==t.dataset.ins);});

  /* ---- seleksi & inspector ---- */
  const selRing=new THREE.Mesh(new THREE.RingGeometry(.9,1,48),new THREE.MeshBasicMaterial({color:cssv('--accent')||'#b15f19',side:THREE.DoubleSide,transparent:true,opacity:.9}));selRing.rotation.x=-Math.PI/2;selRing.visible=false;v.scene.add(selRing);
  themeFns.push(()=>selRing.material.color.set(cssv('--accent')));
  function select(s){
    if(S.sel&&S.sel.W&&S.sel.W.mat){S.sel.W.mat.emissive.set('#000000');S.sel.W.mat.emissiveIntensity=0;}
    S.sel=s;if(s&&s.W&&s.W.mat){s.W.mat.emissive.set('#e0782a');s.W.mat.emissiveIntensity=.6;}placeEnds();
    renderInspector();renderSelBar();}
  function placeRing(){const P=S.sel&&S.sel.P;selRing.visible=!!P;if(P){selRing.position.set(P.x,.015,P.z);selRing.scale.setScalar({l298:1.5,motor:1.6,bat:1.1,servo:1.4,relay:1.5,lamp:1.1,sonar:1.2,pir:1.1}[P.type]||.75);}}
  function connText(P,nm){const id=`p:${P.uid}:${nm}`;if(!S.uf)return '';const n=net(id);const others=(S.members.get(n)||[]).filter(x=>x!==id).map(pointName);
    const v2=S.V.has(n)?(S.driven.has(n)?volt(n).toFixed(2)+' V':_L('mengambang','floating')):'—';
    return `<li><b>${esc((CAT[P.type].pinLabel||{})[nm]||nm)}</b><span class="vv">${v2}</span><span class="cn">${others.length?'→ '+esc(others.slice(0,4).join(', '))+(others.length>4?` +${others.length-4}`:''):_L('<i>belum tersambung</i>','<i>not connected</i>')}</span></li>`;}
  function renderInspector(){
    const el=$('#insSel');const s=S.sel;placeRing();
    if(!s){el.innerHTML=_L(`<p class="muted">Klik komponen atau kabel untuk melihat detailnya.</p>
      <ul class="howto"><li><b>Pasang kabel:</b> klik lubang breadboard atau pin, lalu klik tujuannya. Tekan Esc untuk batal.</li><li><b>Pindah komponen:</b> drag badannya. Kakinya menempel otomatis ke lubang breadboard.</li><li><b>Putar:</b> tombol R. <b>Hapus:</b> tombol Delete.</li><li><b>Multimeter:</b> arahkan kursor ke lubang atau pin untuk melihat tegangannya.</li><li>Lubang dalam satu kolom (a–e atau f–j) saling tersambung. Jalur + dan − tersambung sepanjang breadboard.</li></ul>`,`<p class="muted">Click a part or a wire to see its details.</p>
      <ul class="howto"><li><b>Add a wire:</b> click a breadboard hole or a pin, then click where it goes. Press Esc to cancel.</li><li><b>Move a part:</b> drag its body. Its legs snap into the breadboard holes.</li><li><b>Rotate:</b> the R key. <b>Delete:</b> the Delete key.</li><li><b>Multimeter:</b> hover over a hole or pin to see its voltage.</li><li>Holes in the same column (a–e or f–j) are connected. The + and − rails run the full length of the breadboard.</li></ul>`);return;}
    if(s.W){const W=s.W;el.innerHTML=`<div class="ins-h"><b>${_L('Kabel','Wire')}</b><span class="sp"></span><button class="xbtn del" type="button" data-act="delwire">${_L('Hapus','Delete')}</button></div><p class="muted">${esc(pointName(W.a))}<br>→ ${esc(pointName(W.b))}</p><p class="note">${_L('Tarik salah satu ujung kabel (bulatan oranye) ke lubang atau pin lain untuk memindahkannya.','Drag either wire end (orange dot) to another hole or pin to move it.')}</p><div class="small-label">${_L('Warna','Colour')}</div><div class="swatches">${WC.slice(1).map(c=>`<button type="button" class="swatch" data-wcol="${c[0]}" aria-label="${c[1]}" aria-pressed="${W.color===c[0]}" style="background:${c[0]}"></button>`).join('')}</div>`;return;}
    const P=s.P,C=CAT[P.type],pr=P.props;const id=k=>`p${P.uid}-${k}`;
    const sl=(k,lab,min,max,st,unit)=>`<div class="field"><label for="${id(k)}">${lab} <b data-v="${k}">${pr[k]}${unit}</b></label><input type="range" id="${id(k)}" data-prop="${k}" data-unit="${unit}" min="${min}" max="${max}" step="${st}" value="${pr[k]}"></div>`;
    let ctl='';
    switch(P.type){
      case 'res':ctl=`<div class="field"><label for="${id('ohm')}">${_L('Nilai resistor','Resistor value')}</label><select class="sel" id="${id('ohm')}" data-prop="ohm">${RES_VALUES.map(r=>`<option value="${r[0]}"${r[0]===pr.ohm?' selected':''}>${r[1]}</option>`).join('')}</select></div>`;break;
      case 'led':ctl=`<div class="small-label">${_L('Warna','Colour')}</div><div class="swatches">${LED_COLORS.map(c=>`<button type="button" class="swatch" data-color="${c[0]}" aria-label="${c[1]}" aria-pressed="${pr.color===c[0]}" style="background:${c[0]}"></button>`).join('')}</div>`+(pr.burnt?_L(`<p class="note warn">LED ini rusak karena arusnya terlalu besar.</p><button class="btn sm accent" type="button" data-act="fix">Ganti LED baru</button>`,`<p class="note warn">This LED burned out because the current was too high.</p><button class="btn sm accent" type="button" data-act="fix">Replace with a new LED</button>`):'')+_L(`<p class="muted">Arus sekarang: <b data-live="I">–</b></p>`,`<p class="muted">Current now: <b data-live="I">–</b></p>`);break;
      case 'btn':ctl=_L(`<button class="btn sm accent" type="button" data-hold="1">Tahan untuk menekan</button><p class="muted">Bisa juga klik dan tahan tombol merah di 3D.</p>`,`<button class="btn sm accent" type="button" data-hold="1">Hold to press</button><p class="muted">You can also click and hold the red button in 3D.</p>`);break;
      case 'pot':ctl=sl('pos',_L('Putar','Turn'),0,100,1,'%');break;
      case 'ldr':ctl=sl('light',_L('Cahaya ruangan','Room light'),0,100,1,'%')+_L(`<p class="muted">Hambatan LDR: <b data-live="R">–</b>. Semakin terang, hambatan semakin kecil.</p>`,`<p class="muted">LDR resistance: <b data-live="R">–</b>. The brighter it is, the lower the resistance.</p>`);break;
      case 'dht':ctl=sl('t',_L('Suhu','Temperature'),0,50,.5,' °C')+sl('h',_L('Kelembapan','Humidity'),20,90,1,' %');break;
      case 'sonar':ctl=sl('cm',_L('Jarak benda','Object distance'),2,200,1,' cm');break;
      case 'pir':ctl=`<label class="check"><input type="checkbox" data-prop="motion"${pr.motion?' checked':''}> ${_L('Ada orang bergerak di depan sensor','Someone is moving in front of the sensor')}</label>`;break;
      case 'l298':ctl=`<label class="check"><input type="checkbox" data-prop="jumperA"${pr.jumperA?' checked':''}> ${_L('Jumper ENA terpasang (motor A selalu kecepatan penuh)','ENA jumper fitted (motor A always at full speed)')}</label><label class="check"><input type="checkbox" data-prop="jumperB"${pr.jumperB?' checked':''}> ${_L('Jumper ENB terpasang','ENB jumper fitted')}</label>`;break;
      case 'bat':ctl=`<label class="check"><input type="checkbox" data-prop="on"${pr.on?' checked':''}> ${_L('Saklar baterai ON','Battery switch ON')}</label>`;break;
      case 'motor':ctl=_L(`<p class="muted">Tegangan motor: <b data-live="Vm">–</b></p>`,`<p class="muted">Motor voltage: <b data-live="Vm">–</b></p>`);break;
      case 'servo':ctl=_L(`<p class="muted">Sudut: <b data-live="ang">–</b></p>`,`<p class="muted">Angle: <b data-live="ang">–</b></p>`);break;
    }
    const pins=C.legs?C.legs.map(l=>l[0]):C.pins;
    el.innerHTML=`<div class="ins-h"><b>${esc(P.label)}</b><span class="sp"></span><button class="xbtn" type="button" data-act="rot">${_L('Putar (R)','Rotate (R)')}</button><button class="xbtn del" type="button" data-act="del">${_L('Hapus','Delete')}</button></div>
      <div class="ins-ctl">${ctl}</div><div class="small-label">${_L('Sambungan tiap kaki','Connections per leg')}</div><ul class="conn" data-conn>${pins.map(nm=>connText(P,nm)).join('')}</ul>`;
  }
  const insEl=$('#insSel');
  insEl.addEventListener('click',e=>{const s=S.sel;if(!s)return;const a=e.target.closest('[data-act]');
    if(a){const k=a.dataset.act;if(k==='delwire')removeWire(s.W);else if(k==='del')removePart(s.P);else if(k==='rot')rotateSel();else if(k==='fix'){s.P.props.burnt=false;s.P.dOn=false;buildVisual(s.P);placeAt(s.P,s.P.x,s.P.z,true);S.topo=true;renderInspector();save();}return;}
    const wc=e.target.closest('[data-wcol]');if(wc&&s.W){s.W.color=wc.dataset.wcol;drawWire(s.W);renderInspector();save();return;}
    const c=e.target.closest('[data-color]');if(c&&s.P){s.P.props.color=c.dataset.color;const P=s.P;buildVisual(P);placeAt(P,P.x,P.z,true);S.topo=true;renderInspector();save();}});
  insEl.addEventListener('input',e=>{const t=e.target.closest('input[type=range][data-prop]');if(!t||!S.sel||!S.sel.P)return;S.sel.P.props[t.dataset.prop]=+t.value;const b=$(`[data-v="${t.dataset.prop}"]`,insEl);if(b)b.textContent=t.value+t.dataset.unit;S.dirty=true;save();});
  insEl.addEventListener('change',e=>{const t=e.target.closest('[data-prop]');if(!t||!S.sel||!S.sel.P)return;const P=S.sel.P;
    if(t.type==='checkbox')P.props[t.dataset.prop]=t.checked;else if(t.tagName==='SELECT'){P.props[t.dataset.prop]=+t.value;if(P.type==='res'){buildVisual(P);placeAt(P,P.x,P.z,true);S.topo=true;}}S.dirty=true;save();});
  const hold=v2=>{if(S.sel&&S.sel.P&&S.sel.P.type==='btn'){S.sel.P.pressed=v2;S.dirty=true;}};
  insEl.addEventListener('pointerdown',e=>{if(e.target.closest('[data-hold]')){e.preventDefault();hold(true);}});
  ['pointerup','pointerout','pointercancel'].forEach(n=>insEl.addEventListener(n,e=>{if(e.target.closest('[data-hold]'))hold(false);}));
  function rotateSel(){const P=S.sel&&S.sel.P;if(!P)return;const old=P.rot,x0=P.x,z0=P.z;P.rot=(P.rot+1)%4;placeAt(P,x0,z0,true);
    if(!legalPlace(P)){let ok=false;const st=BBS.p;for(const [dx,dz] of [[0,0],[st,0],[-st,0],[0,st],[0,-st],[st,st],[-st,-st],[2*st,0],[-2*st,0]]){placeAt(P,x0+dx,z0+dz,true);if(legalPlace(P)){ok=true;break;}}
      if(!ok){P.rot=old;placeAt(P,x0,z0,true);serialLine(String(_L('[Tidak bisa diputar di sini: tempatnya bentrok. Geser dulu komponennya.]','[Cannot rotate here: no room. Move the part first.]')),'sim');}}
    redrawWiresOf(P);S.topo=true;placeRing();save();}

  /* ---- interaksi 3D ---- */
  const el=v.renderer.domElement;const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();
  const hoverM=new THREE.Mesh(new THREE.RingGeometry(.07,.11,24),new THREE.MeshBasicMaterial({color:'#e0782a',side:THREE.DoubleSide,depthTest:false,transparent:true}));hoverM.rotation.x=-Math.PI/2;hoverM.renderOrder=10;hoverM.visible=false;v.scene.add(hoverM);
  const startM=hoverM.clone();startM.material=new THREE.MeshBasicMaterial({color:'#35c4d8',side:THREE.DoubleSide,depthTest:false,transparent:true});v.scene.add(startM);
  const prevGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);const prevLine=new THREE.Line(prevGeo,new THREE.LineDashedMaterial({color:'#e0782a',dashSize:.15,gapSize:.1,depthTest:false}));prevLine.renderOrder=10;prevLine.visible=false;v.scene.add(prevLine);
  const endA=startM.clone();endA.material=new THREE.MeshBasicMaterial({color:'#e0782a',side:THREE.DoubleSide,depthTest:false,transparent:true});endA.scale.setScalar(2.1);endA.visible=false;v.scene.add(endA);
  const endB=endA.clone();v.scene.add(endB);
  function placeEnds(){const W=S.sel&&S.sel.W;endA.visible=endB.visible=!!(W&&W.g);if(W&&W.g){endA.position.copy(pointPos(W.a)).add(new THREE.Vector3(0,.03,0));endB.position.copy(pointPos(W.b)).add(new THREE.Vector3(0,.03,0));}}
  const tip=v.tip;
  let wiring=null,drag=null,press=null,downXY=null,ptDown=null;
  function setPtr(e){const r=el.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ptr,v.camera);return r;}
  function pick(e){setPtr(e);
    const r=el.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    // pegangan ujung kabel yang sedang dipilih didahulukan
    const sw=S.sel&&S.sel.W;
    if(sw&&endA.visible)for(const [m,end] of [[endA,sw.a],[endB,sw.b]]){const s=toScreen(m.position,r);if(Math.hypot(s[0]-mx,s[1]-my)<16)return {kind:'end',W:sw,pt:end};}
    const objs=[root,board.group];const hits=ray.intersectObjects(objs,true);
    for(const h of hits){let o=h.object;
      if(o.userData.pt){let id=o.userData.pt;const m=/^p:(\d+):(.+)$/.exec(id);if(m){const P=partBy(+m[1]);if(P&&P.snapped&&P.holes[m[2]])id=P.holes[m[2]];}return {kind:'pt',pt:id};}
      if(o.userData.wire){const W=o.userData.wire;for(const end of [W.a,W.b]){const ep=pointPos(end);if(ep&&Math.hypot(ep.x-h.point.x,ep.z-h.point.z)<.28)return {kind:'end',W,pt:end};}return {kind:'wire',W};}
      if(o===selRing||o===hoverM)continue;
      while(o&&!o.userData.part&&o!==board.group)o=o.parent;
      if(o&&o.userData.part){const P=o.userData.part;if(P.type==='btn'&&P.vis.cap&&isChildOf(h.object,P.vis.cap))return {kind:'press',P};return {kind:'part',P};}
      if(o===board.group)return {kind:'board'};}
    const t=new THREE.Vector3();if(ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-BBS.top),t)){const h=holeNear(t.x,t.z,.13);if(h)return {kind:'pt',pt:h};}
    return null;}
  function toScreen(p,r){const q=p.clone().project(v.camera);return [(q.x+1)/2*r.width,(1-q.y)/2*r.height];}
  // "magnet": titik sambungan terdekat dari kursor (di layar), dipakai saat menarik kabel
  function snapPt(e,except){const r=el.getBoundingClientRect();const mx=e.clientX-r.left,my=e.clientY-r.top;let best=null,bd=28;
    const test=id=>{if(id===except)return;const p=pointPos(id);if(!p)return;const s=toScreen(p,r);const d=Math.hypot(s[0]-mx,s[1]-my);if(d<bd){bd=d;best=id;}};
    PINS.forEach(p=>test('m:'+p.id));
    S.parts.forEach(P=>{const C=CAT[P.type];if(!C.legs)C.pins.forEach(nm=>test(`p:${P.uid}:${nm}`));else if(!P.snapped)C.legs.forEach(l=>test(`p:${P.uid}:${l[0]}`));});
    setPtr(e);const t=new THREE.Vector3();
    if(ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-BBS.top),t)){const ix=Math.round((t.x-bx(0))/BBS.p);
      for(let dx=-1;dx<=1;dx++){const x=ix+dx;if(x<0||x>=BBS.cols)continue;ROW_IZ.forEach(iz=>test(`h:${x}:${iz}`));if(railHole(x))for(const sd of ['near','far'])for(const k of ['gnd','vcc'])test(`r:${sd}:${k}:${x}`);}}
    return best;}
  function isChildOf(o,p){while(o){if(o===p)return true;o=o.parent;}return false;}
  function floorPt(e){setPtr(e);const t=new THREE.Vector3();return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),t)?t:null;}
  function showTip(e,txt){const r=el.getBoundingClientRect();tip.textContent=txt;tip.hidden=false;tip.style.transform=`translate(${Math.min(e.clientX-r.left+14,r.width-220)}px,${e.clientY-r.top+16}px)`;}
  function ptTip(id){let txt=pointName(id);if(S.uf){const n=net(id);if(S.V.has(n))txt+=S.driven.has(n)?` · ${volt(n).toFixed(2)} V`:_L(' · mengambang',' · floating');}return txt;}
  const mark=(m,id)=>{m.position.copy(pointPos(id)).add(new THREE.Vector3(0,.02,0));m.visible=true;};
  function finishWire(to){const a=wiring.a;cancelWire();if(a===to)return;const W=addWire(a,to,wireColor==='auto'?null:wireColor);if(W)select({kind:'wire',W});}

  /* aturan penempatan: komponen berkaki wajib menancap di lubang kosong, modul tidak boleh menumpuk */
  const FOOT={l298:1.15,motor:1.2,bat:1.0,servo:.9,relay:1.1,lamp:.8};
  function legalPlace(P){const C=CAT[P.type];
    if(C.legs){if(!P.snapped)return false;const mine=new Set(Object.values(P.holes));return !S.parts.some(q=>q!==P&&q.snapped&&Object.values(q.holes).some(h=>mine.has(h)));}
    const r=FOOT[P.type]||1;const inRect=(cx,cz,hw,hd)=>Math.abs(P.x-cx)<hw+r*.8&&Math.abs(P.z-cz)<hd+r*.8;
    if(inRect(BBS.cx,0,BBS.w/2,BBS.d/2)||inRect(board.group.position.x,0,2.55,1.4))return false;
    return !S.parts.some(q=>q!==P&&!CAT[q.type].legs&&Math.hypot(q.x-P.x,q.z-P.z)<(r+(FOOT[q.type]||1))*.8);}
  const MSG_LEG=_L('Kaki komponen harus menancap di lubang breadboard yang kosong.','Part legs must go into empty breadboard holes.');
  const MSG_MOD=_L('Modul ini ditaruh di meja, tidak boleh menumpuk dengan breadboard, ESP32, atau modul lain.','This module sits on the table and cannot overlap the breadboard, the ESP32 or another module.');

  el.tabIndex=0;el.style.outline='none';
  el.addEventListener('pointerdown',e=>{
    if(e.button===2){cancelWire();return;}
    try{el.focus({preventScroll:true});}catch(_){}
    downXY=[e.clientX,e.clientY];const p=pick(e);
    if(!p||p.kind==='board'){if(wiring){const s=snapPt(e,wiring.a);if(s){v.controls.enabled=false;finishWire(s);downXY=null;}}return;}
    v.controls.enabled=false;
    if(wiring){const t=(p.kind==='pt'||p.kind==='end')?p.pt:snapPt(e,wiring.a);if(t){finishWire(t);downXY=null;}else v.controls.enabled=true;return;}
    if(p.kind==='pt'||p.kind==='end'){
      const sw=S.sel&&S.sel.W;
      const W=p.kind==='end'?p.W:((sw&&(sw.a===p.pt||sw.b===p.pt))?sw:S.wires.slice().reverse().find(w=>w.a===p.pt||w.b===p.pt));
      ptDown={pt:p.pt,W:W||null,moving:false,to:null};return;}
    if(p.kind==='press'){press=p.P;p.P.pressed=true;S.dirty=true;select({kind:'part',P:p.P});return;}
    if(p.kind==='part'){const pt=floorPt(e);drag={P:p.P,off:pt?{x:p.P.x-pt.x,z:p.P.z-pt.z}:{x:0,z:0},moved:false,last:[p.P.x,p.P.z]};select({kind:'part',P:p.P});return;}
    if(p.kind==='wire'){select({kind:'wire',W:p.W});return;}
  },{capture:true});
  el.addEventListener('pointermove',e=>{
    if(ptDown&&downXY){const d=ptDown;
      if(!d.moving&&e.buttons&&Math.hypot(e.clientX-downXY[0],e.clientY-downXY[1])>6){d.moving=true;
        d.fixed=d.W?(d.W.a===d.pt?d.W.b:d.W.a):d.pt;if(d.W&&d.W.g)root.remove(d.W.g);
        mark(startM,d.fixed);endA.visible=endB.visible=false;}
      if(d.moving){const a=pointPos(d.fixed);d.to=snapPt(e,d.fixed);
        if(d.to){const pos=pointPos(d.to);mark(hoverM,d.to);setPrev(a,pos);showTip(e,ptTip(d.to));}
        else{hoverM.visible=false;tip.hidden=true;const fp=floorPt(e);if(fp)setPrev(a,fp.setY(.4));}
        return;}}
    if(drag){const pt=floorPt(e);if(!pt)return;drag.moved=true;const P=drag.P,C=CAT[P.type];
      let nx=clampN(pt.x+drag.off.x,-12,13),nz=clampN(pt.z+drag.off.z,-9,8);
      if(!C.legs){nx=Math.round(nx*4)/4;nz=Math.round(nz*4)/4;}
      placeAt(P,nx,nz,true);
      if(legalPlace(P)){drag.last=[P.x,P.z];tip.hidden=true;}
      else{placeAt(P,drag.last[0],drag.last[1],true);showTip(e,String(C.legs?MSG_LEG:MSG_MOD));}
      redrawWiresOf(P);placeRing();return;}
    if(e.buttons&&!wiring){tip.hidden=true;hoverM.visible=false;return;}
    const p=pick(e);
    let hp=p&&(p.kind==='pt'||p.kind==='end')?p.pt:null;if(!hp&&wiring)hp=snapPt(e,wiring.a);
    if(hp){const pos=pointPos(hp);mark(hoverM,hp);el.style.cursor=p&&p.kind==='end'&&!wiring?'grab':'crosshair';showTip(e,ptTip(hp)+(p&&p.kind==='end'&&!wiring?String(_L(' · tarik untuk memindah ujung kabel',' · drag to move this wire end')):''));
      if(wiring)setPrev(pointPos(wiring.a),pos);}
    else{hoverM.visible=false;tip.hidden=true;el.style.cursor=p&&(p.kind==='part'||p.kind==='wire'||p.kind==='press')?'pointer':'';
      if(wiring){const fp=floorPt(e);if(fp)setPrev(pointPos(wiring.a),fp.setY(.4));}}
  });
  function setPrev(a,b){const arr=prevGeo.attributes.position.array;arr[0]=a.x;arr[1]=a.y+.05;arr[2]=a.z;arr[3]=b.x;arr[4]=b.y+.05;arr[5]=b.z;prevGeo.attributes.position.needsUpdate=true;prevLine.computeLineDistances();prevLine.visible=true;}
  function cancelWire(){wiring=null;startM.visible=false;prevLine.visible=false;}
  window.addEventListener('pointerup',e=>{
    if(ptDown){const d=ptDown;ptDown=null;v.controls.enabled=true;downXY=null;
      if(!d.moving){if(d.W)select({kind:'wire',W:d.W});wiring={a:d.pt};mark(startM,d.pt);return;}
      const to=d.to;startM.visible=false;prevLine.visible=false;hoverM.visible=false;tip.hidden=true;
      const dup=t=>S.wires.some(w=>w!==d.W&&((w.a===t&&w.b===d.fixed)||(w.b===t&&w.a===d.fixed)));
      if(d.W){if(to&&to!==d.fixed&&!dup(to)){if(d.W.a===d.pt)d.W.a=to;else d.W.b=to;S.topo=true;save();}drawWire(d.W);select({kind:'wire',W:d.W});}
      else if(to&&to!==d.pt&&!dup(to)){const W=addWire(d.pt,to,wireColor==='auto'?null:wireColor);if(W)select({kind:'wire',W});}
      return;}
    if(press){press.pressed=false;S.dirty=true;press=null;}
    if(drag){if(drag.moved){tip.hidden=true;S.topo=true;save();renderInspector();}drag=null;}
    v.controls.enabled=true;
    if(downXY&&e.target===el){const moved=Math.hypot(e.clientX-downXY[0],e.clientY-downXY[1]);if(moved<5){const p=pick(e);if(!p||p.kind==='board'){if(wiring)cancelWire();else select(null);}}}
    downXY=null;});
  el.addEventListener('contextmenu',e=>{if(wiring){e.preventDefault();cancelWire();}});
  function delSel(){if(!S.sel)return;cancelWire();if(S.sel.W)removeWire(S.sel.W);else removePart(S.sel.P);}
  window.addEventListener('keydown',e=>{if(e.target&&e.target.closest&&e.target.closest('input,textarea,select'))return;
    if(e.key==='Escape'){cancelWire();select(null);}
    else if((e.key==='Delete'||e.key==='Backspace')&&S.sel){e.preventDefault();delSel();}
    else if((e.key==='r'||e.key==='R')&&S.sel&&S.sel.P)rotateSel();});
  window.__simKey=k=>{const ev=new KeyboardEvent('keydown',{key:k,cancelable:true});window.dispatchEvent(ev);return ev.defaultPrevented;};

  /* bilah aksi untuk yang sedang dipilih */
  const selbar=document.createElement('div');selbar.className='selbar';selbar.hidden=true;$('#stage-sim').appendChild(selbar);
  function renderSelBar(){const s=S.sel;if(!s||(!s.W&&!s.P)){selbar.hidden=true;return;}selbar.hidden=false;
    selbar.innerHTML=`<b>${esc(s.W?_L('Kabel','Wire'):s.P.label)}</b>${s.P?`<button type="button" data-sb="rot">⟳ ${_L('Putar','Rotate')} <kbd>R</kbd></button>`:''}<button type="button" class="del" data-sb="del">${_L('Hapus','Delete')} <kbd>Del</kbd></button><button type="button" class="x" data-sb="x" aria-label="${_L('Batal pilih','Deselect')}">✕</button>`;}
  selbar.addEventListener('click',e=>{const b=e.target.closest('[data-sb]');if(!b)return;const k=b.dataset.sb;if(k==='del')delSel();else if(k==='rot')rotateSel();else{cancelWire();select(null);}});
  onLang(renderSelBar);

  /* ---- simpan / muat ---- */
  function serialize(){const idx=u=>S.parts.findIndex(p=>p.uid===u);const conv=id=>id.startsWith('p:')?id.replace(/^p:(\d+):/,(m,u)=>`p:#${idx(+u)}:`):id;
    return {parts:S.parts.map(P=>{const o={type:P.type,rot:P.rot,props:Object.assign({},P.props)};if(P.snapped){const h=P.holes[CAT[P.type].legs[0][0]].split(':');o.hole=[+h[1],+h[2]];}else o.at=[+P.x.toFixed(3),+P.z.toFixed(3)];return o;}),
      wires:S.wires.map(w=>[conv(w.a),conv(w.b),w.color]),code:ed.value,exKey:S.exKey||null};}
  let saveT=null;function save(){clearTimeout(saveT);saveT=setTimeout(()=>store('esp32sim-v1',serialize()),500);}
  function loadDesign(d,withCode){
    select(null);cancelWire();
    S.wires.slice().forEach(w=>{if(w.g)root.remove(w.g);});S.wires=[];
    S.parts.slice().forEach(P=>{root.remove(P.group);if(P.lbl)v.removeLabel(P.lbl);});S.parts=[];S.uid=1;S.wid=1;
    const uids=[];
    (d.parts||[]).forEach(o=>{if(!CAT[o.type]){uids.push(null);return;}const P=createPart(o.type,o.props,o.rot||0);uids.push(P.uid);if(o.hole)placeAtHole(P,o.hole[0],o.hole[1]);else if(o.at)placeAt(P,o.at[0],o.at[1],!!CAT[o.type].legs);else autoPlace(P);});
    const conv=id=>id.replace(/^p:#(\d+):/,(m,i)=>`p:${uids[+i]}:`);
    (d.wires||[]).forEach(w=>{const a=conv(w[0]),b=conv(w[1]);if(/p:null/.test(a+b))return;addWire(a,b,w[2]);});
    if(withCode&&d.code!=null){ed.value=String(d.code);S.codeSrc=typeof d.code==='object'?d.code:null;clearCodeErr();}
    S.topo=true;S.dirty=true;renderInspector();save();
  }

  /* ---- visual & pemeriksa per frame ---- */
  let probT=0,liveT=0,audio=null,gain=null;
  $('#soundOn').addEventListener('change',e=>{if(e.target.checked&&!audio){try{const AC=window.AudioContext||window.webkitAudioContext;audio=new AC();const o=audio.createOscillator();o.type='square';o.frequency.value=2300;gain=audio.createGain();gain.gain.value=0;o.connect(gain).connect(audio.destination);o.start();}catch(err){e.target.checked=false;}}else if(audio&&audio.state==='suspended')audio.resume();});
  function visuals(dt,t){
    let buzz=false;
    for(const P of S.parts){const pr=P.props;
      switch(P.type){
        case 'led':if(!pr.burnt)P.vis.set(clampN((P.cur.I||0)/.012,0,1));P.vis.smoke(t,pr.burnt&&P.burnT&&performance.now()-P.burnT<4000);break;
        case 'btn':if(P.vis.pressed!==!!P.pressed)P.vis.press(!!P.pressed);break;
        case 'pot':P.vis.setPos(pr.pos/100);break;
        case 'ldr':P.vis.setLight(pr.light/100);break;
        case 'buz':{const on=(P.vd||0)>2;P.vis.set(on);P.vis.update(dt,t);if(on)buzz=true;break;}
        case 'sonar':P.vis.update(dt,pr.cm,!!P.pw);break;
        case 'pir':P.vis.update(t,pr.motion,!!P.pw&&pr.motion);break;
        case 'motor':{const vm=P.vm||0;const w=Math.sign(vm)*Math.max(0,Math.abs(vm)-1.2)*3.2;P.w=lerp(P.w||0,w,Math.min(1,dt*3));P.vis.spin(dt,P.w);break;}
        case 'servo':{let tgt=null;if((P.vcc||0)>=3.5){const n=net(`p:${P.uid}:SIG`);const so=RT.servos.find(s=>s.pin>=0&&netOfPin(s.pin)===n);if(so)tgt=so.a;}
          if(P.ang===undefined)P.ang=90;if(tgt!==null){const d=tgt-P.ang;P.ang+=Math.sign(d)*Math.min(Math.abs(d),(P.vcc>=4.4?300:90)*dt);}P.vis.setAngle(P.ang);break;}
        case 'bat':P.vis.sw.material=std(pr.on?'#2fa85a':'#d63a2f');break;
        case 'relay':P.vis.update(dt);break;
        case 'lamp':P.vis.set(clampN((Math.abs(P.vl||0)-1)/6,0,1));break;
      }
      if(P.lbl){let s=P.label;if(P.type==='dht')s+=` · ${pr.t}°C ${pr.h}%`;else if(P.type==='sonar')s+=` · ${pr.cm} cm`;else if(P.type==='relay')s+=P.on?' · ON':' · OFF';else if(P.type==='bat')s+=pr.on?' · ON':' · OFF';else if(P.type==='res')s=`${P.label} · ${RES_VALUES.find(r=>r[0]===pr.ohm)?.[1]||pr.ohm+' Ω'}`;else if(P.type==='led'&&pr.burnt)s+=_L(' · rusak',' · burned out');P.lbl.set(esc(s));}
    }
    if(gain)gain.gain.setTargetAtTime(buzz&&$('#soundOn').checked?.04:0,audio.currentTime,.01);
  }
  function checks(){
    const L=[];const add=(lvl,msg)=>L.push({lvl,msg});
    if(S.srcI['3V3']>.6)add('err',_L('Korsleting: pin 3V3 tersambung langsung ke GND (atau bebannya terlalu besar). Periksa kabel merah dan hitam.','Short circuit: the 3V3 pin is connected straight to GND (or the load is too large). Check the red and black wires.'));
    if(S.srcI['VIN']>.9)add('err',_L('Korsleting: pin VIN (5 V) tersambung langsung ke GND.','Short circuit: the VIN (5 V) pin is connected straight to GND.'));
    if(Math.abs(S.batI)>4)add('err',_L('Korsleting pada baterai. Kutub + dan − tersambung langsung.','Battery short circuit. The + and − terminals are connected directly.'));
    for(const g in S.gpioI){const i=Math.abs(S.gpioI[g])*1000;if(i>40)add('err',_L(`GPIO ${g} dipaksa mengalirkan ${i.toFixed(0)} mA. Batas aman ESP32 sekitar 20–40 mA per pin. Beban besar (motor, lampu) harus lewat driver atau transistor.`,`GPIO ${g} is forced to carry ${i.toFixed(0)} mA. The safe ESP32 limit is about 20–40 mA per pin. Heavy loads (motors, lamps) must go through a driver or transistor.`));else if(i>25)add('warn',_L(`GPIO ${g} mengalirkan ${i.toFixed(0)} mA, di atas batas aman 20 mA.`,`GPIO ${g} carries ${i.toFixed(0)} mA, above the 20 mA safe limit.`));}
    PINS.forEach(p=>{if(p.gpio===null)return;const n=net('m:'+p.id);if(S.driven.has(n)&&volt(n)>3.65)add('err',_L(`Pin ${p.label} (GPIO ${p.gpio}) menerima ${volt(n).toFixed(1)} V. ESP32 hanya tahan 3.3 V dan bisa rusak.`,`Pin ${p.label} (GPIO ${p.gpio}) is receiving ${volt(n).toFixed(1)} V. The ESP32 only tolerates 3.3 V and can be damaged.`));});
    const wired=P=>(CAT[P.type].legs?CAT[P.type].legs.map(l=>l[0]):CAT[P.type].pins).some(nm=>{const id=`p:${P.uid}:${nm}`;return (S.members.get(net(id))||[]).some(x=>x!==id&&!x.startsWith(`p:${P.uid}:`));});
    for(const P of S.parts){const pr=P.props;
      switch(P.type){
        case 'led':if(pr.burnt)add('err',_L(`${P.label} rusak karena arusnya terlalu besar. LED selalu butuh resistor (misalnya 220 Ω) di jalurnya.`,`${P.label} burned out because the current was too high. An LED always needs a resistor (for example 220 Ω) in series.`));
          else if(P.cur.I>.021)add('warn',_L(`${P.label} dialiri ${(P.cur.I*1000).toFixed(0)} mA, di atas batas aman 20 mA. Tambahkan resistor.`,`${P.label} is carrying ${(P.cur.I*1000).toFixed(0)} mA, above the 20 mA safe limit. Add a resistor.`));
          else if((P.cur.vd||0)<-1.5)add('info',_L(`${P.label} sepertinya terpasang terbalik. Kaki panjang (anoda, +) harus ke arah tegangan positif.`,`${P.label} seems to be backwards. The long leg (anode, +) must face the positive voltage.`));break;
        case 'dht':if(wired(P)&&!P.pw)add('warn',_L(`${P.label} belum dapat daya. Sambungkan VCC ke 3V3 dan GND ke GND.`,`${P.label} has no power. Connect VCC to 3V3 and GND to GND.`));break;
        case 'sonar':if(wired(P)&&!P.pw)add('warn',P.vcc>2.5?_L(`${P.label} butuh 5 V (pin VIN), sekarang hanya ${P.vcc.toFixed(1)} V.`,`${P.label} needs 5 V (the VIN pin), but only has ${P.vcc.toFixed(1)} V.`):_L(`${P.label} belum dapat daya. VCC ke VIN (5 V), GND ke GND.`,`${P.label} has no power. VCC to VIN (5 V), GND to GND.`));
          else if(P.pw&&(S.members.get(net(`p:${P.uid}:ECHO`))||[]).some(x=>x.startsWith('m:')))add('info',_L(`${P.label}: pin ECHO mengeluarkan 5 V. Di rangkaian asli, pasang pembagi tegangan (1 kΩ + 2 kΩ) sebelum masuk ke ESP32.`,`${P.label}: the ECHO pin outputs 5 V. In a real circuit, add a voltage divider (1 kΩ + 2 kΩ) before the ESP32.`));break;
        case 'pir':if(wired(P)&&!P.pw)add('warn',P.vcc>2.5?_L(`${P.label} butuh 5 V (pin VIN), sekarang hanya ${P.vcc.toFixed(1)} V.`,`${P.label} needs 5 V (the VIN pin), but only has ${P.vcc.toFixed(1)} V.`):_L(`${P.label} belum dapat daya. VCC ke VIN (5 V), GND ke GND.`,`${P.label} has no power. VCC to VIN (5 V), GND to GND.`));break;
        case 'servo':if(wired(P)&&(P.vcc||0)<3.5)add('warn',_L(`${P.label} belum dapat daya. Kabel merah ke VIN (5 V), coklat ke GND.`,`${P.label} has no power. Red wire to VIN (5 V), brown to GND.`));else if(wired(P)&&P.vcc<4.4)add('info',_L(`${P.label} hanya dapat ${P.vcc.toFixed(1)} V, jadi geraknya lemah. Pakai VIN (5 V).`,`${P.label} only gets ${P.vcc.toFixed(1)} V, so it moves weakly. Use VIN (5 V).`));
          else if(RT.running&&wired(P)&&!RT.servos.some(s=>s.pin>=0&&netOfPin(s.pin)===net(`p:${P.uid}:SIG`)))add('info',_L(`${P.label}: kabel sinyal belum ke pin yang dipakai servo.attach() di kode.`,`${P.label}: the signal wire is not on the pin used by servo.attach() in the code.`));break;
        case 'buz':if((P.vd||0)<-2)add('info',_L(`${P.label} terpasang terbalik: kaki + (lebih panjang) harus ke arah pin sinyal.`,`${P.label} is backwards: the + leg (the longer one) must face the signal pin.`));break;
        case 'l298':if(wired(P)&&(P.v12||0)<5)add('warn',_L(`${P.label} belum dapat daya motor. Sambungkan baterai + ke terminal 12V dan − ke GND.`,`${P.label} has no motor power. Connect the battery + to the 12V terminal and − to GND.`));
          if(wired(P)&&(P.v12||0)>=5&&!P.common)add('err',_L(`${P.label}: GND baterai belum disatukan dengan GND ESP32, jadi sinyal IN tidak terbaca. Tambahkan kabel dari GND ESP32 ke GND L298N.`,`${P.label}: the battery GND is not joined to the ESP32 GND, so the IN signals cannot be read. Add a wire from ESP32 GND to L298N GND.`));break;
        case 'motor':if((S.members.get(net(`p:${P.uid}:M1`))||[]).concat(S.members.get(net(`p:${P.uid}:M2`))||[]).some(x=>x.startsWith('m:D')))add('warn',_L(`${P.label} tersambung langsung ke pin ESP32. Pin tidak kuat menggerakkan motor. Pakai driver L298N.`,`${P.label} is connected straight to an ESP32 pin. A pin cannot drive a motor. Use an L298N driver.`));break;
        case 'relay':if(wired(P)&&(P.vcc||0)<4)add('warn',`${P.label}: ${_L('butuh 5 V. Sambungkan VCC ke VIN dan GND ke GND.','needs 5 V. Connect VCC to VIN and GND to GND.')}`);break;
        case 'lamp':if(wired(P)&&Math.abs(P.vl||0)<1&&(S.members.get(net(`p:${P.uid}:A`))||[]).some(x=>x.startsWith('m:')))add('info',`${P.label}: ${_L('pin ESP32 tidak kuat menyalakan lampu. Pakai relay dan baterai.','an ESP32 pin cannot power a lamp. Use a relay and a battery.')}`);break;
      }}
    RT.warn.forEach(m=>add('warn',m));
    {const seen=new Set();for(let i=L.length-1;i>=0;i--){const m=String(L[i].msg);if(seen.has(m))L.splice(i,1);else seen.add(m);}}
    S.probs=L;
    const box=$('#insProb');const n=L.filter(x=>x.lvl!=='info').length;$('#probN').textContent=L.length?`(${L.length})`:'';$('#probN').className=n?'badge':'';
    box.innerHTML=L.length?`<ul class="issues">${L.map(x=>`<li class="${x.lvl}">${esc(x.msg)}</li>`).join('')}</ul>`:_L('<p class="muted">Tidak ada masalah yang terdeteksi.</p>','<p class="muted">No problems detected.</p>');
    lessonTick();
  }
  function live(){
    const s=S.sel;if(!s||!s.P)return;const P=s.P;
    const q=k=>$(`[data-live="${k}"]`,insEl);
    if(P.type==='led'&&q('I'))q('I').textContent=`${((P.cur.I||0)*1000).toFixed(1)} mA`;
    if(P.type==='ldr'&&q('R')){const r=Math.pow(10,5-2*P.props.light/100);q('R').textContent=r>=1000?(r/1000).toFixed(1)+' kΩ':r.toFixed(0)+' Ω';}
    if(P.type==='motor'&&q('Vm'))q('Vm').textContent=`${(P.vm||0).toFixed(2)} V`;
    if(P.type==='servo'&&q('ang'))q('ang').textContent=`${Math.round(P.ang||90)}°`;
    const c=$('[data-conn]',insEl);if(c){const pins=CAT[P.type].legs?CAT[P.type].legs.map(l=>l[0]):CAT[P.type].pins;const h=pins.map(nm=>connText(P,nm)).join('');if(c.innerHTML!==h)c.innerHTML=h;}
  }
  v.onFrame=(dt,t)=>{
    if(S.topo){buildNets();renderInspector();}
    if(RT.running){step(dt*1000);$('#runTime').textContent=(RT.t/1000).toFixed(1)+_L(' dtk',' s');}
    if(S.dirty||RT.running){solve();S.dirty=false;}
    lessonFrame();extrasFrame(dt);
    serialFlush();visuals(dt,t);
    probT+=dt;if(probT>.3){probT=0;checks();}
    liveT+=dt;if(liveT>.2){liveT=0;live();}
  };

  /* ---- mode belajar: pelajaran bertahap dengan pemeriksaan otomatis ---- */
  const lsSame=(a,b)=>{try{return !!S.uf&&net(a)===net(b);}catch(e){return false;}};
  const lsMem=id=>{try{return S.members.get(net(id))||[];}catch(e){return [];}};
  const lsGnd=id=>lsSame(id,'m:GND_R')||lsSame(id,'m:GND_L');
  const lsV33=id=>lsSame(id,'m:3V3');
  const lsRail=k=>['near','far'].some(sd=>k==='vcc'?lsV33(`r:${sd}:vcc:0`):lsGnd(`r:${sd}:gnd:0`));
  const lsParts=t=>S.parts.filter(P=>P.type===t);
  const lsLeg=(P,nm)=>`p:${P.uid}:${nm}`;
  const lsGpio=id=>{for(const x of lsMem(id)){if(x.startsWith('m:')){const p=PIN_BY[x.slice(2)];if(p&&p.gpio!==null)return p.gpio;}}return null;};
  const lsOn=t=>lsParts(t).some(P=>P.snapped);
  // dari mana LED dapat listrik: langsung dari pin/3V3, atau lewat resistor
  function lsFeed(P){const A=lsLeg(P,'A');let g=lsGpio(A);if(g!==null)return {g,res:false};if(lsV33(A))return {v:1,res:false};
    for(const R of lsParts('res'))for(const [x,y] of [['1','2'],['2','1']])if(lsSame(lsLeg(R,x),A)){const o=lsLeg(R,y);g=lsGpio(o);if(g!==null)return {g,res:true};if(lsV33(o))return {v:1,res:true};}
    return null;}
  const lsCode=re=>re.test(ed.value.replace(/\/\/.*$/gm,'').replace(/\/\*[\s\S]*?\*\//g,''));
  const lsLit=()=>lsParts('led').filter(P=>!P.props.burnt&&(P.cur.I||0)>.001);
  const RAILS=[['m:3V3','r:near:vcc:0',RED],['m:GND_R','r:near:gnd:1',K]];
  const LED_BB=[{type:'res',hole:[4,2]},{type:'led',hole:[8,3]}];
  const exOf=k=>EXAMPLES.find(x=>x[0]===k)[2]();
  const C_EMPTY=exOf('kosong').code;
  const LESSONS=[
   {id:'power',t:_L('Listrik dari ESP32 ke breadboard','Power from the ESP32 to the breadboard'),
    goal:_L('ESP32 memberi listrik 3.3 V lewat pin 3V3. Breadboard punya jalur + (garis merah) dan jalur − (garis biru) di pinggir yang tersambung sepanjang papan. Hampir semua rangkaian dimulai dengan membawa 3V3 dan GND ke jalur ini.',
            'The ESP32 supplies 3.3 V on its 3V3 pin. The breadboard has a + rail (red line) and a − rail (blue line) along each edge, connected along the whole board. Almost every circuit starts by bringing 3V3 and GND to these rails.'),
    rule:_L('Jangan pernah menyambung 3V3 langsung ke GND. Itu korsleting.','Never connect 3V3 straight to GND. That is a short circuit.'),
    steps:[
     {t:_L('Klik pin 3V3 di ESP32, lalu klik satu lubang di jalur + (garis merah).','Click the 3V3 pin on the ESP32, then click a hole on the + rail (red line).'),ok:()=>lsRail('vcc')},
     {t:_L('Klik pin GND, lalu klik satu lubang di jalur − (garis biru).','Click a GND pin, then click a hole on the − rail (blue line).'),ok:()=>lsRail('gnd')},
     {t:_L('Pastikan tab Pemeriksa tidak menunjukkan korsleting.','Make sure the Checker tab shows no short circuit.'),ok:()=>lsRail('vcc')&&lsRail('gnd')&&!(S.probs||[]).some(x=>x.lvl==='err')}],
    hint:_L('Arahkan kursor ke lubang jalur +. Multimeter akan menunjukkan 3.30 V kalau kabelnya benar. Kabel yang salah bisa diklik lalu dihapus dengan tombol Delete.','Hover over a + rail hole. The multimeter shows 3.30 V when the wire is right. Click a wrong wire and press Delete to remove it.'),
    start:()=>ex([],[],C_EMPTY),answer:()=>ex([],RAILS,C_EMPTY)},
   {id:'led',t:_L('LED pertama, tanpa kode','Your first LED, no code'),
    goal:_L('LED hanya menyala ke satu arah: kaki panjang (anoda) ke arah +, kaki pendek (katoda) ke arah −. Resistor membatasi arus supaya LED tidak rusak.',
            'An LED only lights one way round: the long leg (anode) towards +, the short leg (cathode) towards −. A resistor limits the current so the LED is not damaged.'),
    rule:_L('LED selalu butuh resistor. Untuk 3.3 V pakai 220–330 Ω.','An LED always needs a resistor. At 3.3 V use 220–330 Ω.'),
    steps:[
     {t:_L('Tambahkan Resistor dan LED dari rak di atas, lalu drag ke breadboard.','Add a Resistor and an LED from the shelf above, then drag them onto the breadboard.'),ok:()=>lsOn('res')&&lsOn('led')},
     {t:_L('Sambungkan: jalur + → resistor → kaki panjang LED. Kaki pendek LED → jalur −.','Wire it: + rail → resistor → LED long leg. LED short leg → − rail.'),ok:()=>lsLit().length>0},
     {t:_L('LED menyala dengan arus aman (di bawah 20 mA), lewat resistor.','The LED lights with a safe current (under 20 mA), through the resistor.'),ok:()=>lsLit().some(P=>P.cur.I<.02&&(lsFeed(P)||{}).res)}],
    hint:_L('Lima lubang dalam satu kolom (a–e atau f–j) saling tersambung. Taruh kaki resistor dan kaki panjang LED di kolom yang sama. Kalau LED rusak, klik LED-nya lalu tekan "Ganti LED baru".','The five holes in one column (a–e or f–j) are connected. Put a resistor leg and the LED long leg in the same column. If the LED burns out, click it and press "Replace with a new LED".'),
    start:()=>ex([],RAILS,C_EMPTY),answer:()=>ex(LED_BB,[...RAILS,['r:near:vcc:4','h:4:4',RED],['h:9:5','r:near:gnd:9',K]],C_EMPTY)},
   {id:'blink',t:_L('Kedipkan LED dengan kode','Blink the LED with code'),
    goal:_L('Supaya bisa diatur program, LED diberi listrik dari pin GPIO, bukan dari jalur +. digitalWrite(pin, HIGH) membuat pin bertegangan 3.3 V, LOW membuatnya 0 V.',
            'To control the LED from code, power it from a GPIO pin instead of the + rail. digitalWrite(pin, HIGH) puts 3.3 V on the pin, LOW puts 0 V.'),
    rule:_L('Satu pin GPIO aman sampai sekitar 20 mA. GPIO 34, 35, 36 (VP), dan 39 (VN) hanya bisa input.','One GPIO pin is safe up to about 20 mA. GPIO 34, 35, 36 (VP) and 39 (VN) are input only.'),
    steps:[
     {t:_L('Pindahkan kabel resistor dari jalur + ke pin D23. Klik kabelnya, tekan Delete, lalu pasang kabel baru.','Move the resistor wire from the + rail to pin D23. Click the wire, press Delete, then add a new wire.'),ok:()=>lsParts('led').some(P=>{const f=lsFeed(P);return f&&f.g!=null&&f.res;})},
     {t:_L('Di setup(), tulis pinMode(23, OUTPUT);','In setup(), write pinMode(23, OUTPUT);'),ok:()=>lsCode(/pinMode\s*\(\s*\w+\s*,\s*OUTPUT\s*\)/)},
     {t:_L('Di loop(), nyalakan dan matikan LED dengan digitalWrite dan delay.','In loop(), switch the LED on and off with digitalWrite and delay.'),ok:()=>lsCode(/digitalWrite\s*\(/)&&lsCode(/delay\s*\(/)},
     {t:_L('Tekan Jalankan. LED berkedip.','Press Run. The LED blinks.'),ok:()=>LS.f.ledOn&&LS.f.ledOff}],
    hint:_L('Nomor pin di kode adalah angka setelah huruf D: D23 berarti 23. Kalau nomornya beda dengan pin yang disambung, LED tidak menyala.','The pin number in code is the number after the D: D23 means 23. If it does not match the wired pin, the LED stays off.'),
    start:()=>ex(LED_BB,[...RAILS,['r:near:vcc:4','h:4:4',RED],['h:9:5','r:near:gnd:9',K]],_L(String.raw`// Pelajaran 3: kedipkan LED di pin D23

void setup() {
  // tulis pinMode di sini
}

void loop() {
  // nyalakan LED, tunggu, matikan LED, tunggu
}
`,String.raw`// Lesson 3: blink the LED on pin D23

void setup() {
  // write pinMode here
}

void loop() {
  // LED on, wait, LED off, wait
}
`)),answer:()=>exOf('blink')},
   {id:'button',t:_L('Membaca tombol','Reading a button'),
    goal:_L('digitalRead(pin) membaca HIGH atau LOW. Dengan INPUT_PULLUP, pin ditarik ke 3.3 V dari dalam chip, jadi tombol cukup disambung ke GND: dilepas = HIGH, ditekan = LOW.',
            'digitalRead(pin) reads HIGH or LOW. With INPUT_PULLUP the pin is pulled to 3.3 V inside the chip, so the button only needs to go to GND: released = HIGH, pressed = LOW.'),
    rule:_L('Pin input tanpa pull-up atau pull-down itu "mengambang" dan nilainya acak.','An input pin without a pull-up or pull-down is "floating" and reads random values.'),
    steps:[
     {t:_L('Pasang Tombol di tengah breadboard, menyeberangi celah tengah.','Place the Button in the middle of the breadboard, across the centre gap.'),ok:()=>lsOn('btn')},
     {t:_L('Sambungkan satu sisi tombol ke pin D4 dan sisi seberangnya ke jalur −.','Wire one side of the button to pin D4 and the opposite side to the − rail.'),ok:()=>lsParts('btn').some(P=>(lsGpio(lsLeg(P,'1a'))!==null&&lsGnd(lsLeg(P,'2a')))||(lsGpio(lsLeg(P,'2a'))!==null&&lsGnd(lsLeg(P,'1a'))))},
     {t:_L('Di kode, pakai pinMode(4, INPUT_PULLUP) dan digitalRead(4).','In code, use pinMode(4, INPUT_PULLUP) and digitalRead(4).'),ok:()=>lsCode(/INPUT_PULLUP/)&&lsCode(/digitalRead\s*\(/)},
     {t:_L('Jalankan, lalu tahan tombolnya: LED menyala saat ditekan dan mati saat dilepas.','Run it, then hold the button: the LED is on while pressed and off when released.'),ok:()=>LS.f.btnOn&&LS.f.btnOff}],
    hint:_L('Untuk menekan: klik-tahan tombol merah di 3D, atau klik tombolnya lalu pakai "Tahan untuk menekan" di tab Komponen.','To press it: click and hold the red cap in 3D, or click the button and use "Hold to press" in the Part tab.'),
    start:()=>{const k=LEDKIT('D23');return ex([...k.parts,{type:'btn',hole:[16,-1]}],[...k.wires,['m:GND_R','r:near:gnd:1',K]],_L(String.raw`// Pelajaran 4: LED menyala saat tombol ditekan
const int BUTTON_PIN = 4;
const int LED_PIN = 23;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  // atur BUTTON_PIN sebagai INPUT_PULLUP
}

void loop() {
  // baca tombol dengan digitalRead
  // ditekan = LOW: LED nyala. Dilepas = HIGH: LED mati
}
`,String.raw`// Lesson 4: LED on while the button is pressed
const int BUTTON_PIN = 4;
const int LED_PIN = 23;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  // set BUTTON_PIN as INPUT_PULLUP
}

void loop() {
  // read the button with digitalRead
  // pressed = LOW: LED on. Released = HIGH: LED off
}
`));},answer:()=>exOf('button')},
   {id:'pot',t:_L('Membaca nilai analog','Reading an analog value'),
    goal:_L('analogRead(pin) mengubah tegangan 0–3.3 V menjadi angka 0–4095 (ADC 12-bit). Potensiometer adalah pembagi tegangan: kedua kaki pinggir ke 3V3 dan GND, kaki tengah (wiper) ke pin ADC.',
            'analogRead(pin) turns 0–3.3 V into a number from 0 to 4095 (12-bit ADC). A potentiometer is a voltage divider: the outer legs go to 3V3 and GND, the middle leg (wiper) goes to an ADC pin.'),
    rule:_L('Pakai pin ADC1 (D32–D35, VP, VN). Pin ADC2 tidak bisa dibaca selama WiFi aktif.','Use ADC1 pins (D32–D35, VP, VN). ADC2 pins cannot be read while WiFi is on.'),
    steps:[
     {t:_L('Pasang Potensiometer di breadboard.','Place the Potentiometer on the breadboard.'),ok:()=>lsOn('pot')},
     {t:_L('Kaki pinggir satu ke jalur +, kaki pinggir lainnya ke jalur −.','One outer leg to the + rail, the other outer leg to the − rail.'),ok:()=>lsParts('pot').some(P=>(lsV33(lsLeg(P,'1'))&&lsGnd(lsLeg(P,'2')))||(lsV33(lsLeg(P,'2'))&&lsGnd(lsLeg(P,'1'))))},
     {t:_L('Kaki tengah (W) ke pin D34.','Middle leg (W) to pin D34.'),ok:()=>lsParts('pot').some(P=>[32,33,34,35,36,39].includes(lsGpio(lsLeg(P,'W'))))},
     {t:_L('Tulis kode yang mencetak analogRead(34) ke Serial Monitor.','Write code that prints analogRead(34) to the Serial Monitor.'),ok:()=>lsCode(/analogRead\s*\(/)&&lsCode(/Serial\.print/)},
     {t:_L('Jalankan, lalu putar potensiometer dari kecil ke besar. Angkanya ikut berubah.','Run it, then turn the potentiometer from low to high. The number follows.'),ok:()=>LS.f.printed&&(LS.f.potMax-LS.f.potMin)>=50}],
    hint:_L('Klik potensiometernya, lalu geser slider "Putar" di tab Komponen.','Click the potentiometer, then move the "Turn" slider in the Part tab.'),
    start:()=>ex([{type:'pot',hole:[20,3]}],RAILS,_L(String.raw`// Pelajaran 5: baca potensiometer
const int POT_PIN = 34;

void setup() {
  Serial.begin(115200);
}

void loop() {
  // baca nilai dengan analogRead, lalu cetak dengan Serial.println
  delay(200);
}
`,String.raw`// Lesson 5: read a potentiometer
const int POT_PIN = 34;

void setup() {
  Serial.begin(115200);
}

void loop() {
  // read the value with analogRead, then print it with Serial.println
  delay(200);
}
`)),answer:()=>ex([{type:'pot',hole:[20,3]}],[...RAILS,['h:20:5','r:near:vcc:20',RED],['h:22:5','r:near:gnd:22',K],['h:21:5','m:D34',GRN]],_L(String.raw`// Pelajaran 5: baca potensiometer
const int POT_PIN = 34;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int nilai = analogRead(POT_PIN);   // 0 - 4095
  float volt = nilai * 3.3 / 4095;
  Serial.print("nilai = ");
  Serial.print(nilai);
  Serial.print("  tegangan = ");
  Serial.println(volt);
  delay(200);
}
`,String.raw`// Lesson 5: read a potentiometer
const int POT_PIN = 34;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int value = analogRead(POT_PIN);   // 0 - 4095
  float volts = value * 3.3 / 4095;
  Serial.print("value = ");
  Serial.print(value);
  Serial.print("  voltage = ");
  Serial.println(volts);
  delay(200);
}
`))},
   {id:'pwm',t:_L('Mengatur terang LED (PWM)','Dimming an LED (PWM)'),
    goal:_L('PWM menyalakan dan mematikan pin ribuan kali per detik. Makin lama bagian nyalanya (duty), makin terang LED. Di paket board esp32 versi 3.x: ledcAttach(pin, frekuensi, resolusi), lalu ledcWrite(pin, 0–255).',
            'PWM switches a pin on and off thousands of times a second. The longer the on part (duty), the brighter the LED. With esp32 board package 3.x: ledcAttach(pin, frequency, resolution), then ledcWrite(pin, 0–255).'),
    rule:_L('map(nilai, 0, 4095, 0, 255) mengubah rentang ADC ke rentang PWM 8-bit.','map(value, 0, 4095, 0, 255) converts the ADC range to the 8-bit PWM range.'),
    steps:[
     {t:_L('Tambahkan LED + resistor, lalu sambungkan ke pin D18 (dan kaki pendek LED ke jalur −).','Add an LED + resistor and wire it to pin D18 (LED short leg to the − rail).'),ok:()=>lsParts('led').some(P=>{const f=lsFeed(P);return f&&f.g!=null&&f.res&&lsGnd(lsLeg(P,'K'));})},
     {t:_L('Di setup(), tulis ledcAttach(18, 5000, 8);','In setup(), write ledcAttach(18, 5000, 8);'),ok:()=>lsCode(/ledcAttach\s*\(|analogWrite\s*\(/)},
     {t:_L('Di loop(), atur terang dengan ledcWrite memakai nilai potensiometer.','In loop(), set the brightness with ledcWrite using the potentiometer value.'),ok:()=>lsCode(/ledcWrite\s*\(|analogWrite\s*\(/)},
     {t:_L('Jalankan. Buat LED redup, lalu terang penuh.','Run it. Make the LED dim, then fully bright.'),ok:()=>LS.f.dim&&LS.f.bright}],
    hint:_L('Arus LED ikut duty: pada 50% arus rata-ratanya kira-kira setengah arus penuh. Lihat angka "Arus sekarang" di tab Komponen saat LED diklik.','LED current follows the duty: at 50% the average is about half the full current. Click the LED and watch "Current now" in the Part tab.'),
    start:()=>{const d=LESSONS[4].answer();return d;},answer:()=>exOf('pot')},
   {id:'dht',t:_L('Sensor suhu DHT11','DHT11 temperature sensor'),
    goal:_L('Banyak sensor punya tiga kaki: VCC, GND, dan DATA. Library DHT membaca suhu dan kelembapan lewat satu pin digital.',
            'Many sensors have three legs: VCC, GND and DATA. The DHT library reads temperature and humidity over one digital pin.'),
    rule:_L('Sensor harus memakai GND yang sama dengan ESP32, kalau tidak datanya tidak terbaca.','A sensor must share GND with the ESP32, otherwise its data cannot be read.'),
    steps:[
     {t:_L('Pasang DHT11 di breadboard.','Place the DHT11 on the breadboard.'),ok:()=>lsOn('dht')},
     {t:_L('VCC ke jalur +, GND ke jalur −.','VCC to the + rail, GND to the − rail.'),ok:()=>lsParts('dht').some(P=>P.pw)},
     {t:_L('DATA ke pin D4.','DATA to pin D4.'),ok:()=>lsParts('dht').some(P=>lsGpio(lsLeg(P,'DATA'))!==null)},
     {t:_L('Jalankan, lalu ubah Suhu di tab Komponen. Angka di Serial Monitor ikut berubah.','Run it, then change the Temperature in the Part tab. The Serial Monitor follows.'),ok:()=>LS.f.printed&&(LS.f.tMax-LS.f.tMin)>=2}],
    hint:_L('Urutan kaki DHT11 di simulator dari kiri: DATA, VCC, GND. Arahkan kursor ke kakinya untuk melihat namanya.','The DHT11 legs from the left are DATA, VCC, GND. Hover over a leg to see its name.'),
    start:()=>{const d=exOf('dht');return ex([{type:'dht',hole:[12,3]}],RAILS,d.code);},answer:()=>exOf('dht')},
   {id:'motor',t:_L('Motor DC dengan driver L298N','DC motor with an L298N driver'),
    goal:_L('Motor butuh arus ratusan mA, jauh di atas batas pin ESP32. Pin ESP32 hanya memberi perintah ke driver L298N. Tenaganya datang dari baterai.',
            'A motor needs hundreds of mA, far beyond what an ESP32 pin can give. The ESP32 pins only send commands to the L298N driver. The power comes from the battery.'),
    rule:_L('GND baterai, GND driver, dan GND ESP32 harus disatukan.','Battery GND, driver GND and ESP32 GND must all be connected.'),
    steps:[
     {t:_L('Baterai + ke terminal 12V driver, baterai − ke GND driver.','Battery + to the driver 12V terminal, battery − to driver GND.'),ok:()=>lsParts('l298').some(P=>(P.v12||0)>=5)},
     {t:_L('Satukan GND ESP32 dengan GND driver.','Join the ESP32 GND with the driver GND.'),ok:()=>lsParts('l298').some(P=>lsGnd(lsLeg(P,'GND')))},
     {t:_L('OUT1 dan OUT2 ke kedua kaki motor.','OUT1 and OUT2 to the two motor terminals.'),ok:()=>lsParts('motor').some(M=>lsParts('l298').some(P=>{const a=lsLeg(P,'OUT1'),b=lsLeg(P,'OUT2'),m1=lsLeg(M,'M1'),m2=lsLeg(M,'M2');return (lsSame(a,m1)&&lsSame(b,m2))||(lsSame(a,m2)&&lsSame(b,m1));}))},
     {t:_L('IN1, IN2, dan ENA ke pin D27, D26, dan D14.','IN1, IN2 and ENA to pins D27, D26 and D14.'),ok:()=>lsParts('l298').some(P=>lsGpio(lsLeg(P,'IN1'))!==null&&lsGpio(lsLeg(P,'IN2'))!==null&&(P.props.jumperA||lsGpio(lsLeg(P,'ENA'))!==null))},
     {t:_L('Jalankan. Motor berputar maju, lalu mundur.','Run it. The motor turns forward, then backward.'),ok:()=>LS.f.fwd&&LS.f.rev}],
    hint:_L('IN1 HIGH + IN2 LOW = maju, IN1 LOW + IN2 HIGH = mundur. ENA mengatur kecepatan dengan PWM.','IN1 HIGH + IN2 LOW = forward, IN1 LOW + IN2 HIGH = backward. ENA sets the speed with PWM.'),
    start:()=>{const d=exOf('motor');return ex(d.parts,[],d.code);},answer:()=>exOf('motor')},
   {id:'car',t:_L('Mobil robot 2 roda','Two-wheel robot car'),
    goal:_L('Satu L298N bisa mengendalikan dua motor: motor kiri lewat IN1, IN2, ENA, motor kanan lewat IN3, IN4, ENB. Kalau kedua roda maju, mobil lurus. Kalau satu maju dan satu mundur, mobil berputar di tempat.',
            'One L298N drives two motors: the left one through IN1, IN2, ENA and the right one through IN3, IN4, ENB. Both wheels forward drives straight. One forward and one backward spins the car on the spot.'),
    rule:_L('Kalau mobil berbelok ke arah yang salah, tukar dua kabel di terminal motor itu. Tidak perlu ubah kode.','If the car turns the wrong way, swap the two wires on that motor terminal. No code change needed.'),
    steps:[
     {t:_L('Tambahkan Motor DC kedua dari rak.','Add a second DC motor from the shelf.'),ok:()=>lsParts('motor').length>=2},
     {t:_L('Sambungkan motor kedua ke OUT3 dan OUT4 di L298N.','Wire the second motor to OUT3 and OUT4 on the L298N.'),ok:()=>{const ms=lsParts('motor');return ms.length>=2&&lsParts('l298').some(P=>ms.some(M=>{const a=lsLeg(P,'OUT3'),b=lsLeg(P,'OUT4'),m1=lsLeg(M,'M1'),m2=lsLeg(M,'M2');return (lsSame(a,m1)&&lsSame(b,m2))||(lsSame(a,m2)&&lsSame(b,m1));}));}},
     {t:_L('IN3, IN4, dan ENB ke pin D25, D33, dan D32.','IN3, IN4 and ENB to pins D25, D33 and D32.'),ok:()=>lsParts('l298').some(P=>lsGpio(lsLeg(P,'IN3'))!==null&&lsGpio(lsLeg(P,'IN4'))!==null&&(P.props.jumperB||lsGpio(lsLeg(P,'ENB'))!==null))},
     {t:_L('Jalankan, lalu pakai remote di pojok layar 3D (atau tombol W A S D): buat mobil maju lurus.','Run it, then use the remote in the corner of the 3D view (or the W A S D keys): drive straight ahead.'),ok:()=>LS.f.both},
     {t:_L('Sekarang belokkan mobilnya.','Now turn the car.'),ok:()=>LS.f.turn}],
    hint:_L('Peta jalan muncul otomatis begitu ada dua motor. Motor 1 adalah roda kiri, Motor 2 roda kanan.','The track view appears as soon as there are two motors. Motor 1 is the left wheel, Motor 2 the right wheel.'),
    start:()=>{const d=exOf('motor');const c=exOf('mobil');return ex([...d.parts,{type:'motor',at:[7.4,-6.9]}],d.wires,c.code);},answer:()=>exOf('mobil')}
  ];
  const LS={i:0,done:{},f:{},armed:null,hint:false,last:'',wasRun:false};
  {const sv=store('esp32sim-lessons');if(sv){LS.i=Math.min(LESSONS.length-1,Math.max(0,sv.i|0));LS.done=sv.done||{};}}
  const lsSave=()=>store('esp32sim-lessons',{i:LS.i,done:LS.done});
  const lsEl=$('#insLearn');
  const strip=document.createElement('button');strip.type='button';strip.className='ls-strip';$('#stage-sim').appendChild(strip);
  let stripOff=false;
  function paintStrip(oks){const L=LESSONS[LS.i];const k=oks.indexOf(false);strip.hidden=stripOff;strip.classList.toggle('ok',k<0);
    strip.innerHTML=`<b>${_L('Pelajaran','Lesson')} ${LS.i+1}/${LESSONS.length} · ${k<0?'✓':`${_L('langkah','step')} ${k+1}/${oks.length}`}</b><span>${esc(k<0?(LS.viaAnswer?_L('Ini rakitan jawaban. Coba rakit sendiri dari titik awal.','This is the answer build. Try building it yourself from the starting point.'):_L('Selesai! Buka tab Belajar untuk lanjut.','Done! Open the Learn tab to continue.')):L.steps[k].t)}</span><span class="x" data-x="1" title="${_L('Sembunyikan','Hide')}" aria-label="${_L('Sembunyikan','Hide')}">×</span>`;}
  strip.addEventListener('click',e=>{if(e.target.closest('[data-x]')){stripOff=true;strip.hidden=true;return;}
    const t=document.querySelector('#insTabs [data-ins="learn"]');if(t)t.click();document.querySelector('.panel').scrollIntoView({behavior:'smooth',block:'nearest'});});
  function renderLessons(){
    const L=LESSONS[LS.i];const n=Object.keys(LS.done).filter(k=>LESSONS.some(x=>x.id===k)).length;
    lsEl.innerHTML=`<div class="ls-top"><select class="sel" id="lsSel" aria-label="${_L('Pilih pelajaran','Choose a lesson')}">${LESSONS.map((x,i)=>`<option value="${i}"${i===LS.i?' selected':''}>${LS.done[x.id]?'✓ ':''}${i+1}. ${esc(x.t)}</option>`).join('')}</select><span class="ls-prog">${n}/${LESSONS.length} ${_L('selesai','done')}</span></div>
      <p class="ls-goal">${esc(L.goal)}</p>
      <p class="note">${esc(L.rule)}</p>
      <ol class="ls-steps">${L.steps.map((s,i)=>`<li data-step="${i}"><span class="ls-ck" aria-hidden="true"></span><span>${esc(s.t)}</span></li>`).join('')}</ol>
      <p class="ls-done" hidden>✓ ${_L('Pelajaran selesai!','Lesson complete!')} ${LS.i<LESSONS.length-1?_L('Lanjut ke pelajaran berikutnya.','Go on to the next lesson.'):_L('Kamu sudah menyelesaikan semua pelajaran.','You have finished every lesson.')}</p>
      <div class="ls-btns"><button class="xbtn" type="button" data-ls="start">${_L('Mulai dari titik awal','Load the starting point')}</button><button class="xbtn" type="button" data-ls="hint" aria-expanded="${LS.hint}">${_L('Petunjuk','Hint')}</button><button class="xbtn" type="button" data-ls="answer">${_L('Lihat jawaban','Show answer')}</button>${LS.i<LESSONS.length-1?`<button class="btn sm accent" type="button" data-ls="next">${_L('Berikutnya','Next')} →</button>`:''}</div>
      <p class="ls-hint" ${LS.hint?'':'hidden'}>${esc(L.hint)}</p>`;
    LS.last='';LS.armed=null;lessonTick();
  }
  function lessonTick(){
    const L=LESSONS[LS.i];if(!L||!lsEl.firstChild)return;
    const oks=L.steps.map(s=>{try{return !!s.ok();}catch(e){return false;}});
    const key=oks.join();if(key===LS.last)return;LS.last=key;
    lsEl.querySelectorAll('[data-step]').forEach((li,i)=>{li.classList.toggle('ok',oks[i]);});paintStrip(oks);
    const all=oks.every(Boolean);const d=lsEl.querySelector('.ls-done');if(d)d.hidden=!all;
    if(d&&all)d.textContent=LS.viaAnswer?String(_L('Ini rakitan jawabannya. Coba rakit sendiri dari titik awal supaya pelajaran ini tercatat selesai.','This is the answer build. Build it yourself from the starting point to mark the lesson complete.')):`✓ ${_L('Pelajaran selesai!','Lesson complete!')} ${LS.i<LESSONS.length-1?_L('Lanjut ke pelajaran berikutnya.','Go on to the next lesson.'):_L('Kamu sudah menyelesaikan semua pelajaran.','You have finished every lesson.')}`;
    if(d)d.classList.toggle('ans',!!LS.viaAnswer);
    if(all&&!LS.viaAnswer&&!LS.done[L.id]){LS.done[L.id]=true;lsSave();
      const o=lsEl.querySelector(`#lsSel option[value="${LS.i}"]`);if(o)o.textContent=`✓ ${LS.i+1}. ${L.t}`;
      const pr=lsEl.querySelector('.ls-prog');if(pr)pr.textContent=`${Object.keys(LS.done).length}/${LESSONS.length} ${_L('selesai','done')}`;}
  }
  function lessonFrame(){
    if(RT.running&&!LS.wasRun)LS.f={};LS.wasRun=RT.running;if(!RT.running)return;const f=LS.f;
    const pressed=lsParts('btn').some(B=>B.pressed);
    for(const P of lsParts('led')){if(P.props.burnt)continue;const I=P.cur.I||0;
      if(I>.001)f.ledOn=true;if(f.ledOn&&I<.0003)f.ledOff=true;if(I>.0003&&I<.0035)f.dim=true;if(I>.0045)f.bright=true;
      if(pressed&&I>.001)f.btnOn=true;if(!pressed&&f.btnOn&&I<.0003)f.btnOff=true;}
    for(const P of lsParts('pot')){f.potMin=Math.min(f.potMin??1e9,P.props.pos);f.potMax=Math.max(f.potMax??-1e9,P.props.pos);}
    for(const P of lsParts('dht')){f.tMin=Math.min(f.tMin??1e9,P.props.t);f.tMax=Math.max(f.tMax??-1e9,P.props.t);}
    for(const P of lsParts('motor')){if((P.vm||0)>2)f.fwd=true;if((P.vm||0)<-2)f.rev=true;}
    {const ms=lsParts('motor');if(ms.length>=2){const a=ms[0].vm||0,b=ms[1].vm||0;if(Math.abs(a)>2&&Math.abs(b)>2&&Math.sign(a)===Math.sign(b))f.both=true;if((Math.abs(a)>2||Math.abs(b)>2)&&Math.sign(a)!==Math.sign(b))f.turn=true;}}
    if(RT.out&&/\d/.test(RT.out))f.printed=true;
  }
  function lessonLoad(d,ans){stripOff=false;LS.viaAnswer=!!ans;stop(true);loadDesign(d,true);S.exKey=null;save();serialEl.innerHTML='';openLine=null;LS.f={};LS.last='';lessonTick();}
  lsEl.addEventListener('change',e=>{if(e.target.id==='lsSel'){stripOff=false;LS.viaAnswer=false;LS.i=+e.target.value;LS.hint=false;lsSave();renderLessons();}});
  lsEl.addEventListener('click',e=>{const b=e.target.closest('[data-ls]');if(!b)return;const k=b.dataset.ls;const L=LESSONS[LS.i];
    if(k==='hint'){LS.hint=!LS.hint;b.setAttribute('aria-expanded',LS.hint);lsEl.querySelector('.ls-hint').hidden=!LS.hint;return;}
    if(k==='next'){stripOff=false;LS.viaAnswer=false;LS.i=Math.min(LESSONS.length-1,LS.i+1);LS.hint=false;lsSave();renderLessons();lsEl.scrollTop=0;return;}
    if(k==='start'||k==='answer'){
      if(LS.armed!==k&&S.parts.length+S.wires.length>0){LS.armed=k;const old=b.textContent;b.textContent=String(_L('Rakitan sekarang diganti. Klik lagi','This replaces your build. Click again'));b.classList.add('arm');
        setTimeout(()=>{if(b.isConnected&&LS.armed===k){LS.armed=null;b.textContent=old;b.classList.remove('arm');}},3500);return;}
      LS.armed=null;lessonLoad(k==='start'?L.start():L.answer(),k==='answer');renderLessons();}
  });
  renderLessons();

  /* ---- tampilan 2D (dari atas) / 3D ---- */
  const VIEW3D={cam:[-.5,11.5,9.2],tgt:[-.5,0,-.3],w:14.2};
  let view2d=false;
  function setView2D(on,quiet){
    view2d=!!on;const c=v.controls;
    if(view2d){v.camera.fov=20;c.enableRotate=false;c.maxDistance=120;c.mouseButtons.LEFT=THREE.MOUSE.PAN;c.touches.ONE=THREE.TOUCH.PAN;v.camera.updateProjectionMatrix();if(v.camera.aspect<1)v.setView([-.4,40,.01],[-.4,0,-.4],16);else v.setView([1.4,40,.01],[1.4,0,-.9],18.5);}
    else{v.camera.fov=36;c.enableRotate=true;c.maxDistance=45;c.mouseButtons.LEFT=THREE.MOUSE.ROTATE;c.touches.ONE=THREE.TOUCH.ROTATE;v.camera.updateProjectionMatrix();v.setView(VIEW3D.cam,VIEW3D.tgt,VIEW3D.w);}
    $$('#viewSeg [data-view]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.view==='2d')===view2d)));
    $('#stage-sim').classList.toggle('flat',view2d);
    if(!quiet)store('esp32sim-view',view2d?'2d':'3d');
  }
  $('#viewSeg').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)setView2D(b.dataset.view==='2d');});
  {const sv=store('esp32sim-view');const small=Math.min(innerWidth,screen.width||innerWidth)<700||matchMedia('(pointer:coarse)').matches;if(sv==='2d'||(!sv&&small))setView2D(true,true);}

  /* ---- mobil robot: peta jalan + remote ---- */
  const hud=document.createElement('div');hud.className='car-hud';hud.hidden=true;
  hud.innerHTML=`<div class="car-h"><b data-t="title"></b><button type="button" class="car-x" data-car="close">×</button></div>
    <canvas width="360" height="220"></canvas>
    <div class="pad" role="group"><button type="button" data-k="w" class="u">▲</button><button type="button" data-k="a" class="l">◀</button><button type="button" data-k="x" class="c">■</button><button type="button" data-k="d" class="r">▶</button><button type="button" data-k="s" class="dn">▼</button></div>
    <p class="car-n" data-t="note"></p>`;
  $('#stage-sim').appendChild(hud);
  const cv=hud.querySelector('canvas'),cx=cv.getContext('2d');
  const car={x:180,y:140,a:-Math.PI/2,trail:[],t:0};
  let hudOff=false,lastN=0,flash=0;
  function hudText(){
    hud.querySelector('[data-t="title"]').textContent=String(_L('Mobil robot · peta jalan','Robot car · track view'));
    hud.querySelector('[data-car="close"]').setAttribute('aria-label',String(_L('Tutup','Close')));
    hud.querySelector('.pad').setAttribute('aria-label',String(_L('Remote: kirim w a s d x ke Serial','Remote: sends w a s d x to Serial')));
    const lab={w:_L('Maju (W)','Forward (W)'),a:_L('Kiri (A)','Left (A)'),x:_L('Berhenti (X)','Stop (X)'),d:_L('Kanan (D)','Right (D)'),s:_L('Mundur (S)','Back (S)')};
    hud.querySelectorAll('[data-k]').forEach(b=>{b.title=String(lab[b.dataset.k]);b.setAttribute('aria-label',String(lab[b.dataset.k]));});
    hud.querySelector('[data-t="note"]').textContent=String(flash>0?_L('Tekan Jalankan dulu.','Press Run first.'):_L('Motor 1 = roda kiri, Motor 2 = roda kanan. Klik peta untuk reset.','Motor 1 = left wheel, Motor 2 = right wheel. Click the map to reset.'));
  }
  hudText();
  function sendKey(k){
    if(!RT.running){flash=2;hudText();hud.classList.add('warn');return;}
    RT.inBuf.push(k.charCodeAt(0));serialLine('» '+k,'in');
    const b=hud.querySelector(`[data-k="${k}"]`);if(b){b.classList.add('on');setTimeout(()=>b.classList.remove('on'),160);}
  }
  hud.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(b){sendKey(b.dataset.k);return;}
    if(e.target.closest('[data-car="close"]')){hudOff=true;hud.hidden=true;$('#stage-sim').classList.remove('has-car');return;}
    if(e.target===cv){car.x=180;car.y=140;car.a=-Math.PI/2;car.trail=[];}});
  window.addEventListener('keydown',e=>{if(hud.hidden||e.ctrlKey||e.metaKey||e.altKey)return;if(e.target.closest&&e.target.closest('input,textarea,select'))return;
    const k={w:'w',a:'a',s:'s',d:'d',x:'x',ArrowUp:'w',ArrowLeft:'a',ArrowDown:'s',ArrowRight:'d',' ':'x'}[e.key.length===1?e.key.toLowerCase():e.key];
    if(k){e.preventDefault();sendKey(k);}});
  function drawCar(){
    const W=cv.width,H=cv.height,css=getComputedStyle(document.documentElement);
    const bg=css.getPropertyValue('--surface-2').trim()||'#eef2f4',ln=css.getPropertyValue('--line').trim()||'#cfd8dc',ac=css.getPropertyValue('--accent').trim()||'#b15f19',fg=css.getPropertyValue('--fg').trim()||'#222';
    cx.fillStyle=bg;cx.fillRect(0,0,W,H);
    cx.strokeStyle=ln;cx.lineWidth=1;for(let x=0;x<=W;x+=30){cx.beginPath();cx.moveTo(x+.5,0);cx.lineTo(x+.5,H);cx.stroke();}for(let y=0;y<=H;y+=30){cx.beginPath();cx.moveTo(0,y+.5);cx.lineTo(W,y+.5);cx.stroke();}
    if(car.trail.length>1){cx.strokeStyle=ac;cx.globalAlpha=.45;cx.lineWidth=3;cx.beginPath();car.trail.forEach((p,i)=>{if(i&&Math.hypot(p[0]-car.trail[i-1][0],p[1]-car.trail[i-1][1])>40)cx.moveTo(p[0],p[1]);else if(i)cx.lineTo(p[0],p[1]);else cx.moveTo(p[0],p[1]);});cx.stroke();cx.globalAlpha=1;}
    cx.save();cx.translate(car.x,car.y);cx.rotate(car.a+Math.PI/2);
    cx.fillStyle=fg;cx.fillRect(-25,-12,9,24);cx.fillRect(16,-12,9,24);
    cx.fillStyle=ac;cx.beginPath();cx.roundRect?cx.roundRect(-16,-24,32,44,7):cx.rect(-16,-24,32,44);cx.fill();
    cx.fillStyle='#fff';cx.beginPath();cx.moveTo(0,-20);cx.lineTo(7,-9);cx.lineTo(-7,-9);cx.closePath();cx.fill();
    cx.restore();
  }
  function extrasFrame(dt){
    const ms=S.parts.filter(P=>P.type==='motor');
    if(ms.length>=2&&lastN<2)hudOff=false;lastN=ms.length;
    const show=ms.length>=2&&!hudOff;if(hud.hidden===show){hud.hidden=!show;$('#stage-sim').classList.toggle('has-car',show);}
    const fg=v.scene.fog;if(fg){fg.near=view2d?400:20;fg.far=view2d?800:46;}
    if(flash>0){flash-=dt;if(flash<=0){hud.classList.remove('warn');hudText();}}
    if(!show)return;
    const wl=ms[0].w||0,wr=ms[1].w||0;
    const sp=(wl+wr)/2*5.5,om=(wr-wl)*.09;
    car.a-=om*dt;car.x+=Math.cos(car.a)*sp*dt;car.y+=Math.sin(car.a)*sp*dt;
    const W=cv.width,H=cv.height;let wrap=false;
    if(car.x<-20){car.x+=W+40;wrap=true;}if(car.x>W+20){car.x-=W+40;wrap=true;}if(car.y<-20){car.y+=H+40;wrap=true;}if(car.y>H+20){car.y-=H+40;wrap=true;}
    if(wrap)car.trail=[];
    car.t+=dt;if(Math.abs(sp)>1&&car.t>.08){car.t=0;car.trail.push([car.x,car.y]);if(car.trail.length>160)car.trail.shift();}
    drawCar();
  }
  onLang(hudText);

  /* ---- dibuka dari halaman materi: muat rangkaian contoh + kode project ---- */
  window.__simOpen=(key,code)=>{const x=EXAMPLES.find(q=>q[0]===key);if(!x)return false;
    stop(true);loadDesign(x[2](),true);S.exKey=x[0];
    if(code){ed.value=String(code);S.codeSrc=null;S.exKey=null;clearCodeErr();paintEditor();}
    save();serialEl.innerHTML='';openLine=null;serialLine(String(_L(`[rangkaian ${x[1]} dimuat bersama kode project. Tekan Jalankan.]`,`[circuit ${x[1]} loaded with the project code. Press Run.]`)),'sim');
    try{const t=document.querySelector('#insTabs [data-ins="sel"]');if(t)t.click();}catch(e){}
    return true;};

  // mulai
  const saved=store('esp32sim-v1');
  if(saved&&saved.parts){try{const ex=saved.exKey&&EXAMPLES.find(x=>x[0]===saved.exKey);if(ex)saved.code=ex[2]().code;loadDesign(saved,true);S.exKey=saved.exKey||null;}catch(err){console.error(err);loadDesign(EXAMPLES[0][2](),true);S.exKey=EXAMPLES[0][0];}}
  else{loadDesign(EXAMPLES[0][2](),true);S.exKey=EXAMPLES[0][0];}
  paintEditor();setRunUI(false);
  let prevLang=LANG;
  onLang(()=>{
    renderRack();renderEx();renderWC();renderInspector();checks();setRunUI(RT.running);
    $('#runTime').textContent=(RT.t/1000).toFixed(1)+_L(' dtk',' s');
    {const c=S.codeSrc;if(c&&typeof c==='object'&&'a' in c){const old=prevLang==='en'?c.b:c.a;if(ed.value===old){ed.value=String(c);clearCodeErr();paintEditor();save();}}}
    if(typeof renderLessons==='function')renderLessons();
    prevLang=LANG;});
  window.__esp32sim={S,RT,run,stop,addWire,addPart,pointPos,v};
  return {v};
}

if(!HAS3D){document.querySelectorAll('.stage').forEach(s=>s.insertAdjacentHTML('beforeend','<div class="stage-err">'+_L('Simulator butuh WebGL, dan browser ini tidak mendukungnya.','The simulator needs WebGL, which this browser does not support.')+'</div>'));return;}
let sim=null;
try{sim=initSim();}catch(err){console.error(err);}
document.addEventListener('click',e=>{const r=e.target.closest('[data-reset]');if(r&&sim)sim.v.reset();});
requestAnimationFrame(tick);
})();
