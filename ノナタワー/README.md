Face Stack - ローカルで遊べるシンプルなHTML5ゲーム

使い方:
1. このフォルダ内にある `faces/` フォルダに、あなたのPNG画像を入れてください（例: face1.png, face2.png）。
2. `faces/list.json` にファイル名を追加または編集して、ゲームに読み込む画像ファイルを列挙しますn3. `index.html` をブラウザで開くか、ローカルサーバーでホストしてください。

ローカルサーバー例（PowerShell）:
# Python 3 がインストール済みの場合
python -m http.server 8000; Start-Process http://localhost:8000

操作:
- 左右矢印キーで顔を左右に動かせます。
- Spaceで落とす（またはゲーム開始時に使用）。

注意:
- faces/list.json のファイル名は小文字/大文字を区別する場合があります。Windowsでは通常問題ありません。
- 画像のアスペクト比によっては見た目が崩れる場合があります。