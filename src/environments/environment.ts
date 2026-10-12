/**
 * Configuration d'environnement du frontend DOLEANCE DU.
 *
 * `apiUrl` pointe vers le préfixe de l'API Laravel. En développement, le
 * serveur Angular (`ng serve`) redirige `/api` vers le backend PHP via
 * `proxy.conf.json` (cf. angular.json) : aucun CORS n'est nécessaire.
 */
export const environment = {
  production: false,
  apiUrl: '/api',
};
