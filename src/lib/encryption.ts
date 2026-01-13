import CryptoJs from "crypto-js";

export default class Encryption {
  static encrypt(plainText: string) {
    return CryptoJs.AES.encrypt(
      plainText,
      process.env.CRYPTO_KEY as string
    ).toString();
  }

  static decrypt(cipherText: string) {
    const bytes = CryptoJs.AES.decrypt(
      cipherText,
      process.env.CRYPTO_KEY as string
    );
    return JSON.parse(bytes.toString(CryptoJs.enc.Utf8));
  }
}
