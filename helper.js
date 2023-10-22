export function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId, code) {
  
    const verifier = localStorage.getItem("verifier");
  
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "https://celadon-custard-96fa91.netlify.app");
    params.append("code_verifier", verifier);
  
    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });
    
    const data = await result.json();
  
    let accessToken = data.access_token;
  
    if( accessToken === undefined){
      localStorage.setItem("accessToken","");
    }
  
    localStorage.setItem("accessToken",accessToken);
    
    
    let refreshToken = data.refresh_token;
  
    if( refreshToken === undefined){
      localStorage.setItem("refreshToken","");
    }
    
    localStorage.setItem("refreshToken",refreshToken);
  
    const expireTime = Math.floor(Date.now() / 1000) + data.expires_in;
    localStorage.setItem("expireTime",expireTime);
    
    return accessToken;
  
  }

  export async function getRefreshToken(clientId,refreshToken){
    const refreshVerifier = generateCodeChallenge(128);
    const refreshChallenge = await generateCodeChallenge(refreshVerifier);

    localStorage.setItem("refreshVerifier", refreshVerifier);

    const refreshParams = new URLSearchParams();
    refreshParams.append("client_id", clientId);
    refreshParams.append("grant_type", "refresh_token");
    refreshParams.append("refresh_token", refreshToken);
    refreshParams.append("code_verifier", refreshVerifier);
    refreshParams.append("code_challenge", refreshChallenge);

    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: refreshParams
  });

  const data = await result.json();

  let newAccessToken = data.access_token;

  if( newAccessToken === undefined){
    localStorage.setItem("accessToken","");
  }

  localStorage.setItem("accessToken",newAccessToken);
  
  
  let newRefreshToken = data.refresh_token;

  if( newRefreshToken === undefined){
    localStorage.setItem("refreshToken","");
  }
  
  localStorage.setItem("refreshToken",newRefreshToken);
  

  const newExpireTime = Math.floor(Date.now() / 1000) + data.expires_in;
  localStorage.setItem("expireTime",newExpireTime);


}