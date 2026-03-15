# 🚛 狭路チェッカー — 狭路警戒マップ

運転手が**事前に道路幅を確認**できるブラウザアプリです。  
HTMLファイル1枚のみ。インストール不要、サーバー不要。ダブルクリックで即使用できます。

---

## 📸 スクリーンショット

> 地図上に道路幅を色分け表示。道路をクリックすると詳細情報がポップアップします。

---

## 🎨 色分け判定基準

| 色 | 幅員 | 判定 |
|:---:|:---:|:---|
| 🔴 赤（実線） | 3.0m 未満 | **侵入禁止** |
| 🟠 オレンジ（実線） | 3.1〜4.0m | **徐行必須** |
| 🟡 黄色（実線） | 4.1〜5.5m | **注意** |
| 🟢 緑（実線） | 5.5m 以上 | **安心** |
| 🔴 赤（点線） | 幅員データなし | 狭い可能性あり（residential / service + lanes=1） |

> **注意**: 色分けはOpenStreetMapの`width`タグを使用しています。  
> 日本国内はwidthデータが少ないエリアもあります。点線表示の道路は実際に確認してください。

---

## 🚀 使い方

### 1. ダウンロード

```
Code → Download ZIP
```

または `git clone`:

```bash
git clone https://github.com/YOUR_USERNAME/narrow-road-checker.git
```

### 2. 起動

`index.html` をブラウザで開くだけです。

```
narrow-road-checker/
└── index.html   ← これをダブルクリック
```

> ⚠️ **位置情報（現在地ボタン）を使う場合**  
> `file://` で開くとChromeはGeolocationをブロックします。  
> その場合は以下のいずれかを使ってください：
> - **GitHub Pages** で公開して `https://` でアクセスする（推奨）
> - ローカルサーバーを使う（後述）
> - 検索ボックスで場所を入力する（位置情報なしでも使えます）

### 3. GitHub Pages で公開する場合（HTTPS で使いたい場合）

1. このリポジトリを自分のGitHubにForkまたはUpload
2. `Settings` → `Pages` → Branch: `main` / Folder: `/(root)` → `Save`
3. `https://YOUR_USERNAME.github.io/narrow-road-checker/` でアクセス

### 4. ローカルサーバーを使う場合

```bash
# Python 3
python -m http.server 8000
# → http://localhost:8000 を開く
```

---

## 🗺️ 機能一覧

| 機能 | 説明 |
|:---|:---|
| 道路色分け表示 | OpenStreetMapの`width`タグをもとに4段階で色分け |
| 現在地ボタン | GPS取得して現在地を地図中心に移動 |
| 住所・地名検索 | 住所や地名を入力してその場所に移動（サジェスト候補付き） |
| 道路クリック | 道路名・幅員・種別・車線数・制限速度をポップアップ表示 |
| 自動再取得 | 地図を移動するたびに道路データを自動取得 |

---

## 🔧 技術スタック

| 技術 | 用途 |
|:---|:---|
| [Leaflet.js](https://leafletjs.com/) v1.9.4 | 地図表示 |
| [CARTO Voyager](https://carto.com/basemaps/) | 地図タイル（HTTPS対応・無料） |
| [Overpass API](https://overpass-api.de/) | OpenStreetMapの道路データ取得 |
| [Nominatim](https://nominatim.openstreetmap.org/) | 住所・地名検索 |

外部ライブラリはCDN経由。バックエンドなし、データベースなし。

---

## 📋 データについて

道路データは **OpenStreetMap** から取得しています。

- 日本国内で`width`タグが登録されている道路は多くありません
- widthデータがない道路は種別（`residential` / `service`）と車線数（`lanes=1`）でヒューリスティック判定しています
- データの正確性は保証できません。**必ず実地で目視確認してください**

OSMへのデータ追加・修正は [https://www.openstreetmap.org](https://www.openstreetmap.org) から誰でも行えます。

---

## ⚠️ 免責事項

このツールは参考情報の提供を目的としています。  
本アプリの情報を基に発生したいかなる損害・事故についても、作者は責任を負いません。  
**運転判断は必ず自身の目視と責任で行ってください。**

---

## 📄 ライセンス

MIT License — 自由に使用・改変・再配布できます。

---

## 🙏 クレジット

- 地図データ: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)
- タイル: © [CARTO](https://carto.com/attributions)
