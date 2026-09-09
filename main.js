// ARK 用量查看 入口
//  - macOS:采用 Electron + menubar,常驻顶部栏,把用量文字画成图片显示在托盘。
//  - Windows:不使用托盘,改用一个置顶可拖动的悬浮球展示三行用量(5小时/1周/1月),
//    点击 ⚙ 打开设置窗口、✕ 退出。
// 复用 src/example.js 里的 fetch 逻辑与接口字段。

const {
  app,
  ipcMain,
  nativeImage,
  nativeTheme,
  BrowserWindow,
  screen,
} = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const fs = require('fs');
const { menubar } = require('menubar');

// 平台标记:Windows 走悬浮球方案,与 macOS 顶部栏完全不同
const isWin = process.platform === 'win32';

// 用户配置(令牌/WebID/Cookie)持久化到 userData 下的 config.json
const CONFIG_FILE = () => path.join(app.getPath('userData'), 'config.json');

let config = {};          // 已保存的鉴权配置
let timer = null;         // 2s 刷新定时器
let currentUsage = { fiveHour: '--', week: '--', month: '--' }; // 最近一次用量

// 窗口引用:
//   settingsWin - 设置窗口(Windows 下自建;macOS 下用 menubar 的 mb.window)
//   ballWin     - Windows 悬浮球窗口
//   mb          - macOS 的 menubar 实例
let settingsWin = null;
let ballWin = null;
let mb = null;

// ---------- 配置读写 ----------

function loadConfig() {
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE(), 'utf8'));
  } catch {
    config = {};
  }
}

function saveConfig(cfg) {
  config = cfg;
  fs.mkdirSync(path.dirname(CONFIG_FILE()), { recursive: true });
  fs.writeFileSync(CONFIG_FILE(), JSON.stringify(cfg, null, 2));
}

// 当前承载设置表单的窗口(macOS:menubar 窗口;Windows:自建设置窗口)
function currentSettingsWindow() {
  return isWin ? settingsWin : mb && mb.window;
}

// 把已保存的配置与当前用量推给渲染进程(每次弹窗/刷新时复用)
function sendToWindow() {
  const w = currentSettingsWindow();
  if (w && !w.isDestroyed()) {
    w.webContents.send('config', config);
    w.webContents.send('usage', currentUsage);
  }
}

// ---------- 拉取 ARK 用量 ----------

async function fetchUsage() {
  const { X_CSRF_TOKEN, X_WEB_ID, COOKIE } = config;
  // 未配置完整鉴权信息时不请求,显示占位
  if (!X_CSRF_TOKEN || !X_WEB_ID || !COOKIE) {
    updateDisplay('ARK --');
    return;
  }
  try {
    const res = await fetch(
      'https://console.volcengine.com/api/top/ark/cn-beijing/2024-01-01/GetCodingPlanUsage?',
      {
        method: 'POST',
        headers: {
          accept: 'application/json, text/plain, */*',
          'content-type': 'application/json',
          'x-csrf-token': X_CSRF_TOKEN,
          'x-web-id': X_WEB_ID,
          cookie: COOKIE,
          referer:
            'https://console.volcengine.com/ark/region:cn-beijing/subscription/coding-plan?agentMode=close',
        },
        body: '{}',
      }
    );
    const json = await res.json();
    const { QuotaUsage } = json.Result;
    // 依次为 5小时 / 1周 / 1月 的用量百分比
    const pct = (v) => (v || 0).toFixed(2) + '%';
    currentUsage = {
      fiveHour: pct(QuotaUsage[0].Percent),
      week: pct(QuotaUsage[1].Percent),
      month: pct(QuotaUsage[2].Percent),
    };
    updateDisplay(`🐟 ${currentUsage.fiveHour}  🐙 ${currentUsage.week}  🐳 ${currentUsage.month}`);
    sendToWindow();
  } catch {
    updateDisplay('ARK --');
  }
}

// 统一的用量展示入口:macOS 画文字图片到顶部栏;Windows 更新悬浮球三行
function updateDisplay(text) {
  if (isWin) {
    updateBall();
  } else {
    renderTray(text);
  }
}

// ---------- macOS:把文字渲染成托盘图片(可微调垂直偏移) ----------
// macOS 的 tray.setTitle 无法控制文字垂直位置,这里用隐藏窗口的 canvas
// 把文字画成图片再设为托盘图标,下移 1px;并用模板图片自动适配深/浅色菜单栏。

let renderer = null; // 隐藏的离屏窗口,负责绘制托盘文字

function ensureRenderer() {
  if (renderer && !renderer.isDestroyed()) return;
  renderer = new BrowserWindow({
    show: false,
    width: 400,
    height: 40,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  renderer.loadURL('data:text/html,<canvas id="c"></canvas>');
}

async function renderTray(text) {
  ensureRenderer();
  const dataURL = await renderer.webContents.executeJavaScript(`
    (function () {
      const dpr = 2; // 2 倍分辨率渲染,避免菜单栏文字模糊
      const font = '12px -apple-system, sans-serif';
      const c = document.getElementById('c');
      const ctx = c.getContext('2d');
      ctx.font = font;
      const pad = 10; // 左右留白,避免贴边
      const w = Math.ceil(ctx.measureText(${JSON.stringify(text)}).width + pad * 2);
      const h = 22; // 菜单栏高度
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      ctx.font = font;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      // 不用模板图片,保留 emoji 彩色;文字颜色跟随深浅色菜单栏
      ctx.fillStyle = ${JSON.stringify(nativeTheme.shouldUseDarkColors ? '#ffffff' : '#000000')};
      ctx.fillText(${JSON.stringify(text)}, pad, h / 2 + 1); // +1px:文字下移
      return c.toDataURL();
    })();
  `);
  const img = nativeImage.createFromDataURL(dataURL);
  // 2x 图像按高度缩放回逻辑尺寸,锐利不模糊
  mb.tray.setImage(img.resize({ height: 22, quality: 'best' }));
}

// ---------- Windows:悬浮球 ----------

const BALL_W = 178; // 悬浮球宽
const BALL_H = 98;  // 悬浮球高

// 悬浮球页面:深色圆角卡片,三行用量,整体可拖动,右上角提供 设置/退出 按钮
const BALL_HTML = `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8" />
<style>
  html, body { margin:0; background:transparent; overflow:hidden; height:100%; }
  body { user-select:none; -webkit-user-select:none; }
  .card {
    -webkit-app-region: drag;               /* 整个卡片可拖动 */
    position:absolute; inset:0;
    box-sizing:border-box;
    border-radius:14px;
    background:rgba(28,30,36,0.94);
    border:1px solid rgba(255,255,255,0.12);
    box-shadow:0 6px 24px rgba(0,0,0,0.35);
    color:#e6e8eb;
    font-family:"Microsoft YaHei","Segoe UI",sans-serif;
    padding:10px 14px 8px;
  }
  .title { font-size:10px; color:#8a9099; margin-bottom:4px; }
  .row {
    font-size:11px; line-height:16px;
    display:flex; justify-content:space-between; align-items:baseline;
  }
  .row .k { color:#9aa0a8; }
  .row .v { color:#4d7cff; font-weight:600; font-variant-numeric:tabular-nums; }
  .btns {
    position:absolute; top:4px; right:4px;
    display:flex; gap:2px;
    -webkit-app-region: no-drag;            /* 按钮不参与拖动 */
  }
  .btns span {
    width:16px; height:16px; line-height:16px; text-align:center;
    font-size:10px; border-radius:4px; cursor:pointer; color:#9aa0a8;
  }
  .btns span:hover { background:rgba(255,255,255,0.16); color:#fff; }
  .btns #btn-quit:hover { color:#ff6b6b; }
</style>
</head>
<body>
<div class="card">
  <div class="title">ARK 用量</div>
  <div class="row"><span class="k">🐟 5小时</span><span class="v" id="h5">--</span></div>
  <div class="row"><span class="k">🐙 1周</span><span class="v" id="w1">--</span></div>
  <div class="row"><span class="k">🐳 1月</span><span class="v" id="m1">--</span></div>
  <div class="btns">
    <span id="btn-gear" title="设置">⚙</span>
    <span id="btn-quit" title="退出">✕</span>
  </div>
</div>
<script>
  const { ipcRenderer } = require('electron');
  document.getElementById('btn-gear').addEventListener('click', () => ipcRenderer.send('ball-gear'));
  document.getElementById('btn-quit').addEventListener('click', () => ipcRenderer.send('ball-quit'));
</script>
</body>
</html>`;

// 悬浮球默认摆放在主显示器右侧中部
function defaultBallPos() {
  const wa = screen.getPrimaryDisplay().workArea;
  return { x: wa.x + wa.width - BALL_W - 24, y: wa.y + Math.round((wa.height - BALL_H) / 2) };
}

function saveBallPos() {
  if (!ballWin || ballWin.isDestroyed()) return;
  const [x, y] = ballWin.getPosition();
  if (config.win) config.win.ballPos = { x, y };
  saveConfig(config);
}

function createBallWindow() {
  ballWin = new BrowserWindow({
    width: BALL_W,
    height: BALL_H,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true, // 不占任务栏,也不进托盘
    hasShadow: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  // 恢复上次拖动位置,否则放到默认位置
  const pos = (config.win && config.win.ballPos) || defaultBallPos();
  ballWin.setPosition(Math.round(pos.x), Math.round(pos.y));
  ballWin.setAlwaysOnTop(true, 'screen-saver'); // 置顶
  ballWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  ballWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(BALL_HTML));
  // 拖动结束后持久化位置
  ballWin.on('moved', saveBallPos);
  updateBall();
}

// 把最新用量写入悬浮球的三行
function updateBall() {
  if (!ballWin || ballWin.isDestroyed()) return;
  ballWin.webContents
    .executeJavaScript(`
      document.getElementById('h5').textContent = ${JSON.stringify(currentUsage.fiveHour)};
      document.getElementById('w1').textContent = ${JSON.stringify(currentUsage.week)};
      document.getElementById('m1').textContent = ${JSON.stringify(currentUsage.month)};
    `)
    .catch(() => {});
}

function createSettingsWindow() {
  settingsWin = new BrowserWindow({
    width: 440,
    height: 460,
    show: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  settingsWin.loadFile('settings.html');
  // 关闭按钮 → 隐藏而非退出,保持悬浮球继续工作
  settingsWin.on('close', (e) => {
    e.preventDefault();
    settingsWin.hide();
  });
  settingsWin.on('show', sendToWindow);
}

// 悬浮球 ⚙:切换设置窗口显示/隐藏
function toggleSettings() {
  if (!settingsWin) return;
  if (settingsWin.isVisible()) {
    settingsWin.hide();
  } else {
    sendToWindow();
    settingsWin.show();
    settingsWin.focus();
  }
}

// ---------- macOS:menubar 托盘 ----------

function setupMacMenubar() {
  mb = menubar({
    icon: path.join(__dirname, 'assets', 'icon.png'),
    index: pathToFileURL(path.join(__dirname, 'settings.html')).href,
    preloadWindow: true,
    tooltip: 'ARK 用量查看',
    browserWindow: {
      width: 440,
      height: 460,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    },
  });

  mb.on('ready', () => {
    mb.tray.setImage(nativeImage.createEmpty()); // 图标置空,菜单栏只显示标题文字
    loadConfig();
    fetchUsage(); // 启动立即拉一次
    timer = setInterval(fetchUsage, 2000); // 每 2s 刷新一次用量
  });

  // 每次打开窗口时把已存配置和当前用量回填到表单
  mb.on('after-create-window', sendToWindow);
  mb.on('after-show', sendToWindow);
}

// ---------- 共享 IPC ----------

// 渲染进程点击"保存"后落盘并立即刷新,再收起窗口
ipcMain.on('save-config', (_e, cfg) => {
  saveConfig(cfg);
  fetchUsage();
  if (isWin) {
    settingsWin.hide();
  } else if (mb) {
    mb.hideWindow();
  }
});

// 渲染进程点击"退出应用":真正退出 App,而非仅收起窗口
ipcMain.on('quit-app', () => {
  app.quit();
});

// Windows 悬浮球按钮
ipcMain.on('ball-gear', toggleSettings);
ipcMain.on('ball-quit', () => app.quit());

// ---------- 启动 ----------

app.whenReady().then(() => {
  // Windows:给应用设置固定的 AppUserModelId,便于任务栏归属与通知
  if (isWin) app.setAppUserModelId('com.unzoa.arkusageview');

  loadConfig();

  if (isWin) {
    createSettingsWindow();
    createBallWindow();
    fetchUsage(); // 启动立即拉一次
    timer = setInterval(fetchUsage, 2000); // 每 2s 刷新一次用量
  } else {
    setupMacMenubar();
  }
});

app.on('before-quit', () => {
  if (timer) clearInterval(timer);
});
