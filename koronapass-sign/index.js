const cors = require('cors');
const fs = require("fs");
const child_process = require("child_process");
const express = require('express');

const PORT = process.env.PORT || 6000
let app = express()
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.text());

app.get("/", async (req, resp)=> {
    console.log(`[Hent] Tilkopling oppretta ved ${req.url}`);
    resp.status(405).append("Accept", "POST").send("api_only_accepts_post"); return;
})

app.post("/", async (req, resp) => {
    console.log(`[Post] Tilkopling oppretta ved ${req.url}`);
    const manifestData = req.body;
    if (!manifestData) { resp.status(400).send("api_invalid_json"); return; }
    
    const manifest = JSON.parse(manifestData);

    if (!manifest) { resp.status(400).send("api_invalid_json"); return; }

    // Validate entries in manifest to avoid signing invalid pass and reduce liklyhood of api-misuse.
    const manifestFields = ["icon.png", "icon@2x.png", "thumbnail.png", "thumbnail@2x.png", "logo.png", "logo@2x.png", "pass.json"];
    for (const field of manifestFields) {
        if (!manifest[field]) { resp.status(400).send("api_missing_manifest_field " + field); return; }
    }

    // Must be updated if any images are changed
    const shasums = {
        "icon.png": "b4aa158e2e298269306236133c2241c35aa4a9a0",
        "icon@2x.png": "ba29448f9622ecb39cc4108bcb9506a5f6117a38",
        "logo.png": "b4aa158e2e298269306236133c2241c35aa4a9a0",
        "logo@2x.png": "ba29448f9622ecb39cc4108bcb9506a5f6117a38",
        "thumbnail.png": "338006f3d8ea29d66492a56f2762a4cb99811fd1",
        "thumbnail@2x.png": "a6a61d9e9fbf2de68e16e1e665457a8dd39d2d46"
    };

    var isValid = true;
    for (const [key, val] of Object.entries(shasums)) {
        if (manifest[key] !== shasums[key]) { isValid = false; console.log("Invalid sum on field " + key); }
    }
    if (!isValid) { resp.status(400).send("api_invalid_checksum_in_manifest"); return; }


    //Create signature
    fs.writeFileSync("files/manifest.json", manifestData);
    const proc = child_process.exec("bash sign.sh", (err, stout, sterr) => {
        if (err) { console.log(err); return }
        if (sterr) { console.log(sterr); return }
    });
    proc.on("exit", (code) => {
        if (code === 0) {
            if (fs.existsSync("files/signature")) {
                const signature = fs.readFileSync("files/signature");
                fs.unlinkSync("files/signature");
                resp.status(200).send(signature);
            } else {
                resp.status(500).send("api_no_output");
            }
        } else {
            resp.status(500).send("api_bad_exit_on_sign " + code);
        }
    });
});

app.listen(PORT, ()=>{ console.log(`Lyttar på port ${PORT}`) });