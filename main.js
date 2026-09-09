// macOS 顶部栏查看 ARK 使用量 的小组件入口
// 采用 Electron + menubar:常驻顶部栏,定时拉取 ARK 用量并显示在托盘标题上。
// 复用 src/example.js 里的 fetch 逻辑与接口字段。

const { app, ipcMain, nativeImage, nativeTheme, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const fs = require('fs');
const { menubar } = require('menubar');

// 用户配置(令牌/WebID/Cookie)持久化到 userData 下的 config.json
const CONFIG_FILE = () => path.join(app.getPath('userData'), 'config.json');

let config = {};          // 已保存的鉴权配置
let timer = null;         // 2s 刷新定时器
let currentUsage = { fiveHour: '--', week: '--', month: '--' }; // 最近一次用量

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

// 把已保存的配置与当前用量推给渲染进程(每次弹窗/刷新时复用)
function sendToWindow() {
  if (mb.window && !mb.window.isDestroyed()) {
    mb.window.webContents.send('config', config);
    mb.window.webContents.send('usage', currentUsage);
  }
}

// ---------- 拉取 ARK 用量 ----------

async function fetchUsage() {
  const { X_CSRF_TOKEN, X_WEB_ID, COOKIE } = config;
  // 未配置完整鉴权信息时不请求,托盘显示占位
  if (!X_CSRF_TOKEN || !X_WEB_ID || !COOKIE) {
    renderTray('ARK --');
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
    // mb.tray.setTitle(`ARK [5h-${currentUsage.fiveHour}] [1w-${currentUsage.week}] [1m-${currentUsage.month}]`);
    renderTray(`🐟 ${currentUsage.fiveHour}  🐙 ${currentUsage.week}  🐳 ${currentUsage.month}`);

    sendToWindow();
  } catch {
    renderTray('ARK --');
  }
}

// ---------- 把文字渲染成托盘图片(可微调垂直偏移) ----------
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

// ---------- 托盘与窗口 ----------

const mb = menubar({
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
// 每次弹出窗口都重新回填,确保 reopen 后输入框显示已持久化的值
mb.on('after-show', sendToWindow);

// 渲染进程点击"保存"后落盘并立即刷新,再收起窗口
ipcMain.on('save-config', (_e, cfg) => {
  saveConfig(cfg);
  fetchUsage();
  mb.hideWindow();
});

// 渲染进程点击"退出应用":真正退出 App,而非仅收起窗口
ipcMain.on('quit-app', () => {
  app.quit();
});

app.on('before-quit', () => {
  if (timer) clearInterval(timer);
});
