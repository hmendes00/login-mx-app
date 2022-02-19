/* eslint-disable @typescript-eslint/no-use-before-define */
import appCommitter, { AppMutationTypes } from './mutations';

export enum AppActionTypes {
  SETUP_APP = 'APP - SETUP_APP'
}

const actionOfApp = {
  /**
   *  Get user credentials
   */
  async [AppActionTypes.SETUP_APP]() {
    appCommitter(AppMutationTypes.SET_APP_LOADED_STATE, true);
  }
};

// all AppActionTypes needs to be in actionsOfApp
function appDispatcher<T extends AppActionTypes, K extends Parameters<typeof actionOfApp[T]>>(
  action: T,
  payload?: K[0]
) {
  if (import.meta.env.MODE === 'development') {
    console.debug(action, payload);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  //@ts-ignore
  actionOfApp[action](payload);
}

export default appDispatcher;
