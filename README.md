# Koronapass generator

Web app for å generere norsk koronapass-kort til Apple Lommebok. Vel bilete av QR-koden frå Helse Norge for å generere pass som kan leggast til i Apple Lommebok. Dette gjer koronapasset tilgjengeleg på låst skjerm ved å trykke to gonger på heim-knappen / side-knappen.

<https://koronapass.e-skils.com>

## Om

Koronapass generator gjer om QR-koden i det norske koronapasset til eit kort som du kan ha i Apple Lommebok / Apple Wallet for å enkelt få tilgang til det. Du kan nå kortet ved å trykke to gonger på heim-knappen / side-knappen. Kortet vert generert lokalt på eininga for å unngå å sende sensitiv helsedata til ein tjenar. Signering av kortet – som er nødvendig for at Apple Wallet skal kunne opne kortet – skjer på ein tjenar, men treng kun sjekksumen av innhaldet i kortet.

Denne repoen inneheld både backend (koronapass-sign) og frontend (resten av filene).

## Prosessen bak

Koronapass generator hentar ut all informasjon frå QR-koden og set saman eit Wallet-kort av typen `.pkpass` (MIME: `application/vnd.apple.pkpass`). Dette kortet er ei `.zip`-fil i forkledning med all informasjon og bilete saman med ei liste med sjekksummar til alle filene og ein digital CMS-signatur. Denne signaturen vert oppretta frå lista med sjekksummane og krev difor ikkje at helseinformasjonen vert sendt til tjenaren.

**På eininga:**

- Les QR-koden
- Hent ut informasjonen lagra i koden (namn, fødselsår, utløpsdato)
- Last ned alle komponentar som skal vere med i kortet (bilete, datamalar i JSON)
- Sett inn informasjon i datamalen til kortet
- Rekn ut SHA1-summen (sjekksum) til datamalen og legg inn i lista over sjekksummar
- Send lista med sjekksummar til tjenaren og motta CMS-signaturen
- Lag ei `.zip`-fil med alle komponentane og last ned som `.pkpass`

**På tjenaren:**

- Motta liste med sjekksummar
- Valider sjekksummar
- Bruk `openssl cms` til å lage ein signatur av lista med gyldige `pkcs7` sertifikat
- Send signaturen tilbale

## Kom i gang

Installer dependencies og start utviklarmiljø:

```bash
npm install
npm run dev
```

Bygg og deploy:

```bash
npm run build
cd public
vercel --prod
```

## Merknadar

 Dependency `base45` får ein feil under dekoding. Dette kan løysast ved å endre return frå `Buffer.from(res)` til `res` (node_modules/base45/lib/base45.js).  

Dersom ein bilderessurs i passet skal endrast må sjekksummane også oppdaterast. Både på frontend og backend. Sjekksummen til ei fil kan skaffast med:

```bash
openssl sha1 -hex -out /dev/stdout <sti til fil>
```

Backenden krev gyldege sertifikat og nøklar i `pkcs7`-format (`.pem`). Sertifikat/nøklar som skal vere til stades er:  

- certificate.pem   (Pass Type ID)
- wwdr.pem          (Apple Worldwide Developer Relations Certification Authority)
- key.pem           (Privat nøkkel)

## Credits

A huge thanks to [covidpass-org/covidpass](https://github.com/covidpass-org/covidpass) which helped a lot along the way—especially with regards to decoding the the QR-code.
