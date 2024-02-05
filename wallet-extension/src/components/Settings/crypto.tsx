

export async function encryptPrivateKey(privateKey: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const encodedPrivateKey = encoder.encode(privateKey);

    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Derive a key from the password using PBKDF2
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // Encrypt the private key using AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedPrivateKey = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        derivedKey,
        encodedPrivateKey
    );

    // Combine the salt, IV, and ciphertext
    const encryptedData = new Uint8Array(salt.length + iv.length + new Uint8Array(encryptedPrivateKey).length);
    encryptedData.set(salt, 0);
    encryptedData.set(iv, salt.length);
    encryptedData.set(new Uint8Array(encryptedPrivateKey), salt.length + iv.length);

    // Convert to base64 for storage 
    const encryptedBase64 = btoa(String.fromCharCode.apply(null, Array.from(encryptedData)));

    return encryptedBase64;
}


export async function decryptPrivateKey(encryptedPrivateKey: string, password: string): Promise<string | null> {
    const decoder = new TextDecoder();

    // Convert from base64
    const encryptedData = Uint8Array.from(atob(encryptedPrivateKey), (c) => c.charCodeAt(0));

    // Extract salt, IV, and ciphertext
    const salt = encryptedData.slice(0, 16);
    const iv = encryptedData.slice(16, 28);
    const ciphertext = encryptedData.slice(28);

    // Derive key from password using PBKDF2
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    try {
        // Decrypt the ciphertext using AES-GCM
        const decryptedPrivateKey = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            derivedKey,
            ciphertext
        );

        return decoder.decode(decryptedPrivateKey);
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
}

