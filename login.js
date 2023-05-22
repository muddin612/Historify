const clientId = '811cede9e60344be9193ad3ebee82def';
const redirectUri = 'http://127.0.0.1:3000/index.html';

function authorizeSpotify(){

    var scopes = ['user-read-playback-state', 'user-read-currently-playing', ]

    var authUrl = 'https://accounts.spotify.com/authorize' +
    '?response_type=token' +
    '&client_id=' + encodeURIComponent(clientId) +
    '&scope=' + encodeURIComponent(scopes.join(' ')) +
    '&redirect_uri=' + encodeURIComponent(redirectUri);

    var loginWindow = window.open(authUrl, 'Login with Spotify', 'width=400,height=600');

}

function handleCallback(){

    var hash = window.location.hash.substr(1);
    var params = new URLSearchParams(hash);
    var accessToken = params.get('access_token');

    window.close();

    console.log('Access Token:', accessToken);
}