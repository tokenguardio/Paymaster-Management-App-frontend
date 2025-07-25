import { ethers } from 'ethers';
import { SiweMessage, generateNonce } from 'siwe';

export async function signInWithEthereum() {
  try {
    if (!window.ethereum) {
      throw new Error('No Ethereum wallet – install MetaMask.');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const nonce = generateNonce();

    await provider.send('eth_requestAccounts', []);

    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const chainId = (await provider.getNetwork()).chainId;
 
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Log in to app',
      uri: window.location.origin,
      version: '1',
      chainId,
      nonce: nonce,
    });

    const signature = await signer.signMessage(message.prepareMessage());

    const res = await fetch('http://localhost:3001/siwe/verify', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.toMessage(), signature }),
      
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'SIWE verification error');
    }

    const { address: loggedAddress } = await res.json();
    console.log('Login as:', loggedAddress);
    return loggedAddress;

  } catch (err: any) {
    console.error('Logged error:', err);
    throw err;
  }
}
