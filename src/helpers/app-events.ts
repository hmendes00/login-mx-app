import { ConfigService } from '@/services/config-service';
import { IdbDelete } from './idb-helper';
import { setUserId, setHasMxToken, setHasPickle, getUserId, getDeviceId } from './matrix-helper';

export const LoginUpdateEvent = (accessToken: string, redirectTo = ConfigService.loginRedirectPath) => {
  return new CustomEvent('toguro-events:login-updated', {
    detail: {
      accessToken,
      redirectTo,
      logoutFunction: () => {
        IdbDelete(ConfigService.mxPickleKey, [getUserId(), getDeviceId()]);
        IdbDelete(ConfigService.mxAccountData, ConfigService.mxTokenKey);

        setUserId('');
        setHasMxToken('');
        setHasPickle('');
      }
    }
  });
};
