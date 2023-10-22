import {generateCodeVerifier, generateCodeChallenge} from './helper.js';
const clientId = "811cede9e60344be9193ad3ebee82def"; 
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

document.addEventListener('click', function(event) {
    if (event.target.id === 'loginButton') {
        redirectToAuthCodeFlow(clientId);
    }
});

async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "https://celadon-custard-96fa91.netlify.app");
    params.append("scope", "user-read-private user-read-email user-top-read user-read-recently-played");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}