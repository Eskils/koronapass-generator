export const ErrorCodes = {
    QR: {
        invalid: "invalid_qr_code",
        unreadable: "failed_reading_qr_code",
        failedDecoding: "failed_decoding_certificate"
    },
    image: {
        failedToLoad: "failed_loading_image"
    },
    api: {
        notImplemented: "api_not_implemented",
        invalidChecksum: "api_invalid_checksum_in_manifest",
        missingManifestField: "api_missing_manifest_field",
        invalidJSON: "api_invalid_json",
        onlyAcceptsPOST: "api_only_accepts_post",
        noOutput: "api_no_output",
        badExitCode: "api_bad_exit_on_sign"
    }
}