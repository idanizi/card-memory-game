const express = require('express');
const path = require('path')
const { createProxyMiddleware } = require('http-proxy-middleware');

const port = process.env.PORT || 8080;
const proxyProt = 8000;

const app = express();

app.use(express.static(path.join(__dirname, 'client', 'build')))

// app.use(['/api/*', '/socket*'], createProxyMiddleware({ target: `http://localhost:${proxyProt}`, changeOrigin: true }));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
})

app.listen(port, () => {
    console.log(`serving on ${port}, proxy to ${proxyProt}`)
});