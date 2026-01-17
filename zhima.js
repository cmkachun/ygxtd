/**
 * 阳光天地自动签到脚本
 * 仓库: cmkachun/ygxtd
 */

const isGetCookie = typeof $request !== 'undefined';

if (isGetCookie) {
    // ======= 自动抓取逻辑 =======
    const headers = $request.headers;
    const auth = headers['Authorization'] || headers['authorization'];
    const sign = headers['X-ZHIMA-SIGNATURE'] || headers['x-zhima-signature'];

    if (auth && sign) {
        const nonce = headers['X-ZHIMA-NONCE'] || headers['x-zhima-nonce'] || "";
        const time = headers['X-ZHIMA-TIMESTAMP'] || headers['x-zhima-timestamp'] || "";
        
        const oldAuth = $persistentStore.read("ygxtd_auth");
        // 仅当 Token 发生变化时才保存并通知
        if (auth !== oldAuth) {
            $persistentStore.write(auth, "ygxtd_auth");
            $persistentStore.write(sign, "ygxtd_sign");
            $persistentStore.write(nonce, "ygxtd_nonce");
            $persistentStore.write(time, "ygxtd_time");

            $notification.post("阳光天地", "✅ 凭证更新成功", "已捕获最新签名，每日 00:07 将执行自动签到", {"open-url": "https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/Sun.png"});
            console.log("阳光天地抓取成功");
        }
    }
    $done({});
} else {
    // ======= 自动签到逻辑 =======
    const auth = $persistentStore.read("ygxtd_auth");
    const sign = $persistentStore.read("ygxtd_sign");
    const nonce = $persistentStore.read("ygxtd_nonce");
    const time = $persistentStore.read("ygxtd_time");

    if (!auth || !sign) {
        $notification.post("阳光天地", "❌ 签到失败", "本地缺失凭证，请先手动进入小程序", {"open-url": "https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/Sun.png"});
        $done();
    } else {
        const request = {
            url: "https://a.china-smartech.com/restful/mall/2407/checkInRecord",
            method: "POST",
            headers: {
                'Authorization': auth,
                'X-ZHIMA-SIGNATURE': sign,
                'X-ZHIMA-NONCE': nonce,
                'X-ZHIMA-TIMESTAMP': time,
                'X-ZHIMA-VERSION': 'V2.4.16',
                'X-ZHIMA-URL': 'restful%2Fmall%2F2407%2FcheckInRecord',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.68(0x18004426) NetType/WIFI Language/zh_CN',
                'Referer': 'https://servicewechat.com/wxa085ef8c613ab410/176/page-frame.html'
            },
            body: JSON.stringify({ "latitude": 0, "longitude": 0 })
        };

        $httpClient.post(request, (error, response, data) => {
            if (error) {
                $notification.post("阳光天地", "❌ 网络异常", error);
            } else {
                try {
                    const res = JSON.parse(data);
                    if (res.code === 200) {
                        $notification.post("阳光天地", "🎉 签到成功", "积分已自动发放", {"open-url": "https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/Sun.png"});
                    } else {
                        const msg = res.msg || "今日已签到";
                        $notification.post("阳光天地", "ℹ️ 任务状态", msg, {"open-url": "https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/Sun.png"});
                    }
                } catch (e) {
                    $notification.post("阳光天地", "❌ 响应解析错误", "返回内容异常");
                }
            }
            $done();
        });
    }
}
