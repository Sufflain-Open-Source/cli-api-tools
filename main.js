/**
    Copyright (C) 2022 Timofey Chuchkanov

    Licensed under the Sufflain Private Module License.
 */

import { fetchServerPubKey } from '../data/remote.js';
import { setServerPubKey } from '../data/session.js';
import * as pgp from 'openpgp';

// setupEncryption :: -> Undefined
export async function setupEncryption() {
    const serverPubKey = await fetchServerPubKey();

    setServerPubKey(serverPubKey);
}

// encryptApiKey :: String -> String
export async function encryptApiKey(serverPub, apiKey) {;
    const encryptedPayload = await pgp.encrypt({
        message: await pgp.createMessage({ text: apiKey }),
        encryptionKeys: await pgp.readKey({ armoredKey: serverPub })
    });

    return encryptedPayload;
}