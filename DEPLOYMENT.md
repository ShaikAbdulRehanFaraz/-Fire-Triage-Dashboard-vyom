# Deployment and API key setup

## Run locally

Use Node.js 18 or newer. From the project directory:

```sh
npm install
npm start
```

Open `http://localhost:3000`. To load live NASA FIRMS data, select **My backend server**, keep the URL as `http://localhost:3000`, enter your NASA FIRMS MAP_KEY, and select **Connect API**. The server also supports setting `NASA_FIRMS_MAP_KEY` in its environment; that server-side setting takes precedence over a key entered in the dashboard.

## Deploying

GitHub Pages only hosts static files and cannot run `server.js`. Deploy this Node.js project to a Node-capable host, configure `NASA_FIRMS_MAP_KEY` as a secret/environment variable on that host, then set the dashboard's backend URL to the deployed server's HTTPS URL and select **My backend server**. Do not use `localhost` for a remotely hosted dashboard: it refers to the visitor's own computer.

If you enter a key in the dashboard instead of configuring the server secret, the browser sends it to the backend in an `x-api-key` header. Only do this with a backend URL you trust and an HTTPS connection. Never commit your real key or put it in a public HTML file.

`GET /api/health` reports whether a server-side key is configured; it never returns the key itself.
