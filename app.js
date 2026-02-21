const timeline = document.getElementById('timeline');
const tweetInput = document.getElementById('tweet-input');
const tweetBtn = document.getElementById('tweet-btn');

let myTweets = JSON.parse(localStorage.getItem('tw_2015_data')) || [];

// 大森靖子さんの最新ツイートを取得する関数
async function fetchSeiko() {
    // 複数の変換プロキシを試すことで、"絶対に"に近い確率で取得します
    const urls = [
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://nitter.net/oomoriseiko/rss')}`,
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://nitter.privacydev.net/oomoriseiko/rss')}`,
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://nitter.it/oomoriseiko/rss')}`
    ];

    let fetchedData = [];

    for (let url of urls) {
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.items && data.items.length > 0) {
                fetchedData = data.items.map(item => ({
                    text: item.description.replace(/<[^>]*>/g, ''), // HTMLタグを消す
                    user: "大森靖子⌨️",
                    id: "@oomoriseiko",
                    date: new Date(item.pubDate).toLocaleString('ja-JP', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}),
                    timestamp: new Date(item.pubDate).getTime(),
                    isOfficial: true
                }));
                break; // 取得できたらループを抜ける
            }
        } catch (e) {
            console.log("接続先を切り替えます...");
        }
    }
    render(fetchedData);
}

function render(seikoData) {
    // 自分の投稿と大森さんの投稿を混ぜて、新しい順に並べる
    const all = [...myTweets, ...seikoData].sort((a, b) => b.timestamp - a.timestamp);
    
    timeline.innerHTML = all.map(t => `
        <div class="tweet" style="${t.isOfficial ? 'background:#fff;' : 'background:#f9f9f9;'}">
            <div class="user-info">
                <span class="display-name" style="${t.isOfficial ? 'color:#55acee;' : ''}">${t.user}</span>
                <span class="user-id">${t.id}</span>
                <span class="date">・ ${t.date}</span>
            </div>
            <div class="text">${t.text}</div>
            <div class="actions">
                <span>🔄 リツイート</span>
                <span>★ お気に入り</span>
            </div>
        </div>
    `).join('');
}

// 自分の投稿
tweetBtn.onclick = () => {
    const val = tweetInput.value.trim();
    if(!val) return;
    myTweets.push({
        text: val, user: "自分", id: "@me",
        date: new Date().toLocaleString('ja-JP', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}),
        timestamp: Date.now(), isOfficial: false
    });
    localStorage.setItem('tw_2015_data', JSON.stringify(myTweets));
    tweetInput.value = '';
    fetchSeiko();
};

fetchSeiko();
// 1分ごとに自動更新
setInterval(fetchSeiko, 60000);
