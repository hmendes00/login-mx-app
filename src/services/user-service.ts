import { LoginUpdateEvent } from '@/helpers/app-events';
import {
  cacheAccessToken,
  CreatePickleKey,
  getCachedAccessToken,
  getClient,
  getDeviceId,
  getUserId,
  setDeviceId,
  setUserId
} from '@/helpers/matrix-helper';
import { createFetch } from '@vueuse/core';

const _fetch = createFetch({
  baseUrl: import.meta.env.VITE_MATRIX_URL,
  options: {
    async beforeFetch({ options }) {
      return { options };
    }
  },
  fetchOptions: {
    mode: 'cors'
  }
});

/**
 * Service with basic calls for Mx User Api
 */
export const ToguroUserService = {
  register: async (username: string, password: string) => {
    try {
      // step 1
      const { data } = await _fetch('/_matrix/client/r0/register')
        .post({
          username,
          password
        })
        .json();

      const res = await _fetch('/_matrix/client/r0/register')
        .post({
          username,
          password,
          auth: {
            session: data.value.session,
            type: 'm.login.email.identity'
          }
        })
        .json();

      return res.data.value;
    } catch (error: any) {
      console.log(error);
    }
  },
  login: async (username: string, password: string) => {
    let cachedAccessToken = await getCachedAccessToken();
    if (!cachedAccessToken) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      const result = await getClient().login('m.login.password', {
        user: username,
        password,
        device_id: getDeviceId() || undefined
      });
      if (!result) {
        return;
      }
      if (!getDeviceId()) {
        setDeviceId(result.device_id);
      }

      if (!getUserId()) {
        setUserId(getClient().getUserId());
      }

      await CreatePickleKey(getUserId(), getDeviceId());
      await cacheAccessToken(getClient().getAccessToken());
      cachedAccessToken = await getCachedAccessToken();
    }
    window.dispatchEvent(LoginUpdateEvent(cachedAccessToken));
  }
};
