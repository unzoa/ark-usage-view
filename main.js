// macOS 顶部栏查看 ARK 使用量 的小组件入口
// 采用 Electron + menubar:常驻顶部栏,定时拉取 ARK 用量并显示在托盘标题上。
// 复用 src/example.js 里的 fetch 逻辑与接口字段。

const { app, ipcMain } = require('electron');
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
    mb.tray.setTitle('ARK --');
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
    mb.tray.setTitle(`ARK [5h-${currentUsage.fiveHour}] [1w-${currentUsage.week}] [1m-${currentUsage.month}]`);
    sendToWindow();
  } catch {
    mb.tray.setTitle('ARK --');
  }
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

app.on('before-quit', () => {
  if (timer) clearInterval(timer);
});
