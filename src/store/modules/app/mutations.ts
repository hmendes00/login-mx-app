import state from './state';

export enum AppMutationTypes {
  SET_APP_LOADED_STATE = 'APP - SET_APP_LOADED_STATE',
  SET_APP_ACCESS_TOKEN = 'APP - SET_APP_ACCESS_TOKEN'
}

const appMutations = {
  [AppMutationTypes.SET_APP_LOADED_STATE](appLoaded: boolean): void {
    state.appLoaded = appLoaded;
  },

  [AppMutationTypes.SET_APP_ACCESS_TOKEN](token: string): void {
    state.appAccessToken = token;
  }
};

function appCommitter<T extends AppMutationTypes, K extends Parameters<typeof appMutations[T]>>(
  mutation: T,
  payload: K[0]
) {
  if (import.meta.env.MODE === 'development') {
    console.debug(mutation, payload);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  return appMutations[mutation](payload as never);
}

export default appCommitter;
