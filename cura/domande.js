/* Parametri della cura · DipintoSucci SRL
   Fonte unica: da qui leggono la pagina del cliente (cura.js) e il dizionario
   dello studio (genera_dizionario.js). Ogni domanda ha un codice di parametro,
   le opzioni hanno un valore; "0" vuol dire sempre "decidete voi".
   Le chiavi "se" accendono la domanda solo se il giardino ha quell'elemento
   (le elenca il link del cliente). Le risposte già decise con il cliente
   stanno nel suo link come "f": non si chiedono, ma entrano nei calcoli. */

var CURA = {};

CURA.versione = "1.2 · 17/11/2026";

/* Elementi e zone di serie, se il link del cliente non ne porta */
CURA.zoneDiSerie = ["Le aiuole", "Il prato", "Le siepi", "Il resto del giardino"];
CURA.aspettiDiSerie = ["Le piante", "I bordi", "La pulizia a fine lavori", "Preavvisi e comunicazione"];

CURA.passi = [
  {
    id: "A",
    titolo: "Com'è andata finora",
    intro: "Partiamo da com'è oggi, dal tuo punto di vista. Per ogni aspetto scegli quello che lo descrive meglio.",
    domande: [
      {
        id: "P01", tipo: "scala", per: "aspetti",
        parametro: "Gradimento per aspetto",
        testo: "Come lo trovi oggi?",
        opzioni: [
          { v: 1, t: "Da rivedere" }, { v: 2, t: "Non mi convince" }, { v: 3, t: "Accettabile" },
          { v: 4, t: "Bene" }, { v: 5, t: "Come lo volevo" }
        ],
        effetto: "Gli aspetti a 1 e 2 entrano nella sistemazione, prima di ogni altro lavoro. La media è l'indice di soddisfazione del cliente, da rimisurare a ogni stagione."
      },
      {
        id: "P02", tipo: "multi", max: 3, per: "aspetti",
        parametro: "Priorità di sistemazione",
        testo: "Quali ti stanno più a cuore? Partiamo da questi.",
        effetto: "Ordine dei lavori della sistemazione."
      },
      {
        id: "P03", tipo: "testo", facoltativa: true,
        parametro: "Nota libera",
        testo: "C'è qualcosa che vuoi dirci con parole tue?",
        segnaposto: "Scrivi pure com'è, anche in due righe",
        effetto: "Si legge prima dei parametri: se contraddice una risposta, vale la nota."
      }
    ]
  },
  {
    id: "B",
    titolo: "Il risultato che vuoi",
    intro: "Non tutte le zone chiedono la stessa attenzione. Per ognuna scegli il livello che senti tuo.",
    domande: [
      {
        id: "P10", tipo: "livello", per: "zone",
        parametro: "Livello di cura per zona",
        testo: "Che livello vuoi?",
        opzioni: [
          { v: 1, t: "Essenziale", d: "Piante sane e terra coperta. Qualche pianta che esce dal bordo e qualche foglia a terra vanno bene." },
          { v: 2, t: "Ordinato", d: "Bordi netti, terra o telo mai in vista, nessuna erbaccia visibile, siepi nella loro forma." },
          { v: 3, t: "Curato nel dettaglio", d: "Come Ordinato, in più foglie e residui tolti a ogni passaggio e controllo dell'acqua nei mesi caldi." },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "Decide i passaggi all'anno della zona e le operazioni di ogni passaggio (vedi regole R1 e R2)."
      },
      {
        id: "P47", tipo: "scelta", se: "prato",
        parametro: "Prato, sistemazione",
        testo: "Il prato, come lo vorresti?",
        opzioni: [
          { v: 1, t: "Lo rimettiamo in forma: arieggiatura, risemina dove è rado, concime" },
          { v: 2, t: "Lo rifacciamo a zolle dove è rovinato" },
          { v: 3, t: "Ne teniamo meno: dove soffre mettiamo piante che non chiedono il taglio" },
          { v: 4, t: "Va bene così" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "1: rigenerazione a settembre o a marzo, poi concimazione in primavera e in autunno. 2: zolle nella sistemazione, a preventivo. 3: riduzione del prato nella sistemazione, a preventivo. Criterio: prato fitto e uniforme, senza chiazze."
      },
      {
        id: "P48", tipo: "scelta", se: "prato",
        parametro: "Prato, taglio",
        testo: "Il taglio dell'erba:",
        opzioni: [
          { v: 1, t: "Lo faccio io" },
          { v: 2, t: "C'è un robot" },
          { v: 3, t: "Lo fate voi nei passaggi" }
        ],
        effetto: "1-2: altezza di taglio consigliata scritta nel programma. 3: taglio da aprile a ottobre, ogni due-tre settimane (R9)."
      },
      {
        id: "P25", tipo: "multi",
        parametro: "Momenti da preparare",
        testo: "Ci sono momenti dell'anno in cui il giardino deve dare il meglio?",
        opzioni: [
          { v: "pasqua", t: "Primavera, per Pasqua" },
          { v: "estate", t: "Inizio estate, per le cene fuori" },
          { v: "agosto", t: "Agosto" },
          { v: "feste", t: "Le feste di fine anno" },
          { v: "nessuno", t: "Nessuno in particolare" }
        ],
        effetto: "Un passaggio nelle due settimane prima di ogni momento indicato (R8)."
      }
    ]
  },
  {
    id: "C",
    titolo: "Il grado di dettaglio",
    intro: "Qui si fissano le tue misure: cosa ti disturba e cosa no, tra un nostro passaggio e l'altro.",
    domande: [
      {
        id: "P20", tipo: "scelta",
        parametro: "Tolleranza alla terra o al telo scoperti",
        testo: "Le piante giovani impiegano qualche mese a coprire. Nel frattempo, il telo o la terra che si vedono:",
        opzioni: [
          { v: 1, t: "Mi disturbano: preferisco più piante subito" },
          { v: 2, t: "Li accetto, se so entro quando si chiude" },
          { v: 3, t: "Non mi disturbano" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "1: si infittisce l'impianto (costo in più, da proporre). 2: si scrive nel programma la stagione in cui la copertura è chiusa. 3: nessuna azione."
      },
      {
        id: "P26", tipo: "scelta", se: "sostituzioni",
        parametro: "Piante da sostituire",
        testo: "Le piante che non sono partite o che soffrono:",
        opzioni: [
          { v: 1, t: "Le sostituiamo con la stessa pianta" },
          { v: 2, t: "Le sostituiamo con una più robusta, anche diversa" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "Sostituzioni nella sistemazione, a preventivo. 2: la pianta nuova la sceglie lo studio, con la stessa resa nel disegno. Prima di sostituire si cerca la causa (acqua, sole, animali)."
      },
      {
        id: "P21", tipo: "scelta",
        parametro: "Bordi",
        testo: "Lungo vialetti e muretti preferisci:",
        opzioni: [
          { v: 1, t: "Un bordo netto, rifilato" },
          { v: 2, t: "Un bordo morbido: le piante possono uscire un po'" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "1: rifilatura a ogni passaggio. 2: contenimento solo quando la pianta invade il passaggio."
      },
      {
        id: "P22", tipo: "scelta",
        parametro: "Tolleranza alle erbacce",
        testo: "Tra un passaggio e l'altro, qualche erbaccia:",
        opzioni: [
          { v: 1, t: "Non la voglio vedere" },
          { v: 2, t: "Ci sta, se poi si toglie" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "1 con livello 1: segnale, servono più passaggi o una pacciamatura più fitta. 2: diserbo manuale a ogni passaggio."
      },
      {
        id: "P23", tipo: "scelta",
        parametro: "Tolleranza a foglie e residui",
        testo: "Foglie secche e residui a terra:",
        opzioni: [
          { v: 1, t: "Via sempre" },
          { v: 2, t: "Fanno parte del giardino, basta che non si accumulino" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "1: raccolta a ogni passaggio, e in autunno un passaggio in più. 2: raccolta solo dove si accumulano."
      },
      {
        id: "P24", tipo: "multi",
        parametro: "Punti di vista",
        testo: "Da dove guardi il giardino più spesso?",
        opzioni: [
          { v: "cancello", t: "Dal cancello, quando entri" },
          { v: "vialetto", t: "Dal vialetto" },
          { v: "finestre", t: "Dalle finestre di casa" },
          { v: "esterno", t: "Dalla zona dove si sta seduti fuori" },
          { v: "strada", t: "Dalla strada" }
        ],
        effetto: "Diventano i punti da cui si verifica ogni criterio di riuscita (telo non visibile da..., nessuna erbaccia visibile da...). Le foto del rapporto si scattano da qui."
      }
    ]
  },
  {
    id: "D",
    titolo: "Le cose che devono funzionare",
    intro: "Il giardino deve essere bello, ma prima deve lasciarti vivere.",
    domande: [
      {
        id: "P30", tipo: "scelta", se: "pozzetti",
        parametro: "Pozzetti",
        testo: "I pozzetti nelle aiuole, come sono adesso?",
        opzioni: [
          { v: 1, t: "Vanno bene così" },
          { v: 2, t: "Sono da rivedere" }
        ],
        effetto: "2: si rivedono nella sistemazione, guardandoli insieme al primo passaggio. Sempre: il coperchio si apre senza tagliare nulla."
      },
      {
        id: "P32", tipo: "scelta", se: "pressostato",
        parametro: "Copertura del pressostato",
        testo: "Il pressostato lo copriamo con un sasso finto da sollevare quando serve?",
        opzioni: [
          { v: 1, t: "Sì" },
          { v: 2, t: "No, lo lascio a vista" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "1: fornitura e posa nella sistemazione."
      },
      {
        id: "P33", tipo: "scelta", se: "fotocellula",
        parametro: "Fotocellula del cancello",
        testo: "L'arbusto vicino alla fotocellula del cancello:",
        opzioni: [
          { v: 1, t: "Lo teniamo potato" },
          { v: 2, t: "Lo spostiamo" },
          { v: 3, t: "Lo sostituiamo con una pianta che resta più contenuta" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "1: contenimento a ogni passaggio, criterio: fotocellula libera tutto l'anno. 2-3: lavoro nella sistemazione, a preventivo."
      },
      {
        id: "P34", tipo: "scelta", se: "cane",
        parametro: "Animali nelle aiuole",
        testo: "{Cane} nelle aiuole:",
        opzioni: [
          { v: 1, t: "Ci passa e scava spesso" },
          { v: 2, t: "Ci passa ogni tanto" },
          { v: 3, t: "Non ci entra" }
        ],
        effetto: "1: niente sassi né ghiaia, piante robuste, controllo delle fallanze a ogni passaggio. 2: controllo stagionale. 1-2: vale la regola R7."
      },
      {
        id: "P36", tipo: "scelta", se: "cane",
        parametro: "Punti fissi per i bisogni",
        testo: "{Cane} ha dei punti preferiti nelle aiuole per fare pipì?",
        opzioni: [
          { v: 1, t: "Sì, quasi sempre gli stessi" },
          { v: 2, t: "No, cambia ogni volta" },
          { v: 0, t: "Non lo so" }
        ],
        effetto: "1: le piante in quei punti si controllano a ogni passaggio e si sostituiscono se bruciano; prima di cercare un difetto nell'impianto si guarda qui. Si chiede quali sono al primo passaggio."
      },
      {
        id: "P37", tipo: "multi", se: "cane",
        parametro: "Percorsi abituali dell'animale",
        testo: "Dove passa di solito {cane}?",
        opzioni: [
          { v: "recinzione", t: "Lungo la recinzione" },
          { v: "aiuole", t: "Attraverso le aiuole" },
          { v: "cancello", t: "Davanti al cancello" },
          { v: "vialetto", t: "Sul vialetto" }
        ],
        effetto: "Sui percorsi abituali non si mettono piante nuove: si lasciano liberi o si rinforzano, a preventivo. Criterio: nessuna pianta nuova sul suo passaggio."
      },
      {
        id: "P35", tipo: "scelta", se: "acqua",
        parametro: "Acqua dove non arriva l'impianto",
        testo: "Dove oggi non arriva l'irrigazione:",
        opzioni: [
          { v: 1, t: "Prolunghiamo l'impianto" },
          { v: 2, t: "Bagno io a mano nei mesi caldi" },
          { v: 3, t: "Bagnate voi nei passaggi d'estate" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "1: lavoro a preventivo. 2: calendario delle bagnature consegnato al cliente. 3: passaggi estivi in più (vedi R4)."
      },
      {
        id: "P38", tipo: "scelta", se: "sole",
        parametro: "Angolo troppo al sole",
        testo: "Per l'angolo dove il sole batte troppo, la strada che senti più tua:",
        opzioni: [
          { v: 1, t: "Un ombrellone: subito e senza lavori" },
          { v: 2, t: "Una vela ombreggiante" },
          { v: 3, t: "Un albero che faccia ombra negli anni" },
          { v: 4, t: "Una struttura fissa, tipo pergola" },
          { v: 0, t: "Proponetemi voi" }
        ],
        effetto: "1: fornitura con il programma. 2-4: soluzione nella sistemazione, a preventivo; 3 si mette a dimora tra novembre e marzo. 0: proposta dello studio dopo un sopralluogo nell'ora di sole peggiore."
      }
    ]
  },
  {
    id: "E",
    titolo: "Le piante grandi",
    intro: "Alberi e siepi cambiano la casa più di tutto il resto: qui decidi tu fin dove.",
    domande: [
      {
        id: "P40", tipo: "scelta", se: "ulivo",
        parametro: "Ulivo, contenimento",
        testo: "L'ulivo:",
        opzioni: [
          { v: 1, t: "Lo lasciamo com'è" },
          { v: 2, t: "Lo conteniamo un po', senza cambiarne la forma" },
          { v: 3, t: "Lo riduciamo in modo deciso" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "2: una potatura l'anno a fine inverno. 3: riduzione a fine inverno, poi contenimento annuale. Telo a terra durante il lavoro, residui portati via."
      },
      {
        id: "P42", tipo: "scelta", se: "siepe",
        parametro: "Siepe, altezza",
        testo: "La siepe, a che altezza la vuoi?",
        opzioni: [
          { v: 1, t: "Più bassa di adesso" },
          { v: 2, t: "Com'è adesso" },
          { v: 3, t: "Più alta, per stare più riparato" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "Criterio di riuscita del taglio: misura presa al primo passaggio e scritta nel rapporto."
      },
      {
        id: "P43", tipo: "scelta", se: "siepe",
        parametro: "Siepe, tagli all'anno",
        testo: "Quante volte la tagliamo?",
        opzioni: [
          { v: 1, t: "Una volta l'anno" },
          { v: 2, t: "Due volte" },
          { v: 3, t: "Tre volte, sempre in forma" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "Mesi dei tagli (vedi R3)."
      },
      {
        id: "P41", tipo: "scelta", se: "cocciniglia",
        parametro: "Siepe, cocciniglia",
        testo: "La cocciniglia sulla siepe è tornata più volte. D'ora in poi:",
        opzioni: [
          { v: 1, t: "Trattamenti programmati, prima che si veda" },
          { v: 2, t: "Controllo a ogni passaggio, trattamento solo se ricompare" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "1: trattamento a fine inverno e controllo con trattamento a fine primavera, quando escono le neanidi (R10). 2: controllo a ogni passaggio, trattamento a parte. Criterio: siepe senza cocciniglia visibile."
      },
      {
        id: "P44", tipo: "scelta", se: "cycas",
        parametro: "Cycas, polloni",
        testo: "I polloni della Cycas, i piccoli getti alla base:",
        opzioni: [
          { v: 1, t: "Li togliamo, il tronco deve vedersi" },
          { v: 2, t: "Li lasciamo" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "1: rimozione a fine inverno, senza ferire il fusto."
      },
      {
        id: "P45", tipo: "scelta", se: "cycas",
        parametro: "Cycas, forma",
        testo: "La Cycas la alziamo togliendo una corona di foglie in basso?",
        opzioni: [
          { v: 1, t: "Sì" },
          { v: 2, t: "No, la lascio così" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "1: nello stesso passaggio dei polloni."
      },
      {
        id: "P46", tipo: "scelta", se: "laterale",
        parametro: "Parte laterale",
        testo: "Nella parte laterale, tra cortecce, sassi e graminacee:",
        opzioni: [
          { v: 1, t: "Togliamo tutto e continuiamo la stessa copertura delle aiuole" },
          { v: 2, t: "Teniamo le graminacee, togliamo sassi e cortecce" },
          { v: 3, t: "Lasciamo com'è" },
          { v: 0, t: "Decidete voi" }
        ],
        effetto: "1-2: lavoro nella sistemazione, a preventivo."
      }
    ]
  },
  {
    id: "F",
    titolo: "Come lavoriamo da te",
    intro: "Le stesse cose fatte nel modo che preferisci tu: quando, come ti avvisiamo, cosa ti raccontiamo dopo.",
    domande: [
      {
        id: "P50", tipo: "scelta",
        parametro: "Preavviso",
        testo: "Prima di ogni intervento, con quanto anticipo ti avvisiamo?",
        opzioni: [ { v: 1, t: "Il giorno prima" }, { v: 3, t: "Tre giorni prima" }, { v: 7, t: "Una settimana prima" } ],
        effetto: "Giorni di preavviso scritti nel programma."
      },
      {
        id: "P51", tipo: "scelta",
        parametro: "Canale",
        testo: "Come preferisci essere avvisato?",
        opzioni: [ { v: 1, t: "WhatsApp" }, { v: 2, t: "Telefono" }, { v: 3, t: "Mail" } ],
        effetto: "Canale unico per avvisi e rapporti."
      },
      {
        id: "P52", tipo: "scelta",
        parametro: "Presenza",
        testo: "Durante i lavori vuoi esserci?",
        opzioni: [ { v: 1, t: "Sì, preferisco esserci" }, { v: 2, t: "Solo la prima volta" }, { v: 3, t: "Non serve" } ],
        effetto: "1: date fissate con te, non con l'operatore. 3: si lavora con l'accesso concordato."
      },
      {
        id: "P53", tipo: "scelta",
        parametro: "Fascia oraria",
        testo: "In che momento della giornata?",
        opzioni: [ { v: 1, t: "Mattina" }, { v: 2, t: "Pomeriggio" }, { v: 0, t: "Indifferente" } ],
        effetto: "Vincolo per la giornata di zona."
      },
      {
        id: "P54", tipo: "multi",
        parametro: "Giorni da evitare",
        testo: "Ci sono giorni da evitare?",
        opzioni: [
          { v: "lun", t: "Lunedì" }, { v: "mar", t: "Martedì" }, { v: "mer", t: "Mercoledì" },
          { v: "gio", t: "Giovedì" }, { v: "ven", t: "Venerdì" }, { v: "sab", t: "Sabato" }
        ],
        effetto: "Vincolo per la giornata di zona."
      },
      {
        id: "P55", tipo: "scelta",
        parametro: "Accesso",
        testo: "Per entrare:",
        opzioni: [ { v: 1, t: "C'è sempre qualcuno in casa" }, { v: 2, t: "Vi apro io quando arrivate" }, { v: 3, t: "Vi lascio le chiavi o il codice" } ],
        effetto: "2: orario d'arrivo esatto, comunicato il giorno prima."
      },
      {
        id: "P56", tipo: "scelta", se: "cane",
        parametro: "L'animale durante i lavori",
        testo: "{Cane}, mentre lavoriamo:",
        opzioni: [ { v: 1, t: "Lo tengo dentro io" }, { v: 2, t: "Può restare fuori, è tranquillo" }, { v: 3, t: "Chiedetemi ogni volta" } ],
        effetto: "Nota fissa per l'operatore."
      },
      {
        id: "P57", tipo: "scelta",
        parametro: "Rendiconto",
        testo: "Dopo ogni intervento ti mandiamo:",
        opzioni: [ { v: 1, t: "Le foto prima e dopo" }, { v: 2, t: "Due righe su cosa è stato fatto" }, { v: 3, t: "Niente, se è andato tutto bene" } ],
        effetto: "Il rapporto all'operatore parte comunque con le foto, dai punti di vista di P24; al cliente arriva nella forma scelta."
      },
      {
        id: "P58", tipo: "scelta",
        parametro: "Soglia di autonomia",
        testo: "Se in giardino notiamo un piccolo lavoro in più, utile da fare subito:",
        opzioni: [
          { v: 50, t: "Procedete fino a 50 euro e me lo scrivete" },
          { v: 100, t: "Procedete fino a 100 euro e me lo scrivete" },
          { v: 200, t: "Procedete fino a 200 euro e me lo scrivete" },
          { v: 1, t: "Chiedetemi sempre prima" }
        ],
        effetto: "Clausola del programma: sotto soglia si esegue e si scrive in giornata; sopra, costo prima."
      },
      {
        id: "P59", tipo: "scelta",
        parametro: "Continuità dell'operatore",
        testo: "Per te conta che venga sempre la stessa persona?",
        opzioni: [ { v: 1, t: "Sì, molto" }, { v: 2, t: "Non è importante" } ],
        effetto: "1: operatore fisso, sostituzioni solo annunciate."
      },
      {
        id: "P60", tipo: "scelta",
        parametro: "Avvisi stagionali",
        testo: "Ti è utile un avviso quando il meteo chiede qualcosa al giardino (caldo forte, gelate, temporali forti)?",
        opzioni: [ { v: 1, t: "Sì, con cosa fare" }, { v: 2, t: "No, solo per i lavori" } ],
        effetto: "1: il cliente entra negli avvisi della cura."
      }
    ]
  },
  {
    id: "G",
    titolo: "L'orizzonte",
    intro: "Ultime domande: fin dove vuoi che arriviamo, con quale misura, e come ti piacerebbe seguire il giardino.",
    domande: [
      {
        id: "P70", tipo: "scelta",
        parametro: "Perimetro",
        testo: "Da noi vorresti:",
        opzioni: [
          { v: 1, t: "Sistemare quello che non mi ha convinto, poi decido" },
          { v: 2, t: "Un programma per le zone di cui abbiamo parlato" },
          { v: 3, t: "Che vi prendiate cura di tutto il giardino" }
        ],
        effetto: "1: solo sistemazione, il programma si propone dopo. 2-3: programma annuale; 3 include le zone di serie."
      },
      {
        id: "P71", tipo: "scelta", facoltativa: true,
        parametro: "Misura annua di riferimento",
        testo: "Per la cura del giardino, una cifra annua che senti giusta:",
        opzioni: [
          { v: 1, t: "Fino a 500 euro" }, { v: 2, t: "Da 500 a 1.000 euro" },
          { v: 3, t: "Da 1.000 a 2.000 euro" }, { v: 4, t: "Oltre 2.000 euro" },
          { v: 0, t: "Preferisco ricevere una proposta" }
        ],
        effetto: "Confronto con il costo dei livelli scelti (R5): se non regge, si propone un livello sotto nelle zone meno viste."
      },
      {
        id: "P72", tipo: "scelta",
        parametro: "Interesse per l'app della cura",
        testo: "Se il tuo giardino avesse un'app che ti segnala quando serve qualcosa e ti tiene informato sugli interventi fatti e da fare, ti piacerebbe?",
        opzioni: [
          { v: 1, t: "Sì, mi piacerebbe" },
          { v: 2, t: "Forse, vorrei prima vederla" },
          { v: 3, t: "No, mi bastano messaggi e telefonate" }
        ],
        effetto: "1-2: si propone la cura con l'app insieme al programma. 3: avvisi e rapporti sul canale di P51."
      }
    ]
  }
];

/* Regole dello studio: dai parametri al programma. Valori proposti, da
   confermare con Domenico e con i tempi misurati in giardino. */
CURA.regole = {
  R1: {
    nome: "Passaggi all'anno per livello",
    testo: "Livello 1: 2 passaggi (marzo, settembre). Livello 2: 4 passaggi (marzo, maggio, luglio, ottobre). Livello 3: 8 passaggi (da marzo a ottobre, uno al mese).",
    mesi: { 1: [3, 9], 2: [3, 5, 7, 10], 3: [3, 4, 5, 6, 7, 8, 9, 10] }
  },
  R2: {
    nome: "Operazioni di ogni passaggio per livello",
    testo: "Livello 1: erbacce, controllo delle piante, contenimento dove invadono. Livello 2: in più rifilatura dei bordi, telo verificato e ricoperto, residui portati via. Livello 3: in più foglie raccolte e controllo dell'acqua da giugno ad agosto.",
    operazioni: {
      1: ["erbacce", "controllo delle piante e delle fallanze", "contenimento dove le piante invadono"],
      2: ["erbacce", "controllo delle piante e delle fallanze", "rifilatura dei bordi", "telo verificato e ricoperto", "residui portati via"],
      3: ["erbacce", "controllo delle piante e delle fallanze", "rifilatura dei bordi", "telo verificato e ricoperto", "residui portati via", "foglie raccolte", "controllo dell'acqua da giugno ad agosto"]
    }
  },
  R3: {
    nome: "Mesi dei tagli della siepe",
    testo: "Un taglio: settembre. Due: giugno e settembre. Tre: maggio, luglio, settembre.",
    mesi: { 1: [9], 2: [6, 9], 3: [5, 7, 9] }
  },
  R4: {
    nome: "Passaggi estivi per l'acqua",
    testo: "Se il cliente chiede a noi le bagnature (P35 = 3): un passaggio in più a giugno, luglio e agosto, oltre a quelli del livello.",
    mesi: [6, 7, 8]
  },
  R5: {
    nome: "Coerenza con la misura annua",
    testo: "Il costo del programma si calcola con i parametri dello studio (minuti per passaggio per livello, costo orario, ricarico, uscita minima). Se supera la fascia di P71, si propone il livello sotto nelle zone che non stanno nei punti di vista di P24."
  },
  R7: {
    nome: "Giardino con un animale",
    testo: "Se l'animale entra nelle aiuole (P34 = 1 o 2): solo concimi e trattamenti indicati come sicuri per gli animali domestici, nessuna esca per lumache, telo fermato con picchetti interrati e controllati a ogni passaggio, residui di potatura portati via il giorno stesso."
  },
  R8: {
    nome: "Momenti da preparare",
    testo: "Per ogni momento di P25, un passaggio nelle due settimane prima: Pasqua nel mese di Pasqua o in quello prima, inizio estate a giugno, agosto a fine luglio, feste di fine anno a dicembre.",
    mesi: { pasqua: 3, estate: 6, agosto: 7, feste: 12 }
  },
  R9: {
    nome: "Taglio del prato",
    testo: "Se il taglio lo fa lo studio (P48 = 3): da aprile a ottobre, un taglio ogni due-tre settimane, in giornate dedicate oltre ai passaggi del livello. Se lo fa il cliente o un robot: nel programma l'altezza di taglio consigliata per stagione.",
    mesi: [4, 5, 6, 7, 8, 9, 10]
  },
  R10: {
    nome: "Cocciniglia",
    testo: "Con P41 = 1: trattamento a fine inverno (febbraio), controllo e trattamento a fine primavera (maggio) sulle neanidi. Prodotti scelti caso per caso, sicuri per gli animali se vale R7.",
    mesi: [2, 5]
  },
  R6: {
    nome: "Decidete voi",
    testo: "Ogni risposta 0 si chiude con la scelta dello studio, scritta nel programma. Se le risposte 0 superano la metà, al cliente si manda una proposta unica, senza alternative."
  }
};

/* Le risposte "0" (decidete voi) vengono risolte così dallo studio,
   finché Domenico non decide altrimenti. */
CURA.sceltaDelloStudio = {
  P10: 2, P20: 2, P21: 1, P22: 2, P23: 2, P32: 1, P33: 1, P35: 2,
  P40: 2, P42: 2, P43: 2, P44: 1, P46: 1,
  P26: 2, P41: 1, P47: 1
};

if (typeof module !== "undefined") module.exports = CURA;
