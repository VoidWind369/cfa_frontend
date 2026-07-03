import { get, post, postRaw, put, del, getPublic, postPublicRaw, getMsgpack, postLoginMsgpack, PUBLIC_TOKEN } from './request';
import type {
  UserSession,
  RestApi,
  ClanInfo,
  ClanPointInfo,
  UserInfo,
  TrackInfo,
  RoundInfo,
  OperateLogInfo,
  LoginLogInfo,
  MiddleTrackApi,
  MiddleReadCompoInfo,
} from '../types';

// ============ 认证接口 ============

export const authApi = {
  login: (email: string, password: string) =>
    postLoginMsgpack<UserSession>('system/login', { email, password }),

  logout: () => del<void>('system/login'),
};

// ============ 部落接口 ============

export const clanApi = {
  list: () =>
    getPublic<ClanInfo[]>('orange/clan', PUBLIC_TOKEN.clan),

  listPage: (page: number, pageSize: number) =>
    getPublic<RestApi<ClanInfo[]>>(`orange/clan_${page}/${pageSize}`, PUBLIC_TOKEN.clan),

  search: (keyword: string) =>
    postPublicRaw<ClanInfo[]>('orange/clan_search', keyword, PUBLIC_TOKEN.clan),

  detail: (id: string) =>
    get<ClanInfo>(`orange/clan/${id}`),

  create: (data: { tag: string; name?: string }) =>
    post<number>('orange/clan', data, {
      headers: !data.name ? { Auto: 'true' } : undefined,
    }),

  update: (data: Partial<ClanInfo>) =>
    put<number>('orange/clan', data),

  delete: (id: string) =>
    del<number>(`orange/clan/${id}`),

  updateRewardPoint: (data: { round_id: string; clan_id: string; reward_type: string }) =>
    put<RestApi<number>>('orange/clan_point', data),

  pointDetail: (id: string) =>
    get<ClanPointInfo>(`orange/clan_point/${id}`),
};

// ============ 用户接口 ============

export const userApi = {
  list: () =>
    get<UserInfo[]>('system/user'),

  listPage: (page: number, pageSize: number) =>
    get<RestApi<UserInfo[]>>(`system/user_${page}/${pageSize}`),

  search: (keyword: string) =>
    postRaw<UserInfo[]>('system/user_search', keyword),

  detail: (id: string) =>
    get<UserInfo>(`system/user/${id}`),

  create: (data: Partial<UserInfo> & { password: string }) =>
    post<number>('system/user', data),

  update: (data: Partial<UserInfo>) =>
    put<number>('system/user', data),

  updateOwn: (data: Partial<UserInfo>) =>
    put<number>('system/user', data),

  delete: (id: string) =>
    del<void>(`system/user/${id}`),

  userClans: (id: string) =>
    get<ClanInfo[]>(`orange/user_clans/${id}`),

  bindClanUser: (clanId: string, userId: string) =>
    post<void>('orange/clan_user', { clan_id: clanId, user_id: userId }),

  unbindClanUser: (clanId: string, userId: string) =>
    del<void>(`orange/clan_user`, { data: { clan_id: clanId, user_id: userId } }),

  me: () =>
    get<UserSession>('system/me'),
};

// ============ 对战接口 ============

export const trackApi = {
  list: () =>
    get<TrackInfo[]>('orange/track'),

  listPage: (page: number, pageSize: number) =>
    get<RestApi<TrackInfo[]>>(`orange/track_${page}/${pageSize}`),

  detail: (id: string) =>
    get<TrackInfo>(`orange/track/${id}`),

  clanTrack: (clanId: string) =>
    get<TrackInfo[]>(`orange/track/${clanId}`),

  create: (data: Partial<TrackInfo>) =>
    post<RestApi<TrackInfo>>('orange/track', data),

  delete: (id: string) =>
    del<RestApi<void>>(`orange/track/${id}`),
};

// ============ 轮次接口 ============

export const roundApi = {
  list: () =>
    get<RestApi<RoundInfo[]>>('orange/round'),

  listPage: (page: number, pageSize: number) =>
    get<RestApi<RoundInfo[]>>(`orange/round_${page}/${pageSize}`),

  last: () =>
    get<RestApi<RoundInfo>>('orange/last_round'),

  create: (time: string) =>
    post<RestApi<number>>('orange/round', { time }),

  createFromMiddle: () =>
    get<RestApi<number>>('middle/round'),
};

// ============ 日志接口 ============

export const logApi = {
  operateLog: () =>
    getPublic<RestApi<OperateLogInfo[]>>('orange/operate_log', PUBLIC_TOKEN.operateLog),

  operateLogPage: (page: number, pageSize: number) =>
    getPublic<RestApi<OperateLogInfo[]>>(`orange/operate_log_${page}/${pageSize}`, PUBLIC_TOKEN.operateLog),

  loginLog: (search?: string) =>
    search
      ? getMsgpack<RestApi<LoginLogInfo[]>>(`safety/login_log/${search}`, PUBLIC_TOKEN.loginLog)
      : getMsgpack<RestApi<LoginLogInfo[]>>('safety/login_log', PUBLIC_TOKEN.loginLog),

  loginLogPage: (page: number, pageSize: number) =>
    getMsgpack<RestApi<LoginLogInfo[]>>(`safety/login_log_${page}/${pageSize}`, PUBLIC_TOKEN.loginLog),
};

export const middleApi = {
  track: (tag: string) =>
    getPublic<MiddleTrackApi>(`middle/track/${tag}`, PUBLIC_TOKEN.middleTrack),
  readCompo: () =>
    getMsgpack<RestApi<MiddleReadCompoInfo>>('middle/read_compo', PUBLIC_TOKEN.middleReadCompo),
};

export { PUBLIC_TOKEN };
