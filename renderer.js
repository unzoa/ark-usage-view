// 设置窗口渲染进程:回填已存配置、实时显示用量、提交保存
const { ipcRenderer } = require('electron');

const token = document.getElementById('token');
const webid = document.getElementById('webid');
const cookie = document.getElementById('cookie');
const usage = document.getElementById('usage');
const save = document.getElementById('save');

// 主进程打开窗口时回填已保存的鉴权配置
ipcRenderer.on('config', (_e, cfg) => {
  token.value = cfg.X_CSRF_TOKEN || '';
  webid.value = cfg.X_WEB_ID || '';
  cookie.value = cfg.COOKIE || '';
});

// 主进程每 2s 推送一次最新用量
ipcRenderer.on('usage', (_e, u) => {
  usage.textContent = `5小时 ${u.fiveHour} · 1周 ${u.week} · 1月 ${u.month}`;
});

// 点击保存:把配置发给主进程持久化并立即刷新
save.addEventListener('click', () => {
  ipcRenderer.send('save-config', {
    X_CSRF_TOKEN: token.value.trim(),
    X_WEB_ID: webid.value.trim(),
    COOKIE: cookie.value,
  });
});
