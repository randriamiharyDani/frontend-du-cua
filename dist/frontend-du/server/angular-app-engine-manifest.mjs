
export default {
  basePath: '/',
  allowedHosts: [
  "localhost",
  "127.0.0.1",
  "10.10.10.32"
],
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
