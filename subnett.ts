import { assert } from "https://deno.land/std@0.79.0/_util/assert.ts";

class IPv4 {
  private _base: number = 0;
  public get base(): number {
    return this._base;
  }
  public set base(v: number) {
    this._base = v;
  }
  private _bits: number = 0;
  public get bits(): number {
    return this._bits;
  }
  public set bits(v: number) {
    this._bits = v;
  }

  constructor(s: number | string, n: number) {
    this.base = typeof s === "string" ? this.from_string(s) : s;
    this.bits = n;
  }
  private from_string(s: string): number {
    let tmp: string = "",
      index: number = 3,
      res: number = 0;
    for (let i = 0; i < s.length; i++) {
      if (48 <= s.charCodeAt(i) && s.charCodeAt(i) <= 58) {
        tmp += s[i];
      } else if (tmp.length > 0) {
        assert(index < 4 && index >= 0, "La stringa non è corretta");
        res += +tmp * 2 ** (index * 8);
        tmp = "";
        index--;
      }
    }
    if (tmp.length > 0) {
      assert(index < 4 && index >= 0, "La stringa non è corretta");
      res += +tmp * 2 ** (index * 8);
    }
    return res;
  }
  public str(fine: boolean = true) {
    let res: string = "";
    for (let i = 3; i > 0; i--) {
      res += ((this.base / (2 ** (i * 8))) & 0xFF).toString();
      res += ".";
    }
    res += (this.base & 0xFF).toString();
    if (fine) res += "/" + this.bits;
    return res;
  }
  public bin(fine: boolean = false) {
    let pad = (n: string, d: number): string => {
      while (n.length < d) n = "0" + n;
      return n;
    };
    let _bin = (n: number): string => {
      if (n <= 0) return "0";
      let res: string[] = [];
      while (n > 0) {
        res.push((n % 2).toString());
        n = Math.round((n - (n % 2)) / 2);
      }
      return res.reverse().join("");
    };
    let res: string = "";
    for (let i = 3; i > 0; i--) {
      res += pad(_bin((this.base / (2 ** (i * 8))) & 0xFF), 8);
      res += ".";
    }
    res += pad(_bin(this.base & 0xFF), 8);
    if (fine) res += "/" + this.bits;
    return res;
  }
}

type Rete = {
  nome: string;
  hosts: number;
};

type Input = {
  indirizzo_base: string;
  bit_network: number;
  reti: Rete[];
  L: number;
};

function resolve(args: Input): string {
  args.reti.sort((a, b) => a.hosts - b.hosts);
  args.reti.forEach((element) => {
    element.nome = element.nome.toUpperCase();
  });
  args.reti = args.reti.reverse();
  let res: string = "";
  let ind = new IPv4(args.indirizzo_base, 0).base;
  args.reti.forEach((rete) => {
    let indirizzi = rete.hosts + 3, bits = Math.ceil(Math.log2(indirizzi));
    res +=
      `\nRete ${rete.nome}: ${rete.hosts} hosts -> ${indirizzi} indirizzi -> ${bits} bits\n`;
    let netmask: IPv4 = new IPv4(0xFFFFFFFF - (2 ** bits - 1), 0);
    let broadcast: IPv4 = new IPv4(ind + 2 ** bits - 1, 0x20 - bits);
    res += `- Indirizzo di rete: ${new IPv4(ind, 0x20 - bits).str()} (${
      new IPv4(ind, 0x20 - bits).bin()
    })\n`;
    res += `- Netmask: ${netmask.str(false)} (${netmask.bin()})\n`;
    res +=
      `- Indirizzo di broadcast: ${broadcast.str()} (${broadcast.bin()})\n`;
    res += `- Range: ${new IPv4(ind + 1, 0x20 - bits).str()} <-> ${
      new IPv4(broadcast.base - 1, 0x20 - bits).str()
    } (${broadcast.base - ind - 1})\n`;
    ind += 2 ** bits;
  });
  for (let i = 1; i <= args.L; i++) {
    let bits = 2;
    res += `\nLink ${i}: 2 routers -> 4 indirizzi -> 2 bits\n`;
    let netmask: IPv4 = new IPv4(0xFFFFFFFF - (2 ** bits - 1), 0);
    let broadcast: IPv4 = new IPv4(ind + 2 ** bits - 1, 0x20 - bits);
    res += `- Indirizzo di rete: ${new IPv4(ind, 0x20 - bits).str()} (${
      new IPv4(ind, 0x20 - bits).bin()
    })\n`;
    res += `- Netmask: ${netmask.str(false)} (${netmask.bin()})\n`;
    res +=
      `- Indirizzo di broadcast: ${broadcast.str()} (${broadcast.bin()})\n`;
    res += `- Range: ${new IPv4(ind + 1, 0x20 - bits).str()} <-> ${
      new IPv4(broadcast.base - 1, 0x20 - bits).str()
    } (${broadcast.base - ind - 1})\n`;
    ind += 2 ** bits;
  }
  res += `\nIndirizzi inutilizzati: ${new IPv4(ind, 0).str(false)} <-> ${
    new IPv4(
      new IPv4(args.indirizzo_base, 0).base + 2 ** (0x20 - args.bit_network) -
        1,
      0,
    ).str(false)
  } (${new IPv4(args.indirizzo_base, 0).base + 2 ** (0x20 - args.bit_network) -
    ind})`;
  return res;
}

const requests: string[] = [
  "Inserisci l'indirizzo di rete principale: ",
  "Inserisci il numero di bit dedicati a network: ",
  "Inserisci il numero di sottoreti: ",
  "Inserisci il nome della sottorete: ",
  "Inserisci il numero di hosts: ",
  "Inserisci il numero di links: ",
];

export { requests, resolve };
export type { Rete };
