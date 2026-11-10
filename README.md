# ark-usage-view

> 小组件查看ARK使用情况

## 功能

- macos顶部栏显示用量
- ark-api: GetAgentPlanAFPUsage
- 点击能输入 X_CSRF_TOKEN 和 X_WEB_ID 、COOKIE
  - 访问 https://console.volcengine.com/ark/region:cn-beijing/subscription/agent-plan
    - 复制 cookie，x-csrf-token 和 x-web-id
- 30s刷新一次用量

## 示例代码

src/example.js

## 诊断结论:用量接口数据存在“回跳”抖动

通过 `src/example.js` 里的串行请求测试复现并确认:

- 请求侧完全正常:每次 `send` 与对应 `recv` 的顺序号一一对应、严格递增,无并发、无乱序。
- 数据侧异常:在**同一 `ResetTime` 统计窗口内**,接口返回的 `Used` 会突然“回退”。例如 5h 窗口在一次运行中
  `149.4333 → 147.9611 → 149.3985 → 147.9611 → 150.2643`,呈跳跃式前进。
- 三个窗口(5h/1w/1m)在同一轮内**同步回退相同的差值**,说明命中了同一份“落后”的缓存/数据快照。

据此判定:**并非本应用请求顺序或代码逻辑问题,而是 volcengine 用量接口背后多副本/缓存不一致**,导致轮询时在“实时值”与“落后快照”两套数据之间交替,悬浮球观感上即为数值来回跳。

缓解措施:

- 轮询间隔已由 2s 放宽到 30s,降低命中抖动副本的频率(入口 `main.js` 的 `pollUsage`)。
- 如需彻底消除观感抖动,可在展示层对同一 `ResetTime` 窗口做**用量单调抑制**(某次返回的 `Used` 比上一轮更小则忽略、沿用上次值;仅当 `ResetTime` 变化时才放行新值)。