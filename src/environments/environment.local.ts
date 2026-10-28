// `-c=local` (see the `local` configurations in angular.json) swaps this file in:
// the app talks to Collecta.API running on this machine (`dotnet run` in ../Collecta-API).
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5215',
};
