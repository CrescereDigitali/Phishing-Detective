# Phishing Lab — Crescere Digitali (versione aggiornata)

Sito statico per la Lezione 3 del corso **CyberSecurity per ragazzi**.

## Giochi inclusi

1. Phishing Detective — con immagini realistiche
2. Real or Scam? — confronto visivo tra messaggi
3. Social Engineer Challenge — con contatori chiari scenario/domanda
4. Clicca i segnali — hotspot interattivi su 3 immagini

## Pubblicazione su GitHub Pages

1. Crea un repository GitHub nuovo o usa quello esistente.
2. Carica tutti i file nella root del repository, inclusa la cartella `assets`.
3. Vai in **Settings → Pages**.
4. In **Build and deployment**, scegli **Deploy from a branch**.
5. Seleziona branch `main` e cartella `/ (root)`.
6. Salva.

Non servono librerie esterne o backend.


## Versione 3
- Ripristinato il logo ufficiale Crescere Digitali.
- Immagini degli altri giochi: max 500 px e cliccabili per ingrandirle.
- Immagini del gioco hotspot: max 700 px e non apribili in popup.
- Corretto il conflitto tra zoom immagine e clic sugli hotspot.

## Versione 4
- Il gioco 4 usa vere aree cliccabili sovrapposte all'immagine: il link e gli altri indizi sono ora cliccabili in modo affidabile.
- Le X e le V restano temporanee.
- Nel gioco 2 le immagini non si aprono più in popup.

## Versione 6
- Nel gioco 4 aggiunto il pulsante “Chiedi aiuto”.
- Primo aiuto: suggerimento testuale senza rivelare il punto.
- Secondo aiuto: suggerimento più preciso + evidenziazione temporanea di un indizio non ancora trovato.
- Massimo 2 aiuti per immagine.

## Versione 7
- Dopo il completamento di tutti e 4 i giochi parte automaticamente un'animazione finale.
- Sequenza: hacker incappucciato → cappuccio sollevato → ragazzo normale → schermata finale "Bravo! Hai smascherato l'hacker!".
- L'animazione è realizzata direttamente in HTML/CSS/JavaScript e non richiede GIF o video.

## Versione 8
- Schermata iniziale con pulsante “Entra nel gioco”; al click si azzerano punteggi e risultati.
- Ogni gioco richiede almeno il 70% per essere superato.
- Card verde se superato, rossa se non superato.
- Missione finale disponibile solo quando tutti e 4 i giochi sono superati.
- Gioco 1: chiarito che possono esserci più indizi corretti e variato l'ordine delle risposte.
- Gioco 2: clic sull'immagine non seleziona più la risposta; si usa un pulsante dedicato.
- Gioco 3: distribuzione delle risposte corrette variata.
