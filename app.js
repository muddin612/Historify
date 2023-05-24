const clientId = '811cede9e60344be9193ad3ebee82def';
const redirectUri = 'https://main--stellular-manatee-a99798.netlify.app/';

function authorizeSpotify(){

    var scopes = ['user-read-playback-state','user-read-currently-playing','user-read-recently-played'];

    var authUrl = 'https://accounts.spotify.com/authorize' +
    '?response_type=token' +
    '&client_id=' + encodeURIComponent(clientId) +
    '&scope=' + encodeURIComponent(scopes.join(' ')) +
    '&redirect_uri=' + encodeURIComponent(redirectUri);

    var loginWindow = window.open(authUrl, 'Login with Spotify', 'width=400,height=600');
    window.close();

}

function handleCallback(){

    var hash = window.location.hash.substr(1);
    var params = new URLSearchParams(hash);
    var accessToken = params.get('access_token');

    window.close();

    console.log('Access Token:', accessToken);

    getListeningHistory(accessToken);
}
function getListeningHistory(accessToken) {
    fetch('https://api.spotify.com/v1/me/player/recently-played', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .then(response => response.json())
      .then(data => {
        
        const tracks = data.items.map(item => {
          const { artist, name, album } = item.track;
          return {
            artist: artist.name,
            title: name,
            album: album.name
          };
        });
  
        // Populate the table with the retrieved tracks
        var table = document.getElementById("spotify_history_table");
        var tbody = table.getElementsByTagName("tbody")[0];
  
        tracks.forEach(function(item) {
          var row = tbody.insertRow();
          var artistCell = row.insertCell();
          var titleCell = row.insertCell();
          var albumCell = row.insertCell();
  
          artistCell.innerHTML = item.artist;
          titleCell.innerHTML = item.title;
          albumCell.innerHTML = item.album;
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }