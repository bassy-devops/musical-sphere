# GitHub Pages Deployment

このプロジェクトはGitHub Pagesにデプロイできます。

## セットアップ手順

### 1. GitHubリポジトリを作成
```bash
git init
git add .
git commit -m "Initial commit: R3F Musical Sphere with Mobile & AR support"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/musical-sphere.git
git push -u origin main
```

### 2. GitHub Pagesを有効化
1. GitHubのリポジトリページにアクセス
2. **Settings** → **Pages** に移動
3. **Source** を **GitHub Actions** に設定

### 3. 自動デプロイ
- `main`ブランチにプッシュすると、自動的にビルドしてデプロイされます
- デプロイ後、`https://YOUR_USERNAME.github.io/musical-sphere/` でアクセスできます

## 手動デプロイ（オプション）
GitHub Actionsを使わない場合は、以下のコマンドで手動デプロイできます：

```bash
npm run build
npx gh-pages -d dist
```

## 注意事項
- **Base Path**: `vite.config.ts`の`base`設定は`/musical-sphere/`（リポジトリ名）に設定されています
- リポジトリ名が異なる場合は、`vite.config.ts`の`base`を変更してください
- **AR機能**: GitHub PagesはHTTPSなので、AR機能も正常に動作します
