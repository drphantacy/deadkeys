const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy Linera RPC
  app.use(
    '/rpc.v1',
    createProxyMiddleware({
      target: 'https://linera-testnet.chainbase.online',
      changeOrigin: true,
      secure: true,
    })
  );

  // Proxy Linera Faucet
  app.use(
    '/faucet.v1',
    createProxyMiddleware({
      target: 'https://faucet.testnet-babbage.linera.net',
      changeOrigin: true,
      secure: true,
    })
  );
};
