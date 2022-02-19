import state from './state';

const gettersOfApp = {
  appLoaded: () => state.appLoaded,
  authToken: () => state.appAccessToken
};

export default gettersOfApp;
