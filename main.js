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
const aCode = "A".charCodeAt(0);

function trailingZeros(n) {
  let res = 0;
  let bit = 1;
  while(!(n & bit)) {
    res += 1;
    bit = bit << 1;
  }
  return res;
}

let lvlind = document.getElementById("level");
let chrind = document.getElementById("characters");

function updateCounts(){
  chrind.textContent = count+"";
  lvlind.textContent = Math.log2(count+1).toFixed(5);
}

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

inp.addEventListener("input", function(evt) {
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
    updateCounts();
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
  fail = false;
  failEl.style.display = "none";
  chrind.textContent = "0";
  lvlind.textContent = "0";
  inp.disabled = false;
  inp.focus();
});

// @license-end
