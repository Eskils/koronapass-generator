openssl cms -sign -binary -certfile ./keys/wwdr.pem -signer ./keys/certificate.pem -inkey ./keys/key.pem -passin pass:<Password to key.pem> -in ./files/manifest.json -out ./files/signature -outform DER