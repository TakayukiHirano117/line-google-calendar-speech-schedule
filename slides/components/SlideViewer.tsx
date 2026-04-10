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
          <img
            src={slide.image}
            alt=""
            style={titleImageStyle}
          />
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

  if (slide.layout === "profile") {
    return (
      <div style={profileLayoutStyle}>
        {slide.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.avatar} alt="" style={profileAvatarStyle} />
        )}
        <div style={profileInfoStyle}>
          <p style={profileLabelStyle}>自己紹介</p>
          <h2 style={profileNameStyle}>{slide.title}</h2>
          {slide.body && (
            <ul style={profileBodyStyle}>
              {slide.body.map((item, i) => (
                <li key={i} style={profileBodyItemStyle}>{item}</li>
              ))}
            </ul>
          )}
          {slide.tags && slide.tags.length > 0 && (
            <div style={profileTagsRowStyle}>
              <span style={profileTagsLabelStyle}>最近の興味</span>
              <div style={profileTagsListStyle}>
                <TagList tags={slide.tags} />
              </div>
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
      {slide.tags && slide.tags.length > 0 && (
        <div style={contentTagsRowStyle}>
          <TagList tags={slide.tags} />
        </div>
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

const profileLayoutStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6%",
  width: "100%",
};

const profileAvatarStyle: React.CSSProperties = {
  width: "clamp(100px, 20%, 170px)",
  height: "auto",
  borderRadius: "50%",
  border: "3px solid var(--color-border)",
  flexShrink: 0,
  background: "#f3f0ff",
};

const profileInfoStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
};

const profileLabelStyle: React.CSSProperties = {
  fontSize: "clamp(0.7rem, 1.5vw, 0.875rem)",
  color: "var(--color-accent)",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};

const profileNameStyle: React.CSSProperties = {
  fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
  fontWeight: 700,
  letterSpacing: "-0.02em",
  lineHeight: 1.1,
};

const profileBodyStyle: React.CSSProperties = {
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: "0.3rem",
};

const profileBodyItemStyle: React.CSSProperties = {
  fontSize: "clamp(0.75rem, 1.6vw, 1rem)",
  color: "var(--color-muted)",
};

const profileTagsRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginTop: "0.5rem",
  flexWrap: "wrap",
};

const profileTagsLabelStyle: React.CSSProperties = {
  fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
  color: "var(--color-muted)",
  whiteSpace: "nowrap",
};

const profileTagsListStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
};

function TagList({ tags }: { tags: NonNullable<Slide["tags"]> }) {
  return (
    <>
      {tags.map((tag, i) => {
        const isUrl = tag.icon?.startsWith("http") || tag.icon?.startsWith("/");
        const inner = (
          <>
            {tag.icon && (
              isUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tag.icon} alt="" style={profileTagIconStyle} />
              ) : (
                <span style={profileTagEmojiStyle}>{tag.icon}</span>
              )
            )}
            {tag.label}
          </>
        );
        return tag.url ? (
          <a
            key={i}
            href={tag.url}
            target={tag.download ? undefined : "_blank"}
            rel={tag.download ? undefined : "noreferrer"}
            download={tag.download ? "SKILL.md" : undefined}
            style={{ ...profileTagStyle, textDecoration: "none", color: "inherit" }}
          >
            {inner}
          </a>
        ) : (
          <span key={i} style={profileTagStyle}>{inner}</span>
        );
      })}
    </>
  );
}

const contentTagsRowStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  marginTop: "1.5rem",
};

const profileTagStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  padding: "0.3rem 0.85rem",
  border: "1px solid var(--color-border)",
  borderRadius: "999px",
  fontSize: "clamp(0.9rem, 2vw, 1.15rem)",
  fontWeight: 500,
};

const profileTagIconStyle: React.CSSProperties = {
  width: "1.8em",
  height: "1.8em",
  objectFit: "contain",
};

const profileTagEmojiStyle: React.CSSProperties = {
  fontSize: "1.8em",
  lineHeight: 1,
};

const counterStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
};
