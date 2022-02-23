import { ConfigService } from '@services/config-service';
import { Callback, createClient, IUploadOpts, MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';
import { IImageInfo } from 'matrix-js-sdk/lib/@types/partials';

let mxClient: MatrixClient;
export const getDeviceId = () => localStorage.getItem(ConfigService.mxDeviceKey) || '';
export const getUserId = () => localStorage.getItem(ConfigService.mxUserId) || '';
export const getClient = () => mxClient;
export const setClient = (accessToken: string) =>
  (mxClient = createClient({
    baseUrl: ConfigService.MatrixUrl,
    userId: getUserId(),
    deviceId: getDeviceId(),
    accessToken
  }));

export const GetSenderAvatar = (item: MatrixEvent) => {
  if (!item) {
    return ConfigService.defaultAvatar;
  }
  return item.sender.getAvatarUrl(ConfigService.MatrixUrl, 50, 50, 'scale', true, false) || ConfigService.defaultAvatar;
};

export const GetMyAvatarUrl = () => mxClient.getUser(getUserId()).avatarUrl;

export const GetRoomAvatar = (room: Room) => {
  if (!room) {
    return ConfigService.defaultAvatar;
  }
  let roomAvatar = room.getAvatarUrl(ConfigService.MatrixUrl, 100, 100, 'scale', true);
  if (!roomAvatar && room.getJoinedMemberCount() === 2) {
    roomAvatar = room.getAvatarFallbackMember().getAvatarUrl(ConfigService.MatrixUrl, 100, 100, 'scale', true, false);
  }
  return roomAvatar || ConfigService.defaultAvatar;
};

export const GetEventTime = (item: MatrixEvent) => {
  const _date = item.getDate()!;
  return `${_date.getHours()}:${_date.getMinutes() > 9 ? _date.getMinutes() : '0' + _date.getMinutes()}`;
};

export const SendMessage = (roomId: string, body: string, callBack?: Callback) => {
  const txnId = mxClient.makeTxnId();
  mxClient.sendTextMessage(roomId, body, txnId, callBack);
};

export const UploadContent = (file: File, opts?: IUploadOpts) => {
  return mxClient.uploadContent(file, opts);
};

export const SendImage = (roomId: string, mxUrl: string, info?: IImageInfo, text?: string, callback?: Callback) => {
  mxClient.sendImageMessage(roomId, mxUrl, info, text, callback);
};
