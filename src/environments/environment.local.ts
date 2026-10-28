// `-c=local` (see the `local` configurations in angular.json) swaps this file in:
// the app talks to Collecta.API running on this machine (`dotnet run` in ../Collecta-API).
// The URL is relative on purpose: `ng serve -c=local` proxies `/api` to
// http://localhost:5215 (proxy.local.json), so the same build works from this
// computer and from a phone on the same wifi (`npm run start:mobile`).
export const environment = {
  production: false,
  apiUrl: '',
};
