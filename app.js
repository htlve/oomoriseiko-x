const timeline = document.getElementById('timeline');
const tweetInput = document.getElementById('tweet-input');
const tweetBtn = document.getElementById('tweet-btn');
const charCount = document.getElementById('char-count');

let myTweets = JSON.parse(localStorage.getItem('tw_2015_data')) || [];

// 接続先のリスト（どれかが生きていれば読み込めます）
const NITTER_INSTANCES = [
    'nitter.net',
    'nitter.privacydev.net',
    'nitter.it',
    'nitter.no-logs.com'
];

async function fetchSeikoTweets() {
    let success = false;
    
    // 読み込み中の表示
    if (timeline.innerHTML === "") {
        timeline.innerHTML = '<div class="loading">大森靖子の言葉を読み込み中...</div>';
    }

    for (const instance of NITTER_INSTANCES) {
        if (success) break;
        
        const rssUrl = `https://${instance}/oomoriseiko/rss`;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const seikoTweets = data.items.map(item => ({
                    text: item.description.replace(/<[^>]*>/g, ''), 
                    user: "大森靖子⌨️",
                    id: "@oomoriseiko",
                    date: new Date(item.pubDate).toLocaleString('ja-JP', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}),
                    timestamp: new Date(item.pubDate).getTime(),
                    isOfficial: true
                }));
                render(seikoTweets);
                success = true;
                console.log(`Successfully fetched from ${instance}`);
            }
        } catch (e) {
            console.warn(`${instance} からの取得に失敗しました。次を試します。`);
        }
    }

    if (!success) {
        console.error("すべての接続先で失敗しました。");
        render([]); // 自分の投稿だけ表示
    }
}

function render(seikoData) {
    const allTweets = [...myTweets, ...seikoData].sort((a, b) => b.timestamp - a.timestamp);
    
    if (allTweets.length === 0) {
        timeline.innerHTML = '<div class="loading">ツイートがありません。</div>';
        return;
    }

    timeline.innerHTML = allTweets.map((t, idx) => `
        <div class="tweet" style="${t.isOfficial ? 'border-left: 3px solid #55acee;' : ''}">
            <div class="user-info">
                <span class="display-name">${t.user}</span>
                <span class="user-id">${t.id}</span>
                <span class="date">・ ${t.date}</span>
            </div>
            <div class="text">${t.text}</div>
            <div class="actions">
                <span>🔄 リツイート</span>
                <span>★ お気に入り</span>
                ${!t.isOfficial ? `<span onclick="deleteTweet(${t.timestamp})" style="color:#e0245e">🗑 削除</span>` : ''}
            </div>
        </div>
    `).join('');
}

tweetBtn.onclick = () => {
    const text = tweetInput.value.trim();
    if (!text) return;
    const newTweet = {
        text: text, user: "自分", id: "@me",
        date: new Date().toLocaleString('ja-JP', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}),
        timestamp: Date.now(), isOfficial: false
    };
    myTweets.push(newTweet);
    localStorage.setItem('tw_2015_data', JSON.stringify(myTweets));
    tweetInput.value = '';
    charCount.innerText = "140";
    fetchSeikoTweets();
};

window.deleteTweet = (ts) => {
    if(confirm('削除しますか？')) {
        myTweets = myTweets.filter(t => t.timestamp !== ts);
        localStorage.setItem('tw_2015_data', JSON.stringify(myTweets));
        fetchSeikoTweets();
    }
};

tweetInput.oninput = () => {
    const len = tweetInput.value.length;
    charCount.innerText = 140 - len;
    tweetBtn.disabled = (len === 0 || len > 140);
};

// 初回読み込み
fetchSeikoTweets();
