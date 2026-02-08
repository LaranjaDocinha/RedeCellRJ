export const isBiometricSupported = async () => {
  return (
    window.PublicKeyCredential &&
    await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  );
};

export const registerBiometric = async (userEmail: string) => {
  // Simulação de registro WebAuthn (em produção exigiria backend)
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: { name: "Redecell RJ", id: window.location.hostname },
    user: {
      id: Uint8Array.from(userEmail, c => c.charCodeAt(0)),
      name: userEmail,
      displayName: userEmail,
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required",
    },
    timeout: 60000,
  };

  try {
    const credential = await navigator.credentials.create({ publicKey });
    console.log("Biometric registered:", credential);
    localStorage.setItem('biometric_enabled', 'true');
    return true;
  } catch (error) {
    console.error("Biometric registration failed:", error);
    return false;
  }
};

export const authenticateBiometric = async () => {
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge,
    timeout: 60000,
    userVerification: "required",
    rpId: window.location.hostname,
  };

  try {
    const assertion = await navigator.credentials.get({ publicKey });
    console.log("Biometric authenticated:", assertion);
    return true;
  } catch (error) {
    console.error("Biometric authentication failed:", error);
    return false;
  }
};
