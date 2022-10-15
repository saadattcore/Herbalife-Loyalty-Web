using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace Loyalty.Customer.Provider.Helpers {
    public static class AesHelper {
        /// <summary>
        /// Returns an UTF8 encoded, AES256 encrypted text
        /// </summary>
        /// <param name="inputText">The text to be encrypted.</param>
        /// <returns></returns>
        public static string AES_Encrypt(string inputText, string AesKey, string AesFootprint) {
            var result = string.Empty;

            inputText = inputText.Replace('+', '_');
            var clearBytes = Encoding.Unicode.GetBytes(inputText);
            using (var encryptor = Aes.Create()) {
                var pdb = new Rfc2898DeriveBytes(AesKey, Convert.FromBase64String(AesFootprint));
                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);
                using (var ms = new MemoryStream()) {
                    using (var cs = new CryptoStream(ms, encryptor.CreateEncryptor(), CryptoStreamMode.Write)) {
                        cs.Write(clearBytes, 0, clearBytes.Length);
                        cs.Close();
                    }
                    result = Convert.ToBase64String(ms.ToArray());
                }
            }

            return result;
        }


        /// <summary>
        /// Decrypts an AES256 encrypted text.
        /// </summary>
        /// <param name="inputText">The input text.</param>
        /// <returns></returns>
        public static string AES_Decrypt(string inputText, string AesKey, string AesFootprint) {
            var result = string.Empty;
            try {
                inputText = inputText.Replace('_', '+');
                var cipherBytes = Convert.FromBase64String(inputText);
                using (var encryptor = Aes.Create()) {
                    var pdb = new Rfc2898DeriveBytes(AesKey, Convert.FromBase64String(AesFootprint));
                    encryptor.Key = pdb.GetBytes(32);
                    encryptor.IV = pdb.GetBytes(16);
                    using (var ms = new MemoryStream()) {
                        using (var cs = new CryptoStream(ms, encryptor.CreateDecryptor(), CryptoStreamMode.Write)) {
                            cs.Write(cipherBytes, 0, cipherBytes.Length);
                            cs.Close();
                        }
                        result = Encoding.Unicode.GetString(ms.ToArray());
                    }
                }
            } catch {}

            return result;
        }
    }
}
