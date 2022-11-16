var db;

function IndexedDb(){
  this.obj = {
    jp_file: null,
    sprite_file: null,
    sprite_file_name: null,
    gameplay: true,
    adjust: false,
    pseudoboots: 'nochange',
    bloodyboots: 'nochange',
    bloodydamage: '2',
    dashcharge: 'nochange',
    quickswap: true,
    music: true,
    resume: true,
    flashing: false,
    sprite: 'https://alttpr-assets.s3.us-east-2.amazonaws.com/001.link.1.zspr',
    color: 'red',
    beep: 'half',
    speed: 'normal',
    owp: 'none',
    uwp: 'none'
  };

  if (!('indexedDB' in window)){
    console.log('This browser doesn\'t support IndexedDB');
    return;
  } else {
    var dbPromise = window.indexedDB.open('adjuster-db', 2);

    dbPromise.onupgradeneeded = function(e) {
      var thisDB = e.target.result;
      if (!thisDB.objectStoreNames.contains('configs')){
        thisDB.createObjectStore('configs', {keyPath: 'field'});
      }
    }
  
    dbPromise.onsuccess = (e) => {
      db = e.target.result;
      this.load();
    }
  }  
}

IndexedDb.prototype.load = function(){
  if (db) {
    var tx = db.transaction('configs', 'readonly');
    var store = tx.objectStore('configs');
    var req = store.getAll();
  
    req.onsuccess = (e) => {
      var req = e.target.result;
      if (req.length > 0){
        req.forEach(eachConfig => {
          this.obj[eachConfig.field] = eachConfig.value;
        });      
      }
  
      this.loadJpRom();
      this.loadSprite();
      this.setFormValues();
    }
  } else {
    this.setFormValues();
  }
}

IndexedDb.prototype.loadJpRom = function(){
  if(this.obj.jp_file){
    try{
      var bin = atob(this.obj.jp_file);
      var array = new Uint8Array(bin.length);
      for(var k=0; k<bin.length; k++){
        array[k] = bin.charCodeAt(k);
      }
      var storedRom = new MarcFile(array);
      var crc = padZeroes(crc32(storedRom, 0), 4);
      if(crc==='3322effc'){
        romFile1 = storedRom;
        jpCrc = crc;
        el('row-input-file-jp').style.display = 'none';
      }else{
        this.obj.jp_file = null;
      }
    }
    catch(e){}
  }
}

IndexedDb.prototype.loadSprite = function(){
  if(this.obj.sprite_file){
    try{
      var bin = atob(this.obj.sprite_file);
      var array = new Uint8Array(bin.length);
      for(var k=0; k<bin.length; k++){
        array[k] = bin.charCodeAt(k);
      }
      spriteFile = spriteFile2 = new MarcFile(array);
      document.getElementById("select-sprite").options[1].innerHTML = "[Custom] - " + this.obj.sprite_file_name;
      document.getElementById("select-sprite2").options[1].innerHTML = "[Custom] - " + this.obj.sprite_file_name;
    }
    catch(e){}
  }
}

IndexedDb.prototype.setFormValues = function(){
  setGameplayMode(this.obj.gameplay);
  setAdjustMode(this.obj.adjust);
  el('select-pseudoboots').value = this.obj.pseudoboots;
  el('select-bloodyboots').value = this.obj.bloodyboots;
  el('select-bloodydamage').value = this.obj.bloodydamage;
  el('select-dashcharge').value = this.obj.dashcharge;
  el('checkbox-quickswap').checked = this.obj.quickswap;
  el('checkbox-music').checked = this.obj.music;
  el('checkbox-resume').checked = this.obj.resume;
  el('checkbox-flashing').checked = this.obj.flashing;
  el('select-sprite').value = this.obj.sprite;
  el('input-file-sprite').style.display=this.obj.sprite == "custom" ? "block" : "none";
  el('select-heartcolor').value = this.obj.color;
  el('select-beep').value = this.obj.beep;
  el('select-menuspeed').value = this.obj.speed;
  el('select-owpalettes').value = this.obj.owp;
  el('select-uwpalettes').value = this.obj.uwp;
  el('select-pseudoboots2').value = this.obj.pseudoboots;
  el('select-bloodyboots2').value = this.obj.bloodyboots;
  el('select-bloodydamage2').value = this.obj.bloodydamage;
  el('select-dashcharge2').value = this.obj.dashcharge;
  el('checkbox-quickswap2').checked = this.obj.quickswap;
  el('checkbox-music2').checked = this.obj.music;
  el('checkbox-resume2').checked = this.obj.resume;
  el('checkbox-flashing2').checked = this.obj.flashing;
  el('select-sprite2').value = this.obj.sprite;
  el('input-file-sprite2').style.display=this.obj.sprite == "custom" ? "block" : "none";
  el('select-heartcolor2').value = this.obj.color;
  el('select-beep2').value = this.obj.beep;
  el('select-menuspeed2').value = this.obj.speed;
  el('select-owpalettes2').value = this.obj.owp;
  el('select-uwpalettes2').value = this.obj.uwp;
}

IndexedDb.prototype.save = function(tab){
  var id = '';
  if (tab==='create')
    id='2';  
  this.saveJpRom();
  this.saveSprite(id);
  this.obj.gameplay = el('switch-gameplay'+id).className.endsWith('enabled');
  this.obj.adjust = el('switch-adjust'+id).className.endsWith('enabled');
  this.obj.pseudoboots = el('select-pseudoboots'+id).value;
  this.obj.bloodyboots = el('select-bloodyboots'+id).value;
  this.obj.bloodydamage = el('select-bloodydamage'+id).value;
  this.obj.dashcharge = el('select-dashcharge'+id).value;
  this.obj.quickswap = el('checkbox-quickswap'+id).checked;
  this.obj.music = el('checkbox-music'+id).checked;
  this.obj.resume = el('checkbox-resume'+id).checked;
  this.obj.flashing = el('checkbox-flashing'+id).checked;
  this.obj.sprite = el('select-sprite'+id).value;
  this.obj.color = el('select-heartcolor'+id).value;
  this.obj.beep = el('select-beep'+id).value;
  this.obj.speed = el('select-menuspeed'+id).value;
  this.obj.owp = el('select-owpalettes'+id).value;
  this.obj.uwp = el('select-uwpalettes'+id).value;

  if (db) {
    var tx = db.transaction('configs', 'readwrite');
    var store = tx.objectStore('configs');
    Object.keys(this.obj).forEach(eachKey => {
      var item = {
        field: eachKey,
        value: this.obj[eachKey]
      };
      store.put(item);
    });
    tx.oncomplete = () => {
      this.setFormValues();
    }
  } 
}

IndexedDb.prototype.saveJpRom = function(){
  if(!this.obj.jp_file && romFile1 && jpCrc==='3322effc'){
    var bin = '';
    var array = romFile1._u8array;
    for(var k=0; k<array.length; k++){
      bin += String.fromCharCode(array[k]);
    }
    this.obj.jp_file = btoa(bin);
  }
}

IndexedDb.prototype.saveSprite = function(id){
  var file = id==='2' ? spriteFile2 : spriteFile;
  if(file && document.getElementById("input-file-sprite"+id).files[0]){
    var bin = '';
    var array = file._u8array;
    for(var k=0; k<array.length; k++){
      bin += String.fromCharCode(array[k]);
    }
    var data = btoa(bin);
    if(this.obj.sprite_file !== data) {
      this.obj.sprite_file = data;
      this.obj.sprite_file_name = document.getElementById("input-file-sprite"+id).files[0].name;
    }
  }
}