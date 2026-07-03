export interface UserSession {
  id: string;
  code: string;
  email: string;
  name: string;
  token: string;
  role: RoleInfo[];
  clans: ClanInfo[];
}

export interface RoleInfo {
  id: string;
  name: string;
  code: string;
  status: number;
  path: string;
}

export interface ClanInfo {
  id: string;
  tag: string;
  name: string;
  create_time: string;
  update_time: string;
  status: ClanStatus;
  series_id?: string;
  is_global: boolean;
  reward_point: number;
  point: number;
}

export interface ClanPointInfo {
  clan_id: string;
  point: number;
  create_time: string;
  update_time: string;
  status?: number;
  reward_point: number;
  tag?: string;
  name?: string;
}

export enum ClanStatus {
  Ready = 1,
  Locked = 2,
  Other = 3,
  Blacklist = 4,
  Ally = 9,
}

export interface TrackInfo {
  id: string;
  self_clan_id: string;
  rival_clan_id: string;
  self_history_point: number;
  rival_history_point: number;
  create_time: string;
  self_now_point: number;
  rival_now_point: number;
  round_id: string;
  result: TrackResult;
  type: TrackType;
  reward_info?: TrackRewardInfo;
  round_code?: string;
  self_tag?: string;
  self_name?: string;
  rival_tag?: string;
  rival_name?: string;
}

export enum TrackResult {
  Win = 1,
  None = 0,
  Lose = -1,
}

export enum TrackType {
  External = 0,
  Internal = 1,
  Alliance = 2,
  Award = 11,
  Penalty = 12,
}

export interface TrackRewardInfo {
  self_history: number;
  rival_history: number;
  self_now: number;
  rival_now: number;
}

export interface RoundInfo {
  id: string;
  code: string;
  round_time: string;
  create_time: string;
}

export interface UserInfo {
  id?: string;
  name: string;
  email: string;
  status?: number;
  code: string;
  phone?: string;
  create_time: string;
  update_time: string;
  password?: string;
}

export interface OperateLogInfo {
  id: string;
  round_id: string;
  text: string;
  create_time: string;
  clan_id: string;
  reward_type: RewardType;
  tag: string;
  name: string;
  round_code: string;
  remarks?: string;
}

export enum RewardType {
  HitExternal = 'HitExternal',
  FaceBlack = 'FaceBlack',
  Penalty = 'Penalty',
  Penalty2 = 'Penalty2',
  Penalty3 = 'Penalty3',
}

export interface LoginLogInfo {
  user_id: string;
  login_time: string;
  address: string;
  code: string;
  name: string;
}

export interface RestApi<D> {
  msg_en: string;
  msg_cn: string;
  data?: D;
  data_count: number;
}

// MiddleTrack 公共积分查询
export interface MiddleTrackApi {
  server: string;
  bz_total_score: number;
  public_total_score: number;
  details: MiddleTrackDetail[];
  summary: string[];
  tag: string;
}

export interface MiddleTrackDetail {
  bz_round: number;
  round_point: number;
  round_result: string;
  clan_tag: string;
  opp_clan_tag?: string;
  explain?: string;
}

export interface MiddleReadCompoInfo {
  min_th_avg: number;
  max_th_avg: number;
  calculated_time: string;
  calculated_composition: string[];
  global: boolean;
}
