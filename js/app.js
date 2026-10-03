/* ============ ESP32 Lab: pemuat halaman ============
   Urutan kerja:
   1. Tentukan bahasa (id/en) dari localStorage.
   2. Ambil isi halaman kedua bahasa (lang/<bahasa>/main.html) dan kode contoh (examples/<bahasa>/*.ino).
   3. Tempel bahasa aktif ke #app-root. Bahasa lainnya disimpan di __esp32lab.alt supaya js/main.js
      bisa menukar teks tanpa memuat ulang halaman.
   4. Jalankan js/main.js.
   5. Simulator (lang/<bahasa>/sim.html + css/sim.css + js/sim.js) baru dibuat dalam iframe saat dibuka.
   File diambil dengan fetch(), jadi halaman harus dibuka lewat server (GitHub Pages atau
   `python3 -m http.server`), bukan dengan klik dua kali file index.html. */
(async function(){
  var get=function(k){try{return localStorage.getItem(k);}catch(e){return null;}};
  var set=function(k,v){try{localStorage.setItem(k,v);}catch(e){}};
  var lang=get('esp32lab-lang');
  if(!lang&&typeof window.name==='string'&&window.name.indexOf('esp32lang:')===0)lang=window.name.slice(10);
  if(lang!=='en')lang='id';
  var other=function(l){return l==='en'?'id':'en';};
  document.documentElement.lang=lang;
  var root=document.getElementById('app-root');

  // statistik pengunjung (GoatCounter): dimuat setelah halaman selesai supaya tidak memperlambat apa pun
  var CFG=window.ESP32LAB_CONFIG||{};
  function track(path,title){try{if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:path,title:title,event:true});}catch(e){}}
  if(CFG.goatcounter){
    var startGC=function(){var s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';
      s.setAttribute('data-goatcounter','https://'+CFG.goatcounter+'.goatcounter.com/count');document.body.appendChild(s);};
    if(document.readyState==='complete')setTimeout(startGC,0);else window.addEventListener('load',startGC);
  }

  // kode Arduino tiap project, urutannya sama untuk kedua bahasa
  var EXAMPLES=['blink','button','fade','dht','sonar','pir','webled','dhtweb','relay','servo','motor'];
  function load(path){return fetch(path).then(function(r){if(!r.ok)throw new Error(path+' ('+r.status+')');return r.text();});}
  function frag(html){var t=document.createElement('template');t.innerHTML=html;return t.content;}
  // isi halaman + kode contoh sebagai <script type="text/plain" id="code-..."> (dibaca codeOf() di main.js)
  async function page(l){
    var res=await Promise.all([load('lang/'+l+'/main.html')].concat(EXAMPLES.map(function(n){return load('examples/'+l+'/'+n+'.ino');})));
    var f=frag(res[0]);
    EXAMPLES.forEach(function(n,i){var s=document.createElement('script');s.type='text/plain';s.id='code-'+n;s.textContent='\n'+res[i+1];f.appendChild(s);});
    return f;
  }
  var cur,alt,simHtml={};
  try{
    var all=await Promise.all([page(lang),page(other(lang)),load('lang/id/sim.html'),load('lang/en/sim.html')]);
    cur=all[0];alt=all[1];simHtml.id=all[2];simHtml.en=all[3];
  }catch(e){
    console.error(e);
    root.innerHTML='<p style="max-width:640px;margin:15vh auto;padding:0 16px;font:16px/1.6 system-ui,sans-serif">'
      +'Gagal memuat file halaman. Jalankan server lokal di folder ini dengan <code>python3 -m http.server 8000</code>, lalu buka http://localhost:8000.<br><br>'
      +'Could not load the page files. Start a local server in this folder with <code>python3 -m http.server 8000</code>, then open http://localhost:8000.</p>';
    return;
  }

  var API=window.__esp32lab={lang:lang,
    alt:alt,
    setLang:function(l){
      l=l==='en'?'en':'id';if(l===API.lang)return;
      API.lang=l;set('esp32lab-lang',l);window.name='esp32lang:'+l;
      track('lang-'+l,'Ganti bahasa: '+l);
      if(window.__langHook)window.__langHook(l);
      if(frame&&frame.contentWindow&&frame.contentWindow.__langHook){try{frame.contentWindow.__langHook(l);}catch(e){console.error(e);}}
      var fl=document.querySelector('iframe');if(fl)fl.title=l==='en'?'ESP32 simulator':'Simulator ESP32';
    },
    showView:showView,
    openSim:function(key,code){track('sim-project-'+key,'Project dibuka di simulator: '+key);showView('sim');var n=0;(function go(){n++;try{var w=frame&&frame.contentWindow;if(w&&w.__simOpen&&w.__simOpen(key,code))return;}catch(e){}if(n<100)setTimeout(go,100);})();}};
  // tempel isi halaman sesuai bahasa, lalu jalankan skripnya
  root.appendChild(cur);
  await new Promise(function(ok,fail){var sc=document.createElement('script');sc.src='js/main.js';sc.onload=ok;sc.onerror=fail;document.body.appendChild(sc);});

  var view='main',frame=null;
  function els(){return [root.querySelector('header.hero'),root.querySelector('main'),root.querySelector('footer')];}
  function syncTheme(){if(!frame)return;try{var d=frame.contentDocument.documentElement;var t=document.documentElement.getAttribute('data-theme');if(t)d.setAttribute('data-theme',t);else d.removeAttribute('data-theme');}catch(e){}}
  function showView(v){
    view=v;var sim=v==='sim';var box=document.getElementById('simView');
    els().forEach(function(e){if(e)e.hidden=sim;});box.hidden=!sim;
    setCur(sim?'#simulator':curSec);
    if(sim&&!frame){
      track('simulator','Simulator dibuka');
      // simulator berjalan di iframe terpisah; path relatif (css/, js/) tetap mengacu ke folder halaman ini
      var l=API.lang,T='<scr'+'ipt';
      frame=document.createElement('iframe');frame.title=l==='en'?'ESP32 simulator':'Simulator ESP32';
      frame.addEventListener('load',syncTheme);
      frame.srcdoc='<!doctype html><html lang="'+l+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ESP32 Simulator</title><link rel="stylesheet" href="css/sim.css"></head><body>'
        +simHtml[l]
        +'<template id="alt-static">'+simHtml[other(l)]+'</template>'
        +T+' src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></scr'+'ipt>'
        +T+' src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></scr'+'ipt>'
        +T+' src="js/sim.js"></scr'+'ipt></body></html>';
      box.appendChild(frame);}
    if(sim){window.scrollTo(0,0);if(location.hash!=='#simulator')history.replaceState(null,'','#simulator');}
    else if(location.hash==='#simulator')history.replaceState(null,'',location.pathname+location.search);
  }
  // tandai menu yang aktif (menu bawah di HP)
  var curSec='';
  function setCur(h){Array.prototype.forEach.call(document.querySelectorAll('.nav-links a,.bnav a'),function(a){if(a.getAttribute('href')===h)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){curSec='#'+e.target.id;if(view!=='sim')setCur(curSec);}});},{rootMargin:'-45% 0px -50% 0px'});
    ['top','pinout','kenalan','cara-kerja','project','mulai'].forEach(function(id){var el=document.getElementById(id);if(el)io.observe(el);});}
  new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-lang]');
    if(b){e.preventDefault();API.setLang(b.getAttribute('data-lang'));return;}
    var a=e.target.closest&&e.target.closest('a[href^="#"]');
    if(!a)return;var h=a.getAttribute('href');
    if(h==='#simulator'){e.preventDefault();showView('sim');return;}
    if(view==='sim'){e.preventDefault();showView('main');var t=h.length>1&&document.getElementById(h.slice(1));setTimeout(function(){if(t)t.scrollIntoView();else window.scrollTo(0,0);},30);}
  });
  // tombol keyboard saat fokus di luar simulator (mis. setelah klik menu) tetap diteruskan ke simulator
  document.addEventListener('keydown',function(e){
    if(view!=='sim'||!frame||!frame.contentWindow||e.ctrlKey||e.metaKey||e.altKey)return;
    var t=e.target;if(t&&t.closest&&t.closest('input,textarea,select,[contenteditable]'))return;
    if(['Delete','Backspace','Escape','r','R','w','a','s','d','x'].indexOf(e.key)<0)return;
    try{if(frame.contentWindow.__simKey&&frame.contentWindow.__simKey(e.key))e.preventDefault();}catch(err){}
  });
  window.addEventListener('hashchange',function(){if(location.hash==='#simulator')showView('sim');});
  if(location.hash==='#simulator')showView('sim');
})();
