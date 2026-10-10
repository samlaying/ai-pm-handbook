# AI 产品实战手册｜从 0 到 1 落地一个 AI 客服项目

一个零框架、零构建的纯静态长页面站点。基于原始素材（`../raw.md`）整理，按 `../guide.md` 的内容大纲与「编辑杂志风」视觉规范搭建。核心案例：零食电商公司搭建 AI 客服，实现降本增效。

## 线上地址

**https://samlaying.github.io/ai-pm-handbook/** （GitHub Pages，国内可直连）

更新内容后重新发布：改完文件 → `git add -A && git commit -m "..." && git push`，Pages 会自动重新构建（约 1 分钟）。

## 本地预览

双击打开 `index.html` 即可（经典脚本 + CSS 文件，无模块、无 fetch，`file://` 协议直开可用）。
也可以起一个本地服务器：

```bash
cd ai-pm-handbook
python3 -m http.server 8080
# 打开 http://127.0.0.1:8080
```

> 提示：修改内容后如果浏览器显示的还是旧版本，按一次 **Cmd+Shift+R**（强制刷新）即可；
> 页面里的资源引用带 `?v=` 版本参数，改完关键文件后可以顺手把 `index.html` 里的版本号 +1。

## 部署到其他平台

整站就是 `index.html + css/ + js/` 三样东西，任何静态托管拖上去就能用：

- **腾讯云 EdgeOne Pages**（国内访问最快）：控制台新建项目 → 直接拖入本文件夹或上传 `../ai-pm-handbook-site.zip`，默认域名免备案；
- **Gitee Pages**：需实名认证后手动开启；
- **Vercel / Netlify**：能部署，但 `.vercel.app` / `.netlify.app` 在国内不稳定，不推荐面向国内用户。

字体已做异步加载：连不上 Google Fonts 时自动回退系统字体（宋体/苹方），不阻塞页面渲染。

## 目录结构（按职责解耦）

```
ai-pm-handbook/
├── index.html              # 页面骨架：语义化标签 + 资源引用，不含内容
├── css/                    # 样式按层拆分
│   ├── tokens.css          #   设计令牌：颜色 / 字体 / 字号（唯一定义处）
│   ├── base.css            #   Reset 与基础排版
│   ├── layout.css          #   骨架：进度条 / 顶栏 / 侧边栏 / Hero / 页脚 / 移动端
│   ├── components.css      #   组件：模块头 / 引语 / 表格 / 产出物 / 清单 / 术语…
│   ├── drawer.css          #   术语详解抽屉（右侧滑入，三段式）
│   ├── glossary.css         #   页面 Tab 切换 + 「名词查询」页
│   ├── motion.css          #   动效 + prefers-reduced-motion 降级
│   └── print.css           #   打印样式
└── js/
    ├── lib/                # 无业务的基础库
    │   ├── dom.js          #   DOM 工具（创建 / 转义 / 嵌套数组拍平）
    │   └── store.js        #   localStorage 封装（命名空间 + 容错）
    ├── data/               # ★ 全部内容都在这里，改文案不用碰代码
    │   ├── site.js         #   站点元信息（Hero / 页脚）
    │   ├── terms.js        #   术语表（名词 Tab 与抽屉的共同数据源）
    │   ├── module-01~09.js #   九个模块，一模块一文件
    │   └── summary.js      #   总结页（四份交付物 + 自查六问）
    ├── ui/                 # 行为按职责拆分，互不依赖
    │   ├── render.js       #   数据 → DOM（纯渲染，含 fmt 行内格式化）
    │   ├── tabs.js           #   页面 Tab：「案例」/「名词查询」（#glossary 路由）
    │   ├── glossary.js       #   名词查询页：搜索 + 分类筛选 + 词条列表
    │   ├── nav.js          #   锚点跳转 / 标题闪烁 / 移动端目录抽屉
    │   ├── progress.js     #   进度条 + scroll-spy 高亮
    │   ├── reveal.js       #   淡入 + 章节编号 parallax
    │   ├── drawer.js       #   术语详解抽屉（点击划线词打开）
    │   └── checklist.js    #   勾选持久化 + 重置
    └── main.js             # 启动器：唯一入口
```

## 如何修改内容

| 想改什么 | 动哪里 |
|---|---|
| 某个模块的文案 / 表格 | `js/data/module-0X.js` 对应小节的 `blocks` |
| 新增 / 删除模块 | 复制一份 module 数据文件，在 `index.html` 加一行 `<script>` |
| 术语详解内容 | `js/data/terms.js`；正文里用 `[[术语名]]` 标注，点击即出右侧抽屉 |
| 颜色 / 字体 / 字号 | `css/tokens.css`（全站唯一出处） |
| Hero / 页脚文案 | `js/data/site.js` |

## 页面 Tab 与术语数据格式

顶栏有两个 Tab：**案例**（九模块手册）与 **名词**（名词查询页，可搜索 / 按分类筛选）。
两个 Tab 共用 `js/data/terms.js` 一份数据，交叉跳转链路：

```
案例正文划线词 ──点击──▶ 右侧抽屉 ──「出现在案例」链接──▶ 回跳案例对应模块
名词 Tab 词条 ──点击──▶ 同一个抽屉 ──相关术语──▶ 继续跳转
```

术语词条结构（六字段）：

```js
"MoSCoW": {
  cat: "方法论",                  // 分组：方法论 / 工程技术 / 组织与商业 / 工具与平台
  def: "名词定义（一句话）",
  case: "项目案例（本案例中的用法）",
  tech: ["技术解析和应用，多段"],  // 字符串或数组，支持 **加粗** 与 [[其他术语]]
  modules: ["m05", "m08"],        // 模块 id，抽屉里渲染成回跳链接
  related: ["MVP", "PRD"]         // 相关术语词块
}
```

正文任意位置写 `[[MoSCoW]]` 渲染成划线词；`#glossary` 哈希直达名词页，浏览器前进后退可用。

## 数据格式速查

```js
blocks: [
  { type: "p",       text: "正文，支持 **加粗** 和 [[术语]] 标注" },
  { type: "table",   head: ["列A", "列B"], rows: [["…", "…"]] },
  { type: "list",    ordered: true, items: ["…"] },
  { type: "quote",   text: "金句", cite: "—— 出处" },
  { type: "warning", label: "安全红线", text: "…" },
  { type: "code",    lang: "Prompt", text: "…" }
]
```

模块级字段：`deliverables`（产出物清单）、`checklist`（检查清单）、`exercise`（实战延伸，可省略）。

## 功能清单

- 顶部进度条（随滚动增长）+ 顶栏 01–10 快速导航（hover 显示模块名）
- 左侧固定目录 scroll-spy 自动高亮；移动端折叠为抽屉
- 模块进入视口淡入；章节大编号轻微 parallax（系统开启“减少动态效果”时全部关闭）
- 顶栏双 Tab：「案例」/「名词查询」，`#glossary` 直达、前进后退可用
- 名词查询页：搜索 + 四类分组筛选 + 计数，点击词条开抽屉
- 正文术语虚线下划线，**点击从右侧滑入详解抽屉**（名词定义 / 项目案例 / 技术解析和应用三段式 + 模块回跳链接 + 相关术语；ESC / 遮罩 / 关闭按钮退出，键盘可达）
- 检查清单可勾选，localStorage 记忆；侧边栏提供一键重置
- 锚点平滑滚动，跳转后标题橙色下划线闪烁提醒
- 打印友好（`@media print` 隐藏外壳保留全文）；语义化标签 + skip-link + focus-visible
