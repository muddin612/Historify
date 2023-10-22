# Historify

Historify is a web application that allows users to log in with their Spotify account and access features related to their Spotify music history. This project integrates with the Spotify API to provide information about top songs and recently played tracks.

## Getting Started

### Prerequisites

Before you start, make sure you have the following prerequisites:

- A Spotify Developer Account: You'll need to create an application on the Spotify Developer Dashboard to obtain a client ID.

### Installation

1. Clone the repository to your local machine.
2. Set up the project's configuration:
   - Update the `clientId` variable in `login.js` with your Spotify client ID.
   - Configure the redirect URI in `login.js` to point to your application's main page.
   - Ensure you have a web server to host the project.
3. Open `index.html` in your web browser to access the login page.

## Features

- **Authentication**: Users can log in with their Spotify account securely using OAuth 2.0 PKCE for enhanced security.
- **Top Songs**: The application displays the user's top 10 most-listened-to songs in a carousel format.
- **Recently Played**: Users can view their recently played Spotify tracks in a grid layout.

## Website Hosting

Historify is hosted on Netlify at the following URL: [https://celadon-custard-96fa91.netlify.app](https://celadon-custard-96fa91.netlify.app)

## Built With

- HTML, CSS for front-end design.
- JavaScript for dynamic functionality.
- Bootstrap for responsive styling.
- Spotify API for accessing user music data.

## Authors

- Mohammed Uddin

## Acknowledgments

- Special thanks to the Spotify Developer team for providing the API and tools necessary for this project.
