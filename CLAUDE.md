# CLAUDE.md

本文件为 Claude Code 在本仓库中工作时提供指导。

## 项目背景

本项目为 **CFA（部落对战积分系统）** 管理后台前端，由原 Rust/Dioxus 项目 `orange_international_web` 迁移至 React + TypeScript + Vite 技术栈。

旧项目路径：`/Users/mzx/RustroverProjects/orange_international_web`

### 后端接口
后端 API 地址根据域名自动切换：
- 本地开发：`http://localhost:20020/api`
- 生产环境：`https://cfa.orgvoid.top/api` 或 `https://cfa.omcoc.club/api`

#### 认证机制
项目使用双轨认证机制：

**1. 登录接口（特殊认证）**
- `POST /system/login`
- Header: `Authorization: Bearer cfa*login*auth`
- Content-Type: `application/msgpack`
- Body: MessagePack 编码的 `{email, password}`

**2. 已登录用户接口**
- Header: `Authorization: Bearer {user_token}`（从 localStorage 读取）
- Content-Type: `application/json`
- 401 响应时自动清除本地存储并跳转登录页

**3. 公开接口（无需登录）**
| 接口 | Token |
|------|-------|
| `GET /orange/clan` 部落列表 | `cfa*clan*select` |
| `POST /orange/clan_search` 部落搜索 | `cfa*clan*select` |
| `GET /orange/operate_log` 操作日志 | `cfa*operate*log*select` |
| `GET /safety/login_log` 登录日志 | `cfa*login*log*select` |
| `GET /middle/track/:tag` 公共积分 | `middle*track*select` |
| `GET /middle/read_compo` 参考配置 | `middle*read_compo*select` |

**4. 特殊数据格式**
- 登录日志接口：响应使用 MessagePack 格式（需解码）

**5. 分页接口**
| 接口 | 路径 | 说明 |
|------|------|------|
| 部落列表 | `GET /orange/clan_{page}/{page_size}` | 公开接口，返回 `data_count` |
| 对战记录 | `GET /orange/track_{page}/{page_size}` | 用户接口，返回 `data_count` |
| 轮次管理 | `GET /orange/round_{page}/{page_size}` | 用户接口，返回 `data_count` |
| 管理日志 | `GET /orange/operate_log_{page}/{page_size}` | 公开接口，返回 `data_count` |
| 登录日志 | `GET /safety/login_log_{page}/{page_size}` | MsgPack 格式，返回 `data_count` |
| 用户列表 | `GET /system/user_{page}/{page_size}` | 用户接口，返回 `data_count` |
- 所有分页接口返回 `RestApi<Vec<T>>`，包含 `data_count` 字段表示总数
- 前端使用 IntersectionObserver 实现瀑布流加载
- 分页防重复机制：
  - 使用 `isLoadingRef` 防止 IntersectionObserver 重复触发同一页请求
  - 使用 `hasMore` 状态（基于返回数据长度与 PAGE_SIZE 比较）判断是否还有更多数据
  - 数据去重：基于唯一 id（或组合键如 `user_id_login_time`）过滤已存在数据
  - 涉及页面：ClanList / TrackList / RoundList / OperateLog / LoginLog / UserList

## 开发命令

- `npm run dev` — 启动 Vite 开发服务器
- `npm run build` — 运行 TypeScript 类型检查并构建生产版本
- `npm run preview` — 本地预览生产构建结果
- `npx tsc --noEmit` — 仅运行 TypeScript 类型检查

## 项目架构

### 技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式**: Tailwind CSS 3 + 自定义粉色主题
- **路由**: React Router DOM v6
- **国际化**: i18next + react-i18next
- **状态管理**: Zustand
- **HTTP 请求**: Axios
- **数据格式**: JSON + MessagePack（登录日志）
- **图标**: lucide-react

### 设计体系
- **主题**: 樱花驾驶舱 (Sakura Cockpit) — 粉色调 + 玻璃拟态 + 微妙光晕
- **调色板**（定义于 `tailwind.config.js` 的 `theme.extend.colors.brand`）：
  - `brand-base` — 页面背景 (#FFF5F7)
  - `brand-surface` — 卡片玻璃表面 (rgba(255,255,255,0.75))
  - `brand-soft` — 柔和粉色 (#FFD9E2)
  - `brand-primary` — 主色玫瑰 (#D8688A)
  - `brand-glow` — 辉光粉 (#F472B6)
  - `brand-accent` — 淡紫强调 (#C084FC)
  - `brand-text` — 正文深紫棕 (#5B4455)
  - `brand-textLight` — 次要文字 (#9A8A94)
  - `brand-muted` — 柔和背景 (#F9EEF2)
  - `brand-border` — 边框色 (#F5D9E1)
  - `brand-success` / `brand-warning` / `brand-error` — 语义色
- **阴影**: `shadow-soft` / `shadow-card` / `shadow-float` / `shadow-glow` / `shadow-glowLg`
- **圆角**: 自定义 `rounded-3xl` (1.25rem) 和 `rounded-4xl` (1.75rem)
- **动画**:
  - `fade-in` / `slide-up` / `slide-down` — 页面进入动画
  - `pulse-soft` — 柔和脉冲
  - `float` — 浮动效果
  - `glow` — 发光呼吸
  - `shake` — 错误抖动
- **玻璃拟态工具类** (`src/index.css`):
  - `.glass` / `.glass-strong` — 玻璃背景
  - `.text-gradient` — 渐变文字
  - `.bg-gradient-primary` / `.bg-gradient-accent` — 渐变背景
  - `.btn-shimmer` / `.btn-shimmer-primary` / `.btn-shimmer-secondary` — 按钮光泽移动特效
  - `.hover-lift` / `.shadow-glow-hover` — 悬浮效果
- **响应式**:
  - 桌面端 (lg+)：侧边栏常驻 + 全宽内容
  - 移动端：顶部 sticky 头部 + 抽屉式侧边栏 + 遮罩层
  - 尊重 `prefers-reduced-motion` 系统设置
- **Sticky Header**:
  - 各页面顶部使用 `sticky top-0 backdrop-blur-md` 实现滚动虚化效果
  - 移动端菜单按钮集成在页面头部行内，无独立顶部导航栏
  - DashboardLayout 控制统一顶部留白：`pt-8 sm:pt-10 lg:pt-12`

### 演示账号
登录页对接后端 API，使用邮箱 + 密码登录。Token 存储在 localStorage 的 `username` 键中。

- **管理员邮箱**: `admin@example.com`
- **管理员密码**: `admin123`
- 实际账号以后端数据库为准

### 项目结构
```
src/
├── api/
│   ├── request.ts          # Axios 请求封装（拦截器、MsgPack、工具函数）
│   └── index.ts            # 各模块 API 接口（auth/clan/user/track/round/log）
├── store/
│   └── user.ts             # Zustand 用户状态管理（token、角色权限）
├── types/
│   └── index.ts            # TypeScript 类型定义（User/Clan/Track/Round/Log 等）
├── components/
│   ├── ui.tsx              # 可复用 UI 组件（Card/Button/InputField/Badge/Toggle/Select/Textarea）
│   └── DashboardLayout.tsx # 仪表盘布局（侧边栏导航 + 语言切换 + 用户信息 + 顶部留白）
├── contexts/
│   └── SidebarContext.tsx  # 侧边栏状态上下文（控制移动端菜单按钮）
├── pages/
│   ├── auth/
│   │   └── Login.tsx       # 登录页
│   ├── dashboard/
│   │   └── Dashboard.tsx   # 首页（系统介绍 + 最近轮次 + 我的部落）
│   ├── clan/
│   │   ├── ClanList.tsx    # 部落管理（列表 + 搜索 + 状态统计）
│   │   ├── ClanAdd.tsx     # 新增部落（管理员，支持自动获取名称）
│   │   ├── ClanEdit.tsx    # 编辑部落（状态修改/删除，管理员可见操作）
│   │   └── ClanTrack.tsx   # 部落对战记录（首页部落名点击进入）
│   ├── user/
│   │   ├── UserList.tsx    # 用户管理（列表 + 搜索，仅管理员可见）
│   │   ├── UserAdd.tsx     # 新增用户（管理员）
│   │   └── UserEdit.tsx    # 编辑用户（资料/密码/状态/删除）
│   ├── track/
│   │   ├── TrackList.tsx    # 对战记录（列表，仅管理员可见）
│   │   ├── TrackInsert.tsx  # 登记对战（管理员，手动输入双方标签）
│   │   ├── RoundList.tsx    # 轮次管理（列表）
│   │   └── RoundAdd.tsx     # 新增轮次（管理员，datetime-local 时间选择 + 中间库时间）
│   ├── log/
│   │   ├── OperateLog.tsx  # 管理日志（列表）
│   │   └── LoginLog.tsx    # 登录日志（列表 + 搜索，仅管理员可见，MsgPack 格式）
│   ├── settings/
│   │   └── Settings.tsx    # 设置页（个人资料/语言/安全/通知）
│   ├── middle/
│   │   ├── MiddleTrack.tsx # 公共对战查询（按部落标签查询积分）
│   │   └── ReadCompo.tsx   # 参考配置（基于平均大本等级的推荐兵力配置）
├── i18n.ts                 # i18next 初始化配置
├── locales.ts              # 多语言翻译文本（zh_CN / zh_TW / en）
├── App.tsx                 # 应用根组件 + 路由配置 + 路由守卫
├── main.tsx                # React 入口文件
└── index.css               # 全局样式 + Tailwind 指令
```

### 路由与权限

| 路径 | 页面 | 权限 |
|------|------|------|
| `/login` | 登录页 | 公开 |
| `/` | 首页仪表盘 | 登录用户 |
| `/clan` | 部落管理 | 登录用户 |
| `/clan-add` | 新增部落 | 管理员 (admin) |
| `/clan-update/:id` | 编辑部落 | 登录用户（管理员可改状态/删） |
| `/clan-track/:id` | 部落对战记录 | 登录用户 |
| `/user` | 用户管理 | 管理员 (admin) |
| `/user-add` | 新增用户 | 管理员 (admin) |
| `/user-update/:id` | 编辑用户 | 登录用户（管理员可改状态/删） |
| `/track` | 对战记录 | 管理员 (admin) |
| `/track-insert` | 登记对战 | 管理员 (admin) |
| `/round` | 轮次管理 | 登录用户 |
| `/round-insert` | 新增轮次 | 管理员 (admin) |
| `/operate-log` | 管理日志 | 登录用户 |
| `/login-log` | 登录日志 | 管理员 (admin) |
| `/settings` | 设置页 | 登录用户 |
| `/middle-track/:tag` | 公共对战查询 | 登录用户 |
| `/read-compo` | 参考配置 | 公开 |

权限控制：
- 路由级：`ProtectedRoute` 组件检查 token，未登录跳转登录页
- 页面级：`useUserStore().isAdmin()` / `hasRole()` 检查角色
- 侧边栏：`adminOnly` 标记的菜单项根据角色动态显示

### 国际化
- **3 种语言**: 简体中文 (zh_CN)、繁體中文 (zh_TW)、English (en)
- 语言偏好保存在 `localStorage` 的 `language` 键中
- 默认语言: `zh_CN`
- 所有可翻译文本使用 `useTranslation()` 钩子
- 翻译键按命名空间组织：`common`、`nav`、`auth`、`dashboard`、`explanation`、`clan`、`user`、`track`、`round`、`log`、`middle`、`settings`
- 新增翻译键须同时在 zh_CN / zh_TW / en 三种语言中添加，禁止单语言添加
- 登录页和侧边栏均有语言切换器

### 业务模块说明

#### 部落管理 (Clan)
- 部落状态：正常(1) / 锁定(2) / 其他(3) / 黑名单(4) / 友盟(9)
- 支持按名称或标签搜索
- 顶部显示各状态部落数量统计（移动端 5 列紧凑布局）
- 管理员可新增（支持 Auto 自动获取名称）、编辑状态、删除部落
- **新增部落按钮智能逻辑**：根据部落名称是否为空动态改变按钮样式和行为
  - 名称为空时：按钮显示"自动新增"，带发光动画特效（推荐方式）
  - 名称不为空时：按钮显示"新增"，无特效
  - 提交时后端根据 name 字段是否为空判断是否自动获取名称
- 首页"我的部落"点击部落名跳转到部落对战记录页
- `clan.is_global` 表示该部落所在服务器：`true`=国际服(Global)，`false`=中国服(China)
- 所有部落卡片均显示服务器标签，使用 `clan.is_global` / `clan.server_china` 键

#### 部落对战记录 (ClanTrack)
- 路径：`/clan-track/:id`，首页部落卡片点击进入
- 展示该部落的所有对战记录，自动判定胜负视角（`getWinLose` 函数以当前帮派为准，不依赖 DB `self_clan_id` 固定视角）
- 顶部队列：胜 / 负 / 奖励 / 惩罚 / 其他
- 展示双方部落、tag、历史积分→当前积分(+diff)、奖励变动；始终以当前帮派为主视角排在第一行

#### 用户管理 (User)
- 仅管理员可见
- 支持按姓名或邮箱搜索
- 用户状态：活跃/待审核/未激活
- 管理员可新增、编辑（资料/密码/状态）、删除用户
- 普通用户可编辑自己的资料和密码

#### 对战记录 (Track)
- 仅管理员可见
- 对战类型：外部(0) / 内部(1) / 友盟(2) / 奖励局(11) / 处罚局(12)
- 对战结果：胜利(1) / 未结算(0) / 失败(-1)
- 展示双方部落、积分、轮次、时间
- 登记对战：
  - 首页登记：每个部落卡片上先手/后手切换 + 登记按钮，调用 `POST /orange/track` 传 `{ self_tag, last }`
  - 管理员登记页 `/track-insert`：手动输入双方标签 `{ self_tag, rival_tag }`

#### 轮次管理 (Round)
- 轮次编码、开战时间、发布时间
- 管理员可新增轮次：手动选择时间（datetime-local）或从中间库获取时间
- 首页展示最近一轮信息

#### 管理日志 (OperateLog)
- 奖励类型：打虫减分 / 俩黑 / 处罚1 / 处罚2 / 处罚3
- 展示部落、轮次、备注信息

#### 登录日志 (LoginLog)
- 仅管理员可见
- 使用 MessagePack 格式传输
- 支持瀑布流加载（IntersectionObserver）
- 支持按用户编码搜索（搜索时不分页）

#### 公共对战查询 (MiddleTrack)
- 输入部落标签查询公共积分数据
- 展示：不战积分、公共积分、轮次、不战轮次、当场积分
- 明细列表：标签、名称、历史积分、当前积分、奖励

#### 参考配置 (ReadCompo)
- 基于平均大本等级的推荐兵力配置
- 展示：平均大本等级范围（最小/最大）、推荐配置列表、统计时间
- 支持全盟数据标识

### UI 组件
所有组件位于 `src/components/ui.tsx`：
- **Card** — 玻璃拟态卡片，支持 hover 效果
- **Button** — 4 种变体（primary / secondary / ghost / danger），3 种尺寸，支持 loading 状态，hover 玻璃光泽移动特效
- **InputField** — 文本输入框，玻璃质感 + focus 发光边框
- **Badge** — 状态标签（success / warning / error / default）
- **Toggle** — 渐变开关，弹性动画
- **Select** — 样式化下拉选择框
- **Textarea** — 多行文本输入框

### 已知问题（待修复）

#### 功能未完成
- **Settings.tsx** — 修改密码和保存个人资料使用 `alert()` 占位，未调 API
- **RoundAdd.tsx/ClanAdd.tsx/ClanEdit.tsx/UserAdd.tsx/UserEdit.tsx** — success 检测依赖翻译值比较，建议改为判断 API 返回码
- 登录日志（LoginLog）IP 地理位置显示为可选功能，需后端支持

### 搜索接口说明
- 部落搜索 `POST /orange/clan_search` 和用户搜索 `POST /system/user_search` 的请求体为**原始 JSON 字符串**（如 `"keyword"`），而非 JSON 对象
- 需使用 `JSON.stringify(keyword)` 手动序列化，并设置 `Content-Type: application/json`
- 对应前端方法：`postPublicRaw`（公开接口）和 `postRaw`（用户接口）
