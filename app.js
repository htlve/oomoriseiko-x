const timeline = document.getElementById('timeline');
const tweetInput = document.getElementById('tweet-input');
const tweetBtn = document.getElementById('tweet-btn');
const charCount = document.getElementById('char-count');

let myTweets = JSON.parse(localStorage.getItem('tw_2015_data')) || [];

async function fetchSeikoTweets() {
    // 安定性の高いNitterインスタンス
    const rssUrl = `https://nitter.privacydev.net/oomoriseiko/rss`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const seikoTweets = data.items.map(item => ({
            text: item.description.replace(/<[^>]*>/g, ''), 
            user: "大森靖子⌨️",
            id: "@oomoriseiko",
            date: new Date(item.pubDate).toLocaleString('ja-JP', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}),
            timestamp: new Date(item.pubDate).getTime(),
            isOfficial: true
        }));
        render(seikoTweets);
    } catch (e) {
        render([]);
    }
}

function render(seikoData) {
    const allTweets = [...myTweets, ...seikoData].sort((a, b) => b.timestamp - a.timestamp);
    timeline.innerHTML = allTweets.map((t, idx) => `
        <div class="tweet">
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

fetchSeikoTweets();
