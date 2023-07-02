const clientId = "811cede9e60344be9193ad3ebee82def"; 
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code && ( accessToken === "" || accessToken === null) ) {
    redirectToAuthCodeFlow(clientId);
} else {
    let accessToken = localStorage.getItem("accessToken");
    let refreshToken = localStorage.getItem("refreshToken");

    const currentTime = Math.floor(Date.now() / 1000);
    console.log("Current Time",currentTime);

    if(accessToken === "" || accessToken === null){
        accessToken =  getAccessToken(clientId, code);
    }
    else if( localStorage.getItem("expireTime") <= currentTime ){
       getRefreshToken(clientId,refreshToken);
       console.log(localStorage.getItem("expireTime") <= currentTime);
    }

    console.log(localStorage.getItem("expireTime") <= currentTime);
    


    const topSong = fetchTopSong(accessToken);
    topSong.then(json => fillTopSong(json));

    const recentlyPlayed = fetchRecentlyPlayed(accessToken);
    recentlyPlayed.then(recentlyPlayed => fillHistory(recentlyPlayed));
}


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

async function getRefreshToken(clientId,refreshToken){
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


async function fetchTopSong(token){
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10&offset=0",{
        method: "GET", headers:{Authorization: `Bearer ${token}`}
    });

    return await result.json();


}


async function fetchRecentlyPlayed(token){
    var recentlyPlayedSongs = [];
    const result = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50",{
        method: "GET", headers:{Authorization: `Bearer ${token}`}
    });

    const data = await result.json();
    for(let x = 0; x < data.items.length; x++){

        var playTime = data.items[x].played_at;
        var date = new Date(playTime);
        var dateEpoch = date.getTime();
    
        var songTitle = data.items[x].track.name;
        var albumTitle = data.items[x].track.album.name;
        var artist = data.items[x].track.album.artists[0].name;
        var url = data.items[x].track.album.images[0].url;
        var spotifyURL = data.items[x].track.external_urls.spotify;

        let song = {
            songName: songTitle,
            album: albumTitle,
            artistName: artist,
            songPicURL: url,
            playedTime: Number(dateEpoch),
            spotifyLink: spotifyURL
        };

        recentlyPlayedSongs.push(song);
    }
    return recentlyPlayedSongs;
}


function fillTopSong(topSong){
    var items = topSong.items;
    let carouselInner = document.getElementById("carousel-inner");
   if( items && items.length > 0){
        for(var x = 0; x < items.length; x++){

            var songName = items[x].name;
            var albumName = items[x].album.name;
            var artistName = items[x].album.artists[0].name;
            var albumURI = items[x].album.images[0].url;
            var url = items[x].external_urls.spotify;


            var card = document.createElement('div');
            card.classList.add('card');
            card.style.width = '40%';
            card.classList.add('d-flex');
            card.classList.add('align-items-center');
            card.classList.add('bg-dark');
            card.style.margin = "0% auto";

            var image = document.createElement('img');
            image.classList.add('card-img-top');
            image.src = albumURI;
            image.alt = 'Card image cap';
      
            var cardBody = document.createElement('div');
            cardBody.classList.add('card-body');
            cardBody.classList.add('text-center');

      
            var songTitle = document.createElement('h5');
            songTitle.classList.add('card-title');
            songTitle.classList.add('text-light');
            songTitle.textContent = songName;
      
            var album = document.createElement('p');
            album.classList.add('card-text');
            album.classList.add('text-light');
            album.textContent = albumName;
      
            var artist = document.createElement('p');
            artist.classList.add('card-text')
            artist.classList.add('text-light');
            artist.textContent = artistName;

            var link = document.createElement('a');
            link.classList.add('btn');
            link.classList.add('btn-outline-success');
            link.textContent = 'Open on Spotify';
            link.href = url;


            cardBody.appendChild(songTitle);
            cardBody.appendChild(album);
            cardBody.appendChild(artist);
            cardBody.appendChild(link);
      
            card.appendChild(image);
            card.appendChild(cardBody);
      
            var carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');
            if (x === 0) {
              carouselItem.classList.add('active');
            }
      
            carouselItem.appendChild(card);
            carouselInner.appendChild(carouselItem);
        }
    }
    else{
        console.log("No Top Songs found");
    }


}


function fillHistory(history){

    var items = history;
    var gridContainer = document.getElementById('gridContainer');
    var gridDiv = document.createElement('div');
    gridDiv.className = 'row';  

    if( items && items.length > 0){
        for(var x = 0; x < items.length; x++){
            var songName = items[x].songName;
            var albumName = items[x].album;
            var artistName = items[x].artistName;
            var albumURI = items[x].songPicURL;
            var url = items[x].spotifyLink;
            
            var cardDiv = document.createElement('div');
            cardDiv.className = 'col-6 col-md-4 col-lg-3 card';
            cardDiv.style.width = '30%';
            cardDiv.classList.add('d-flex')

            var img = document.createElement('img');
            img.className = 'card-img-top';
            img.src = albumURI;
            img.alt = songName;

            var innerDiv = document.createElement('div');
            innerDiv.className = 'card-body';

            var h5 = document.createElement('h5');
            h5.className = 'card-title';
            h5.textContent = songName;

            var p = document.createElement('p');
            p.className = 'card-text';
            p.textContent = albumName;

            var p1 = document.createElement('p');
            p1.className = 'card-text';
            p1.textContent = artistName;

            var link = document.createElement('a');
            link.classList.add('btn');
            link.classList.add('btn-outline-success');
            link.textContent = 'Open on Spotify';
            link.href = url; 


            innerDiv.appendChild(h5);
            innerDiv.appendChild(p);
            innerDiv.appendChild(p1);
            innerDiv.appendChild(link);

            cardDiv.appendChild(img);
            cardDiv.appendChild(innerDiv);

            gridDiv.appendChild(cardDiv);


        }
        gridContainer.appendChild(gridDiv);
    }
    

}