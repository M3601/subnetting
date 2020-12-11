function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function write(msg, t = 50) {
  return new Promise(async (resolve) => {
    let last = document.querySelector(".main").children;
    last = last[last.length - 1];
    let m = document.createElement("text");
    last.appendChild(m);
    for (const letter of msg) {
      m.textContent += letter;
      await sleep(letter == " " ? 10 : t);
    }
    resolve();
  });
}
async function user_input(type = "text") {
  return new Promise((resolve) => {
    let active = document.querySelector(".line.active");
    let input = document.createElement("input");
    input.setAttribute("type", type);
    input.setAttribute("spellcheck", false);
    active.appendChild(input);
    let focus_end = () => {
      input.click();
      input.focus();
      let val = input.value;
      input.value = "";
      input.value = val;
    };
    let res = undefined;
    focus_end();
    document.querySelector(".main").addEventListener("click", () => {
      focus_end();
    });
    input.addEventListener("click", () => {
      focus_end();
    });
    input.addEventListener("input", (e) => {
      if (input.value.length == 0) input.style.width = "1px";
      else input.style.width = input.value.length + 0.5 + "ch";
    });
    input.addEventListener("keyup", (e) => {
      if (e.keyCode == 13 || e.keyCode == 10) {
        resolve(input.value);
        input.blur();
        input = null;
      }
    });
  });
}
async function enter(bash = false) {
  return new Promise((resolve) => {
    try {
      document.querySelector(".line.active").classList.remove("active");
    } catch (error) {}
    let newl = document.createElement("div");
    newl.classList.add("line");
    newl.classList.add("active");
    if (bash) newl.classList.add("bash");
    document.querySelector(".main").appendChild(newl);
    document.querySelector(".main").scrollTop = document.querySelector(
      ".main"
    ).scrollHeight;
    resolve();
  });
}
async function rewrite() {
  let last = document.querySelector(".main").children;
  last = last[last.length - 1];
  last.remove();
  await enter();
}
async function loading(res) {
  let last = document.querySelector(".main").children;
  last = last[last.length - 1];
  let m = document.createElement("load");
  last.appendChild(m);
  write("Loading...");
  return await res();
}
(async () => {
  let i = 0;
  let res = {};
  let dati = [];
  await write("./subnett");
  await enter();
  while (res.fine != true) {
    await loading(async () => {
      res = await fetch("/cli", {
        body: JSON.stringify({
          index: i,
          dati: dati,
        }),
        method: "POST",
        headers: {
          "content-type": "application/json; charset=UTF-8",
        },
      }).then((val) => val.json());
    });
    await rewrite();
    if (res.output) {
      let texts = res.output.split("\n");
      for (let i = 0; i < texts.length; i++) {
        await write(texts[i], 0);
        await enter();
      }
    }
    if (res.request) {
      await write(res.request);
      dati.push(await user_input(res.type ? res.type : "text"));
      await enter();
    }
    i++;
  }
  document.querySelector(".line.active").classList.remove("active");
})();
