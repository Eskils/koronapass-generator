<script lang="ts">
import Cell from "./Cell.svelte";
import { ErrorCodes } from "./ErrorCodes";
import Fileinput from "./Fileinput.svelte";
import { createPass, downloadBlob } from "./GenerationHandler";
import type { Koronasertifikat } from "./Koronasertifikat";
import LoadingButton from "./LoadingButton.svelte";
import { readQR } from "./QRHandler";

let qrImageURL: string = null;
let feedbackText: string = null;
let genererFeedbackText = null;
let kanGenerereKort = false;
let sertifikat: Koronasertifikat = null;
let skalLaste = false;

function didChoseQR(e) {
	const src = e.detail.src;
	qrImageURL = src;
	feedbackText = null;
	kanGenerereKort = false;
	sertifikat = null;
	skalLaste = false;

	readQR(src)
		.then((result) => {
			sertifikat = result;
			kanGenerereKort = true;
		})
		.catch((error) => {
			console.log(error);
			if (typeof error === "string") {
				switch (error) {
					case ErrorCodes.QR.unreadable:
						qrImageURL = null;
						feedbackText = "Kan ikkje scanne QR-koden. Prøv med eit anna bilete.";
						break;
					case ErrorCodes.QR.invalid:
						qrImageURL = null;
						feedbackText = "QR-koden er ugyldig. Hugs at den må hentast frå Helse Norge og vere for Noreg.";
						break;
					case ErrorCodes.QR.failedDecoding:
						qrImageURL = null;
						feedbackText = "Kan ikkje dekode sertifikatet frå QR-koden. Prøv med eit anna bilete.";
						break;
					case ErrorCodes.image.failedToLoad:
						qrImageURL = null;
						feedbackText = "Kan ikkje laste bilete. Sjekk at du valde eit bilete, eller prøv med eit anna bilete.";
						break;
					default:
						feedbackText = "Ein feil oppstod: " + error;
						break;
				}
			} else {
				feedbackText = (error as Error).message;
			}
		});
}

function generateCard() {
	skalLaste = true;
	genererFeedbackText = null;
	createPass(sertifikat)
		.then((blob) => {
			skalLaste = false
			downloadBlob(blob, "Koronapass.pkpass")
		})
		.catch((error) => {
			if (typeof error === "string") {
				let errorComposition = error.split(" ");
				console.log(errorComposition);
				switch (errorComposition[0]) {
					case ErrorCodes.api.notImplemented:
						genererFeedbackText = "[Ikkje implementert] Tjenaren kan ikkje handtere førespurnaden. Prøv igjen seinare.";
						break;
					case ErrorCodes.api.onlyAcceptsPOST:
						genererFeedbackText = "[Støttar kun post] Tjenaren kan ikkje handtere førespurnaden. Prøv igjen seinare.";
						break;
					case ErrorCodes.api.invalidJSON:
						genererFeedbackText = "[Ugyldig JSON] Klienten kan ikkje handtere førespurnaden. Prøv igjen seinare.";
						break;
					case ErrorCodes.api.invalidChecksum:
						genererFeedbackText = "[Ugyldig hashsum] Klienten kan ikkje handtere førespurnaden. Prøv igjen seinare.";
						break;
					case ErrorCodes.api.missingManifestField:
						genererFeedbackText = "[Manglande felt] Klienten kan ikkje handtere førespurnaden. Prøv igjen seinare.";
						break;
					case ErrorCodes.api.noOutput:
						genererFeedbackText = "[Ingen output] Tjenaren kan ikkje handtere førespurnaden. Prøv igjen seinare.";
						break;
					case ErrorCodes.api.badExitCode:
						genererFeedbackText = "[Ugyldig exit] Tjenaren kan ikkje handtere førespurnaden. Prøv igjen seinare.";
						break;
					default:
						genererFeedbackText = "Ein feil oppstod: " + error;
						break;
				}
			} else {
				genererFeedbackText = (error as Error).message;
			}
		})
}

</script>

<main>
	<div class="container">
		<div>
			<h1>Koronapass Generator</h1>
		
			<Cell>Generer norsk koronapass-kort til Apple Lommebok. Genereringen skjer på di eining.</Cell>

			<Cell steg={1} tittel="Hent QR-kode frå Helse Norge">
				<p style="margin-bottom:4px">Skaff QR-koden frå Helse Norge: </p>
				<ul style="margin-top:0">
					<li>Logg inn på Helse Norge</li>
					<li>Gå til „Koronasertifikat“</li>
					<li>Gå til „Vis kontrollside“</li>
					<li>Vel „Kontroll i Norge“</li>
					<li>Lagre QR-koden eller ta skjermdump av den</li>
				</ul>
				<a href="https://helsenorge.no" target="_blank">Gå til Helse Norge</a>
			</Cell>
			
			<Cell steg={2} tittel="Vel bildet av QR-koden">
				<p>Vel bildet av QR-koden frå Helse Norge til å generere passet som kan leggast til i Apple Lommebok.</p>
				{#if qrImageURL}
					<img src={qrImageURL} alt="QR-kode frå Helse Norge"/>
				{/if}
				{#if feedbackText}
					<p class="feedback">{feedbackText}</p>
				{/if}
				<Fileinput on:change={didChoseQR}/>
			</Cell>

			<Cell steg={3} tittel="Generer koronapass-kort">
				<p>Generer koronapass-kort. 
					Denne prosessen køyrer på di eining, kun ein <abbr title="Kort kode nytta til å sjekke integriteten av passet.">sjekksum</abbr> vert sendt til tjenar for signering 
					– ingen sensitive data forlet eininga di. <a href="https://github.com/Eskils/koronapass-generator" target="_blank">Lær meir om prosessen bak</a>
				</p>
				{#if sertifikat}
						<p>Ditt sertifikat er godkjent til <strong>{sertifikat.datestringFromUtløpsdato()}</strong>. Merk at du må generere eit nytt kort etter denne datoen.</p>
					{/if}
				{#if genererFeedbackText}
					<p class="feedback">{genererFeedbackText}</p>
				{/if}
				<LoadingButton on:click={generateCard} disabled={!kanGenerereKort} shouldLoad={skalLaste}><i class="material-icons-round">file_download</i>Generer koronapass-kort</LoadingButton>
			</Cell>

			<p class="footer">Koronapass Generator by E Skils</p>

		</div>
	</div>
</main>

<style>
	main {
		text-align: left;
		padding: 1em;
		width: 100%;
		height: 100%;
		position: relative;
		box-sizing: border-box;
	}

	.container>div>h1 {
		text-align: center;
	}

	.container {
		display: flex;
		justify-content: center;
	}

	.container>div {
		width: calc(100% - 16px);
		max-width: 400px;
	}

	img {
		object-fit: contain;
		width: 100%;
		height: min(100% - 16px - 24px, 400px - 24px);
		margin-bottom: 8px;
	}

	p {
		margin-top: 0;
		font-size: 1em;
	}

	p.feedback {
		color: crimson;
	}

	.footer {
		margin-top: 12px;
		text-align: center;
		font-size: 0.9em;
		color: var(--footer);
	}

</style>