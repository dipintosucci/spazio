/* La cura del tuo giardino · pagina del cliente e lettura dello studio.
   Nessun dato esce dal telefono finché il cliente non preme "Manda":
   le risposte viaggiano nel link (#r=...), mai su un server. */
(function () {
  "use strict";

  var IMPRONTA = "0e3236bfff3e162aa2a1f5adbbc5739ef4b4b9c25db928584baaa7469611e756";
  var $ = function (id) { return document.getElementById(id); };
  var main = $("contenuto");

  /* ------------------------------------------------------------ utilità */
  function el(tag, attr, figli) {
    var n = document.createElement(tag);
    if (attr) for (var k in attr) {
      if (k === "testo") n.textContent = attr[k];
      else if (k === "classe") n.className = attr[k];
      else n.setAttribute(k, attr[k]);
    }
    (figli || []).forEach(function (f) { if (f) n.appendChild(typeof f === "string" ? document.createTextNode(f) : f); });
    return n;
  }
  function b64urlDaByte(u8) {
    var s = ""; for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function byteDaB64url(t) {
    t = t.replace(/-/g, "+").replace(/_/g, "/"); while (t.length % 4) t += "=";
    var s = atob(t), u8 = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i);
    return u8;
  }
  function codifica(obj) {
    var dati = new TextEncoder().encode(JSON.stringify(obj));
    if (typeof CompressionStream === "undefined") return Promise.resolve("j." + b64urlDaByte(dati));
    var flusso = new Blob([dati]).stream().pipeThrough(new CompressionStream("deflate-raw"));
    return new Response(flusso).arrayBuffer().then(function (ab) { return "z." + b64urlDaByte(new Uint8Array(ab)); });
  }
  function decodifica(t) {
    var tipo = t.slice(0, 2), u8 = byteDaB64url(t.slice(2));
    if (tipo === "j.") return Promise.resolve(JSON.parse(new TextDecoder().decode(u8)));
    var flusso = new Blob([u8]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Response(flusso).text().then(JSON.parse);
  }
  function leggiHash() {
    var h = {}; location.hash.replace(/^#/, "").split("&").forEach(function (p) {
      var i = p.indexOf("="); if (i > 0) h[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1));
    });
    return h;
  }
  function memoria(chiave, valore) {
    try {
      if (valore === undefined) return JSON.parse(localStorage.getItem(chiave) || "null");
      localStorage.setItem(chiave, JSON.stringify(valore));
    } catch (e) { return null; }
  }
  function sha256(t) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)).then(function (ab) {
      return Array.prototype.map.call(new Uint8Array(ab), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  }

  /* ------------------------------------------------------------ configurazione */
  var conf = { n: "", z: CURA.zoneDiSerie, a: CURA.aspettiDiSerie, e: [], t: "", m: "" };
  var risposte = {};
  var chiaveMemoria = "cura-risposte";
  var indice = -1; // -1 copertina, 0..n-1 passi, n riepilogo, n+1 inviato

  function domandeAttive(passo) {
    return passo.domande.filter(function (d) { return (!d.se || conf.e.indexOf(d.se) >= 0) && (conf.x || []).indexOf(d.id) < 0 && !(conf.f && conf.f[d.id] !== undefined); });
  }
  function passiAttivi() {
    return CURA.passi.filter(function (p) { return domandeAttive(p).length; });
  }
  function personalizza() {
    var n = conf.c || "";
    var t = JSON.stringify(CURA.passi).replace(/\{Cane\}/g, n || "Il cane").replace(/\{cane\}/g, n || "il cane");
    CURA.passi = JSON.parse(t);
  }
  function voci(d) { return d.per === "zone" ? conf.z : d.per === "aspetti" ? conf.a : null; }

  /* ------------------------------------------------------------ compilazione */
  function salva() { memoria(chiaveMemoria, { r: risposte, i: indice }); }

  function bottone(testo, scelto, alClick, sotto, classe) {
    var b = el("button", { type: "button", classe: "opz" + (classe ? " " + classe : ""), "aria-pressed": scelto ? "true" : "false" }, [testo]);
    if (sotto) b.appendChild(el("small", { testo: sotto }));
    b.addEventListener("click", alClick);
    return b;
  }

  function disegnaDomanda(d) {
    var box = el("section", { classe: "domanda" });
    var elenco = voci(d);
    if (d.tipo === "scala") {
      box.appendChild(el("h3", { testo: d.testo }));
      risposte[d.id] = risposte[d.id] || {};
      elenco.forEach(function (voce, i) {
        var riga = el("div", { classe: "riga" }, [el("p", { classe: "nome", testo: voce })]);
        var griglia = el("div", { classe: "scala" });
        d.opzioni.forEach(function (o) {
          griglia.appendChild(bottone(o.t, risposte[d.id][i] === o.v, function () {
            risposte[d.id][i] = risposte[d.id][i] === o.v ? undefined : o.v; salva(); ridisegna();
          }));
        });
        riga.appendChild(griglia); box.appendChild(riga);
      });
    } else if (d.tipo === "livello") {
      box.appendChild(el("h3", { testo: "I tre livelli" }));
      var spiega = el("div", { classe: "livelli" });
      d.opzioni.filter(function (o) { return o.d; }).forEach(function (o) {
        spiega.appendChild(el("div", null, [el("b", { testo: o.t }), el("span", { testo: o.d })]));
      });
      box.appendChild(spiega);
      risposte[d.id] = risposte[d.id] || {};
      elenco.forEach(function (zona, i) {
        var riga = el("div", { classe: "riga" }, [el("p", { classe: "nome", testo: zona })]);
        var seg = el("div", { classe: "seg" });
        d.opzioni.forEach(function (o) {
          seg.appendChild(bottone(o.t, risposte[d.id][i] === o.v, function () {
            risposte[d.id][i] = risposte[d.id][i] === o.v ? undefined : o.v; salva(); ridisegna();
          }, null, o.v === 0 ? "delega" : ""));
        });
        riga.appendChild(seg); box.appendChild(riga);
      });
    } else if (d.tipo === "multi") {
      box.appendChild(el("h3", { testo: d.testo }));
      var lista = d.opzioni || elenco.map(function (v, i) { return { v: i, t: v }; });
      var scelte = risposte[d.id] || [];
      var chips = el("div", { classe: "chips" });
      lista.forEach(function (o) {
        var dentro = scelte.indexOf(o.v) >= 0;
        chips.appendChild(bottone(o.t, dentro, function () {
          var s = (risposte[d.id] || []).slice(), k = s.indexOf(o.v);
          if (k >= 0) s.splice(k, 1); else { if (d.max && s.length >= d.max) s.shift(); s.push(o.v); }
          risposte[d.id] = s; salva(); ridisegna();
        }));
      });
      box.appendChild(chips);
      if (d.max) box.appendChild(el("p", { classe: "nota", testo: "Al massimo " + d.max + "." }));
    } else if (d.tipo === "testo") {
      box.appendChild(el("h3", { testo: d.testo }));
      var area = el("textarea", { placeholder: d.segnaposto || "", maxlength: "1200" });
      area.value = risposte[d.id] || "";
      area.addEventListener("input", function () { risposte[d.id] = area.value; salva(); });
      box.appendChild(area);
    } else {
      box.appendChild(el("h3", { testo: d.testo }));
      var opz = el("div", { classe: "opzioni" });
      d.opzioni.forEach(function (o) {
        opz.appendChild(bottone(o.t, risposte[d.id] === o.v, function () {
          risposte[d.id] = risposte[d.id] === o.v ? undefined : o.v; salva(); ridisegna();
        }, null, o.v === 0 ? "delega" : ""));
      });
      box.appendChild(opz);
    }
    if (d.facoltativa) box.appendChild(el("p", { classe: "nota", testo: "Facoltativa." }));
    if (conf.p && conf.p[d.id] !== undefined) box.appendChild(el("p", { classe: "nota", testo: conf.pn || "Abbiamo segnato quello che ci avevi detto: se è cambiato, cambialo." }));
    return box;
  }

  function scrollSu() { window.scrollTo({ top: 0, behavior: "smooth" }); }

  function copertina() {
    $("passo").textContent = "";
    var nome = conf.n ? conf.n + ", il" : "Il";
    main.appendChild(el("div", { classe: "copertina" }, [
      el("p", { classe: "etichetta", testo: "La cura del giardino" }),
      el("h1", { testo: nome + " tuo giardino, come lo vuoi tu" }),
      el("p", { testo: "Ci servono le tue misure, non le nostre: cosa ti aspetti da ogni zona, quanto dettaglio, come preferisci che lavoriamo. Da qui costruiamo il programma degli interventi." }),
      el("p", { testo: "Rispondi quando vuoi e con calma. Le risposte restano su questo telefono finché non decidi tu di mandarcele, e puoi fermarti e riprendere in qualsiasi momento. Dove non hai una preferenza, scegli «Decidete voi»: è una risposta utile quanto le altre." }),
      el("div", { classe: "righe" }, [
        el("div", { testo: "Circa 10 minuti" }),
        el("div", { testo: passiAttivi().length + " passi, quasi tutte risposte da toccare" }),
        el("div", { testo: "Nessuna risposta è obbligatoria" })
      ])
    ]));
    $("avanti").textContent = memoria(chiaveMemoria) ? "Riprendi" : "Inizia";
    $("indietro").hidden = true;
  }

  function passo(i) {
    var p = passiAttivi()[i];
    $("passo").textContent = (i + 1) + " di " + passiAttivi().length;
    main.appendChild(el("p", { classe: "etichetta", testo: "Passo " + (i + 1) }));
    main.appendChild(el("h2", { testo: p.titolo }));
    main.appendChild(el("p", { classe: "intro", testo: p.intro }));
    domandeAttive(p).forEach(function (d) { main.appendChild(disegnaDomanda(d)); });
    $("avanti").textContent = "Avanti";
    $("indietro").hidden = false;
  }

  function testoRisposta(d, v) {
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) return null;
    var elenco = voci(d);
    var trova = function (x) { var o = (d.opzioni || []).filter(function (o) { return o.v === x; })[0]; return o ? o.t : String(x); };
    if (d.tipo === "scala" || d.tipo === "livello") {
      var righe = elenco.map(function (voce, i) { return v[i] === undefined ? null : voce + ": " + trova(v[i]); }).filter(Boolean);
      return righe.length ? righe.join(" · ") : null;
    }
    if (d.tipo === "multi") return v.map(function (x) { return d.opzioni ? trova(x) : elenco[x]; }).join(", ");
    if (d.tipo === "testo") return v;
    return trova(v);
  }

  function riepilogo() {
    $("passo").textContent = "Riepilogo";
    main.appendChild(el("p", { classe: "etichetta", testo: "Ultimo passo" }));
    main.appendChild(el("h2", { testo: "Le tue risposte" }));
    main.appendChild(el("p", { classe: "intro", testo: "Rileggile con calma: con «Indietro» cambi quello che vuoi. Quando ti tornano, mandacele." }));
    var dl = el("dl", { classe: "riepilogo" }), vuote = 0;
    passiAttivi().forEach(function (p) {
      domandeAttive(p).forEach(function (d) {
        var t = testoRisposta(d, risposte[d.id]);
        if (!t) { if (!d.facoltativa) vuote++; return; }
        dl.appendChild(el("dt", { testo: d.parametro }));
        dl.appendChild(el("dd", { testo: t }));
      });
    });
    if (vuote) main.appendChild(el("p", { classe: "avviso", testo: vuote === 1 ? "Una domanda è rimasta senza risposta: va bene così, se preferisci." : vuote + " domande sono rimaste senza risposta: va bene così, se preferisci." }));
    main.appendChild(dl);
    $("avanti").textContent = conf.t ? "Manda su WhatsApp" : "Manda";
    $("indietro").hidden = false;
    if (conf.m && conf.t) {
      var viaMail = el("p", { classe: "nota" });
      var a = el("a", { href: "#", testo: "Preferisci la mail? Mandala da qui." });
      a.addEventListener("click", function (ev) { ev.preventDefault(); manda("mail"); });
      viaMail.appendChild(a); main.appendChild(viaMail);
    }
  }

  function manda(canale) {
    if (window.CURA_ANTEPRIMA) { indice = passiAttivi().length; salva(); vistaStudio(); return; }
    var pacco = { v: 1, k: conf, r: risposte, d: new Date().toISOString().slice(0, 10) };
    codifica(pacco).then(function (t) {
      var link = location.origin + location.pathname + "#r=" + t;
      var testo = "Ciao Domenico, ecco le mie risposte sulla cura del giardino: " + link;
      indice = passiAttivi().length + 1; salva();
      if (canale === "mail" || (!conf.t && conf.m)) {
        location.href = "mailto:" + conf.m + "?subject=" + encodeURIComponent("La cura del giardino, le mie risposte") + "&body=" + encodeURIComponent(testo);
      } else if (conf.t) {
        location.href = "https://wa.me/" + conf.t + "?text=" + encodeURIComponent(testo);
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(testo);
      }
      ridisegna();
    });
  }

  function inviato() {
    $("passo").textContent = "";
    $("avanzamento").style.width = "100%";
    main.appendChild(el("p", { classe: "etichetta", testo: "Grazie" }));
    main.appendChild(el("h2", { testo: "Le tue risposte sono pronte" }));
    main.appendChild(el("p", { testo: "Se il messaggio non è partito, premi di nuovo «Manda»: le risposte sono ancora qui. Con queste misure ti prepariamo il programma degli interventi." }));
    $("avanti").textContent = "Manda di nuovo";
    $("indietro").hidden = false;
  }

  function ridisegna() {
    var y = window.scrollY;
    main.textContent = "";
    var n = passiAttivi().length;
    $("avanzamento").style.width = indice < 0 ? "0" : Math.min(100, ((indice + 1) / (n + 1)) * 100) + "%";
    if (indice < 0) copertina();
    else if (indice < n) passo(indice);
    else if (indice === n) riepilogo();
    else inviato();
    window.scrollTo(0, y);
  }

  function avviaCompilazione() {
    personalizza();
    var salvato = memoria(chiaveMemoria);
    if (salvato && salvato.r) risposte = salvato.r;
    else if (conf.p) risposte = JSON.parse(JSON.stringify(conf.p));
    $("avanti").addEventListener("click", function () {
      var n = passiAttivi().length;
      if (indice >= n) { manda(); return; }
      if (indice < 0 && salvato && typeof salvato.i === "number" && salvato.i >= 0) indice = Math.min(salvato.i, n);
      else indice++;
      salva(); ridisegna(); scrollSu();
    });
    $("indietro").addEventListener("click", function () {
      var n = passiAttivi().length;
      indice = indice > n ? n : indice - 1; salva(); ridisegna(); scrollSu();
    });
    ridisegna();
  }

  /* ------------------------------------------------------------ lettura dello studio */
  var MESI = ["", "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

  function tutteLeDomande() {
    var out = []; CURA.passi.forEach(function (p) { domandeAttive(p).forEach(function (d) { out.push(d); }); }); return out;
  }
  function valore(id) {
    var v = risposte[id];
    if (v === 0 && CURA.sceltaDelloStudio[id] !== undefined) return CURA.sceltaDelloStudio[id];
    return v;
  }

  function calcola() {
    if (conf.f) Object.keys(conf.f).forEach(function (k) { risposte[k] = conf.f[k]; });
    var D = {}; tutteLeDomande().forEach(function (d) { D[d.id] = d; });
    var pv = (risposte.P24 || []).map(function (x) { return { cancello: "cancello", vialetto: "vialetto", finestre: "finestre di casa", esterno: "zona dove si sta seduti", strada: "strada" }[x]; });
    var daPV = pv.length ? pv.join(", ") : "[punti di vista da fissare]";

    // indici
    var scala = risposte.P01 || {}, somma = 0, num = 0;
    Object.keys(scala).forEach(function (k) { if (typeof scala[k] === "number") { somma += scala[k]; num++; } });
    var soddisf = num ? (somma / num) : null;
    var scelteTot = 0, deleghe = 0, risposte_ = 0, totali = 0;
    tutteLeDomande().forEach(function (d) {
      if (d.facoltativa) return;
      totali++;
      var v = risposte[d.id];
      var piena = !(v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length) || (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).filter(function (k) { return v[k] !== undefined && v[k] !== null; }).length));
      if (piena) risposte_++;
      if (d.tipo === "scelta" && d.opzioni.some(function (o) { return o.v === 0; }) && v !== undefined) { scelteTot++; if (v === 0) deleghe++; }
      if (d.tipo === "livello" && v) Object.keys(v).forEach(function (k) { if (v[k] !== undefined) { scelteTot++; if (v[k] === 0) deleghe++; } });
    });

    // programma per mese
    var mesi = {}; for (var m = 1; m <= 12; m++) mesi[m] = [];
    var livelli = risposte.P10 || {}, passaggiAnno = 0;
    conf.z.forEach(function (zona, i) {
      var L = livelli[i] === 0 ? CURA.sceltaDelloStudio.P10 : livelli[i];
      if (!L) return;
      CURA.regole.R1.mesi[L].forEach(function (mm) { mesi[mm].push(zona + ", livello " + L); });
      passaggiAnno = Math.max(passaggiAnno, CURA.regole.R1.mesi[L].length);
    });
    var tagli = valore("P43"); if (tagli) CURA.regole.R3.mesi[tagli].forEach(function (mm) { mesi[mm].push("taglio della siepe"); });
    var ulivo = valore("P40"); if (ulivo === 2) mesi[2].push("potatura di contenimento dell'ulivo"); if (ulivo === 3) mesi[2].push("riduzione dell'ulivo");
    if (valore("P44") === 1 || valore("P45") === 1) mesi[2].push("Cycas: polloni e corona di foglie");
    if (valore("P35") === 3) CURA.regole.R4.mesi.forEach(function (mm) { mesi[mm].push("bagnatura"); });
    if (valore("P23") === 1) mesi[11].push("raccolta delle foglie");
    (risposte.P25 || []).forEach(function (k) { var mm = CURA.regole.R8.mesi[k]; if (mm) mesi[mm].push("passaggio prima di: " + k); });
    if (valore("P33") === 1) [5, 9].forEach(function (mm) { mesi[mm].push("arbusto della fotocellula"); });
    var uscite = Object.keys(mesi).filter(function (k) { return mesi[k].length; }).length;

    // sistemazione
    var sist = [], prio = risposte.P02 || [];
    prio.forEach(function (i) { sist.push(conf.a[i] + " (priorità indicata)"); });
    conf.a.forEach(function (a, i) { if (scala[i] <= 2 && prio.indexOf(i) < 0) sist.push(a + " (giudizio " + scala[i] + " su 5)"); });
    if (valore("P20") === 1) sist.push("infittire l'impianto dove il telo resta scoperto, a preventivo");
    if (valore("P32") === 1) sist.push("sasso finto sul pressostato");
    if (valore("P33") === 2) sist.push("spostare l'arbusto della fotocellula, a preventivo");
    if (valore("P33") === 3) sist.push("sostituire l'arbusto della fotocellula con una pianta più contenuta, a preventivo");
    if (valore("P35") === 1) sist.push("prolungare l'impianto d'irrigazione, a preventivo");
    if (valore("P46") === 1) sist.push("parte laterale: togliere tutto e continuare la copertura, a preventivo");
    if (valore("P46") === 2) sist.push("parte laterale: togliere sassi e cortecce, tenere le graminacee, a preventivo");
    if (valore("P30") === 2) sist.push("pozzetti da rivedere: si guardano insieme al primo passaggio");
    var cane = conf.c || "l'animale";
    if (risposte.P34 === 1 || risposte.P34 === 2) sist.push("picchetti del telo interrati e verificati uno per uno (" + cane + ")");
    if ((risposte.P37 || []).length) sist.push("percorsi di " + cane + " (" + risposte.P37.join(", ") + "): niente piante nuove, liberi o rinforzati, a preventivo");

    // criteri di riuscita
    var crit = [];
    crit.push("Telo o terra non visibili da: " + daPV + (valore("P20") === 2 ? "; copertura chiusa entro la stagione indicata nel programma" : ""));
    if (valore("P21") === 1) crit.push("Bordi netti, rifilati a ogni passaggio");
    if (valore("P21") === 2) crit.push("Bordi morbidi: si contiene solo dove la pianta invade il passaggio");
    if (valore("P22") === 1) crit.push("Nessuna erbaccia visibile da: " + daPV + ", in nessun momento dell'anno");
    if (valore("P22") === 2) crit.push("Nessuna erbaccia dopo ogni passaggio");
    if (valore("P23") === 1) crit.push("Foglie e residui tolti a ogni passaggio");
    if (risposte.P30 !== undefined) crit.push("Coperchi dei pozzetti apribili senza tagliare nulla");
    if (valore("P33") === 1) crit.push("Fotocellula del cancello libera tutto l'anno");
    if (valore("P35") === 2) crit.push("Dove l'impianto non arriva bagna il cliente: calendario delle bagnature consegnato con il programma");
    var alt = valore("P42"); if (alt) crit.push("Siepe " + ["", "più bassa di oggi", "all'altezza di oggi", "più alta di oggi"][alt] + ": misura presa al primo passaggio e scritta nel rapporto");
    if (valore("P44") === 1) crit.push("Cycas: tronco libero alla vista, nessun pollone");
    if (risposte.P34 === 1 || risposte.P34 === 2) crit.push("Con " + cane + " in giardino: solo prodotti sicuri per gli animali, nessuna esca per lumache, nessun picchetto in vista, residui portati via in giornata (R7)");
    if ((risposte.P37 || []).length) crit.push("Nessuna pianta nuova sui percorsi di " + cane);
    crit.push("Foto del rapporto scattate da: " + daPV);

    // segnali per Domenico
    var seg = [];
    if (risposte.P03) seg.push("C'è una nota libera: si legge prima dei parametri.");
    if (soddisf !== null && soddisf < 3) seg.push("Soddisfazione sotto la sufficienza (" + soddisf.toFixed(1) + " su 5): prima la sistemazione, poi ogni altro discorso.");
    var minL = Math.min.apply(null, conf.z.map(function (z, i) { return livelli[i] === 0 ? CURA.sceltaDelloStudio.P10 : (livelli[i] || 9); }));
    if (valore("P22") === 1 && minL === 1) seg.push("Vuole zero erbacce ma ha zone a livello Essenziale: va spiegato o va alzato il livello.");
    if (risposte.P71 === 1 && passaggiAnno >= 4) seg.push("Misura annua fino a 500 euro con un programma da " + passaggiAnno + " passaggi: verificare con R5.");
    if (scelteTot && deleghe / scelteTot > 0.5) seg.push("Più della metà delle scelte delegate: proposta unica, senza alternative (R6).");
    if (risposte.P36 === 1) seg.push("Punti fissi per la pipì di " + cane + ": possibile causa delle piante sofferenti, da controllare prima di attribuirla a chi ha piantato.");
    if (risposte.P52 === 1) seg.push("Vuole esserci: le date si fissano con lui, non con l'operatore.");
    if (risposte.P70 === 1) seg.push("Per ora chiede solo la sistemazione: il programma si propone dopo.");
    if (risposte.P58 === 1) seg.push("Nessuna autonomia: ogni lavoro in più va chiesto prima.");
    if (risposte.P59 === 1) seg.push("Conta la continuità dell'operatore.");
    if (risposte.P72 === 1) seg.push("Gli piacerebbe l'app della cura: proporla con il programma.");
    if (risposte.P72 === 2) seg.push("Curioso dell'app della cura: fargliela vedere prima di proporla.");

    return {
      soddisf: soddisf, delega: scelteTot ? deleghe / scelteTot : null, completezza: totali ? risposte_ / totali : null,
      mesi: mesi, uscite: uscite, sist: sist, crit: crit, seg: seg
    };
  }

  function tabella(intest, righe) {
    var t = el("table", { classe: "tab" });
    t.appendChild(el("tr", null, intest.map(function (h) { return el("th", { testo: h }); })));
    righe.forEach(function (r) {
      t.appendChild(el("tr", null, r.map(function (c, i) {
        var td = el("td", { testo: c === null ? "non risposto" : c });
        if (i === 0) td.className = "cod"; if (c === null) td.className = "vuoto";
        return td;
      })));
    });
    return t;
  }

  function lettura(pacco) {
    $("comandi").hidden = true;
    $("passo").textContent = "Lettura dello studio";
    $("avanzamento").style.width = "100%";
    var c = calcola();
    main.appendChild(el("p", { classe: "etichetta", testo: "Parametri della cura · " + (pacco.d || "") }));
    main.appendChild(el("h2", { testo: conf.n || "Cliente" }));
    var pc = function (x) { return x === null ? "–" : Math.round(x * 100) + "%"; };
    main.appendChild(el("div", { classe: "indici" }, [
      el("div", null, [el("b", { testo: c.soddisf === null ? "–" : c.soddisf.toFixed(1) }), el("span", { testo: "soddisfazione su 5" })]),
      el("div", null, [el("b", { testo: pc(c.delega) }), el("span", { testo: "scelte delegate a noi" })]),
      el("div", null, [el("b", { testo: pc(c.completezza) }), el("span", { testo: "domande con risposta" })])
    ]));
    if (risposte.P03) { main.appendChild(el("h3", { testo: "Con parole sue" })); main.appendChild(el("p", { classe: "citazione", testo: risposte.P03 })); }
    if (c.seg.length) { main.appendChild(el("h3", { testo: "Segnali" })); main.appendChild(el("ul", { classe: "segnali" }, c.seg.map(function (s) { return el("li", { testo: s }); }))); }
    main.appendChild(el("h3", { testo: "Sistemazione, prima di tutto" }));
    main.appendChild(c.sist.length ? el("ul", { classe: "segnali" }, c.sist.map(function (s) { return el("li", { testo: s }); })) : el("p", { classe: "nota", testo: "Nessun punto segnalato." }));
    main.appendChild(el("h3", { testo: "Criteri di riuscita" }));
    main.appendChild(el("ul", { classe: "segnali" }, c.crit.map(function (s) { return el("li", { testo: s }); })));
    main.appendChild(el("h3", { testo: "Programma proposto (" + c.uscite + " uscite)" }));
    var righeMesi = []; for (var m = 1; m <= 12; m++) if (c.mesi[m].length) righeMesi.push([MESI[m], c.mesi[m].join("; ")]);
    main.appendChild(tabella(["Mese", "Interventi"], righeMesi));
    main.appendChild(el("h3", { testo: "Tutti i parametri" }));
    var righe = tutteLeDomande().map(function (d) {
      var t = testoRisposta(d, risposte[d.id]);
      if (t && risposte[d.id] === 0 && CURA.sceltaDelloStudio[d.id] !== undefined) {
        var s = d.opzioni.filter(function (o) { return o.v === CURA.sceltaDelloStudio[d.id]; })[0];
        t += " → " + (s ? s.t : "");
      }
      return [d.id, d.parametro, t];
    });
    if (conf.f) CURA.passi.forEach(function (p) { p.domande.forEach(function (d) {
      if (conf.f[d.id] !== undefined) righe.push([d.id, d.parametro, (testoRisposta(d, conf.f[d.id]) || String(conf.f[d.id])) + " (già deciso)"]);
    }); });
    main.appendChild(tabella(["Cod.", "Parametro", "Valore"], righe));
    var bott = el("button", { type: "button", classe: "btn", testo: "Copia i parametri per l'archivio" });
    bott.addEventListener("click", function () {
      var out = { cliente: conf.n, data: pacco.d, versione: CURA.versione, zone: conf.z, aspetti: conf.a, elementi: conf.e, parametri: risposte };
      navigator.clipboard.writeText(JSON.stringify(out, null, 1)).then(function () { bott.textContent = "Copiati"; });
    });
    main.appendChild(bott);
  }

  function grazieCliente() {
    $("comandi").hidden = true; $("passo").textContent = "";
    main.appendChild(el("p", { classe: "etichetta", testo: "La cura del giardino" }));
    main.appendChild(el("h2", { testo: "Risposte ricevute" }));
    main.appendChild(el("p", { testo: "Con queste misure prepariamo il programma degli interventi." }));
  }

  /* ------------------------------------------------------------ anteprima per lo studio */
  function vistaStudio(esempio) {
    if (esempio) risposte = JSON.parse(JSON.stringify(esempio));
    main.textContent = ""; window.scrollTo(0, 0);
    lettura({ d: new Date().toISOString().slice(0, 10) });
    var torna = el("button", { type: "button", classe: "btn chiaro", testo: "Torna alle domande" });
    torna.style.marginTop = "10px"; torna.style.width = "100%";
    torna.addEventListener("click", vistaCliente);
    main.appendChild(torna);
  }
  function vistaCliente() {
    var salvato = memoria(chiaveMemoria);
    risposte = (salvato && salvato.r) || (conf.p ? JSON.parse(JSON.stringify(conf.p)) : {});
    $("comandi").hidden = false; indice = -1; ridisegna(); window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------ avvio */
  var h = window.CURA_ANTEPRIMA ? {} : leggiHash();
  if (window.CURA_ANTEPRIMA) {
    conf = Object.assign(conf, window.CURA_ANTEPRIMA.conf); chiaveMemoria = "cura-anteprima";
    window.CURA_vistaStudio = function () { vistaStudio(window.CURA_ANTEPRIMA.esempio); };
    window.CURA_vistaCliente = vistaCliente;
    avviaCompilazione();
  } else {
  window.addEventListener("hashchange", function () { location.reload(); });
  if (h.chiave) {
    sha256(h.chiave).then(function (x) {
      if (x === IMPRONTA) memoria("cura-studio", x);
      history.replaceState(null, "", location.pathname);
      main.appendChild(el("p", { testo: x === IMPRONTA ? "Questo telefono ora apre le risposte dei clienti." : "Chiave non valida." }));
      $("comandi").hidden = true;
    });
  } else if (h.r) {
    decodifica(h.r).then(function (pacco) {
      conf = Object.assign(conf, pacco.k || {}); risposte = pacco.r || {}; personalizza();
      if (memoria("cura-studio") === IMPRONTA) lettura(pacco); else grazieCliente();
    }).catch(function () { main.appendChild(el("p", { testo: "Il link non è completo." })); $("comandi").hidden = true; });
  } else {
    var prosegui = function () { avviaCompilazione(); };
    if (h.k) {
      decodifica(h.k).then(function (k) {
        conf = Object.assign(conf, k); chiaveMemoria = "cura-risposte-" + h.k.slice(-12); prosegui();
      }).catch(prosegui);
    } else prosegui();
  }
  }
})();
