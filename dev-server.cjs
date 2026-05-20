const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 5173);
const host = '127.0.0.1';

const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8'
};

const server = http.createServer((request, response) => {
    const requestedPath = request.url === '/' ? 'index.html' : decodeURIComponent(request.url.slice(1));
    const filePath = path.resolve(root, requestedPath);

    if (!filePath.startsWith(root)) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            response.writeHead(404);
            response.end('Not found');
            return;
        }

        response.writeHead(200, {
            'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream'
        });
        response.end(data);
    });
});

server.listen(port, host, () => {
    console.log(`Calculator running at http://${host}:${port}/index.html`);
});
