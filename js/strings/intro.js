// The beginner's primer — "what you need to know BEFORE level 1", assuming
// zero prior knowledge. Shown automatically on the first visit and always
// available from the header. One {it, en} object, same tr() convention as
// the level content.

export const INTRO = {
  it: `
<p>Benvenuto! Questa pagina spiega <b>da zero</b> le idee che incontrerai nei
livelli. Non serve saper contare in binario: cinque minuti di lettura e sei
pronto. Puoi riaprirla quando vuoi dal bottone <b>Basi</b> in alto.</p>

<h3>Tutto è fatto di bit</h3>
<p>Dentro un computer c'è un solo tipo di informazione: il <b>bit</b>, un
interruttore che può stare <b>acceso (1)</b> o <b>spento (0)</b>. Non esiste
altro. Numeri, testo, immagini, suoni: sono <i>tutti</i> lunghe file di bit.
Otto bit in fila formano un <b>byte</b>. Questo laboratorio ti mostra, un bit
alla volta, come da quegli 0 e 1 nascono i numeri.</p>

<h3>Come i bit diventano un numero: il valore posizionale</h3>
<p>Nel nostro solito sistema (base 10) la cifra più a destra vale le unità,
poi le decine, poi le centinaia: ogni posizione vale <b>dieci volte</b> quella
alla sua destra. In <b>binario</b> (base 2) è identico, ma ogni posizione vale
solo il <b>doppio</b> della precedente: 1, 2, 4, 8, 16, 32, 64, 128…</p>
<p>Per leggere un numero binario, accendi i pesi dove c'è un 1 e somma:</p>
<pre>bit:    0   0   1   0   1   0   1   0
peso: 128  64  32  16   8   4   2   1
                 ↓       ↓       ↓
somma:          32  +    8  +    2       = 42</pre>
<p>Quindi <code>00101010</code> in binario è <b>42</b>. Tutto qui: leggere il
binario è solo sommare i pesi delle posizioni accese. È esattamente ciò che
farai al livello 1.</p>

<h3>L'esadecimale: un'abbreviazione comoda</h3>
<p>Otto bit sono scomodi da scrivere. Li si raggruppa a quattro (un
<b>nibble</b>) e ogni gruppo diventa <i>una</i> cifra <b>esadecimale</b> (base
16), che usa 0–9 e poi A–F per i valori 10–15. Così <code>00101010</code>
diventa <code>2A</code>: molto più corto, e ogni cifra hex corrisponde
esattamente a 4 bit.</p>

<h3>L'idea più importante: gli stessi bit, significati diversi</h3>
<p>Un byte da solo <b>non ha un significato</b>: dipende da come decidi di
leggerlo. Gli stessi otto bit <code>10101010</code> possono essere il numero
positivo 170, oppure il numero <b>negativo</b> −86 (col trucco del
<b>complemento a due</b>, il modo in cui i computer scrivono i numeri con
segno), oppure un pezzetto di un numero con la <b>virgola</b> (lo standard
<b>IEEE 754</b>), oppure una <b>lettera</b> (tramite una tabella come
l'<b>ASCII</b>). È l'<i>interpretazione</i> a dare senso ai bit — ed è il tema
che lega tutti i livelli, fino al capstone.</p>

<h3>Piccolo glossario</h3>
<table>
<tr><th>parola</th><th>in una frase</th></tr>
<tr><td><b>bit</b></td><td>l'unità minima: 0 o 1, acceso o spento</td></tr>
<tr><td><b>byte</b></td><td>otto bit in fila (valori da 0 a 255)</td></tr>
<tr><td><b>base</b></td><td>quanti simboli usa un sistema: 2 (binario), 8 (ottale), 10 (decimale), 16 (esadecimale)</td></tr>
<tr><td><b>valore posizionale</b></td><td>ogni posizione vale un peso; il valore è la somma dei pesi accesi</td></tr>
<tr><td><b>nibble</b></td><td>quattro bit = una cifra esadecimale — livello 3</td></tr>
<tr><td><b>riporto</b></td><td>quando una somma di bit sfora e "riporta" 1 alla posizione successiva — livello 5</td></tr>
<tr><td><b>overflow</b></td><td>quando il risultato non ci sta nella larghezza fissata e "gira" — livello 6</td></tr>
<tr><td><b>complemento a due</b></td><td>il modo standard di rappresentare i numeri negativi — livello 8</td></tr>
<tr><td><b>virgola mobile / IEEE 754</b></td><td>come si scrivono i numeri con la virgola in bit — livello 12</td></tr>
<tr><td><b>ASCII / UTF-8</b></td><td>tabelle che associano bit a caratteri — livello 13</td></tr>
</table>

<h3>Come si usa il laboratorio</h3>
<p>In ogni livello: leggi la lezione a sinistra, scrivi un piccolo comando (per
esempio <code>to bin x</code> o <code>add a b</code>), premi <b>Esegui</b>. La
<b>griglia dei bit</b> si anima passo per passo: le celle si accendono, i
riporti scorrono, i campi segno/esponente/mantissa si colorano. Con lo slider
porti la velocità fino al <b>turbo</b>; col bottone <b>Passo</b> avanzi di una
micro-operazione alla volta. Se ti blocchi ci sono i <b>suggerimenti</b>, uno
alla volta.</p>
<p>La verifica prova il tuo comando su più numeri, alcuni <b>nascosti</b>:
passano le soluzioni vere, non le risposte cablate. E non puoi rompere niente:
<b>Reset</b> riporta sempre il comando di partenza. Buon viaggio nel binario!</p>`,

  en: `
<p>Welcome! This page explains <b>from zero</b> the ideas you will meet in the
levels. You do not need to know how to count in binary: five minutes of reading
and you are ready. You can reopen it anytime from the <b>Basics</b> button in
the header.</p>

<h3>Everything is made of bits</h3>
<p>Inside a computer there is only one kind of information: the <b>bit</b>, a
switch that can be <b>on (1)</b> or <b>off (0)</b>. Nothing else. Numbers, text,
images, sound: they are <i>all</i> long rows of bits. Eight bits in a row make
a <b>byte</b>. This lab shows you, one bit at a time, how numbers arise from
those 0s and 1s.</p>

<h3>How bits become a number: place value</h3>
<p>In our usual system (base 10) the rightmost digit counts units, then tens,
then hundreds: each position is worth <b>ten times</b> the one to its right. In
<b>binary</b> (base 2) it is identical, but each position is worth just
<b>double</b> the previous one: 1, 2, 4, 8, 16, 32, 64, 128…</p>
<p>To read a binary number, switch on the weights where there is a 1 and add:</p>
<pre>bit:    0   0   1   0   1   0   1   0
weight:128  64  32  16   8   4   2   1
                 ↓       ↓       ↓
sum:            32  +    8  +    2       = 42</pre>
<p>So <code>00101010</code> in binary is <b>42</b>. That is all there is to it:
reading binary is just adding the weights of the switched-on positions. It is
exactly what you will do in level 1.</p>

<h3>Hexadecimal: a handy shorthand</h3>
<p>Eight bits are awkward to write. We group them in fours (a <b>nibble</b>) and
each group becomes <i>one</i> <b>hexadecimal</b> digit (base 16), which uses 0–9
and then A–F for the values 10–15. So <code>00101010</code> becomes
<code>2A</code>: much shorter, and each hex digit maps to exactly 4 bits.</p>

<h3>The most important idea: same bits, different meanings</h3>
<p>A byte on its own <b>has no meaning</b>: it depends on how you decide to read
it. The same eight bits <code>10101010</code> can be the positive number 170, or
the <b>negative</b> number −86 (via the <b>two's complement</b> trick, the way
computers write signed numbers), or part of a number with a <b>fractional
point</b> (the <b>IEEE 754</b> standard), or a <b>letter</b> (through a table
like <b>ASCII</b>). It is the <i>interpretation</i> that gives bits meaning —
and it is the thread running through every level, up to the capstone.</p>

<h3>A small glossary</h3>
<table>
<tr><th>word</th><th>in one sentence</th></tr>
<tr><td><b>bit</b></td><td>the smallest unit: 0 or 1, off or on</td></tr>
<tr><td><b>byte</b></td><td>eight bits in a row (values 0 to 255)</td></tr>
<tr><td><b>base</b></td><td>how many symbols a system uses: 2 (binary), 8 (octal), 10 (decimal), 16 (hex)</td></tr>
<tr><td><b>place value</b></td><td>each position carries a weight; the value is the sum of the switched-on weights</td></tr>
<tr><td><b>nibble</b></td><td>four bits = one hex digit — level 3</td></tr>
<tr><td><b>carry</b></td><td>when a sum of bits overflows and "carries" 1 to the next position — level 5</td></tr>
<tr><td><b>overflow</b></td><td>when the result does not fit the fixed width and "wraps around" — level 6</td></tr>
<tr><td><b>two's complement</b></td><td>the standard way to represent negative numbers — level 8</td></tr>
<tr><td><b>floating point / IEEE 754</b></td><td>how numbers with a fractional point are written in bits — level 12</td></tr>
<tr><td><b>ASCII / UTF-8</b></td><td>tables that map bits to characters — level 13</td></tr>
</table>

<h3>How to use the lab</h3>
<p>In every level: read the lesson on the left, write a small command (for
example <code>to bin x</code> or <code>add a b</code>), press <b>Run</b>. The
<b>bit grid</b> animates step by step: cells light up, carries ripple, the
sign/exponent/mantissa fields colour in. The slider goes all the way to
<b>turbo</b>; the <b>Step</b> button advances one micro-operation at a time. If
you get stuck there are <b>hints</b>, one at a time.</p>
<p>Verification tries your command on several numbers, some of them
<b>hidden</b>: real solutions pass, hardcoded answers do not. And you cannot
break anything: <b>Reset</b> always brings the starter command back. Enjoy the
trip into binary!</p>`,
};
