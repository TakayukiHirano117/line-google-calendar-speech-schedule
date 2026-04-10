---
name: slides
description: >
  スライドを作成・生成するよう依頼されたとき（「スライドを作って」「プレゼンを作成して」
  「slides を作りたい」「/slides」など）に使用する。
  Next.js でミニマルなプレゼンテーションを生成する。
version: 1.0.0
---

# スライド作成 Skill

## 概要

ユーザーからトピックや内容を受け取り、Next.js ベースのプレゼンテーションアプリを生成する。

## ワークフロー

### Step 1: 情報収集

以下の情報をユーザーに確認する（すでに提示されていれば省略）:

1. **スライドのトピック・目的**（必須）
2. **ターゲット**: 誰に向けて話すか
3. **スライド数の目安**: なければ適切に判断する
4. **生成先ディレクトリ**: 未指定なら現在の作業ディレクトリを使用

### Step 2: スライド構成の設計

受け取った情報をもとに、以下のスライド構成を設計する:

- **タイトルスライド** (`layout: "title"`): 発表タイトル・サブタイトル・発表者
- **セクション区切り** (`layout: "section"`): 大きな話題の切り替えに使用
- **コンテンツスライド** (`layout: "content"`): 本文（箇条書き3〜5項目が目安）

**スライド作成のルール**:
- 1スライドに1メッセージ。詰め込まない
- 箇条書きは短く（1行15〜20字以内が目安）
- 説明は `note` フィールドに入れる（スライド上には出ない）

### Step 3: Next.js アプリの生成

指定ディレクトリに以下の構成でファイルを作成する。
既存の Next.js プロジェクトがあれば、必要なファイルのみ追加・上書きする。

---

## 生成するファイル一覧

### `package.json`

```json
{
  "name": "slides",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "15.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

### `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `app/globals.css`

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-bg: #FAFAFA;
  --color-text: #1A1A1A;
  --color-accent: #2563EB;
  --color-muted: #6B7280;
  --color-border: #E5E7EB;
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

html, body {
  height: 100%;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

### `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slides",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

### `app/page.tsx`

```tsx
import { slides } from "@/data/slides";
import { SlideViewer } from "@/components/SlideViewer";

export default function Home() {
  return <SlideViewer slides={slides} />;
}
```

### `data/slides.ts`

スライドの内容はユーザーのトピックに合わせて生成する。以下は型定義と例:

```ts
export type Slide = {
  title: string;
  body?: string[];
  note?: string;
  layout?: "title" | "content" | "section" | "profile";
  image?: string;   // public/ 配下のパス（例: "/logo.png"）
  avatar?: string;  // profile レイアウト用フェイス画像（public/ 配下: "/face.jpg"）
  tags?: { label: string; icon?: string; url?: string; download?: boolean }[];
  // icon: URL（"/clawd.png" など public/ 参照）または絵文字文字列（"🦀"）
};

export const slides: Slide[] = [
  {
    layout: "title",
    title: "発表タイトル",
    body: ["サブタイトル", "発表者名 / 事業部 · 2026年4月"],
    image: "/logo.png",  // 省略可。public/logo.png を参照
  },
  {
    layout: "profile",
    title: "発表者名",
    avatar: "/face.jpg",  // public/face.jpg を参照
    body: ["所属事業部", "入社年月"],
    tags: [
      { label: "Claude", icon: "/clawd.png" },  // public/clawd.png を参照
      { label: "Go", icon: "https://cdn.simpleicons.org/go/00ADD8" },  // 外部URLも可
      { label: "その他の興味", icon: "🦀" },  // 絵文字も可
    ],
  },
  {
    layout: "section",
    title: "第1章",
  },
  {
    layout: "content",
    title: "スライドタイトル",
    body: [
      "ポイント1",
      "ポイント2",
      "ポイント3",
    ],
    note: "ここに発表者ノートを書く",
  },
];
```

### `components/SlideViewer.tsx`

縦スクロール（scroll-snap）方式。スクロール・キーボード（↑↓ / Space）・タッチで操作できる。  
`image` フィールドが指定されたタイトルスライドは、左に画像・右にテキストの横並びレイアウトになる。

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { Slide } from "@/data/slides";

export function SlideViewer({ slides }: { slides: Slide[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const index = Math.round(el.scrollTop / el.clientHeight);
      setCurrent(index);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
        el.scrollTo({ top: (current + 1) * el.clientHeight, behavior: "smooth" });
      } else if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
        e.preventDefault();
        el.scrollTo({ top: (current - 1) * el.clientHeight, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current]);

  return (
    <div ref={containerRef} style={containerStyle}>
      {slides.map((slide, i) => (
        <section key={i} style={sectionStyle}>
          <div style={slideStyle}>
            <SlideContent slide={slide} />
          </div>
          <p style={counterStyle}>{i + 1} / {slides.length}</p>
        </section>
      ))}
    </div>
  );
}

function SlideContent({ slide }: { slide: Slide }) {
  if (slide.layout === "title") {
    return (
      <div style={slide.image ? titleWithImageLayoutStyle : titleLayoutStyle}>
        {slide.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.image} alt="" style={titleImageStyle} />
        )}
        <div style={titleTextBlockStyle}>
          <h1 style={titleHeadingStyle}>{slide.title}</h1>
          {slide.body && (
            <div style={titleSubStyle}>
              {slide.body.map((line, i) => (
                <p key={i} style={{ color: "var(--color-muted)", marginTop: "0.5rem" }}>
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (slide.layout === "section") {
    return (
      <div style={sectionLayoutStyle}>
        <div style={sectionAccentStyle} />
        <h2 style={sectionHeadingStyle}>{slide.title}</h2>
      </div>
    );
  }

  return (
    <div style={contentLayoutStyle}>
      <h2 style={contentHeadingStyle}>{slide.title}</h2>
      {slide.body && (
        <ul style={listStyle}>
          {slide.body.map((item, i) => (
            <li key={i} style={listItemStyle}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  height: "100vh",
  overflowY: "scroll",
  scrollSnapType: "y mandatory",
};

const sectionStyle: React.CSSProperties = {
  height: "100vh",
  scrollSnapAlign: "start",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
  gap: "1.25rem",
};

const slideStyle: React.CSSProperties = {
  width: "min(960px, 100%)",
  aspectRatio: "16 / 9",
  background: "#ffffff",
  border: "1px solid var(--color-border)",
  borderRadius: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "5%",
};

const titleLayoutStyle: React.CSSProperties = {
  textAlign: "center",
};

const titleWithImageLayoutStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "5%",
  width: "100%",
};

const titleImageStyle: React.CSSProperties = {
  width: "clamp(120px, 22%, 200px)",
  height: "auto",
  flexShrink: 0,
};

const titleTextBlockStyle: React.CSSProperties = {
  flex: 1,
};

const titleHeadingStyle: React.CSSProperties = {
  fontSize: "clamp(2rem, 5vw, 3.5rem)",
  fontWeight: 700,
  lineHeight: 1.2,
  letterSpacing: "-0.02em",
};

const titleSubStyle: React.CSSProperties = {
  marginTop: "1.5rem",
  fontSize: "clamp(1rem, 2vw, 1.25rem)",
};

const sectionLayoutStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
};

const sectionAccentStyle: React.CSSProperties = {
  width: "6px",
  height: "clamp(3rem, 8vw, 5rem)",
  background: "var(--color-accent)",
  borderRadius: "3px",
  flexShrink: 0,
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: "clamp(2rem, 4.5vw, 3rem)",
  fontWeight: 700,
  letterSpacing: "-0.02em",
};

const contentLayoutStyle: React.CSSProperties = {
  width: "100%",
};

const contentHeadingStyle: React.CSSProperties = {
  fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
  fontWeight: 700,
  letterSpacing: "-0.02em",
  marginBottom: "1.5rem",
  paddingBottom: "0.75rem",
  borderBottom: "2px solid var(--color-accent)",
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const listItemStyle: React.CSSProperties = {
  fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
  lineHeight: 1.7,
  paddingLeft: "1.5rem",
  position: "relative",
};

const contentTagsRowStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  marginTop: "1.5rem",
};

const counterStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
};
```

---

## Step 4: 完了後の案内

すべてのファイルを生成したら、以下を伝える:

```
セットアップ:
  cd <プロジェクトディレクトリ>
  npm install
  npm run dev        # 開発サーバー起動 → http://localhost:3000

静的ファイルとして書き出し（頒布・共有用）:
  npm run build      # out/ ディレクトリに静的ファイルを生成
  → out/index.html をブラウザで直接開けばlocalhost不要で閲覧可能

画像の置き場所:
  public/ 配下に配置し、スライドからは "/ファイル名" で参照する
  例: public/face.jpg → avatar: "/face.jpg"
      public/logo.png → image: "/logo.png"
  icon には URL・ローカルパス（"/xxx.png"）・絵文字（"🦀"）のいずれも指定可

↑ / ↓ キー（またはスクロール）でスライドを移動できます
```

---

## デザイン制約（厳守）

- グラデーション・box-shadow・テキストシャドウを使わない
- アニメーション・トランジションを加えない
- フォントは `system-ui` のみ。外部フォントを読み込まない
- カラーパレットは `--color-*` 変数のみ使用
- 箇条書きには `•` の代わりにカスタム絵文字や記号を使わない
