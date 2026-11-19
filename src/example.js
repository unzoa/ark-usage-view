
const X_CSRF_TOKEN = "b94c9b7b6063a362ab69c3ecde3876a3" // 只有这里是必须的
const X_WEB_ID = "U2FsdGVkX19/oCMiK+jHyjjPvGtHGA4eno0WkH1EF/6H894eF8HpIn8k3jz+Jb6X"
const SEAT_ID = "seat-20261119112646-hd4sx" // 订阅页 Seat 列表中的 Seat ID
const COOKIE = `volcfe-uuid=9dbccd70-4ade-42f7-baf0-692029fa70aa; monitor_huoshan_web_id=1510661472301439481; hasUserBehavior=1; __spti=11_000J3Hf0KEYPtPrMwlQ3ilQxfn2UtC; __spti=11_000J3Hf0KEYPtPrMwlQ3ilQxfn2UtC; user_locale=zh; i18next=zh; signin_i18next=zh; _gcl_au=1.1.885004698.1787881648.-.-.1787881648.1940581990.1787881648.1787888586; _uetvid=6d8dc550a28211f1a56f05f292554313; volc_platform_clear_user_locale=1; referrer_title=%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98%20-%20%E7%81%AB%E5%B1%B1%E6%96%B9%E8%88%9F%20-%20%E7%81%AB%E5%B1%B1%E5%BC%95%E6%93%8E; p_c_check=1; monitor_session_id_flag=1; _tea_utm_cache_3569={%22utm_source%22:%22doubao%22%2C%22utm_medium%22:%22sidebar%22%2C%22utm_campaign%22:%22aihub_promote%22%2C%22utm_term%22:%22sidebar_traffic%22%2C%22utm_content%22:%22browser_btn%22}; utm={%22utm_source%22:%22doubao%22%2C%22utm_medium%22:%22sidebar%22%2C%22utm_term%22:%22sidebar_traffic%22%2C%22utm_campaign%22:%22aihub_promote%22%2C%22utm_content%22:%22browser_btn%22%2C%22landing_page_url%22:%22https://ai.volcengine.com/?utm_source=doubao&utm_medium=sidebar&utm_term=sidebar_traffic&utm_campaign=aihub_promote&utm_content=browser_btn%22}; s_v_web_id=202609101316537EB7229D5073872040A4; s_v_web_id=202609101316537EB7229D5073872040A4; vcloudWebId=202609101316537EB7229D5073872040A4; volc-design-locale=zh; finance-hub-sdk-lang=zh; __sptiho=7311_000J3Hf0KEYPtPrMwlQ3ilQxfn2UtC_bRL; __sptiho=7311_000J3Hf0KEYPtPrMwlQ3ilQxfn2UtC_bRL; monitor_utm=%257B%2522utm_source%2522%253A%2522doubao%2522%252C%2522utm_medium%2522%253A%2522sidebar%2522%252C%2522utm_campaign%2522%253A%2522aihub_promote%2522%252C%2522utm_term%2522%253A%2522sidebar_traffic%2522%252C%2522utm_content%2522%253A%2522browser_btn%2522%257D; ve_doc_history=6257%2C6836%2C82379%2C83458; referrer_title=%E5%AE%89%E5%85%A8%E8%AE%BE%E7%BD%AE--%E8%AE%BF%E9%97%AE%E6%8E%A7%E5%88%B6-%E7%81%AB%E5%B1%B1%E5%BC%95%E6%93%8E; volcf-is-intranet=0; isIntranet=0; ark_page_popup_dismissed=ae67001a-c520-41fe-9eea-005206ec8fa9%3A1anov6c|once|tpxwg0/61503241-aa18-4095-abad-92c8dcddc296%3Aic4vaj|once|tq3gg0; VOLCFE_im_uuid=1794968041936180628; monitor_session_id=5934258202440627833; top_region=; digest=eyJhbGciOiJSUzI1NiIsImtpZCI6ImE5ZDM1YTQ4YmZiNDExZjA4OWMwMDAxNjNlMDcwOGJkIn0.eyJhdWQiOlsic2lnbmluLnZvbGNlbmdpbmUuY29tIl0sImV4cCI6MTc5NTIzMzIxNCwiaWF0IjoxNzk1MDYwNDE0LCJpc3MiOiJodHRwczovL3NpZ25pbi52b2xjZW5naW5lLmNvbSIsImp0aSI6ImU3MmI0YjYxLTI1ZTQtNGQ3OC1hMWQ5LTNiZmU3ZmNlNTliZiIsIm1zZyI6Ikg0c0lBQUFBQUFBQy8rTFM1V0x4Uzh4TkZaTE15TTlMcnl6VnF5eDFLTWxNVHkzS1RVMUpMeXJRUzg3UGxmajk4T2QxTm9VNXozNWVaeE55NFdJSkxVNHRFamg5WktLQmxOaXp6dTVuYzNZOW43TGlXY2YyZUZNTEMvTjRjd05qRXlXd2lWNjRUUVFFQUFELy95S2UzSDUxQUFBQSIsIm5hbWUiOiJob25neXUueXVAdGlnZXJtZWRncnAuY29tIiwic2NvcGVzIjpudWxsLCJzdWIiOiIyMTMzMzc4MDc0IiwidG9waWMiOiJzaWduaW5fY3JlZGVudGlhbCIsInRybiI6InRybjppYW06OjIxMzMzNzgwNzQ6dXNlci9ob25neXUueXVAdGlnZXJtZWRncnAuY29tL-S6jua0quWuhyIsInZlcnNpb24iOiJ2MSIsInppcCI6Imd6aXAifQ.Wz4HZzrlKDJeK6jXIgKw2WpzJWMhXNCjAT1EVU0Ndp4yLdZcGZ_nfBV4V10CocekGCsBFIAP-HcX2E9MRpWNd6LyXX3bwiU3pFuzwFI2hYl2wlZeX529xrfiycOoHvoEjfXntJ1A0cUP45GsQ_Khkgd978RrjKuY-V5kNadd6ZsN4eJM8LvBr-DyQ1D-F5DcX1rqOlR0wIqbDfW266EPbAWJ2RTIXEHgLGkbTwp1tWNwSQQ_pVqMHSZqOhAmaFseTXXT0ntTBotMF46n2VWeNpXzV6lEhUEnSjtBMCqwra6TZRxCQQ40vsmMP_9j7ubB5lDAEgB2Rlx4chIAbWYu7A; AccountID=2133378074; AccountID=2133378074; userInfo=eyJhbGciOiJSUzI1NiIsImtpZCI6ImE5ZDM1YTQ4YmZiNDExZjA4OWMwMDAxNjNlMDcwOGJkIn0.eyJhY2NfaSI6MjEzMzM3ODA3NCwiYXVkIjpbInNpZ25pbi52b2xjZW5naW5lLmNvbSJdLCJleHAiOjE3OTc2NTI0MTQsImkiOiIwMmQwYmRlZmUzY2QxMWYxYWY5NDM0MzZhYzEyMDI4OSIsImlkX24iOiJob25neXUueXVAdGlnZXJtZWRncnAuY29tIiwibXNnIjpudWxsLCJwaWQiOiJlNzJiNGI2MS0yNWU0LTRkNzgtYTFkOS0zYmZlN2ZjZTU5YmYiLCJzc19uIjoiaG9uZ3l1Lnl1QHRpZ2VybWVkZ3JwLmNvbSIsInQiOiJVc2VyIiwidG9waWMiOiJzaWduaW5fdXNlcl9pbmZvIiwidV9pIjoxMDA5NTA2MDMsInZlcnNpb24iOiJ2MSIsInppcCI6IiJ9.b_ePey7btll2pohb6oHmuFzP7V-J51CyTw3TufLDU0l8MYY2L2eioXjhTmkm1_vhHnuNprWPo2ml4oVMDhk5zIIgfcHXIMqtpKYk6YaFypkvTmdhgXOT4nnEJfz0Hy-zb5QykKCvaO42vrGeUtEXuCCFVlHm2YmMymo8EDhnkn3NVIb5t1X_Vr6puVnYON8UF5hvnF6QD1eXBsZr60GsXqsFpsoNt2mkdKWYk7H3KbbynzqXWddVKC6yEtWj1CH8O3h8PcnF6dzjdImDqXZ0LDlQi9NS90GC-yvnql86IA6Hfe6RN-RWLLxXj7WaIia6JgmGo1WJMHMhglKR5z4LmQ; csrfToken=b94c9b7b6063a362ab69c3ecde3876a3; volcengineLoginMethod=subaccount; csrfToken=b94c9b7b6063a362ab69c3ecde3876a3; gfkadpd=3569,42874|3569,46745; acw_tc=d35f331a17950645089236905e4a6ed438ef9a775ec2af86b7d451913a; cdn_sec_tc=d35f331a17950645089236905e4a6ed438ef9a775ec2af86b7d451913a; account_active_time=100950603_2133378074_1795067125376; __tea_cache_tokens_3569={%22web_id%22:%227704212534412428815%22%2C%22user_unique_id%22:%2211_000J3Hf0KEYPtPrMwlQ3ilQxfn2UtC%22%2C%22timestamp%22:1795067227487%2C%22_type_%22:%22default%22}; monitor_traceid_base_cookie=206`

fetch("https://console.volcengine.com/api/top/ark/cn-beijing/2024-01-01/GetAgentPlanSeatAFPUsage?", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "zh",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "x-csrf-token": X_CSRF_TOKEN,
    "x-web-id": X_WEB_ID,
    "cookie": COOKIE,
    "Referer": "https://console.volcengine.com/ark/region:cn-beijing/subscription/agent-plan-enterprise?tab=subscription"
  },
  "body": JSON.stringify({ SeatIDs: [SEAT_ID] }),
  "method": "POST"
}).then(res => res.json()).then(json => {
  console.log('json', json)
  // Seat 接口返回 Result.SeatAFPUsages 数组,取首个 Seat;异常时打印原始响应避免解构报错
  const seatUsage = json && json.Result && json.Result.SeatAFPUsages && json.Result.SeatAFPUsages[0]
  if (!seatUsage) {
    console.error('接口未返回 SeatAFPUsages:', json)
    return
  }
  const { Result: {
    SeatAFPUsages: [{
      AFPFiveHour,
      AFPWeekly,
      AFPMonthly
    }]
  }} = json

  // 5h
  const fiveHourUsage = ((AFPFiveHour.Used / AFPFiveHour.Quota || 0) * 100).toFixed(2) + "%"

  // 1week
  const weekUsage = ((AFPWeekly.Used / AFPWeekly.Quota || 0) * 100).toFixed(2) + "%"

  // 1month
  const monthUsage = ((AFPMonthly.Used / AFPMonthly.Quota || 0) * 100).toFixed(2) + "%"

  console.log(fiveHourUsage, weekUsage, monthUsage)
});

// =====================================================================
// 下面为"用量回跳"复现测试:串行多次请求同一接口,检测同一重置窗口内用量是否回退
// 目的:确认现象是接口数据波动(多副本/缓存不一致),而非请求乱序或代码逻辑问题
// 运行:node example.js
// =====================================================================

// 接口地址:与上方原始请求一致
const API_URL =
  "https://console.volcengine.com/api/top/ark/cn-beijing/2024-01-01/GetAgentPlanSeatAFPUsage?";

// 构建请求参数:复用上方已定义的凭证变量,请求头与原始请求保持一致
function buildOptions() {
  return {
    method: "POST",
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "zh",
      "cache-control": "no-cache",
      "content-type": "application/json",
      pragma: "no-cache",
      priority: "u=1, i",
      "x-csrf-token": X_CSRF_TOKEN,
      "x-web-id": X_WEB_ID,
      cookie: COOKIE,
      Referer:
        "https://console.volcengine.com/ark/region:cn-beijing/subscription/agent-plan-enterprise?tab=subscription",
    },
    body: JSON.stringify({ SeatIDs: [SEAT_ID] }),
  };
}

// 睡眠工具:用于控制串行请求之间的间隔
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 串行请求 total 次,间隔 gapMs,检测同一 ResetTime 窗口内 Used 是否出现回退
async function detectRollback(total = 12, gapMs = 5000) {
  // prev 记录上一次观察到的各窗口 Used,key 为 ResetTime 值
  let prev = {};
  for (let i = 1; i <= total; i++) {
    const t0 = Date.now(); // 记录本次请求开始时间,用于统计耗时
    try {
      const res = await fetch(API_URL, buildOptions());
      const json = await res.json();
      // 接口异常时不返回 SeatAFPUsages,打印原始响应后跳过本轮
      const seatUsage = json && json.Result && json.Result.SeatAFPUsages && json.Result.SeatAFPUsages[0];
      if (!seatUsage) {
        console.log(`[req #${i}] 接口未返回 SeatAFPUsages:`, json);
        if (i < total) await sleep(gapMs);
        continue;
      }
      const { AFPFiveHour, AFPWeekly, AFPMonthly } = seatUsage;
      // 三个候选窗口,用 ResetTime 区分当前所在的统计窗口
      const rows = [
        { name: "5h", key: AFPFiveHour.ResetTime, used: AFPFiveHour.Used },
        { name: "1w", key: AFPWeekly.ResetTime, used: AFPWeekly.Used },
        { name: "1m", key: AFPMonthly.ResetTime, used: AFPMonthly.Used },
      ];
      // 对每个窗口:首次打印 first;跨窗口打印 NEW-WINDOW;回退打印 <<BACKWARD!
      const detail = rows
        .map((r) => {
          const last = prev[r.name];
          let tag = "first"; // 默认首见
          if (last) {
            if (last.key !== r.key) {
              tag = "NEW-WINDOW"; // ResetTime 变化,说明进入新的重置窗口,正常放行
            } else if (r.used < last.used - 1e-9) {
              tag = "<<BACKWARD!"; // 同一窗口内用量变小,即为"回跳"异常
            } else if (Math.abs(r.used - last.used) < 1e-9) {
              tag = "same"; // 与上轮完全相同(命中同份缓存快照)
            } else {
              tag = "+" + (r.used - last.used).toFixed(3); // 正常单调增长
            }
          }
          prev[r.name] = { key: r.key, used: r.used }; // 记录本轮,供下一轮比较
          return (
            `${r.name.padEnd(3)} Used=${r.used}`.padEnd(24) +
            ` key=${r.key}  ${tag}`
          );
        })
        .join("\n            ");
      console.log(
        `[req #${i} ${new Date().toLocaleTimeString()} 耗时${Date.now() - t0}ms]\n            ${detail}`
      );
    } catch (e) {
      console.log(`[req #${i}] error:`, e.message);
    }
    if (i < total) await sleep(gapMs); // 串行:上一轮完全结束后再等 gapMs 发起下一轮
  }
  console.log(
    "检测完成:出现 <<BACKWARD 即说明接口在同一重置窗口内返回值回退(数据抖动)"
  );
}

// 启动回退检测
detectRollback().catch((e) => console.error(e));
