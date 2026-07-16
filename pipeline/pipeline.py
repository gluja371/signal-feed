"""
Feed content pipeline v0.2
Fetches articles from RSS lanes -> generates cards via Claude API -> writes feed.json

Run daily (GitHub Actions cron or manually):
    pip install anthropic feedparser
    export ANTHROPIC_API_KEY=sk-ant-...
    python pipeline.py
"""

import json
import os
import re
from datetime import date, datetime, timedelta, timezone

import anthropic
import feedparser

# ---------------------------------------------------------------- config

LANES = {
    "computer-vision": [
        "https://www.ultralytics.com/blog/rss.xml",
        "https://news.mit.edu/topic/mitcomputer-vision-rss.xml",
        "https://www.edge-ai-vision.com/feed/",
    ],
    "vibe-coding": [
        "https://simonwillison.net/atom/everything/",
        "https://www.anthropic.com/news/rss.xml",
    ],
    "agentic-ai": [
        "https://www.anthropic.com/news/rss.xml",
        "https://hnrss.org/newest?q=AI+agents&points=100",
    ],
    "ai-news": [
        "https://hnrss.org/frontpage?q=AI&points=150",
    ],
    # People describing real problems and requests = startup idea ore.
    # (X/Twitter has no free feed access; Reddit + Ask HN cover the same ground.)
    "startup-ideas": [
        "https://www.reddit.com/r/SomebodyMakeThis/.rss",
        "https://www.reddit.com/r/startups/.rss",
        "https://www.reddit.com/r/SaaS/.rss",
        "https://www.reddit.com/r/Entrepreneur/.rss",
        "https://hnrss.org/ask?points=50",
    ],
    # Rockets, launches, and the build-out of space infrastructure.
    "aerospace": [
        "https://spacenews.com/feed/",
        "https://www.nasaspaceflight.com/feed/",
        "https://spaceflightnow.com/feed/",
        "https://feeds.arstechnica.com/arstechnica/space",
    ],
}

CARDS_PER_DAY = 10         # finite feed: hard cap (6 lanes now)
MAX_AGE_DAYS = 7           # ignore stale items
MODEL = "claude-sonnet-4-6"
SEEN_FILE = "seen_urls.json"   # dedupe across days
OUT_FILE = "feed.json"
PROMPT_FILE = "generation-prompt.md"

# Reddit rejects anonymous/default clients; a named user agent keeps it happy.
USER_AGENT = "signal-feed/0.2 (personal single-user learning app)"

# ---------------------------------------------------------------- fetch

def fetch_candidates():
    cutoff = datetime.now(timezone.utc) - timedelta(days=MAX_AGE_DAYS)
    seen = set(json.load(open(SEEN_FILE))) if os.path.exists(SEEN_FILE) else set()
    candidates = []
    for topic, feeds in LANES.items():
        for feed_url in feeds:
            try:
                parsed = feedparser.parse(feed_url, agent=USER_AGENT)
            except Exception as e:
                print(f"  ! feed failed {feed_url}: {e}")
                continue
            if not parsed.entries:
                print(f"  ! feed empty {feed_url}")
                continue
            for entry in parsed.entries[:10]:
                url = entry.get("link", "")
                if not url or url in seen:
                    continue
                published = entry.get("published_parsed") or entry.get("updated_parsed")
                if published and datetime(*published[:6], tzinfo=timezone.utc) < cutoff:
                    continue
                text = re.sub(r"<[^>]+>", " ", entry.get("summary", ""))[:4000]
                candidates.append({
                    "topic": topic,
                    "title": entry.get("title", ""),
                    "url": url,
                    "text": text,
                })
    return candidates, seen


# ---------------------------------------------------------------- generate

def generate_card(client, system_prompt, item):
    msg = client.messages.create(
        model=MODEL,
        max_tokens=1500,
        system=system_prompt,
        messages=[{
            "role": "user",
            "content": (
                f"TOPIC: {item['topic']}\n"
                f"ARTICLE_TITLE: {item['title']}\n"
                f"ARTICLE_URL: {item['url']}\n"
                f"ARTICLE_TEXT: {item['text']}"
            ),
        }],
    )
    raw = msg.content[0].text.strip()
    raw = re.sub(r"^```(json)?|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)


def main():
    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY
    system_prompt = open(PROMPT_FILE).read()

    candidates, seen = fetch_candidates()
    print(f"{len(candidates)} fresh candidates")

    # simple balance: round-robin topics so one noisy lane can't dominate
    by_topic = {}
    for c in candidates:
        by_topic.setdefault(c["topic"], []).append(c)
    picked = []
    while len(picked) < CARDS_PER_DAY * 2 and any(by_topic.values()):
        for topic in list(by_topic):
            if by_topic[topic]:
                picked.append(by_topic[topic].pop(0))

    cards = []
    for item in picked:
        if len(cards) >= CARDS_PER_DAY:
            break
        try:
            card = generate_card(client, system_prompt, item)
        except Exception as e:
            print(f"  ! generation failed for {item['url']}: {e}")
            continue
        seen.add(item["url"])
        if card.get("skip"):
            print(f"  - skipped: {item['title'][:50]} ({card.get('reason','')})")
            continue
        cards.append(card)
        print(f"  + [{card['format']:<11}] {card['title']}")

    feed = {"version": 1, "generated_at": str(date.today()), "cards": cards}
    json.dump(feed, open(OUT_FILE, "w"), indent=2)
    json.dump(sorted(seen)[-2000:], open(SEEN_FILE, "w"))
    print(f"wrote {OUT_FILE} with {len(cards)} cards")


if __name__ == "__main__":
    main()
