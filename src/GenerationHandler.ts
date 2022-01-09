import CryptoJS from "crypto-js";
import type { Koronasertifikat } from "./Koronasertifikat";
import JSZip  from "jszip";

function calculateSHA(str: string): string {
    //CryptoJS.enc.Utf8.parse(file)
        const words = CryptoJS.SHA1(str);
        const hex = CryptoJS.enc.Hex.stringify(words);
        return hex;
}

async function signManifest(manifest: string): Promise<Blob> {//Promise<Blob> {
    let APIRoot = "https://koronaspass-sign.herokuapp.com/";
    if (sessionStorage.getItem("ENVDEVEL")) { APIRoot = "http://localhost:5003"; }
    const options = {
        method: "POST",
        body: manifest
    }
    const response = await fetch(APIRoot, options)
    if (response.status === 200) {
        return await response.blob()
    } else {
        throw await response.text();
    }
}

export function downloadBlob(blob: Blob, name?: string) {
    const link = document.createElement("A") as HTMLLinkElement;
    link.setAttribute("href", URL.createObjectURL(blob));
    if (name) { link.setAttribute("download", name); } 
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            resolve(reader.result as ArrayBuffer);
        });
        reader.readAsArrayBuffer(blob);
    });
}

export async function createPass(sertifikat: Koronasertifikat): Promise<Blob> {
    let passFile = await fetch("./resources/pass.json").then(res => res.text());
    let manifestFile = await fetch("./resources/manifest.json").then(res => res.text());

    const icon = await fetch("./resources/icon.png").then(res => res.blob());
    const icon2x = await fetch("./resources/icon@2x.png").then(res => res.blob());
    const thumbnail = await fetch("./resources/thumbnail.png").then(res => res.blob());
    const thumbnail2x = await fetch("./resources/thumbnail@2x.png").then(res => res.blob());

    const namestruct = sertifikat.sertifikat.nam;
    const name = `${namestruct.gn} ${namestruct.fn}`;
    const dob = sertifikat.sertifikat.dob
    const utløpsdato = sertifikat.datestringFromUtløpsdato();
    const w3cUtløpsdato = sertifikat.w3cDatestringFromUtløpsdato();
    const qrString = sertifikat.qrKode;
    const serialNumber = "NKS_" + `${namestruct.gnt}${namestruct.fnt}${dob}`;

    passFile = passFile.split("[[NAM]]").join(name);            // Full name
    passFile = passFile.split("[[DOB]]").join(dob);             // Year of birth
    passFile = passFile.split("[[EXP]]").join(utløpsdato);      // Expiration date
    passFile = passFile.split("[[SER]]").join(serialNumber);    // Serial number
    passFile = passFile.split("[[QRC]]").join(qrString);        // Original QR-code
    passFile = passFile.split("[[W3E]]").join(w3cUtløpsdato);   // Expiration date in complete W3C format

    const passFileSHA = calculateSHA(passFile);
    manifestFile = manifestFile.split("[[SUM]]").join(passFileSHA);

    console.log(manifestFile);
    const signature = await signManifest(manifestFile);

    //TODO: Generate zip and return blob
    let zip = new JSZip();
    zip.file("icon.png", icon);
    zip.file("icon@2x.png", icon2x);
    zip.file("logo.png", icon);
    zip.file("logo@2x.png", icon2x);
    zip.file("thumbnail.png", thumbnail);
    zip.file("thumbnail@2x.png", thumbnail2x);

    zip.file("pass.json", passFile);

    zip.file("manifest.json", manifestFile);
    zip.file("signature", signature);

    const result = await zip.generateAsync({type: "blob"})
    const abResult = await blobToArrayBuffer(result);

    const blob = new Blob([abResult], {type: "application/vnd.apple.pkpass"});

    return blob;
}