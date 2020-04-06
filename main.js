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

function doFail(){
  inp.disabled = true;
  failEl.style.display = "";
}

inp.value = "";
inp.focus();

document.addEventListener("keydown", function(evt) {
  if( fail ) return;
  if( evt.key.length !== 1 ) return;
  let nextCount = count + 1;
  console.log(nextCount);
  console.log(trailingZeros(nextCount));
  let nextChar = String.fromCharCode(aCode + trailingZeros(nextCount));
  console.log(nextChar);
  inp.value += evt.key.toLowerCase();
  inp.selectionStart = inp.selectionEnd = -1;
  if( evt.key.toUpperCase() === nextChar ){
    count += 1;
    updateCounts();
  }else{
    fail = true;
    doFail();
  }
  evt.preventDefault();
});
