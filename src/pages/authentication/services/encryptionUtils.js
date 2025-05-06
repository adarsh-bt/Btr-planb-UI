import CryptoJS from 'crypto-js';

const SECRET_KEY = "B34nhbgRILjQH7hI2Lie0sYzjh6v9aV1"; 

export const encrypt = (data) => {
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
    const iv = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    const combined = iv.concat(encrypted.ciphertext);
    return CryptoJS.enc.Base64.stringify(combined);
};



export const decrypt = (data) => {
    const decrypted = CryptoJS.AES.decrypt(data, SECRET_KEY_HEX, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
};