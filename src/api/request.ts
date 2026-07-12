import axios from 'axios';
import * as msgpack from 'msgpack-lite';

const getBaseUrl = () => {
  const hostname = window.location.hostname;
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'http://localhost:20020/api';
  } else {
    return 'https://ncfa.orgvoid.top/api';
  };
};

// 公开 API token
export const PUBLIC_TOKEN = {
  login: 'cfa*login*auth',
  clan: 'cfa*clan*select',
  operateLog: 'cfa*operate*log*select',
  loginLog: 'cfa*login*log*select',
  middleTrack: 'middle*track*select',
  middleReadCompo: 'middle*read_compo*select',
} as const;

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 300000,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// 普通请求拦截器：附加用户 token（仅当未手动设置 Authorization 时）
api.interceptors.request.use((config) => {
  // 如果已经手动设置了 Authorization header（如公开接口），不覆盖
  if (config.headers && config.headers.Authorization) {
    return config;
  }
  const userStr = localStorage.getItem('username');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      // ignore
    }
  }
  return config;
});

// 401 时清除本地存储并跳转登录（排除登录接口）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('system/login')) {
        localStorage.removeItem('username');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============ 通用方法 ============

export const get = async <T>(url: string, params?: Record<string, any>, options?: { signal?: AbortSignal }): Promise<T> => {
  const res = await api.get<T>(url, { params, signal: options?.signal });
  return res.data;
};

export const post = async <T>(url: string, data?: any, options?: { headers?: Record<string, string> }): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  const res = await api.post<T>(url, data, { headers });
  return res.data;
};

export const postRaw = async <T>(url: string, rawText: string): Promise<T> => {
  const res = await api.post<T>(url, JSON.stringify(rawText), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

export const put = async <T>(url: string, data?: any): Promise<T> => {
  const res = await api.put<T>(url, data);
  return res.data;
};

export const del = async <T>(url: string, options?: { data?: any }): Promise<T> => {
  const res = await api.request<T>({
    method: 'DELETE',
    url,
    data: options?.data,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

export const head = async (url: string): Promise<boolean> => {
  try {
    const res = await api.head(url);
    return res.status === 200;
  } catch (e: any) {
    if (e?.response?.status === 401) return false;
    return true;
  }
};

// ============ 公开接口方法（使用 public token）============

export const getPublic = async <T>(url: string, publicToken: string, params?: Record<string, any>): Promise<T> => {
  const res = await api.get<T>(url, {
    headers: {
      Authorization: `Bearer ${publicToken}`,
    },
    params,
  });
  return res.data;
};

export const postPublic = async <T>(url: string, data: any, publicToken: string): Promise<T> => {
  const res = await api.post<T>(url, data, {
    headers: {
      Authorization: `Bearer ${publicToken}`,
    },
  });
  return res.data;
};

export const postPublicRaw = async <T>(url: string, rawText: string, publicToken: string): Promise<T> => {
  const res = await api.post<T>(url, JSON.stringify(rawText), {
    headers: {
      Authorization: `Bearer ${publicToken}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

// ============ MsgPack 方法 ============

export const postMsgpack = async <T>(url: string, data?: any): Promise<T> => {
  const encoded = msgpack.encode(data);
  const res = await api.post(url, encoded, {
    headers: {
      'Content-Type': 'application/msgpack',
    },
  });
  return res.data as T;
};

export const getMsgpack = async <T>(url: string, publicToken?: string): Promise<T> => {
  const res = await api.get(url, {
    responseType: 'arraybuffer',
    headers: publicToken
      ? { Authorization: `Bearer ${publicToken}` }
      : undefined,
  });
  return msgpack.decode(new Uint8Array(res.data)) as T;
};

// ============ 登录专用（使用 login token + MsgPack）============
export const postLoginMsgpack = async <T>(url: string, data: any): Promise<T> => {
  const encoded = msgpack.encode(data);
  const res = await api.post<T>(url, encoded, {
    headers: {
      Authorization: `Bearer ${PUBLIC_TOKEN.login}`,
      'Content-Type': 'application/msgpack',
    },
  });
  return res.data;
};

// ============ 工具函数 ============

export const timeParse = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
