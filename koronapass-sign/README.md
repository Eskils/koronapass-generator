# koronapass-sign

Backend til Koronapass generator. Er ansvarleg for validering og signering av kort. Tek imot liste over sjekksummar, sjekkar at alt er der og har korrekt sjekksum, og opprettar ein CMS-signatur med gyldige sertifikat

## Kom i gang

Krev ein backend som:

- Kan køyre shell-script
- Har `openssl` installert – testa på versjon 3.0.0 og 1.1.1f
- Har skrivetilgang til filsystemet

Koronapass generator nyttar Heroku.

Sett inn gyldige sertifikat og nøklar i `pkcs7`-format (`.pem`). Sertifikat/nøklar som skal vere til stades er:  

- certificate.pem   (Pass Type ID)
- wwdr.pem          (Apple Worldwide Developer Relations Certification Authority)
- key.pem           (Privat nøkkel)

Skriv inn korrekt passord til nøkkelen i `sign.sh`.

**Viktig:** Opprett mappene `keys` (til nøklar og sertifikat) og `files` (til manifest.json og signature).

**Start utviklarmiljø:**
```bash
npm install
export PORT=<Port som skal nyttast til lokal testing>
npm run start
```

## Korleis skaffe sertifikat og nøklar
Dette krev at ein har ein utviklarkonto hjå Apple.

- Gå til [Apple Developer](developer.apple.com) -> logg inn -> Certificates, Identifiers & Profiles
- Opprett ein *Identifier* av typen `Pass Type ID`
- Oppret eit *Certificate* av typen `Pass Type ID Certificate` med identifieren
- Last ned og opne sertifikatet i Nøkkelringtilgang, eksporter som `.p12` i ei tom mappe
- Bruk [passkit-keys](https://github.com/tinovyatkin/pass-js/blob/master/bin/passkit-keys) til å skaffe `wwdr.pem` og eit midlertidig sertifikat: `node passkit-keys.js <mappe med p12>`
- Lag to nye filer som skal bli til sertifikat og nøkkel henholdsvis: `touch certificate.pem key.pem`
- Opne filene i TextEdit saman med det midlertidige sertifikatet:
  - I `certificate.pem` lim inn frå det midlertidige mellom (inklusiv) `-BEGIN CERTIFICATE-` og `-END CERTIFICATE-`  
  - I `key.pem` lim inn frå det midlertidige mellom (inklusiv) `-BEGIN ENCRYPTED PRIVATE KEY-` og `-END ENCRYPTED PRIVATE KEY-`  

I tillegg må ein legge inn passordet til nøkkelen i `sign.sh`. Passordet vart satt under eksport av p12.
