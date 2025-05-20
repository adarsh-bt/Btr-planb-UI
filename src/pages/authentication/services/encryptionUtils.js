import CryptoJS from 'crypto-js';

const SECRET_KEY_BASE64 = "B34nhbgRILjQH7hI2Lie0sYzjh6v9aV1"; // 32 bytes key in Base64
const IV_BASE64 = "wGiHplamyXlVB11UXWol8g=="; // Initialization Vector in Base64

export const encryptData = (data) => {
    // Parse the Base64 key and IV
    const key = CryptoJS.enc.Base64.parse(SECRET_KEY_BASE64);
    const iv = CryptoJS.enc.Base64.parse(IV_BASE64);

    // Convert the data into a JSON string if it's not already a string
    const jsonData = typeof data === "string" ? data : JSON.stringify(data);

    // Encrypt using AES CBC mode with PKCS7 padding
    const encrypted = CryptoJS.AES.encrypt(jsonData, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    // Return the encrypted data as a Base64 encoded string
    return encrypted.toString(); // Base64 encoded ciphertext
};



export const decryptData = (encryptedBase64) => {
    const key = CryptoJS.enc.Base64.parse(SECRET_KEY_BASE64);
    const iv = CryptoJS.enc.Base64.parse(IV_BASE64);

    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
};