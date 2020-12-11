import {
  json,
  opine,
  serveStatic,
} from "https://deno.land/x/opine@0.26.0/mod.ts";
import { dirname, join } from "https://deno.land/std@0.80.0/path/mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.9.3/mod.ts";
import { parse } from "https://deno.land/std@0.80.0/flags/mod.ts";
import { requests, resolve, Rete } from "./subnett.ts";

const { args } = Deno;
const app = opine();
const PORT = parseInt(parse(args).port ?? "80");
const __dirname = dirname(import.meta.url);

app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine(".ejs", renderFileToString);
app.use(json());
// app.use(urlencoded());
app.use(serveStatic(join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("home", { title: "Subnett | Home" });
});
app.get("/cli", (req, res) => {
  res.render("cli", { title: "Subnett | CLI" });
});
app.post("/cli", (req, res) => {
  if (req.parsedBody.index < 3) {
    res.json(
      {
        request: requests[req.parsedBody.index],
        type: req.parsedBody.index > 0 ? "number" : "text",
      },
    );
  } else {
    let n = +req.parsedBody.dati[2];
    if (req.parsedBody.dati.length < 3 + n * 2) {
      if (req.parsedBody.dati.length % 2 == 0) {
        res.json({ request: requests[4], type: "number" });
      } else {
        res.json({ request: requests[3] });
      }
    } else if (req.parsedBody.index < 4 + n * 2) {
      res.json({ request: requests[5], type: "number" });
    } else {
      let reti: Rete[] = [];
      for (let i = 0; i < n; i++) {
        reti.push({
          nome: req.parsedBody.dati[3 + i * 2],
          hosts: +req.parsedBody.dati[4 + i * 2],
        });
      }
      res.json({
        output: resolve({
          indirizzo_base: req.parsedBody.dati[0],
          bit_network: +req.parsedBody.dati[1],
          L: +req.parsedBody.dati[req.parsedBody.dati.length - 1],
          reti: reti,
        }),
        fine: true,
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
