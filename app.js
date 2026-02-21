const timeline = document.getElementById('timeline');
const tweetInput = document.getElementById('tweet-input');
const tweetBtn = document.getElementById('tweet-btn');
const charCount = document.getElementById('char-count');

let myTweets = JSON.parse(localStorage.getItem('tw_2015_data')) || [];

// 1. 自分の投稿を表示する関数
function renderMyTweets() {
    const myTweetsHtml = myTweets.slice().reverse().map((t) => `
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
                <span onclick="deleteTweet(${t.timestamp})" style="color:#e0245e">🗑 削除</span>
            </div>
        </div>
    `).join('');
    
    // 自分のツイートエリアを更新
    document.getElementById('my-tweets-container').innerHTML = myTweetsHtml;
}

// 2. 大森靖子さんの公式タイムラインを読み込む（2015年風に調整）
function loadSeikoTimeline() {
    const container = document.getElementById('seiko-timeline-container');
    container.innerHTML = `
        <a class="twitter-timeline" 
           data-lang="ja" 
           data-height="1000" 
           data-chrome="noheader nofooter noborders transparent" 
           href="https://twitter.com/oomoriseiko?ref_src=twsrc%5Etfw">
           大森靖子のツイートを読み込み中...
        </a>
    `;
    // Twitterのスクリプトを動的に読み込み
    const script = document.createElement('script');
    script.src = "https://platform.twitter.com/widgets.js";
    script.charset = "utf-8";
    document.body.appendChild(script);
}

// 投稿ボタンの処理
tweetBtn.onclick = () => {
    const text = tweetInput.value.trim();
    if (!text) return;
    const newTweet = {
        text: text, user: "自分", id: "@me",
        date: new Date().toLocaleString('ja-JP', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}),
        timestamp: Date.now()
    };
    myTweets.push(newTweet);
    localStorage.setItem('tw_2015_data', JSON.stringify(myTweets));
    tweetInput.value = '';
    charCount.innerText = "140";
    renderMyTweets();
};

window.deleteTweet = (ts) => {
    if(confirm('削除しますか？')) {
        myTweets = myTweets.filter(t => t.timestamp !== ts);
        localStorage.setItem('tw_2015_data', JSON.stringify(myTweets));
        renderMyTweets();
    }
};

tweetInput.oninput = () => {
    const len = tweetInput.value.length;
    charCount.innerText = 140 - len;
    tweetBtn.disabled = (len === 0 || len > 140);
};

// 初期表示
document.getElementById('timeline').innerHTML = `
    <div id="my-tweets-container"></div>
    <div id="seiko-timeline-container"></div>
`;
renderMyTweets();
loadSeikoTimeline();
