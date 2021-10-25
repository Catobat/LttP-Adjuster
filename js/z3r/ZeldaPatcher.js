function zeldaPatcher(rom, gameplay, adjust, pseudoboots, bloodyboots, bloodydamage, dashcharge, beepRate, heartColor, isQuickswap, menuSpeed, isMusicDisabled, isMSUResume, isFlashingReduced, sprite, owPalettes, uwPalettes){
  if(gameplay){
    pseudobootsPatch(rom,pseudoboots);
    bloodybootsPatch(rom,bloodyboots,bloodydamage);
    dashchargePatch(rom,dashcharge);
  }
  if(adjust){
    quickswapPatch(rom,isQuickswap);
    musicPatch(rom,isMusicDisabled);
    resumePatch(rom,isMSUResume);
    flashingPatch(rom,isFlashingReduced);
    menuSpeedPatch(rom,menuSpeed);
    heartBeepPatch(rom,beepRate);
    heartColorPatch(rom,heartColor);
    if(sprite){
      spritePatch(rom,sprite);
    }
    vanillaPalette(rom);
    paletteShufflePatch(rom, uwPalettes, owPalettes);
  }
  writeCrc(rom);
}

function pseudobootsPatch(rom,pseudoboots){
  if(pseudoboots!=='nochange'){
    rom.seekWriteU8(0x18008E,pseudoboots==='on' ? 0x01 : 0x00);
  }
}

function bloodybootsPatch(rom,bloodyboots,bloodydamage){
  switch(bloodyboots){
    case 'off':
      writeHexBlock(rom,0x039C28,'8E 6C 03 8A');
      break;
    case 'on1':
      writeHexBlock(rom,0x039C28,'22 04 FE 1C');
      writeHexBlock(rom,0x0E7E04,'8E 6C 03 E0 02 D0 1A A5 1B F0 06 A5 A0 C9 8B F0 10 A5 55 D0 0C EA EA EA EA EA AF 00 FE 1C 8D 73 03 8A 6B');
      rom.seekWriteU8(0x0E7E00,parseInt(bloodydamage)*2);
      break;
    case 'on2':
      writeHexBlock(rom,0x039C28,'22 04 FE 1C');
      writeHexBlock(rom,0x0E7E04,'8E 6C 03 E0 02 D0 1A A5 1B F0 06 A5 A0 C9 8B F0 10 A5 55 D0 0C AD 1F 03 D0 07 AF 00 FE 1C 8D 73 03 8A 6B');
      rom.seekWriteU8(0x0E7E00,parseInt(bloodydamage)*2);
  }
}

function dashchargePatch(rom,dashcharge){
  switch(dashcharge){
    case 'instant':
      rom.seekWriteU8(0x03B283,1);
      break;
    case 'fast':
      rom.seekWriteU8(0x03B283,14);
      break;
    case 'normal':
      rom.seekWriteU8(0x03B283,29);
      break;
    case 'slow':
      rom.seekWriteU8(0x03B283,44);
  }
}

function writeHexBlock(rom,address,block){
  rom.seek(address);
  var bytes=block.split(' ');
  for(var byte of bytes){
    rom.writeU8(parseInt(byte,16));
  }
}

function quickswapPatch(rom, isQuickswap){
  rom.seekWriteU8(0x18004B,isQuickswap ? 0x01 : 0x00);
}

function menuSpeedPatch(rom, speed){
  if(speed==='instant'){
    rom.seekWriteU8(0x6DD9A, 0x20);
    rom.seekWriteU8(0x6DF2A, 0x20);
    rom.seekWriteU8(0x6E0E9, 0x20);
  }else{
    rom.seekWriteU8(0x6DD9A, 0x11);
    rom.seekWriteU8(0x6DF2A, 0x12);
    rom.seekWriteU8(0x6E0E9, 0x12);
  }
  switch(speed){
    case 'instant':
      rom.seekWriteU8(0x180048, 0xE8); break;
    case 'double':
      rom.seekWriteU8(0x180048, 0x10); break;
    case 'triple':
      rom.seekWriteU8(0x180048, 0x18); break;
    case 'quadruple':
      rom.seekWriteU8(0x180048, 0x20); break;
    case 'half':
      rom.seekWriteU8(0x180048, 0x04); break;
    default:
      rom.seekWriteU8(0x180048, 0x08); break;
  }
}

function heartBeepPatch(rom,rate){
  var beepValues={
    off:0x00,
    half:0x40,
    quarter:0x80,
    normal:0x20,
    double:0x10
  };
  rom.seekWriteU8(0x180033,beepValues[rate]);
}

function heartColorPatch(rom, color){
  var colorNames=['red','blue','green','yellow','random'];
  if(color==='random'){
    color=colorNames[Math.floor(Math.random()*4)];
  }
  var colorValues={
    red:[0x24, 0x05],
    blue:[0x2C, 0x0D],
    green:[0x3C, 0x19],
    yellow:[0x28, 0x09]
  };
  var addresses=[0x6FA1E,0x6FA20,0x6FA22,0x6FA24,0x6FA26,0x6FA28,0x6FA2A,0x6FA2C,0x6FA2E,0x6FA30];
  addresses.forEach(address=>{
    rom.seekWriteU8(address,colorValues[color][0]);
  })
  rom.seekWriteU8(0x65561,colorValues[color][1]); //??
}

function musicPatch(rom, isMusicDisabled){
  var addresses={
    list:[0x0CFE18,0x0CFEC1,0x0D0000,0x0D00E7,0x18021A],
    on:[[0x70],[0xC0],[0xDA,0x58],[0xDA,0x58],[0x00]],
    off:[[0x00],[0x00],[0x00,0x00],[0xC4,0x58],[1]]
  };
  var which = isMusicDisabled ? 'off' : 'on';
  addresses.list.forEach((address, i) => {
    rom.seekWriteBytes(address, addresses[which][i]);
  });
}

function resumePatch(rom, isMSUResume){
  rom.seekWriteU8(0x18021D,isMSUResume ? 0x08 : 0x00);
  rom.seekWriteU8(0x18021E,isMSUResume ? 0x07 : 0x00);
}

function flashingPatch(rom, isFlashingReduced){
  rom.seekWriteU8(0x18017F,isFlashingReduced ? 0x01 : 0x00);
}

function spritePatch(rom, sprite){
  rom.seekWriteBytes(0x80000, sprite.sprite);
  rom.seekWriteBytes(0xDD308, sprite.palette);
  rom.seekWriteBytes(0xDEDF5, sprite.glovePalette);
  if(sprite.author && rom.fileSize>=0x200000){
    rom.seek(0x118000);
    if(rom.readU8()!==0x02 || rom.readU8()!==0x37){
      return;
    }
    rom.seek(0x11801E);
    if(rom.readU8()!==0x02 || rom.readU8()!==0x37){
      return;
    }
    rom.seek(0x118002);
    for(var i=0; i<28; i++){
      rom.writeU8(sprite.author[i][0]);
    }
    rom.seek(0x118020);
    for(var i=0; i<28; i++){
      rom.writeU8(sprite.author[i][1]);
    }
  }
}

function writeCrc(rom){
  var crcSum = [...rom.seekReadBytes(0,0x7FDC),...rom.seekReadBytes(0x7FE0,rom.fileSize)];  
  var crcSums = crcSum.reduce((a,b)=>{
    if (b) {
      return (a+b) & 0xFFFF
    } else {
      return a;
    }    
  }, 0);
  var crc = (crcSums + 0x01FE) & 0xFFFF;  
  var inv = crc ^ 0xFFFF;
  rom.seekWriteBytes(0x7FDC,[inv & 0xFF, (inv >> 8) & 0xFF, crc & 0xFF, (crc >> 8) & 0xFF]);
}

const z3pr = window.z3pr;
const randomizePalette = z3pr.randomize;
function paletteShufflePatch(rom, uwPalettes, owPalettes) {
  // TODO: revert any changes when choosing none
  var options = {randomize_dungeon: true};
  switch(uwPalettes){
    case 'none':
      options.mode = 'none'; break;
    case 'shuffled':
      options.mode = 'maseya'; break;
    case 'blackout':
      options.mode = 'blackout'; break;
    case 'grayscale':
      options.mode = 'grayscale'; break;
    case 'legacy':
      options.mode = 'classic'; break;
    case 'puke':
      options.mode = 'puke'; break;
  }
  var romData = rom.seekReadBytes(0, rom.fileSize);
  romData = randomizePalette(romData, options);

  options = {randomize_overworld: true};
  switch(owPalettes){
    case 'none':
      options.mode = 'none'; break;
    case 'shuffled':
      options.mode = 'maseya'; break;
    case 'blackout':
      options.mode = 'blackout'; break;
    case 'grayscale':
      options.mode = 'grayscale'; break;
    case 'legacy':
      options.mode = 'classic'; break;
    case 'puke':
      options.mode = 'puke'; break;
  }  
  romData = randomizePalette(romData, options);

  rom.seekWriteBytes(0,romData);
}

function vanillaPalette(rom) {
  rom.seekWriteBytes(0xDE604, vanillaOwPaletteData);
  rom.seekWriteBytes(0xDD734, vanillaUwPaletteData);
  for(let i=0; i<vanillaOwPaletteData2.addresses.length; i++){
    rom.seekWriteBytes(vanillaOwPaletteData2.addresses[i],vanillaOwPaletteData2.data[i]);
  }
}

const vanillaOwPaletteData = [165,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,16,14,0,89,16,31,41,232,28,66,8,9,33,99,12,165,64,103,93,174,126,24,127,
  207,25,92,123,196,8,68,0,64,21,38,50,202,16,128,25,144,29,165,20,38,61,135,85,206,122,233,20,11,98,143,29,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,165,20,233,20,44,21,143,29,198,25,105,38,241,37,165,
  20,233,20,44,21,143,29,141,21,17,34,241,37,165,20,233,20,44,21,143,29,44,21,241,37,241,37,165,20,10,58,239,
  74,182,95,101,21,105,38,70,27,165,20,76,25,209,37,52,50,229,29,105,38,40,38,99,12,135,12,202,16,45,17,140,25,
  50,42,144,29,99,12,167,12,202,16,45,17,110,25,242,41,144,29,99,12,167,12,202,16,45,17,45,17,144,29,144,29,196,
  8,201,33,110,54,52,79,140,25,50,42,116,50,196,8,177,77,211,114,183,18,140,25,50,42,207,29,99,12,135,12,202,16,
  45,17,141,21,207,25,144,29,99,12,135,12,202,16,45,17,182,111,80,33,255,127,99,12,135,12,202,16,45,17,45,17,144,
  29,144,29,230,20,10,58,239,74,214,95,141,21,207,25,191,125,165,20,76,17,209,29,53,46,141,21,207,25,144,29,132,8,
  199,12,10,21,77,21,10,21,76,29,175,33,132,8,199,12,9,21,108,25,245,65,66,8,154,86,132,8,199,12,9,21,108,25,9,
  21,175,33,175,33,132,16,201,33,110,54,52,79,10,21,76,29,142,37,132,16,177,77,211,114,183,18,233,16,76,29,10,21,
  132,0,165,0,231,0,232,0,75,1,13,1,24,1,160,0,0,1,66,9,131,13,164,17,140,37,8,25,230,36,98,20,164,28,7,41,205,
  28,15,37,238,32,139,57,73,49,6,41,230,36,164,20,140,37,8,25,132,16,8,25,140,37,115,66,247,82,139,24,50,21,255,
  127,255,127,255,127,255,127,255,127,255,127,255,127,255,127,255,127,255,127,255,127,255,127,255,127,255,127,
  255,127,255,127,255,127,255,127,255,127,255,127,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,197,20,110,33,243,41,119,54,237,28,82,41,215,70,197,20,10,58,239,74,182,95,218,107,198,25,105,38,165,20,76,
  25,209,33,85,50,165,33,232,33,101,25,165,20,112,53,55,82,28,107,115,34,139,73,80,98,165,20,76,25,209,33,101,25,
  82,41,198,25,238,28,165,20,209,41,216,78,189,119,71,25,13,50,198,25,165,20,145,29,25,30,189,38,95,107,119,45,
  27,74,165,20,255,127,164,61,49,70,241,28,255,127,255,127,199,20,207,45,116,62,92,99,198,25,105,38,255,123,19,
  127,85,127,217,127,253,127,200,49,0,0,208,126,255,127,92,0,0,0,92,1,31,2,191,2,63,3,255,127,255,127,255,127,
  255,127,255,127,255,127,255,127,198,24,143,29,11,98,152,107,231,29,105,38,241,37,198,24,135,81,54,30,158,63,
  231,29,105,38,11,98,165,20,233,20,44,21,143,29,198,25,105,38,241,37,132,8,42,5,239,33,181,58,57,75,76,29,172,
  24,132,8,42,5,239,33,181,58,57,75,76,29,172,24,132,8,8,21,108,25,175,33,245,65,76,29,154,86,194,56,3,89,167,
  117,235,126,178,127,207,25,99,12,99,12,43,21,18,42,216,58,106,20,144,29,233,20,99,12,44,29,80,33,118,38,182,
  111,207,25,255,127,99,12,135,12,202,16,45,17,141,21,207,25,144,29,99,12,135,12,202,16,45,17,182,111,255,127,
  144,29,99,12,134,49,198,57,209,45,24,127,106,50,92,123,165,20,10,58,239,74,148,87,198,25,51,58,182,70,165,20,
  109,29,241,45,255,127,165,33,247,73,148,53,165,20,110,33,243,41,119,54,37,49,168,69,215,70,165,20,171,37,113,
  50,23,71,38,25,233,20,241,37,165,20,76,25,209,33,17,34,83,26,83,34,174,21,165,20,171,37,113,50,23,71,90,95,174,
  25,17,34,0,40,64,56,161,68,4,81,140,101,12,106,105,38,231,28,11,50,243,70,153,83,254,107,168,65,105,38,5,21,76,
  17,105,38,164,25,5,38,101,50,200,54,232,0,54,51,142,41,84,70,177,42,235,21,245,58,132,8,234,4,77,17,209,33,22,
  18,218,30,80,1,132,8,43,13,241,25,183,62,189,91,110,25,242,41,0,0,33,8,99,16,165,24,231,44,41,53,107,73,167,
  12,78,41,20,70,250,94,173,29,255,127,245,58,132,8,140,33,82,46,245,58,204,29,80,46,41,17,4,37,104,45,236,65,
  108,78,208,90,128,25,117,111,132,8,128,25,106,13,47,26,25,51,245,9,188,46,132,8,64,21,192,16,240,29,110,25,242,
  41,128,25,99,12,45,17,128,25,2,42,140,25,50,42,144,29,99,12,64,21,255,127,255,127,140,25,50,42,128,25,99,12,
  135,12,202,16,45,17,140,25,50,42,144,29,232,20,176,29,117,46,26,63,255,127,24,71,90,79,132,8,234,4,77,17,209,
  33,215,49,123,70,83,37,198,16,178,37,87,50,219,58,148,45,24,58,188,78,99,12,178,37,87,50,251,54,72,41,108,57,
  16,74,230,20,201,33,110,54,52,79,184,95,140,25,50,42,132,8,234,4,77,17,209,33,172,25,47,38,103,29,142,20,20,25,
  217,33,255,50,1,12,1,12,10,24,132,8,234,4,77,17,209,33,142,73,19,90,42,61,132,8,110,13,243,25,86,38,151,46,12,
  17,202,0,132,8,9,5,107,17,49,42,181,58,76,29,208,1,132,8,199,12,10,21,77,21,255,91,154,86,175,33,66,8,66,8,99,
  12,73,8,232,28,99,12,9,33,132,16,7,4,106,16,206,4,82,21,37,25,232,12,132,8,203,28,206,29,148,54,24,71,76,29,
  172,24,132,8,8,21,108,25,175,33,245,65,76,29,154,86];

const vanillaOwPaletteData2 = {
  addresses: [0x067FB4, 0x067F94, 0x067FC6, 0x067FE6, 0x067FE1, 0x05FEA9, 0x05FEB3],
  data: [[0x69,0x26],[0x69,0x26],[0x69,0x26],[0x69,0x26],[0xC6,0x19],[0x69,0x26],[0x32,0x2A]]
};

const vanillaUwPaletteData = [198,12,43,21,208,25,117,54,93,83,238,28,137,16,255,127,198,12,43,
  21,208,25,117,54,93,83,238,28,137,16,198,24,107,45,148,82,189,119,47,37,186,26,245,41,255,127,
  132,12,104,49,203,61,13,70,231,40,208,25,238,28,198,12,43,21,51,26,25,59,172,20,199,77,70,69,
  255,127,132,12,37,41,102,49,168,57,107,125,43,21,137,16,198,16,110,33,243,33,220,58,205,24,222,
  102,217,89,255,127,165,12,41,45,113,45,179,53,231,40,208,25,238,28,99,20,16,33,184,53,156,115,
  8,65,219,22,173,97,255,127,165,12,41,45,14,33,80,41,231,40,74,49,107,125,198,12,43,21,208,25,
  117,54,93,83,43,21,107,125,255,127,165,12,10,21,0,0,0,0,205,24,117,54,208,25,99,20,199,44,42,
  61,174,73,116,98,236,28,137,16,255,127,99,20,199,44,42,61,174,73,116,98,45,29,202,16,198,24,
  107,45,148,82,189,119,47,37,186,26,245,41,255,127,99,20,38,45,137,57,203,61,38,45,42,61,45,29,
  99,20,199,44,42,61,174,73,116,98,236,28,137,16,255,127,99,20,228,36,5,41,71,49,228,36,199,44,
  202,16,198,24,11,29,144,37,244,33,200,20,236,28,137,16,255,127,134,12,200,16,10,25,76,33,53,54,
  28,75,191,111,198,24,16,33,184,53,156,115,8,65,219,22,173,97,255,127,99,20,228,36,38,45,137,57,
  137,57,115,78,247,94,99,20,7,101,73,105,81,127,231,68,105,93,79,126,255,127,99,16,199,40,228,
  36,165,21,165,21,174,73,42,61,167,20,79,33,179,33,21,50,186,62,248,86,15,37,255,127,167,20,79,
  33,179,33,21,50,186,62,248,86,236,28,198,24,107,45,148,82,189,119,47,37,186,26,245,41,255,127,
  167,20,104,49,203,61,13,70,104,49,147,33,236,28,167,20,79,33,179,33,88,50,200,100,175,125,255,
  127,255,127,165,12,45,25,111,33,177,41,45,25,79,33,202,24,233,20,177,33,87,54,154,58,171,3,217,
  86,119,74,255,127,165,12,45,25,111,33,177,41,45,25,147,33,236,28,198,24,16,33,184,53,156,115,8,
  61,186,26,206,93,255,127,165,12,4,37,102,49,168,57,255,127,79,33,202,24,167,20,115,6,173,33,
  239,33,255,127,255,127,255,127,255,127,165,12,133,8,232,20,132,41,132,41,167,20,167,20,165,20,
  70,25,200,37,176,58,89,83,140,65,41,53,255,127,165,20,70,25,200,37,176,58,89,83,40,61,231,40,
  198,24,107,45,148,82,189,119,47,37,186,26,245,41,255,127,99,12,40,49,74,57,140,65,230,44,200,
  41,40,61,165,20,70,25,200,37,176,58,89,83,156,42,85,41,255,127,99,12,198,44,231,44,41,53,197,
  40,36,29,231,40,165,20,70,25,200,37,176,58,89,83,140,45,41,53,255,127,165,20,8,33,74,41,140,
  49,115,78,90,107,255,127,198,24,16,33,184,53,156,115,8,61,186,26,206,93,255,127,132,16,167,28,
  201,36,11,45,74,57,148,82,156,115,165,20,104,69,237,89,80,102,133,41,72,58,43,83,255,127,165,
  20,37,21,0,0,237,28,237,28,176,58,200,37,164,36,37,89,75,106,149,119,251,127,206,93,140,85,
  255,127,164,36,37,89,75,106,149,119,251,127,238,93,106,77,198,24,107,45,148,82,189,119,47,37,
  186,26,245,41,255,127,164,36,106,77,172,85,238,93,37,77,238,93,168,81,164,36,37,89,75,106,187,
  119,123,17,207,117,181,126,255,127,164,36,106,77,172,85,238,93,71,61,238,93,168,81,164,36,169,
  120,208,125,203,118,250,127,169,100,172,85,255,127,200,52,106,77,172,85,238,93,179,106,88,123,
  255,127,99,20,16,41,184,61,156,115,74,97,186,26,49,126,255,127,164,36,139,93,40,77,6,65,9,91,
  148,82,156,115,164,36,136,73,228,94,103,115,231,68,105,93,79,126,255,127,132,32,5,85,0,0,0,0,
  139,93,149,119,249,127,165,12,234,16,77,25,243,41,182,62,203,45,137,37,255,127,165,12,234,16,
  77,25,243,41,182,62,104,33,6,25,198,24,107,45,148,82,189,119,47,37,186,26,245,41,255,127,99,12,
  104,33,170,41,173,41,144,33,77,25,104,33,165,12,234,16,77,25,243,41,182,62,204,42,229,21,255,
  127,99,12,38,25,103,33,107,33,5,25,234,16,6,25,165,12,234,16,77,25,243,41,182,62,173,41,170,
  41,255,127,231,16,74,21,173,29,16,42,247,66,189,95,255,127,198,24,16,33,184,53,156,115,8,65,
  186,26,173,97,255,127,99,12,174,21,240,29,174,21,170,41,148,82,156,115,198,36,38,69,103,97,
  201,101,71,69,200,89,140,106,255,127,165,12,234,16,0,0,236,29,236,29,243,41,77,25,132,16,202,
  24,46,37,211,57,154,82,140,65,41,53,255,127,132,16,202,24,46,37,243,57,186,82,41,45,231,36,
  198,24,107,45,148,82,189,119,47,37,186,26,245,41,255,127,99,12,41,53,74,57,140,65,8,49,46,37,
  41,45,132,16,202,24,46,37,211,57,186,82,90,30,245,28,255,127,99,12,198,40,231,44,41,49,198,40,
  202,24,231,36,132,16,202,24,46,37,211,57,186,82,107,61,41,53,255,127,228,28,69,37,134,45,199,
  53,47,90,56,119,255,127,132,16,16,33,184,53,156,115,8,65,219,22,140,93,255,127,132,16,201,20,
  204,20,13,25,41,53,148,82,156,115,165,40,40,49,106,57,172,65,231,64,105,93,14,114,255,127,100,
  12,169,20,0,0,235,28,235,28,243,57,47,33,133,16,200,16,235,24,145,29,53,46,79,37,12,33,255,127,
  133,16,201,16,45,25,145,29,53,46,9,66,135,49,198,24,107,45,148,82,189,119,47,37,186,26,245,41,
  255,127,133,16,201,20,235,24,46,33,200,16,110,33,11,25,198,24,132,25,70,38,105,59,255,25,213,
  24,169,16,255,127,133,16,136,16,169,16,203,20,134,16,44,25,200,16,133,16,110,33,243,33,183,66,
  170,101,11,25,235,24,255,127,133,16,201,20,235,24,46,33,178,45,152,66,191,103,132,16,16,33,
  184,53,156,115,38,65,219,22,203,97,255,127,99,12,13,17,145,29,53,46,45,33,148,82,156,115,99,
  20,230,88,73,97,139,101,231,68,105,93,46,122,255,127,133,16,201,16,0,0,0,0,165,53,133,16,133,
  16,99,12,8,33,173,53,82,74,57,103,204,49,138,41,255,127,99,12,8,33,173,53,82,74,57,103,105,37,
  39,29,198,24,107,45,148,82,189,119,47,37,186,26,245,41,255,127,132,16,72,33,138,41,172,49,72,
  33,173,53,105,37,99,12,8,33,173,53,82,74,57,103,215,26,174,25,0,0,132,16,6,25,39,29,105,37,6,
  25,8,33,39,29,99,12,107,45,148,82,156,115,38,46,138,79,166,58,255,127,199,16,9,17,141,29,240,
  41,248,66,157,95,255,127,198,24,16,33,184,53,156,115,8,65,186,26,173,97,255,127,132,16,233,16,
  43,21,109,29,138,41,148,82,156,115,132,16,72,33,204,49,119,54,231,68,105,93,79,126,255,127,99,
  12,231,28,0,0,0,0,204,29,82,74,173,53,132,16,230,24,76,25,242,41,216,70,140,41,74,17,255,127,
  132,16,230,24,76,25,242,41,216,70,170,20,134,16,198,24,107,45,148,82,189,119,47,37,186,26,245,
  41,255,127,99,20,72,17,74,17,140,41,69,25,138,37,170,20,132,16,230,24,76,25,242,41,216,70,140,
  41,170,20,255,127,99,20,135,16,168,20,8,21,255,127,7,29,134,16,132,16,230,24,76,25,242,41,216,
  70,140,41,170,20,255,127,198,32,8,49,107,65,206,81,82,98,57,127,255,127,99,20,16,33,184,53,156,
  115,8,65,219,22,173,97,255,127,132,16,36,57,134,73,11,90,74,17,49,70,214,90,99,20,81,127,73,
  105,7,101,231,68,105,93,79,126,255,127,99,20,199,44,8,33,255,127,205,24,242,41,109,33,132,16,
  8,37,74,49,239,69,247,102,136,49,134,25,255,127,132,16,8,37,74,49,239,69,247,102,135,29,38,25,
  198,24,107,45,148,82,189,119,47,37,186,26,245,41,255,127,132,16,37,21,134,25,136,49,141,25,74,
  49,135,29,132,16,8,37,74,49,239,69,247,102,136,49,134,25,255,127,132,16,167,16,200,20,233,24,
  166,16,8,37,38,25,132,16,10,25,76,33,142,41,24,107,136,49,134,25,255,127,233,16,42,25,108,33,
  174,41,52,54,26,87,191,111,198,24,16,33,184,53,156,115,8,65,219,22,173,97,255,127,132,16,37,
  21,134,25,136,49,134,25,148,82,156,115,99,20,7,101,73,105,81,127,231,68,105,93,79,126,255,127,
  99,12,165,20,198,24,141,25,141,25,239,69,74,41,99,12,69,25,230,29,208,58,119,87,106,66,8,54,
  255,127,99,12,69,25,230,29,208,58,119,87,175,29,75,17,198,24,107,45,148,82,189,119,47,37,186,
  26,245,41,255,127,99,12,167,41,8,54,106,66,101,37,230,25,175,29,99,12,69,25,230,29,208,58,167,
  41,8,54,106,66,255,127,99,12,69,37,133,41,199,45,69,37,69,21,75,17,165,20,102,25,235,46,10,75,
  255,127,177,37,237,28,255,127,233,20,43,21,109,29,208,41,51,54,183,70,191,111,99,20,16,33,184,
  53,156,115,8,65,219,22,173,97,255,127,99,12,167,16,234,20,43,29,199,45,148,82,156,115,198,24,
  0,112,132,124,165,124,67,53,163,65,67,82,255,127,66,12,37,21,0,0,0,0,208,29,208,58,109,37,133,
  16,201,16,45,25,145,29,53,46,79,37,12,33,255,127,133,16,201,16,45,25,145,29,53,46,9,66,135,49,
  198,24,107,45,148,82,189,119,47,37,186,26,245,41,255,127,133,16,201,20,235,24,46,33,200,16,
  110,33,11,25,255,127,115,54,24,55,189,55,165,20,41,53,206,53,255,127,133,16,136,16,169,16,203,
  20,134,16,44,25,200,16,99,20,8,21,107,25,82,50,24,83,12,25,235,24,255,127,133,16,201,20,235,
  24,46,33,178,45,152,66,191,103,132,16,16,33,184,53,156,115,40,53,219,22,172,89,255,127,99,12,
  13,17,145,29,53,46,45,33,148,82,156,115,165,20,114,12,156,16,255,17,39,77,236,97,78,126,255,
  127,133,16,201,16,0,0,206,25,165,53,133,16,133,16,99,12,203,36,111,41,52,54,249,74,173,57,107,
  49,255,127,99,12,203,36,111,41,52,54,249,74,135,49,37,37,198,24,107,45,148,82,156,115,47,37,
  186,26,245,41,255,127,99,12,74,45,107,49,173,57,170,20,111,41,135,49,99,12,203,36,111,41,52,
  54,249,74,166,22,197,21,0,0,99,12,231,32,8,37,41,41,198,32,203,36,37,37,99,12,203,36,111,41,
  52,54,249,74,241,37,175,29,255,127,136,16,170,20,205,24,51,37,58,70,93,107,255,127,198,24,16,
  33,184,53,156,115,40,61,186,26,206,93,255,127,136,16,170,20,205,24,51,37,205,24,51,37,0,0,165,
  20,5,53,198,81,105,90,249,74,203,36,0,0,255,127,99,12,202,36,0,0,0,0,231,52,52,54,117,62,99,
  12,201,20,141,33,115,62,57,87,78,17,206,17,255,127,99,12,201,20,141,33,115,62,57,87,78,17,206,
  17,196,20,107,45,148,82,189,119,50,37,219,22,249,37,255,127,99,12,233,20,12,25,45,29,233,20,
  43,17,201,16,99,12,202,24,208,17,131,22,191,22,77,125,123,12,255,127,99,12,198,16,232,20,9,25,
  198,16,43,17,201,16,99,12,170,28,48,17,19,42,141,16,255,127,236,36,255,127,99,12,141,16,83,41,
  24,66,31,99,43,17,201,16,132,16,245,28,187,53,156,115,41,53,219,22,173,89,255,127,99,12,198,
  16,232,20,9,25,12,25,148,82,156,115,99,12,16,17,247,25,253,38,41,125,219,24,131,22,255,127,99,
  12,201,20,0,0,141,16,141,16,4,17,4,17,132,16,234,36,47,37,211,57,122,78,214,62,107,21,255,127,
  132,16,234,36,47,37,211,57,122,78,214,62,107,21,196,20,107,45,148,82,189,119,50,37,219,22,249,
  37,255,127,132,16,12,33,46,37,80,41,134,25,146,45,107,21,132,16,234,36,47,37,211,57,156,127,
  140,125,165,100,255,127,132,32,8,57,74,61,140,69,134,25,146,45,107,21,132,16,44,29,240,33,116,
  50,251,28,156,127,41,77,255,127,132,16,160,109,96,127,116,50,255,127,255,61,251,28,132,16,117,
  18,41,73,156,115,5,21,255,61,251,28,255,127,132,16,201,40,11,49,76,53,134,25,146,45,107,21,
  132,16,145,45,11,41,155,34,168,17,251,28,83,8,255,127,132,16,137,53,32,1,167,29,134,25,195,12,
  195,12,165,12,233,16,110,29,84,46,59,67,177,70,12,50,255,127,165,12,235,16,110,29,84,46,57,
  63,71,29,197,20,196,20,107,45,148,82,189,119,50,37,219,22,249,37,255,127,132,16,8,45,74,53,
  140,57,255,127,110,29,71,29,165,12,233,16,110,29,84,46,59,67,89,30,85,21,255,127,99,12,44,29,
  145,29,210,33,229,36,11,17,197,20,165,12,38,25,202,41,144,66,90,91,84,46,110,29,255,127,231,
  16,235,16,110,29,84,46,247,66,189,95,255,127,132,16,245,28,187,53,156,115,41,53,219,22,173,89,
  255,127,99,12,165,36,198,40,198,40,8,45,148,82,156,115,132,16,13,33,145,49,120,78,223,119,110,
  29,84,46,255,127,132,12,202,16,0,0,0,0,241,28,84,46,17,46,222,119,222,119,222,119,222,119,222,
  119,222,119,222,119,0,0,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,
  119,222,119,222,119,222,119,222,119,222,119,0,0,222,119,222,119,222,119,222,119,222,119,222,
  119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,0,0,222,119,222,119,222,
  119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,
  0,0,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,
  222,119,222,119,222,119,0,0,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,
  222,119,222,119,222,119,222,119,222,119,222,119,0,0,222,119,222,119,222,119,222,119,222,119,
  222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,0,0,222,119,222,119,
  222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,
  119,0,0,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,
  119,222,119,222,119,222,119,0,0,222,119,222,119,222,119,222,119,222,119,222,119,222,119,222,
  119,222,119,222,119,222,119,222,119,222,119,222,119,0,0,222,119,222,119,222,119,222,119,222,
  119,222,119,222,119,165,20,14,56,24,96,31,124,191,125,127,126,63,127,0,0,165,20,14,56,24,96,
  31,124,191,125,127,126,63,127,0,0,14,56,24,96,31,124,191,125,127,126,63,127,0,0,0,0,14,56,24,
  96,31,124,191,125,127,126,63,127,0,0,14,56,24,96,31,124,191,125,127,126,63,127,0,0,165,20,14,
  56,24,96,31,124,191,125,127,126,63,127,165,20,14,56,24,96,31,124,191,125,127,126,63,127,0,0,
  0,0,14,56,24,96,31,124,191,125,127,126,63,127,0,0,14,56,24,96,31,124,191,125,127,126,63,127,
  0,0,165,20,14,56,24,96,31,124,191,125,127,126,63,127,0,0,14,56,24,96,31,124,191,125,127,126,
  63,127,0,0,0,0,14,56,24,96,31,124,191,125,127,126,63,127,0,0,14,56,24,96,31,124,191,125,127,
  126,63,127,0,0,0,0,14,56,24,96,31,124,191,125,127,126,63,127,0,0,14,56,24,96,31,124,191,125,
  127,126,63,127,0,0,0,0,14,56,24,96,31,124,191,125,127,126,63,127];