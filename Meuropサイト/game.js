// script.js

// まずはちゃんとJSが動いてるか確認！ブラウザのコンソールに出てくるよ！
console.log("いえーい！JavaScriptもバッチリ動いてるぜ！✨");

// HTMLの <button id="magicButton"> を見つけてくる
const button = document.getElementById('magicButton');

// ボタンがクリックされたら、何かするっていう命令を追加
button.addEventListener('click', function() {
    alert('ボタン押してくれてありがとー！💖 君は神！');
    // ここに他の魔法も書けるよ！例えば、何かの表示を変えたりとか！
});