import CryptoJS from 'crypto-js';

const SECRET_KEY = "B34nhbgRILjQH7hI2Lie0sYzjh6v9oC1";

const SECRET_KEY_HEX = CryptoJS.enc.Utf8.parse(SECRET_KEY);
const SECRET_KEY_B64 = CryptoJS.enc.Base64.stringify(SECRET_KEY_HEX);


export const encrypt = (data) => {
    const encrypted = CryptoJS.AES.encrypt(data, SECRET_KEY_HEX, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
};

export const decrypt = (data) => {
    const decrypted = CryptoJS.AES.decrypt(data, SECRET_KEY_HEX, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
};
