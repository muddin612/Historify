const clientId = "811cede9e60344be9193ad3ebee82def"; // Replace with your client ID
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

const accessToken = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken =  getAccessToken(clientId, code);

    const topSong = accessToken.then(json => fetchTopSong(json));
    topSong.then(json => fillTopSong(json));
}


async function redirectToAuthCodeFlow(clientId) {
    // TODO: Redirect to Spotify authorization page
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://127.0.0.1:3000/index.html");
    params.append("scope", "user-read-private user-read-email user-top-read user-read-recently-played");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}
function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function getAccessToken(clientId, code) {
  // TODO: Get access token for code
  
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://127.0.0.1:3000/index.html");
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
  });
  
  const data = await result.json();

  let accessToken = data.access_token;
  let refreshToken = data.refresh_token;
  const expiresIn = data.expires_in;
  const expirationTime = Date.now() + expiresIn * 1000;

  if(expirationTime < Date.now()){
    var token = getRefreshToken(clientId, refreshToken);
    token.then(newToken => accessToken = newToken);

    if(token.refresh_token){
        refreshToken = token.refresh_token;
        localStorage.setItem("refreshToken", refreshToken);
    }
  }


  return accessToken;

}

async function getRefreshToken(clientId,refreshToken){
    const refreshVerifier = generateCodeChallenge(128);
    const refreshChallenge = await generateCodeChallenge(refreshVerifier);

    localStorage.setItem("refreshVerifier", refreshVerifier);

    const refreshParams = new URLSearchParams();
    refreshParams.append("client_id", clientId);
    refreshParams.append("grant_type", "refresh_token");
    refreshParams.append("refresh_token", refreshToken);
    refreshParams.append("code_verifier", refreshVerifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: refreshParams
  });

  const refreshData = await result.json();

  return refreshData.access_token;


}


async function fetchTopSong(token){
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5&offset=0",{
        method: "GET", headers:{Authorization: `Bearer ${token}`}
    });

    return await result.json();


}

function fillTopSong(topSong){
    var items = topSong.items;
    //const carouselItems = document.querySelector('.carousel-item');
   if( items && items.length > 0){
        for(var x = 0; x < items.length; x++){

            var songName = items[x].name;
            var albumName = items[x].album.name;
            var artistName = items[x].album.artists[0].name;
            var albumURI = items[x].album.images[0].url;

            var carouselItem = document.getElementById('carousel-' + (x + 1));
            var songTitle = carouselItem.querySelector('#songTitle');
            var album = carouselItem.querySelector('#ablum');
            var artist = carouselItem.querySelector('#artist');
            var image = carouselItem.querySelector('.d-block');

            songTitle.textContent = songName;
            album.textContent = albumName;
            artist.textContent = artistName;
            image.src = albumURI;
            image.alt = songName;        
        }
    }
    else{
        console.log("No Top Songs found");
    }


}