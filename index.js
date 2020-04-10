const express = require('express');
const path = require('path')
const { createProxyMiddleware } = require('http-proxy-middleware');

const port = 8080;
const proxyProt = 8000;

const app = express();

app.use(['/api/*', '/socket*'], createProxyMiddleware({ target: `http://localhost:${proxyProt}`, changeOrigin: true }));
app.use('/*', express.static(path.resolve('client/build')))
app.listen(port, () => {
    console.log(`serving on ${port}, proxy to ${proxyProt}`)
});