import base45 from "base45";
import pako from "pako";
import cbor from "cbor-js";
import jsQR from "jsqr";
import { Koronasertifikat } from "./Koronasertifikat";
import { ErrorCodes } from "./ErrorCodes";


function readImage(src: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("CANVAS") as HTMLCanvasElement;
        const img = document.createElement("IMG") as HTMLImageElement;
        img.addEventListener("load", (e) => {
            const [width, height] = [img.naturalWidth, img.naturalHeight];
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, width, height);
            if (imageData.data.length !== 4*width*height) { reject(ErrorCodes.image.failedToLoad); }
            else { resolve(imageData); }
        });
        img.addEventListener("error", (e) => {
            reject(ErrorCodes.image.failedToLoad);
        });

        img.src = src
    });
}

// From https://github.com/covidpass-org/covidpass/blob/main/src/decode.ts (line 8 – 10)
function typedArrayToBufferSliced(array: Uint8Array): ArrayBuffer {
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset);
}

export async function readQR(src: string): Promise<Koronasertifikat> {
    const imageData = await readImage(src);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
        let data = code.data
        if (data.startsWith("NO1")) {
            data = data.substring(3);
            
            if (data.startsWith(":")) {
                data = data.substring(1);
            }
        } else {
            throw ErrorCodes.QR.invalid;
        }
        
        let buffer = Uint8Array.from(base45.decode(data));
        
        if (buffer[0] === 0x78) {
            buffer = pako.inflate(buffer);
        }

        const payload: Array<Uint8Array> = cbor.decode(buffer.buffer);
        if (!Array.isArray(payload) || payload.length !== 4) {
            throw ErrorCodes.QR.failedDecoding
        }

        const decoded = cbor.decode(typedArrayToBufferSliced(payload[2]));

        return Koronasertifikat.fromDecodedQR(decoded, code.data);

    } else {
        throw ErrorCodes.QR.unreadable;
    }
}