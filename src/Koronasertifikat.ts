import { ErrorCodes } from "./ErrorCodes"

export class Koronasertifikat {
    utløpsdato: number
    sertifikat: IKoronasertifikat
    qrKode: string

    constructor(utløpsdato: number, sertifikat: IKoronasertifikat, qrKode: string) {
        this.utløpsdato = utløpsdato
        this.sertifikat = sertifikat
        this.qrKode = qrKode;
    }

    static fromDecodedQR(decoded: Object, qrKode: string): Koronasertifikat {
        if (typeof decoded !== "object") { throw ErrorCodes.QR.invalid; }

        const expiry = decoded[4]
        const certificate = decoded[-260];

        if (!expiry || !certificate) { throw ErrorCodes.QR.invalid; }

        return new Koronasertifikat(expiry, certificate[1], qrKode);
    }

    datestringFromUtløpsdato(): string {
        const date = new Date(this.utløpsdato*1000);
        
        const day = date.getDate();
        const month = date.getMonth()+1;
        const year = date.getFullYear();
    
        return `${(day < 10) ? "0"+day : day}/${(month < 10) ? "0"+month : month}/${year}`;
    }

    w3cDatestringFromUtløpsdato(): string {
        const date = new Date(this.utløpsdato*1000);
        
        const day = date.getDate();
        const month = date.getMonth()+1;
        const year = date.getFullYear();
    
        return `${year}-${(month < 10) ? "0"+month : month}-${(day < 10) ? "0"+day : day}T00:00+01:00`;
    }
}

export interface IKoronasertifikat {
    dob: string         // Date of birth
    nam: IKoronaName    // Struct of different parts of name
    ver: string         // Version of certificate
}

export interface IKoronaName {
    fn: string          // Family name ex. Nor***
    gn: string          // Given name ex. O.
    fnt: string         // Family name bold ex. NOR
    gnt: string         // Given name bold ex. O
}