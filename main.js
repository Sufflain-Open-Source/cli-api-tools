/**
    Copyright (C) 2022 Timofey Chuchkanov

    Licensed under the Sufflain Private Module License.
 */

import config from '../../cli-config.js';
import { fetchServerPubKey } from '../data/remote.js';
import { setServerPubKey, setKeyPair } from '../data/session.js';
import * as pgp from 'openpgp';

const pass = 'c6ljzyboxj8Y2cdiPs2Rp9mxkDTQrtwa';

// setupEncryption :: -> Undefined
export async function setupEncryption() {
    const serverPubKey = await fetchServerPubKey();
    const keyPair = await generateKeyPair(); 

    setServerPubKey(serverPubKey);
    setKeyPair(keyPair);
}

// decryptServerResponse :: String -> String
export async function decryptServerResponse(response, privateKey) {
    const payload = response.payload;
    const { data: decrypted } = await pgp.decrypt({
        message: await pgp.readMessage({ armoredMessage: payload }),
        decryptionKeys: await pgp.decryptKey({ privateKey: await pgp.readPrivateKey({ armoredKey: privateKey }), passphrase: pass})
    });

    return decrypted;
}

// encryptOwnPubKey :: String -> String
export async function encryptOwnPubKey(serverPub, ownPub) {
    const dataToShare = `${ config.shared }@${ ownPub }`;
    const encryptedPayload = await pgp.encrypt({
        message: await pgp.createMessage({ text: dataToShare }),
        encryptionKeys: await pgp.readKey({ armoredKey: serverPub })
    });

    return encryptedPayload;
}

// generateKeyPair :: -> undefined
export async function generateKeyPair() {
    const { privateKey, publicKey } = await pgp.generateKey({
        type: 'rsa',
        rsaBits: 2048,
        userIDs: [{ name: 'Timofey Chuchkanov', email: 'crt0r.9@yahoo.com' }],
        passphrase: pass
    });
    
    return { pri: privateKey, pub: publicKey };
}
