---
layout: post
title: これはブログ記事風に表示したいページのタイトルだよ！
date: 2025-05-29 # postレイアウトは日付も表示することが多いから、書いとくとイイ感じ！
# author: 君の名前！ # テーマによっては著者名も表示できる！
# categories: [イベント, レポート] # カテゴリとかも設定できるかも！
---

# メウロぷのページへようこそ
# ツイフィ兼ポートフォリオ兼ブログ

日本語しか分かりません。プログラミング言語ってなんですか。

## ブログ
---
layout: default # ← 記事一覧を表示するページのレイアウトを指定 (Minimaテーマの `home` は元々記事一覧機能がある)
title: ボクのブログ - 最新記事一覧！
permalink: /blog/ # ← もし `blog.md` とかで専用ページ作るなら、URLをこうやって指定できる (トップページなら不要)
---

## ✨ 最新の記事一覧 ✨

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
      <p>{{ post.excerpt }}</p> {# post.excerpt で記事の最初の段落とかを抜粋表示できる！ #}
    </li>
  {% endfor %}
</ul>

<p>過去の記事も読んでみてね！</p>

## 🏆 Shadowverse大会実績 🏆

3位以上になった大会を記録していきます。大会の規模は問いません。

###JCG
* JCG Shadowverse Open Farewell CUP アンリミテッド大会 3位

###Tonamel
* さんかく杯vol.22 準優勝
* waybssvopenwaybscupvol120 3位
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
* [エーテル難民にも安心]ブロンズ限定大会[第一回] 3-1 2位
* 第25回　アンリミBO3 ヨシハラ杯 2位
* 【ローテbo3】賞金1000ギフト大会5/8【集会所杯】 準優勝
* アンリミテッドBO3しむ杯 第9回 3位

## 🛡️ ランクマッチ記録 🛡️

今までプレイしてきた色々なゲームのランクを簡単に記録する場所です。

| ゲームタイトル     | ランク/ステータス | 最高到達点     | ひとことコメント                               |
|----------------|---------------|------------|--------------------------------------------|
| Shadowverse    | あ        | い | だ        |
| VALORANT       | う   | え | ぢ        |
| APEX LEGENDS   | プラチナ IV     | マスター     | づ |
| (他のゲーム)    | (現在のランク)   | (最高ランク) | (何かコメント)                               |

## 🎮 つくったミニゲーム 🎮

メウロぷがGeminiちゃんと一緒につくったゲームたちです。

## 🔗 リンク一覧 🔗

色んなリンクの置き場です。

* **X:** [![Xのアイコンとか](ここにXアイコン画像のURLとかあれば)](https://twitter.com/あなたのXアカウント) [@あなたのXアカウント](https://twitter.com/あなたのXアカウント) - 最新情報や日常をポストしてるよ！
* **Twitch:** [![Twitchのアイコンとか](ここにTwitchアイコン画像のURLとかあれば)](https://twitch.tv/あなたのTwitchチャンネル) [あなたのTwitchチャンネル](https://twitch.tv/あなたのTwitchチャンネル) - ゲーム配信メイン！コメントで盛り上げてね！
* **YouTube:** [![YouTubeのアイコンとか](ここにYouTubeアイコン画像のURLとかあれば)](https://youtube.com/あなたのYouTubeチャンネル) [あなたのYouTubeチャンネル](https://youtube.com/あなたのYouTubeチャンネル) - 大会動画や解説動画をアップしてるかも！
* **note:** `君のDiscord名#1234` (またはサーバー招待リンク！) - 一緒にゲームする仲間募集中！

---
