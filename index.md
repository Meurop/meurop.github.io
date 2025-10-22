---
layout: page
title: メウロぷのホームページ
# author
# categories: [イベント, レポート]
---

# メウロぷのポートフォリオ

## 📜雑記📜

<ul class="post-list"> {% for post in site.posts %}
    <li>
      <h3>
        <a class="post-link" href="{{ post.url | relative_url }}">
          {{ post.title }}
        </a>
      </h3>
      <span class="post-meta">{{ post.date | date: "%Y年%m月%d日" }}</span>
      {% if post.categories.size > 0 %}
        <span class="post-categories">
          カテゴリー: {{ post.categories | join: ", " }}
        </span>
      {% endif %}
      <p>{{ post.excerpt }}</p>
    </li>
  {% endfor %}
</ul>

## 🏆 Shadowverse大会実績 🏆

3位以上になった大会を記録していきます。大会の規模は問いません。

JCG
* JCG Shadowverse Open Farewell CUP アンリミテッド大会 3位

Tonamel 🥇×5 🥈×7 🥉×12
* さんかく杯vol.22 準優勝
* WAYBS SV Open: WaybsCup vol.120 3位
* 第47回YeSUカップオンラインES大会 優勝
* さくれ杯 vol.123 優勝
* ぴーふぉ杯vol.110 優勝
* REIGN SV General Season15 vol.43-BO1ローテーション 優勝
* マイローテーションBO1おぺち杯 優勝
* ぴーふぉ杯vol.111 3位
* REIGN SV General Season16 vol.28-BO1ローテーション 準優勝
* REIGN SV General Season16 vol.36-BO1ローテーション 準優勝
* REIGN SV General Season16 vol.43-BO1ローテーション 3位
* REIGN SV General Season17 vol.24-BO1ローテーション 3位
* Shadowverse pauper tournament Ⅲ 3位
* REIGN SV General Season17 vol.40-BO1ローテーション 3位
* REIGN SV General Season19 vol.5-BO1 2Pick 3位
* REIGN SV General Season19 vol.6-BO3ローテーション 3位
* REIGN SV General Season19 vol.10-BO3ローテーション 3位
* 魔導物語 ES大会 ローテーションBO1 3位
* [エーテル難民にも安心]ブロンズ限定大会[第一回] 2位
* 第25回　アンリミBO3 ヨシハラ杯 2位
* 【ローテbo3】賞金1000ギフト大会5/8【集会所杯】 準優勝
* アンリミテッドBO3しむ杯 第9回 3位
* 第32回 アンリミBO3 ヨシハラ杯 3位

SUL、SCL、LOSなどにも一応出ていた気がする…

## ⚔ ShadowverseWB大会実績 ⚔
* 【シャドバWB大会】Wisdom #1 優勝
* 1Day Championship #2【Bo1トーナメント】3位
* 1Day Championship #3【Bo1トーナメント】優勝
* 1Day Championship #4【Bo1トーナメント】3位
* NEOのイベント#1 シャドバ 3位
* 名無CS#1 2位
* 1Day Championship #10【Bo1トーナメント】 2位

## 🛡️ ランクマッチ記録 🛡️

今までプレイしてきた色々なゲームの最高ランクを簡単に記録する場所です。

| ゲームタイトル     |   ランク    |
|----------------|------------|
| VALORANT       | D2 |
| APEX LEGENDS   |  D3     |
| HALOInfinite   |  D1 |
| Splitgate    |  D1 |
| Overwatch2    |  G1 |
| Marvel Rivals    |  P1 |
| Shadowverse    |  GM0 |
| Yu-Gi-Oh! Master Duel    | P5 |
| DUEL MASTERS PLAY'S    | P3 |
| Pokémon Trading Card Game Pocket    | MASTER |
| NIJICA    | MASTER |
| Poker Chase    |  DIAMOND |
| Mahjong Soul    |  雀傑 |
| Mahjong Fight Girls    |  初段 |
| STREET FIGHTER 6    |  MASTER |
| ELDEN RING    | 最高ランク |
| ARMORED CORE VI FIRES OF RUBICON    | S |
| Mecha BREAK    |  CHAMPION5 |
| Warlander    |  ORICHALCUM |
| Pokémon UNITE    | MASTER |

## 🎮 つくったミニゲーム 🎮

メウロぷがGeminiちゃんやDeepSeekちゃんと一緒につくったゲームたちです。
* [しいたけタワー！](https://meurop.github.io/pen-export-vEOOeNa/dist/)
* [スイカ斬りゲーム！](https://meurop.github.io/pen-export-qEddxrx/dist/)
* [ノナタワー！](https://meurop.github.io/pen-export-ZYQvMoO/dist/)
* [ノナダンマクカグラ！(PC推奨)](https://meurop.github.io/nonadanmakukagura/dist/)

## 🔗 リンク一覧 🔗

色んなリンクの置き場です。

<div class="social-links-container">
  <a href="https://x.com/MeuropGG" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="X のプロフィールへ">
    <img src="https://pbs.twimg.com/profile_images/1652941656650559488/426V_CyM_400x400.jpg" alt="Xのアイコン" style="width:48px; height:48px; vertical-align:middle; margin-right:6px;">
    <span class="social-text">X</span>
  </a>
  <br>

  <a href="https://twitch.tv/meurop" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Twitch のチャンネルへ">
    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/f2a96e20-c68d-4ae5-b2f1-06f5d3e48e38-profile_image-300x300.png" alt="Twitchのアイコン" style="width:48px; height:48px; vertical-align:middle; margin-right:6px;">
    <span class="social-text">Twitch</span>
  </a>
  <br>

  <a href="https://youtube.com/@meurop" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="YouTube のチャンネルへ">
    <img src="https://yt3.googleusercontent.com/ytc/AIdro_lRztgQ1DASjKdf4yOb9aHj6JYfRIqI3A133L_mkt_qqg=s160-c-k-c0x00ffffff-no-rj" alt="YouTubeのアイコン" style="width:48px; height:48px; vertical-align:middle; margin-right:6px;">
    <span class="social-text">YouTube</span>
  </a>
  <br>

  <a href="https://vrchat.com/home/user/usr_a24e8f74-6037-4cd3-bae6-e58df9dbdd6c" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="VRChat のプロフィールへ">
    <img src="https://pbs.twimg.com/media/GsGVuBuaUAEltl-?format=jpg&name=large" alt="VRChatのアイコン" style="width:48px; height:48px; vertical-align:middle; margin-right:6px;">
    <span class="social-text">VRChat</span>
  </a>
  <br>
  </div>
---




