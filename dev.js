function startOptions() {
  let modal = document.createElement("div");
  modal.classList.add("open");

  let greet_p = document.createElement("p");
  let greet_txt = document.createTextNode("hi welcome to emojraw! ⍢");

  let pixelsize = document.createElement("input");
  pixelsize.classList.add("pixelsize");
  pixelsize.value = "30";

  modal.appendChild(greet_p);
  modal.appendChild(pixelsize);

  document.body.appendChild(modal);
}

function selectEmoji(callback) {
  let div = document.createElement("div");
  div.classList.toggle("select");
  const emojRange = [
    [128513, 128591],
    [9986, 10160],
    [128640, 128704],
    [127744, 129782]
  ];
  for (let i = 0; i < emojRange.length; i++) {
    let range = emojRange[i];
    for (let x = range[0]; x < range[1]; x++) {
      let e = document.createElement("span");
      e.innerHTML = "&#" + x + ";";
      e.addEventListener("click", function () {
        callback(e.textContent);
        console.log(e.textContent);
        div.remove();
      });
      div.appendChild(e);
    }
  }
  document.body.appendChild(div);
}
