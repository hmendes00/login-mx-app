// The pickle key is a string of unspecified length and format.  For AES, we
// need a 256-bit Uint8Array. So we HKDF the pickle key to generate the AES

import { IdbLoad, IdbSave } from './idb-helper';
import { encodeUnpaddedBase64 } from 'matrix-js-sdk/lib/crypto/olmlib';
import { decryptAES, encryptAES, IEncryptedPayload } from 'matrix-js-sdk/lib/crypto/aes';
import { createClient } from 'matrix-js-sdk';
import { ConfigService } from '@/services/config-service';
import { LoginUpdateEvent } from './app-events';

const mxClient = createClient({
  baseUrl: import.meta.env.VITE_MATRIX_URL
});
export const getDeviceId = () => localStorage.getItem(ConfigService.mxDeviceKey) || '';
export const setDeviceId = (value: string) => localStorage.setItem(ConfigService.mxDeviceKey, value);
export const getUserId = () => localStorage.getItem(ConfigService.mxUserId) || '';
export const setUserId = (value: string) => localStorage.setItem(ConfigService.mxUserId, value);
export const setHasMxToken = (value: string) => localStorage.setItem(ConfigService.mxHasMxToken, value);
export const getHasMxToken = () => localStorage.getItem(ConfigService.mxHasMxToken) || '';
export const setHasPickle = (value: string) => localStorage.setItem(ConfigService.mxHasPickleKey, value);
export const getHasPickle = () => localStorage.getItem(ConfigService.mxHasPickleKey) || '';
export const getClient = () => mxClient;

// key.  The AES key should be zeroed after it is used.
export const PickleKeyToAesKey = async (pickleKey: string): Promise<Uint8Array> => {
  const pickleKeyBuffer = new Uint8Array(pickleKey.length);
  for (let i = 0; i < pickleKey.length; i++) {
    pickleKeyBuffer[i] = pickleKey.charCodeAt(i);
  }
  const hkdfKey = await window.crypto.subtle.importKey('raw', pickleKeyBuffer, 'HKDF', false, ['deriveBits']);
  pickleKeyBuffer.fill(0);
  return new Uint8Array(
    await window.crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore: https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/879
        salt: new Uint8Array(32),
        info: new Uint8Array(0)
      },
      hkdfKey,
      256
    )
  );
};

/**
 * Get a previously stored pickle key.  The pickle key is used for
 * encrypting libolm objects.
 * @param {string} userId the user ID for the user that the pickle key is for.
 * @param {string} userId the device ID that the pickle key is for.
 * @returns {string|null} the previously stored pickle key, or null if no
 *     pickle key has been stored.
 */
export const GetPickleKey = async (userId: string, deviceId: string): Promise<string | null> => {
  if (!window.crypto || !window.crypto.subtle) {
    return null;
  }
  let data;
  try {
    data = await IdbLoad(ConfigService.mxPickleKey, [userId, deviceId]);
  } catch (e) {
    console.log('idbLoad for pickleKey failed', e);
  }
  if (!data) {
    return null;
  }
  if (!data.encrypted || !data.iv || !data.cryptoKey) {
    console.log('Badly formatted pickle key');
    return null;
  }

  const additionalData = new Uint8Array(userId.length + deviceId.length + 1);
  for (let i = 0; i < userId.length; i++) {
    additionalData[i] = userId.charCodeAt(i);
  }
  additionalData[userId.length] = 124; // "|"
  for (let i = 0; i < deviceId.length; i++) {
    additionalData[userId.length + 1 + i] = deviceId.charCodeAt(i);
  }

  try {
    const key = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: data.iv, additionalData },
      data.cryptoKey,
      data.encrypted
    );
    return encodeUnpaddedBase64(key);
  } catch (e) {
    console.log('Error decrypting pickle key', e);
    return null;
  }
};

export const CreatePickleKey = async (userId: string, deviceId: string): Promise<string | null> => {
  if (!window.crypto || !window.crypto.subtle) {
    return null;
  }
  const crypto = window.crypto;
  const randomArray = new Uint8Array(32);
  crypto.getRandomValues(randomArray);
  const cryptoKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const iv = new Uint8Array(32);
  crypto.getRandomValues(iv);

  const additionalData = new Uint8Array(userId.length + deviceId.length + 1);
  for (let i = 0; i < userId.length; i++) {
    additionalData[i] = userId.charCodeAt(i);
  }
  additionalData[userId.length] = 124; // "|"
  for (let i = 0; i < deviceId.length; i++) {
    additionalData[userId.length + 1 + i] = deviceId.charCodeAt(i);
  }

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData }, cryptoKey, randomArray);
  try {
    await IdbSave(ConfigService.mxPickleKey, [userId, deviceId], { encrypted, iv, cryptoKey });
  } catch (e) {
    return null;
  }
  return encodeUnpaddedBase64(randomArray);
};

export const getCachedAccessToken = async () => {
  let encryptedAccessToken;
  let accessToken = localStorage.getItem(ConfigService.mxTokenKey) || '';
  try {
    encryptedAccessToken = await IdbLoad(ConfigService.mxAccountData, ConfigService.mxTokenKey);
  } catch (error) {
    console.log(`idbLoad failed to read ${ConfigService.mxTokenKey} in account table`, error);
  }

  if (!encryptedAccessToken) {
    if (accessToken) {
      try {
        // try to migrate access token to IndexedDB if we can
        await IdbSave(ConfigService.mxAccountData, ConfigService.mxTokenKey, accessToken);
        localStorage.removeItem(ConfigService.mxTokenKey); //remove from localStorage
      } catch (e) {
        console.log('migration of access token to IndexedDB failed', e);
      }
    }
  }

  const pickleKey = await GetPickleKey(getUserId(), getDeviceId());

  if (pickleKey && encryptedAccessToken) {
    const aesKey = await PickleKeyToAesKey(pickleKey);
    accessToken = await decryptAES(encryptedAccessToken, aesKey, 'access_token');
    aesKey.fill(0);
  }

  return accessToken;
};
export const cacheAccessToken = async (accessToken: string) => {
  // store whether we expect to find an access token, to detect the case
  // where IndexedDB is blown away
  if (mxClient.getAccessToken()) {
    setHasMxToken('true');
  } else {
    setHasMxToken('');
  }

  const pickleKey = await GetPickleKey(getUserId(), getDeviceId());
  if (pickleKey) {
    let encryptedAccessToken: IEncryptedPayload | null = null;

    try {
      const aesKey = await PickleKeyToAesKey(pickleKey);
      encryptedAccessToken = await encryptAES(accessToken, aesKey, 'access_token');
      aesKey.fill(0); // needs to zero it after using
    } catch (error) {
      console.log('Could not encrypt access token');
    }

    try {
      // save either the encrypted access token, or the plain access
      // token if we were unable to encrypt (e.g. if the browser doesn't
      // have WebCrypto).
      await IdbSave(
        ConfigService.mxAccountData,
        ConfigService.mxTokenKey,
        encryptedAccessToken || mxClient.getAccessToken()
      );
    } catch (e) {
      localStorage.setItem(ConfigService.mxTokenKey, mxClient.getAccessToken());
    }

    setHasPickle('true');
  } else {
    try {
      await IdbSave(ConfigService.mxAccountData, ConfigService.mxTokenKey, mxClient.getAccessToken());
    } catch (e) {
      localStorage.setItem(ConfigService.mxTokenKey, mxClient.getAccessToken());
    }
    if (getHasPickle()) {
      console.log('Expected a pickle key, but none provided.  Encryption may not work.');
    }
  }
};
