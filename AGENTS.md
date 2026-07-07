# AGENTS.md

## 项目背景

本项目为 **CFA（部落对战积分系统）** 管理后台前端，由原 Rust/Dioxus 项目 `orange_international_web` 迁移至 React + TypeScript + Vite 技术栈。

旧项目路径：`/Users/mzx/RustroverProjects/orange_international_web`
后端路径：`/Users/mzx/RustroverProjects/orange_international`

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

### 后端接口
后端 API 地址根据域名自动切换：
- 本地开发：`http://localhost:20020/api`
- 测试环境：`https://ncfa.orgvoid.top/api`
- 生产环境：`https://cfa.orgvoid.top/api`

### 认证机制
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

### 搜索接口说明
- 部落搜索 `POST /orange/clan_search` 和用户搜索 `POST /system/user_search` 的请求体为**原始 JSON 字符串**（如 `"keyword"`），而非 JSON 对象
- 需使用 `JSON.stringify(keyword)` 手动序列化，并设置 `Content-Type: application/json`
- 对应前端方法：`postPublicRaw`（公开接口）和 `postRaw`（用户接口）

### 演示账号
登录页对接后端 API，使用邮箱 + 密码登录。Token 存储在 localStorage 的 `username` 键中。
- **管理员邮箱**: `admin@example.com`
- **管理员密码**: `admin123`
- 实际账号以后端数据库为准

## 路由与权限
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

## 项目结构
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
│   ├── auth/Login.tsx
│   ├── dashboard/Dashboard.tsx
│   ├── clan/   (ClanList/ClanAdd/ClanEdit/ClanTrack)
│   ├── user/   (UserList/UserAdd/UserEdit)
│   ├── track/  (TrackList/TrackInsert/RoundList/RoundAdd)
│   ├── log/    (OperateLog/LoginLog)
│   ├── settings/Settings.tsx
│   └── middle/ (MiddleTrack/ReadCompo)
├── i18n.ts, locales.ts, App.tsx, main.tsx, index.css
```

## 设计体系
- **主题**: 樱花驾驶舱 (Sakura Cockpit) — 粉色调 + 玻璃拟态 + 微妙光晕
- **调色板**（定义于 `tailwind.config.js` 的 `theme.extend.colors.brand`）：
  - `brand-base` (#FFF5F7), `brand-surface` (rgba(255,255,255,0.75)), `brand-soft` (#FFD9E2)
  - `brand-primary` (#D8688A), `brand-glow` (#F472B6), `brand-accent` (#C084FC)
  - `brand-text` (#5B4455), `brand-textLight` (#9A8A94), `brand-muted` (#F9EEF2)
  - `brand-border` (#F5D9E1), `brand-success`, `brand-warning`, `brand-error`
- **阴影**: `shadow-soft` / `shadow-card` / `shadow-float` / `shadow-glow` / `shadow-glowLg`
- **圆角**: 自定义 `rounded-3xl` (1.25rem) 和 `rounded-4xl` (1.75rem)
- **动画**: `fade-in` / `slide-up` / `slide-down` / `pulse-soft` / `float` / `glow` / `shake`
- **玻璃拟态工具类** (`src/index.css`): `.glass` / `.glass-strong` / `.text-gradient` / `.bg-gradient-primary` / `.bg-gradient-accent` / `.btn-shimmer` / `.hover-lift` / `.shadow-glow-hover`
- **响应式**: 桌面端侧边栏常驻；移动端 sticky 头部 + 抽屉式侧边栏 + 遮罩层；尊重 `prefers-reduced-motion`
- **主题背景**: 页面使用 `linear-gradient(to right, ...)` 左右渐变，左侧淡粉 → 中间透明 → 右侧淡紫，底部保留弱径向渐变增强层次感

## 业务模块说明

### 部落管理 (Clan)
- 部落状态：正常(1) / 锁定(2) / 其他(3) / 黑名单(4) / 友盟(9)
- 支持按名称或标签搜索；顶部各状态数量统计（移动端 5 列紧凑布局）
- 管理员可新增（支持 Auto 自动获取名称）、编辑状态、删除部落
- 首页"我的部落"点击部落名跳转到部落对战记录页
- `clan.is_global` = 国际服(Global)，`false` = 中国服(China)；所有卡片显示服务器标签
- **Clan Counts API**: 后端提供 `GET /orange/clan_counts` 接口返回各状态统计数量，前端通过 `clanApi.searchStats()` 调用，返回 `{ ready: number, locked: number, other: number, blacklist: number, ally: number }` 格式

### 部落对战记录 (ClanTrack)
- 路径 `/clan-track/:id`，首页部落卡片点击进入
- 展示所有对战记录，自动判定胜负视角（`getWinLose` 以当前帮派为准）
- 顶部队列：胜 / 负 / 奖励 / 惩罚 / 其他
- 展示双方部落、tag、历史→当前积分(+diff)、奖励变动；当前帮派为主视角排第一行

### 用户管理 (User)
- 仅管理员可见；支持按姓名或邮箱搜索
- 用户状态：活跃(1) / 未激活(0) / 待审核(2)
- 管理员可新增、编辑（资料/密码/状态，`Select` 组件）、删除用户
- 普通用户可编辑自己的资料和密码（仅本人页面可见）
- 列表布局：单 Card + `divide-y divide-brand-border` + 方形头像 + 编辑/删除按钮

### 对战记录 (Track)
- 仅管理员可见
- 对战类型：外部(0) / 内部(1) / 友盟(2) / 奖励局(11) / 处罚局(12)
- 对战结果：胜利(1) / 未结算(0) / 失败(-1)
- 登记：首页部落卡片先手/后手切换 + 登记按钮；管理员 `/track-insert` 手动输入双方标签

### 轮次管理 (Round)
- 轮次编码、开战时间、发布时间
- 管理员可新增：手动选择时间（datetime-local）或从中间库获取时间；首页展示最近一轮

### 管理日志 (OperateLog)
- 奖励类型：打虫减分 / 俩黑 / 处罚1 / 处罚2 / 处罚3

### 登录日志 (LoginLog)
- 仅管理员可见；MessagePack 格式；IntersectionObserver 瀑布流；支持按用户编码搜索（不分页）
- 列表布局：单 Card + `divide-y divide-brand-border` 方形头像

### 公共对战查询 (MiddleTrack)
- 输入部落标签查询公共积分数据；`explain` 字段显示为 `text-xs text-brand-textLight/60`
- 展示：不战积分、公共积分、轮次、不战轮次、当场积分

### 参考配置 (ReadCompo)
- 基于平均大本等级的推荐兵力配置；支持全盟数据标识

## UI 组件
所有组件位于 `src/components/ui.tsx`：
- **Card** — 玻璃拟态卡片，支持 hover
- **Button** — 4 种变体（primary / secondary / ghost / danger），3 种尺寸，loading 状态，hover 玻璃光泽移动特效
- **InputField** — 玻璃质感 + focus 发光边框
- **Badge** — 状态标签（success / warning / error / default）
- **Toggle** — 渐变开关，弹性动画
- **Select** — 样式化下拉选择框
- **Textarea** — 多行文本输入框

## 国际化
- **3 种语言**: zh_CN / zh_TW / en，默认 zh_CN
- 语言偏好保存在 `localStorage` 的 `language` 键中
- 使用 `useTranslation()` 钩子；键按命名空间组织：`common` / `nav` / `auth` / `dashboard` / `explanation` / `clan` / `user` / `track` / `round` / `log` / `middle` / `settings`
- **所有文本**必须使用 `t('namespace.key')`，不得硬编码
- 新增翻译键须同时在三种语言中添加，禁止单语言添加
- 登录页和侧边栏均有语言切换器

## 开发命令
- `npm run dev` — 启动 Vite 开发服务器
- `npm run build` — TypeScript 类型检查 + 构建生产版本
- `npm run preview` — 本地预览生产构建结果
- `npx tsc --noEmit` — 仅类型检查

## 开发规范

### 对战结果展示
- 单字：zh_CN "赢/输/平"，zh_TW "贏/輸/平"，en "Win/Lose/Draw"
- 标签位于名称下方，与积分变动 `history → now (+diff)` 同行
- 奖惩变动 `Reward: X → Y (+Z)` 跟随在积分变动后显示

### 仪表盘轮次展示
- `items-center` 垂直居中；图标 `w-12 h-12 rounded-2xl`，渐变 `from-brand-primary to-brand-glow`
- 开战时间 `text-xl font-bold`

### 分页接口
| 接口 | 路径 | 说明 |
|------|------|------|
| 部落列表 | `GET /orange/clan_{page}/{page_size}` | 公开，token: `cfa*clan*select` |
| 对战记录 | `GET /orange/track_{page}/{page_size}` | 用户接口 |
| 轮次管理 | `GET /orange/round_{page}/{page_size}` | 用户接口 |
| 管理日志 | `GET /orange/operate_log_{page}/{page_size}` | 公开，token: `cfa*operate*log*select` |
| 登录日志 | `GET /safety/login_log_{page}/{page_size}` | MsgPack，token: `cfa*login*log*select` |
| 用户列表 | `GET /system/user_{page}/{page_size}` | 用户接口 |
- 所有接口返回 `RestApi<Vec<T>>`，含 `data_count` 字段
- 前端使用 IntersectionObserver 实现瀑布流加载

### 分页防重复规范
- `isLoadingRef` 防止多次触发同一页（请求期间 true）
- `hasMore` 判断：`data.length === PAGE_SIZE` 时有更多
- 数据去重：基于唯一 id 过滤（无 id 时用组合键如 `user_id_login_time`）
- 涉及页面：ClanList / TrackList / RoundList / OperateLog / LoginLog / UserList

### Sticky Header
- 所有页面（除 Dashboard/Login 外）顶部 `sticky top-0 backdrop-blur-md`
- 移动端菜单按钮集成在头部行内，`useSidebar()` hook 控制侧边栏
- DashboardLayout 控制顶部留白：`pt-8 sm:pt-10 lg:pt-12`；底部 `pb-8`
- 涉及页面：ClanList / ClanAdd / ClanEdit / ClanTrack / UserList / UserAdd / UserEdit / UserClans / TrackList / TrackInsert / RoundList / RoundAdd / OperateLog / LoginLog / MiddleTrack / ReadCompo / Settings

### 页面标题图标
- `<h1>` 前加：`<Icon className="w-5 h-5 text-brand-primary shrink-0" />`
- `h1` 含 `flex items-center gap-2`
- 图标语义对应（如 ClanList=Flag, TrackList=Swords, Settings=Settings）

### 列表页 UI 规范
- 单 Card + `divide-y divide-brand-border` 布局
- 每行 `p-5 hover:bg-brand-muted/20 transition-colors`
- 方形头像 `w-9 h-9 rounded-xl bg-stone-50` + 灰度图标
- 上段 `flex items-start gap-3`（avatar + title），下段 `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ml-12`（badges + timestamp）

### 侧边栏登录状态
- 已登录：用户头像卡片 + 角色过滤导航菜单 + 登出按钮
- 未登录：品牌卡片（app_name + guest_hint）+ BZLM 外部链接 + 登录按钮；不显示受保护菜单项
- BZLM 链接：`https://www.cocbzlm.com`（外部链接，新窗口）
- 公共页面 `/middle-track/:tag` 和 `/read-compo` 为无保护路由

### 用户管理规范
- `code` 是登录用户名，不加 `#` 前缀；显示顺序 email → code → time
- 列表：单 Card + `divide-y`；每项右侧有编辑按钮（`Edit` 图标，`/user-update/:id`）和删除按钮
- 编辑页管理员用 `Select` 修改 status（Active/Inactive/Pending）
- 权限：普通用户只能编辑本人资料/密码；管理员可修改 code/email/status/password

### 部落新增按钮智能逻辑
- 提交按钮始终使用 `t('common.add')` + `<Wand2>` 图标（"添加/新增/Add"）
- 名称为空时按钮带 `shadow-lg shadow-brand-primary/30 animate-pulse-subtle` 动效提示
- 名称不为空时无特效
- 提交传 `name: isAuto ? undefined : name.trim()`

### 新增/添加按钮规范
- 所有模块的新增/添加按钮（列表页导航按钮、提交按钮）统一使用 `t('common.add')` + 对应图标
- 不额外显示模块名前缀（如原 "添加部落" → "添加"）

### 专业技能
- `.claude/skills/` 目录下
- 视觉/UI 设计先加载 `frontend-design` skill
- 配置 opencode 本身时加载 `customize-opencode` skill

## 已知问题（待修复）
- Settings 页面密码修改和通知设置为 `alert()` 占位逻辑
- `RoundAdd.tsx` 和 Add/Edit 页面的 success 检测依赖翻译值，建议改为判断 API 返回码
- 登录日志 IP 地理位置显示（可选功能，需后端支持）
