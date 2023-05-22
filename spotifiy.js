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
  