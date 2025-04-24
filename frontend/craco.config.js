const path = require('path');

module.exports = {
  webpack: {
    configure: (config) => {
      // Allow imports from outside src (node_modules)
      config.resolve.plugins = config.resolve.plugins.filter(
        plugin => plugin.constructor.name !== 'ModuleScopePlugin'
      );
      // enable WebAssembly support
      config.experiments = {
        ...(config.experiments || {}),
        asyncWebAssembly: true,
      };
      // emit wasm as resource
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'asset/resource',
      });
      // allow dynamic imports in Linera client
      config.module.rules.push({
        test: /\.js$/,
        include: path.resolve(__dirname, 'node_modules/@linera/client/dist'),
        type: 'javascript/auto',
      });
      return config;
    },
  },
  devServer: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    },
    proxy: {
      '/rpc.v1': {
        target: 'https://linera-testnet.chainbase.online',
        changeOrigin: true,
        secure: true,
      },
      '/faucet.v1': {
        target: 'https://faucet.testnet-babbage.linera.net',
        changeOrigin: true,
        secure: true,
      },
    },
  }
};
