# EDU-NUM · Number Playground

🇮🇹 Italiano · [🇬🇧 English](README.en.md)

**▶ Provalo online: <https://manzolo.github.io/NumberSimulator/?lang=it>**

Un percorso didattico interattivo per capire **come i computer rappresentano i
numeri — ogni bit, passo per passo**. Scrivi un piccolo comando; un motore
scritto a mano — niente librerie, nessuna dipendenza — lo esegue e **anima ogni
bit**: le celle si accendono coi loro pesi posizionali, il riporto scorre lungo
la somma, l'inverti-e-aggiungi-uno del complemento a due prende forma, i campi
segno/esponente/mantissa di un float IEEE 754 si colorano, un carattere diventa
i suoi byte UTF-8. Nello spirito del lab di crittografia della collana, dove si
guarda ogni byte trasformarsi: qui si guarda ogni bit nascere.

È un fratello della collana EDU-*, insieme a
[EDU-16 ASM Playground](https://github.com/manzolo/AssemblerSimulator),
[EDU-NET](https://github.com/manzolo/NetworkSimulator),
[EDU-REGEX](https://github.com/manzolo/RegexSimulator),
[EDU-SQL](https://github.com/manzolo/SqlSimulator),
[EDU-BRANCH](https://github.com/manzolo/GitBranchingSimulator),
[EDU-CRYPTO](https://github.com/manzolo/CryptoSimulator) e
[EDU-NN](https://github.com/manzolo/NeuralSimulator).

## Perché un motore scritto a mano

Possedere il motore è tutto il punto: le conversioni di base, la somma binaria
col riporto, il complemento a due, il floating point IEEE 754 (via `DataView`,
esattamente come li scrive l'hardware) e le codifiche ASCII/UTF-8 sono tutte in
`js/core/`, leggibili e **verificate nei test contro i built-in di JavaScript**
(`BigInt.toString`, `DataView`, `TextEncoder`). Il motore è deterministico:
stesso comando, stessi input ⇒ stessa trace. Emette un flusso di eventi neutri
rispetto alla lingua (una divisione, un bit posato, un riporto propagato, un
campo colorato) a cui la UI si iscrive: un tick = una micro-operazione, così
puoi guardare l'algoritmo al rallentatore o macinarlo in turbo.

## Curriculum

**Non serve alcun prerequisito**: alla prima visita si apre una guida
introduttiva ("Basi") che spiega da zero — con analogie e un esempio numerico —
cosa sono bit, byte, valore posizionale, complemento a due, virgola mobile e
codifiche. Resta sempre raggiungibile dal bottone in alto.

14 livelli guidati + una sandbox libera: valore posizionale · decimale→binario
(divisioni successive) · esadecimale e nibble · rileggere una base · somma
binaria e riporto · larghezza fissa e overflow · sottrazione · complemento a
due · aritmetica con segno · shift e maschere · frazioni in virgola fissa ·
IEEE 754 · codifica dei caratteri (ASCII/UTF-8) · capstone: il doppio a 64 bit
(perché 0.1 non finisce mai).

Ogni livello verifica il tuo comando su più numeri — alcuni mostrati, altri
**nascosti**: il comando fa riferimento agli input per nome (x, a, b…), quindi
una risposta con un valore cablato passa il caso visibile ma fallisce quelli
nascosti (anti-trucco).

## Avvio

Sito statico puro, moduli ES, **zero build, zero dipendenze**. Servi la cartella
con un qualsiasi server statico (i moduli ES non funzionano via `file://`):

```
npm run serve        # python3 -m http.server 8000
# apri http://localhost:8000
```

Deploy su GitHub Pages da `main`/root così com'è (`.nojekyll`, percorsi relativi).

## Sviluppo / test

```
npm test             # node --test — bits, motore, DSL, tutti i 14 livelli
npm run e2e          # smoke test headless su Chrome (avvia la UI, risolve due livelli)
```

Il core (`js/core/`) è completamente DOM-free e deterministico, quindi testabile
headless: lo stesso motore anima i passi e corregge la tua risposta.

## Licenza

MIT © Andrea Manzi (manzolo)
