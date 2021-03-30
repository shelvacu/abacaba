// @license magnet:?xt=urn:btih:0b31508aeb0634b347b8270c7bee4d411b5d4109&dn=agpl-3.0.txt AGPL-v3-or-Later

/*  Copyright 2020 Shelvacu

    This file is part of abacaba.

    abacaba is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    abacaba is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with abacaba.  If not, see <https://www.gnu.org/licenses/>.
*/

let inp = document.getElementById("main");
let count = 0;
let fail = false;
let failEl = document.getElementById("fail");
let speeds = document.getElementById("speeds");
let lvlind = document.getElementById("level");
let chrind = document.getElementById("characters");
let hs_speeds = document.getElementById("hs-speeds");
let hs_lvlind = document.getElementById("hs-level");
let hs_chrind = document.getElementById("hs-characters");
let farthest = +localStorage.getItem('farthest') || 0;
let levelSpeeds = [];
const aCode = "A".charCodeAt(0);

let currLevel = 2;
while(true) {
  let score = localStorage.getItem("levelSpeed" + currLevel);
  if (!score) break;
  levelSpeeds.push(score+0);
  currLevel++;
}

function trailingZeros(n) {
  let res = 0;
  let bit = 1;
  while(!(n & bit)) {
    res += 1;
    bit = bit << 1;
  }
  return res;
}


function updateCounts(thisCharAt){
  if (inp.disabled) return;
  chrind.textContent = count+"";
  let lvlFloat = Math.log2(count+1);
  lvlind.textContent = lvlFloat.toFixed(5);
  if( count == 1 || start == null ) return;
  let time_ms = (thisCharAt - start);
  let speed_c_per_ms = (count-1) / time_ms;
  let time_s = time_ms/1000;
  let speed_c_per_s = speed_c_per_ms * 1000;
  let speedtext = speed_c_per_s.toFixed(3) + " characters per second (" + (count-1) + " characters* in " + time_s + " seconds)";
  console.log(lvlFloat);
  console.log(lvlFloat|0);
  if( count > farthest ){
    farthest = count;
    localStorage.setItem("farthest", farthest);
    updateHs();
  }
  if( (lvlFloat|0) === lvlFloat ){
    let el = speeds.children[speeds.children.length-1];
    el.textContent = "Level " + lvlFloat + " speed: " + speedtext;
    speeds.appendChild(document.createElement("div"));

    if (levelSpeeds[lvlFloat-2] == null || time_s < levelSpeeds[lvlFloat-2]) {
      levelSpeeds[lvlFloat-2] = time_s;
      localStorage.setItem("levelSpeed" + lvlFloat, time_s);
    }
    updateHs();
  }
  let el = speeds.children[speeds.children.length-1];
  el.textContent = "Current Speed: " + speedtext;
}

function updateHs(){
  let lvlFloat = Math.log2(farthest+1);
  hs_lvlind.textContent = lvlFloat.toFixed(5);
  hs_chrind.textContent = farthest+"";
  let level = 2;
  hs_speeds.innerHTML = "";
  for(let time_s of levelSpeeds){
    let count = Math.pow(2,level)-1;
    let speed_c_per_s = count / time_s;
    let d = document.createElement("div");
    d.textContent = `Level ${level} best speed: ${speed_c_per_s.toFixed(3)} characters per second (${count-1} characters in ${time_s} seconds)`
    hs_speeds.appendChild(d);
    level++;
  }
}

updateHs();

function doFail(why){
  inp.disabled = true;
  console.log("why", why);
  document.getElementById("why").textContent = why;
  failEl.style.display = "";
  document.getElementById("tryagain").focus();
}

inp.value = "";
inp.focus();

let previousText = "";
let start = null;

inp.addEventListener("input", function(evt) {
  if( start == null ){
    start = Date.now();
  }
  let thisCharAt = Date.now();
  console.log(evt.inputType, evt.data);
  if( fail ) return;
  let dataLen = evt.data ? evt.data.length : -1;
  if( evt.inputType === "insertCompositionText" ){ dataLen -= (inp.value.length - 1) }
  if( !(evt.inputType === "insertText" || evt.inputType === "insertCompositionText") || dataLen != 1 ){
    let shouldReturn = true;
    if( evt.inputType === "insertCompositionText"){
      if( inp.selectionStart !== inp.value.length ){
        doFail("Don't move the cursor");
      }else if( inp.value.length - previousText.length > 1 ){
        doFail("Only insert one character at a time.");
      }else if( previousText.length - inp.value.length > 1 ){
        doFail("Backspace is not allowed.");
      }else{
        shouldReturn = false;
      }
    }else if( evt.inputType === "insertText" ){
      doFail("Only insert one character at a time.");
    }else if( evt.inputType === "insertReplacementText" ){
      doFail("You cannot replace text.");
    }else if( evt.inputType === "insertFromYank" || evt.inputType === "insertFromDrop" || evt.inputType === "insertFromPaste" || evt.inputType === "insertFromPasteAsQuotation" ){
      doFail("Paste is not allowed");
    }else if( evt.inputType.startsWith("delete") || dataLen < 0 ){
      doFail("Backspace is not allowed");
    }else if( evt.inputType.startsWith("history") ){
      doFail("No undo/redo");
    }else{
      console.log("WARN: unrecognized ", evt.inputType, ", ignoring.");
    }
    if( shouldReturn ) return;
  }
  let data = evt.data[evt.data.length - 1];
  //if( evt.key.length !== 1 ) return;
  let nextCount = count + 1;
  console.log(nextCount);
  console.log(trailingZeros(nextCount));
  let nextChar = String.fromCharCode(aCode + trailingZeros(nextCount));
  console.log(nextChar);
  //inp.value += evt.data.toLowerCase();
  previousText = inp.value;
  inp.selectionStart = inp.selectionEnd = -1;
  if( data.toUpperCase() === nextChar ){
    count += 1;
    updateCounts(thisCharAt);
  }else{
    fail = true;
    doFail("Incorrect character.");
  }
  evt.preventDefault();
});

document.getElementById("tryagain").addEventListener("click", function(){
  inp.value = "";
  previousText = "";
  count = 0;
  start = null;
  fail = false;
  failEl.style.display = "none";
  chrind.textContent = "0";
  lvlind.textContent = "0";
  speeds.innerHTML = "<div></div>";
  inp.disabled = false;
  inp.focus();
});

// @license-end
