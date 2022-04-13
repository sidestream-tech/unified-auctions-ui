import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export const startProxy = async function (targetUrl: string, port: number) {
    const app = express();
    app.use('/', createProxyMiddleware({ target: targetUrl, changeOrigin: true }));
    app.listen(port);
};
