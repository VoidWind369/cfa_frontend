# AGENTS.md

## 项目上下文
- 核心开发命令和架构概览请参阅 `CLAUDE.md`，每次开始工作前先阅读。
- 专业技能文件位于 `.claude/skills/` 目录下。
- 当任务涉及视觉/UI 设计时，请先加载 `frontend-design` skill 确保遵循设计体系。
- 当配置 opencode 本身时，请加载 `customize-opencode` skill。

## 国际化规范
- **所有文本**必须使用 `t('namespace.key')` 调用，不得硬编码任何语言文本
- `locales.ts` 必须为 **zh_CN/zh_TW/en** 三种语言同时添加翻译键
- 新增翻译键须先在所有三种语言中添加后再引用，避免遗漏

## 对战结果展示规范
- 对战结果使用单字：zh_CN 用"赢/输/平"，zh_TW 用"贏/輸/平"，en 用"Win/Lose/Draw"
- 对战记录中标签位于名称下方，与积分变动 `history → now (+diff)` 同行
- 奖惩变动 `Reward: X → Y (+Z)` 跟随在积分变动后显示

## 仪表盘轮次展示
- 轮次卡片图标与文字使用 `items-center` 垂直居中
- 图标容器 `w-12 h-12 rounded-2xl`，品牌色渐变 `from-brand-primary to-brand-glow`
- 开战时间统一 `text-xl font-bold`

## 已知问题（待修复）
- Settings 页面密码修改和通知设置为 `alert()` 占位逻辑
- `RoundAdd.tsx` 和 Add/Edit 页面的 success 检测依赖翻译值，建议改为判断 API 返回码
- 登录日志 IP 地理位置显示（可选功能，需后端支持）

## 分页接口说明
- 部落列表：`GET /orange/clan_{page}/{page_size}`（公开接口，token: `cfa*clan*select`）
- 对战记录：`GET /orange/track_{page}/{page_size}`（用户接口）
- 轮次管理：`GET /orange/round_{page}/{page_size}`（用户接口）
- 管理日志：`GET /orange/operate_log_{page}/{page_size}`（公开接口，token: `cfa*operate*log*select`）
- 登录日志：`GET /safety/login_log_{page}/{page_size}`（MsgPack 格式，token: `cfa*login*log*select`）
- 用户列表：`GET /system/user_{page}/{page_size}`（用户接口）
- 所有分页接口返回 `RestApi<Vec<T>>`，包含 `data_count` 字段
- 前端使用 IntersectionObserver 实现瀑布流加载

## 分页防重复规范
- 使用 `isLoadingRef` 防止 IntersectionObserver 多次触发同一页请求（请求期间 ref 设为 true）
- 使用 `hasMore` 状态控制是否继续加载：`data.length === PAGE_SIZE` 时有更多，否则已加载完毕
- 数据去重：追加数据前基于唯一 id 过滤已存在项（无 id 字段时使用组合键如 `user_id_login_time`）
- 涉及页面：ClanList / TrackList / RoundList / OperateLog / LoginLog / UserList

## Sticky Header 规范
- 所有页面（除仪表盘外）顶部使用 `sticky top-0 backdrop-blur-md` 实现滚动虚化效果
- 移动端菜单按钮集成在页面头部行内，使用 `useSidebar()` hook 控制侧边栏
- DashboardLayout 控制统一顶部留白：移动端 `pt-8`，平板 `pt-10`，桌面端 `pt-12`
- SidebarContext.tsx 提供全局侧边栏状态管理，所有页面共享同一个侧边栏状态
- 涉及页面：ClanList / ClanAdd / ClanEdit / ClanTrack / UserList / UserAdd / UserEdit / UserClans / TrackList / TrackInsert / RoundList / RoundAdd / OperateLog / LoginLog / MiddleTrack / ReadCompo / Settings

## 页面标题图标
- 所有页面 `<h1>` 标题前添加主题色图标：`<Icon className="w-5 h-5 text-brand-primary shrink-0" />`
- `h1` className 必须包含 `flex items-center gap-2` 使图标与文字对齐
- 图标选取原则：图标内容与页面功能语义对应（如 ClanList=Flag, TrackList=Swords, Settings=Settings）

## 组件新增
- `src/contexts/SidebarContext.tsx` — 侧边栏状态上下文，供各页面菜单按钮使用

## 侧边栏登录状态
- 已登录：显示用户头像卡片 + 根据角色过滤的导航菜单 + 登出按钮
- 未登录：显示品牌卡片（app_name + guest_hint）+ BZLM 公共链接 + 登录按钮
- 未登录时不显示任何受保护菜单项
- 公共页面 `/middle-track/:tag` 和 `/read-compo` 为无保护路由

## 服务器标签（部落管理）
- `clan.is_global` 表示"国际服"（Global server），反之表示"中国服"（China server）
- 所有部落卡片都必须显示服务器标签，英文用 Global / China，中文用 国际服 / 中国服
- 相关 locale 键：`clan.is_global`（国际服）、`clan.server_china`（中国服）

## 公共对战查询（MiddleTrack）
- `explain` 字段为辅助文本，必须显示为小号灰色文字 `text-xs text-brand-textLight/60`，不得使用 Badge 或颜色包裹

## 用户管理（UserList）
- `code` 字段是登录用户名，前面不得加 `#` 前缀
- 其重要性与 email 同级，显示顺序为 email → code → time
- 列表采用单 Card + `divide-y divide-brand-border` 布局（参考 OperateLog 风格）
- 每个用户项右侧有编辑按钮（`Edit` 图标，链接到 `/user-update/:id`）和删除按钮
- 编辑页（UserEdit）管理员可修改用户 status：使用 `Select` 组件提供 Active/Inactive/Pending 三项
- 权限模型：普通用户只能编辑自己的资料和密码；管理员可修改 code/email/status/password

## 部落新增按钮智能逻辑
- 新增部落页面（ClanAdd.tsx）只有一个提交按钮
- 根据部落名称是否为空动态改变：
  - **名称为空**（推荐方式）：按钮显示"自动新增"，带发光动画 `shadow-lg shadow-brand-primary/30 animate-pulse-subtle`
  - **名称不为空**：按钮显示"新增"，无特效
- 提交时通过 `name: isAuto ? undefined : name.trim()` 传给后端

## 构建与验证
- 修改代码后运行 `npm run build` 确保构建通过
- 类型检查：`npx tsc --noEmit`
- 开发服务器：`npm run dev`

## 列表页 UI 规范
- 列表页（UserList、LoginLog、OperateLog 等）使用单 Card + `divide-y divide-brand-border` 布局
- 每项使用 `p-5 hover:bg-brand-muted/20 transition-colors` 的行样式
- 头像采用方形 `w-9 h-9 rounded-xl bg-stone-50` + 灰度图标
- 信息分两段：上段 `flex items-start gap-3`（avatar + title），下段 `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ml-12`（badges + timestamp）

## 主题背景
- 页面背景使用 `linear-gradient(to right, ...)` 左右渐变方向
- 左侧淡粉 → 中间透明 → 右侧淡紫
- 底部保留弱径向渐变增强层次感