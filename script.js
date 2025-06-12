function startOptions(grid, callback) {
  let modal = document.createElement("div");
  modal.classList.add("intro");

  let greet_p = document.createElement("p");
  greet_p.appendChild(document.createTextNode("hi welcome to emojraw! ⍢"));

  let pixelsize = document.createElement("input");
  pixelsize.name = "pixelsize";
  pixelsize.classList.add("pixelsize");
  pixelsize.value = "30";

  let pixelsize_label = document.createElement("label");
  pixelsize_label.appendChild(document.createTextNode("pixel size: "));

  let rows = document.createElement("input");
  rows.name = "rows";
  rows.classList.add("rows");
  rows.value = "auto";

  let rows_label = document.createElement("label");
  rows_label.appendChild(document.createTextNode("rows: "));

  let cols = document.createElement("input");
  cols.name = "cols";
  cols.classList.add("cols");
  cols.value = "auto";

  let cols_label = document.createElement("label");
  let cols_label_txt = document.createTextNode("cols: ");
  cols_label.appendChild(cols_label_txt);

  let start = document.createElement("button");
  start.addEventListener("click", function () {
    let old_data = grid.data;
    let old_width = grid.width;

    if (rows.value != "auto") {
      grid.height = parseInt(rows.value);
    } else if (rows.value == "auto") {
      grid.height = parseInt(window.innerHeight / pixelsize.value) - 2;
    }

    if (cols.value != "auto") {
      grid.width = parseInt(cols.value);
    } else if (cols.value == "auto") {
      grid.width = parseInt(window.innerWidth / pixelsize.value) - 1;
    }
    grid.data = [];
    for (let i = 0; i < grid.height * grid.width; ++i) {
      grid.data.push(" ");
    }

    for (let i = 0; i < grid.height; ++i) {
      for (let j = 0; j < grid.width; ++j) {
        grid.data[i * grid.width + j] = old_data[i * old_width + j];
      }
    }
    grid.pixelsize = parseInt(pixelsize.value);
    callback(grid);
    var divdivs = document.querySelectorAll("body > div > div");
    for (let x = 0; x < divdivs.length; x++) {
      divdivs[x].style.height = parseInt(pixelsize.value) + "px";
    }
    modal.remove();
  });
  start.appendChild(document.createTextNode("start"));

  modal.appendChild(greet_p);
  modal.appendChild(pixelsize_label);
  modal.appendChild(pixelsize);
  modal.appendChild(document.createElement("br"));
  modal.appendChild(rows_label);
  modal.appendChild(rows);
  modal.appendChild(document.createElement("br"));

  modal.appendChild(cols_label);
  modal.appendChild(cols);

  modal.appendChild(document.createElement("br"));
  modal.appendChild(start);
  document.body.appendChild(modal);
}

let emojis = [];
let emoji_usage = {};
function use(emoji) {
  if (!(emoji in emoji_usage)) {
    emoji_usage[emoji] = 0;
  }
  emoji_usage[emoji]++;
  emojis = emojis.sort(function (a, b) {
    let a_v = 0;
    let b_v = 0;
    if (a.emoji in emoji_usage) {
      a_v = emoji_usage[a.emoji];
    }
    if (b.emoji in emoji_usage) {
      b_v = emoji_usage[b.emoji];
    }
    return b_v - a_v;
  });
}

function selectEmoji(callback) {
  let div = document.createElement("div");
  div.classList.toggle("select");

  let search = document.createElement("input");
  search.placeholder = "search";
  search.setAttribute("autocomplete", "off");
  search.setAttribute("autocorrect", "off");
  search.setAttribute("autocapitalize", "off");
  search.setAttribute("spellcheck", false);
  let pruned_emojis = emojis;
  let emoji_container = document.createElement("div");

  function refresh_emoji_list() {
    emoji_container.innerHTML = "";
    function addEmoji(html) {
      let e = document.createElement("span");
      e.innerHTML = html;
      e.addEventListener("click", function () {
        callback(e.textContent);
        use(e.textContent);
        div.remove();
      });
      emoji_container.appendChild(e);
    }
    addEmoji("&nbsp;");
    for (let emoji of pruned_emojis) {
      addEmoji(emoji.html);
    }
  }

  search.addEventListener("keydown", function (e) {
    if (e.code == "Escape") {
      callback(e.textContent);
      div.remove();
    }
    if (search.value) {
      pruned_emojis = [];
      for (let e of emojis) {
        if (e.name.includes(search.value.toLowerCase())) {
          pruned_emojis.push(e);
        }
      }
    } else {
      pruned_emojis = emojis;
      // console.log(pruned_emojis)
    }
    refresh_emoji_list();
  });

  refresh_emoji_list();

  div.appendChild(search);
  div.appendChild(document.createElement("br"));
  div.appendChild(emoji_container);

  document.body.appendChild(div);
  search.focus();
}

function base64encode(str) {
  return LZString.compressToBase64(str);
}

function base64decode(str) {
  return LZString.decompressFromBase64(str);
}

window.addEventListener("load", function () {
  {
    let oReq = new XMLHttpRequest();

    oReq.onload = function (e) {
      emojis = JSON.parse(oReq.responseText).emojis;
      // console.log(emojis)
    };
    oReq.open("GET", "/emoji.json");
    oReq.send();
  }
  {
    let oReq = new XMLHttpRequest();
    // just to check on # of hits :)
    oReq.open("GET", "https://jott.live/raw/emojraw");
    oReq.send();
  }

  let pre = document.querySelector("div");
  const s = document.createElement("span");
  s.textContent = "X";
  pre.appendChild(s);
  const rect = s.getBoundingClientRect();
  // console.log(rect);
  s.remove();

  const height = parseInt(window.innerHeight / rect.height) - 2;
  const width = parseInt(window.innerWidth / rect.width) - 1;
  let grid = { height: height, pixelsize: 30, width: width, data: [] };

  for (let i = 0; i < height * width; ++i) {
    grid.data.push(" ");
  }

  if (window.location.hash) {
    let h = window.location.hash;
    grid = JSON.parse(base64decode(h.slice(1)));
    let w = parseInt(window.innerHeight / (grid.height + 2));
    w = Math.min(w, parseInt(window.innerWidth / (grid.width + 1)));
    if (w < grid.pixelsize) {
      grid.pixelsize = w;
    }
    window.location.hash = "";
  }

  let emoji = "😀";

  // captures isDrawing
  let isDrawing = false;
  function setupSpans(grid, draw_callback) {
    let pre = document.querySelector("div");
    let spans = [];
    for (let i = 0; i < grid.height; ++i) {
      let div = document.createElement("div");
      for (let j = 0; j < grid.width; ++j) {
        const span = document.createElement("span");
        if (j == 0) {
          span.style.boxShadow = "-1px 0 black, 0 -1px black, 1px 0 black";
        }
        if (i == grid.height - 1) {
          span.style.boxShadow = "0 -1px black, 1px 0 black, 1px 1px black";
        }
        if (j == 0 && i == grid.height - 1) {
          span.style.boxShadow =
            "black 0px -1px, black 1px 0px, black 1px 1px, black 0px 1px, black -1px 0, black -1px -1px";
        }
        // else if ()
        span.textContent = grid.data[i * grid.width + j];
        span.setAttribute("data-pos", i + "," + j);
        function start(e) {
          isDrawing = true;
          draw_callback(grid, spans, i, j);
        }
        function move(e) {
          if (isDrawing) {
            draw_callback(grid, spans, i, j);
          }
        }

        function end(e) {
          isDrawing = false;
        }

        span.style.height = grid.pixelsize + "px";
        span.style.width = grid.pixelsize + "px";
        span.style.fontSize = grid.pixelsize - 4 + "px";
        span.style.lineHeight = grid.pixelsize + 3 + "px";

        span.addEventListener("pointerdown", start);
        span.addEventListener("pointerover", move);
        span.addEventListener("pointerup", end);
        span.addEventListener("touchstart", start);
        span.addEventListener("touchmove", function (e) {
          let el = document.elementFromPoint(e.pageX, e.pageY);
          let pos = el.getAttribute("data-pos").split(",");
          if (isDrawing) {
            draw_callback(grid, spans, parseInt(pos[0]), parseInt(pos[1]));
          }
        });
        span.addEventListener("touchend", end);

        div.appendChild(span);
        spans.push(span);
      }
      pre.appendChild(div);
    }
  }

  let fill_on = false;
  function renderSpan(grid, spans, i, j, last = []) {
    for (let l of last) {
      if (l[0] == i && l[1] == j) {
        return;
      }
    }
    let idx = i * grid.width + j;
    let curr = spans[idx].textContent;
    spans[idx].textContent = emoji;
    grid.data[idx] = emoji;
    let other = function (di, dj) {
      if (i + di < 0 || i + di >= grid.height) {
        return;
      }
      if (j + dj < 0 || j + dj >= grid.width) {
        return;
      }
      const o_idx = (i + di) * grid.width + j + dj;
      if (spans[o_idx].textContent == curr) {
        last.push([i, j]);
        renderSpan(grid, spans, i + di, j + dj, last);
      }
    };
    if (fill_on) {
      other(-1, 0);
      other(0, -1);
      other(0, 1);
      other(1, 0);
    }
  }
  setupSpans(grid, renderSpan);

  let is_open = false;
  function selectEmojiLocal() {
    if (is_open) {
      return;
    }
    selectEmoji(function (e) {
      if (e) {
        emoji = e;
      }
      is_open = false;
    });
    is_open = true;
  }
  function setOptionsLocal() {
    // startOptions(grid, function(grid) {
    //   pre.innerHTML = "";
    //   setupSpans(grid, renderSpan);
    // });
  }
  window.addEventListener("keydown", function (e) {
    if (e.code == "KeyF") {
      fill_on = true;
    }
  });
  window.addEventListener("keyup", function (e) {
    if (e.code == "KeyN") {
      selectEmojiLocal();
    } else if (e.code == "KeyQ") {
      setOptionsLocal();
    }
    if (e.code == "KeyF") {
      fill_on = false;
    }
  });

  document
    .getElementById("select_emoji")
    .addEventListener("click", selectEmojiLocal);
  document.getElementById("options").addEventListener("click", setOptionsLocal);
  let fill = document.getElementById("fill");
  fill.addEventListener("click", function () {
    if (fill_on === false) {
      fill_on = true;
      fill.style.fontWeight = "bold";
      fill.textContent = "stop filling";
    } else {
      fill_on = false;
      fill.style.fontWeight = "normal";
      fill.textContent = "fill";
    }
  });

  document.getElementById("copy").addEventListener("click", function () {
    let ta = document.createElement("textarea");
    document.body.appendChild(ta);
    for (let i = 0; i < grid.height; ++i) {
      for (let j = 0; j < grid.width; ++j) {
        let c = grid.data[i * grid.width + j];
        ta.value += c.replace(" ", "⬜");
      }
      ta.value += "\n";
    }
    ta.select();
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    ta.remove();
    alert("copied as text to clipboard!");
  });

  document.getElementById("share").addEventListener("click", function () {
    let url = window.location.origin + "#" + base64encode(JSON.stringify(grid));
    let ta = document.createElement("textarea");
    document.body.appendChild(ta);
    ta.value = url;
    ta.select();
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    ta.remove();
    alert("copied URL to clipboard!");
  });

  return;
});
