import { useEffect, useState } from "react";
import { getStories } from "./contentful";

const CATEGORIES = [
  "Fiction",
  "Poetry",
  "Essays",
  "Flash fiction",
];

const STORIES = [
  {
    id: 1,
    title: "The Cartographer Who Lost Her North",
    category: "Fiction",
    author: "Naila Farooq",

    excerpt:
      "Every map she drew pointed somewhere true except her own street, which kept wandering off the page.",

    content:
      "Every morning, she drew maps.\n\nNot the kind that helped people get somewhere. Her maps were stranger than that.\n\nShe drew places that had disappeared, roads that no longer existed, and houses whose owners had moved away years ago.\n\nBut there was one street she could never draw correctly.\n\nHer own.\n\nShe tried again and again. Still, when she finished, the street wandered away from the page.\n\nOne evening, she decided to follow it.\n\nFor the first time, she stopped trying to find north.",

    minutes: 6,
    featured: true,

    image:
      "https://picsum.photos/seed/littlestories1/900/600",
  },

  {
    id: 2,
    title: "Instructions for Leaving a Small Town",
    category: "Poetry",
    author: "Amara Bloom",

    excerpt:
      "Pack light. The porch light will follow you for miles.",

    content:
      "Pack light.\n\nTake only what you can carry.\n\nLeave the old photographs behind.\n\nLeave the broken chair by the window.\n\nLeave the road that knows your name.\n\nThe porch light will follow you for miles.",

    minutes: 2,

    image:
      "https://picsum.photos/seed/littlestories2/500/360",
  },

  {
    id: 3,
    title: "On Keeping Plants Alive When Nothing Else Is Working",
    category: "Essays",
    author: "Meher Aslam",

    excerpt:
      "The basil died in March. I want to tell you what that had to do with anything, but it didn't, and that was the point.",

    content:
      "The basil died in March.\n\nI had forgotten to water it for three days.\n\nAt first, I felt guilty. Then I realized that sometimes things simply stop growing.\n\nWe spend so much time trying to keep everything alive.\n\nPlants.\n\nFriendships.\n\nDreams.\n\nSometimes letting something end is not failure.\n\nSometimes it is simply the end of that particular season.",

    minutes: 5,

    image:
      "https://picsum.photos/seed/littlestories3/500/360",
  },

  {
    id: 4,
    title: "Forty Words for the Last Bus Home",
    category: "Flash fiction",
    author: "Kamil Zafar",

    excerpt:
      "She counted streetlights instead of stops, which was its own kind of arriving.",

    content:
      "She counted streetlights instead of stops.\n\nOne.\n\nTwo.\n\nThree.\n\nOutside the window, the city slowly disappeared.\n\nBy the time she reached her stop, she had counted forty lights.\n\nShe smiled.\n\nIt was not home yet.\n\nBut it was close.",

    minutes: 1,

    image:
      "https://picsum.photos/seed/littlestories4/500/360",
  },

  {
    id: 5,
    title: "The Neighbor Who Collected Endings",
    category: "Fiction",
    author: "Rehan Malik",

    excerpt:
      "He kept them in jam jars — the last lines of books he never finished, labeled by the year he gave up.",

    content:
      "He kept endings in jam jars.\n\nEvery jar contained the last line of a book he never finished.\n\nSome endings were beautiful.\n\nSome were disappointing.\n\nSome were forgotten completely.\n\nHe labeled every jar with the year he gave up.\n\nOne day, his neighbor asked him why.\n\nHe simply smiled.\n\nBecause unfinished things deserve somewhere to live.",

    minutes: 7,

    image:
      "https://picsum.photos/seed/littlestories5/500/360",
  },

  {
    id: 6,
    title: "A Short Grief, Folded Twice",
    category: "Poetry",
    author: "Zohaib Rana",

    excerpt:
      "I keep it in the drawer with the batteries and the spare keys.",

    content:
      "I keep it in the drawer with the batteries and the spare keys.\n\nIt is folded twice.\n\nSmall enough to forget.\n\nHeavy enough to remember.\n\nSometimes I open the drawer just to make sure it is still there.\n\nIt always is.",

    minutes: 2,

    image:
      "https://picsum.photos/seed/littlestories6/500/360",
  },
];

const PALETTE = {
  paper: "#FAF3E7",
  ink: "#241F1C",
  inkSoft: "#5B5148",
  indigo: "#2B3A55",
  berry: "#8B3A42",
  gold: "#B9925A",
  line: "#E3D8BE",
  card: "#FFFFFF",
};

const CATEGORY_ACCENTS = {
  Fiction: PALETTE.berry,
  Poetry: PALETTE.indigo,
  Essays: PALETTE.gold,
  "Flash fiction": "#607A70",
};

// Small status strip shown under the navbar while Contentful loads,
// or if the live fetch failed and we're showing the built-in stories instead.
function StatusBanner({ status }) {
  if (status === "idle") return null;

  const isLoading = status === "loading";

  return (
    <div
      style={ {
        background: isLoading ? "#F3E9D6" : "#F6E3E1",
        borderBottom: `1px solid ${PALETTE.line}`,
      } }
    >
      <div
        style={ {
          maxWidth: 960,
          margin: "0 auto",
          padding: "10px 24px",
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: isLoading ? PALETTE.inkSoft : PALETTE.berry,
        } }
      >
        { isLoading
          ? "Loading the latest stories…"
          : "Couldn't reach Contentful just now — showing the built-in stories instead." }
      </div>
    </div>
  );
}

function Navbar({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { key: "home", label: "Home" },
    { key: "categories", label: "Categories" },
    { key: "about", label: "About" },
  ];

  return (
    <header
      style={ {
        borderBottom: `1px solid ${PALETTE.line}`,
        background: PALETTE.paper,
        position: "sticky",
        top: 0,
        zIndex: 10,
      } }
    >
      <div
        className="site-nav-inner"
        style={ {
          maxWidth: 960,
          margin: "0 auto",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        } }
      >
        <button
          onClick={ () => setPage("home") }
          style={ {
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            padding: 0,
          } }
        >
          <span
            style={ {
              fontFamily: "'Fraunces', serif",
              fontSize: 25,
              fontWeight: 600,
              color: PALETTE.ink,
              letterSpacing: "-0.01em",
            } }
          >
            Little Stories
          </span>

          <span
            style={ {
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: PALETTE.berry,
              display: "inline-block",
              marginBottom: 3,
            } }
          />
        </button>

        <button
          className="menu-toggle"
          type="button"
          aria-label={ menuOpen ? "Close menu" : "Open menu" }
          aria-expanded={ menuOpen }
          onClick={ () => setMenuOpen((isOpen) => !isOpen) }
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={ `site-nav-links${menuOpen ? " is-open" : ""}` }
          style={ {
            display: "flex",
            gap: 28,
          } }
        >
          { links.map((l) => {
            const isActive = page === l.key;

            return (
              <button
                key={ l.key }
                onClick={ () => {
                  setPage(l.key);
                  setMenuOpen(false);
                } }
                style={ {
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive ? PALETTE.berry : PALETTE.inkSoft,
                  borderBottom: isActive
                    ? `2px solid ${PALETTE.berry}`
                    : "2px solid transparent",
                  paddingBottom: 4,
                } }
              >
                { l.label }
              </button>
            );
          }) }
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      style={ {
        maxWidth: 960,
        margin: "0 auto",
        padding: "56px 24px 8px",
      } }
    >
      <p
        style={ {
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: PALETTE.berry,
          fontWeight: 600,
          letterSpacing: "0.02em",
          marginBottom: 12,
        } }
      >
        A small home for short things
      </p>

      <h1
        style={ {
          fontFamily: "'Fraunces', serif",
          fontSize: 46,
          lineHeight: 1.1,
          fontWeight: 600,
          color: PALETTE.ink,
          margin: 0,
          maxWidth: 620,
        } }
      >
        Fiction, poetry and essays you can read on one coffee.
      </h1>
    </section>
  );
}

function CategoryShelf({ active, onSelect }) {
  return (
    <div
      style={ {
        display: "flex",
        gap: 8,
        marginTop: 32,
        marginBottom: 40,
        flexWrap: "wrap",
      } }
    >
      <button
        onClick={ () => onSelect("All") }
        style={ pillStyle(active === "All") }
      >
        All stories
      </button>

      { CATEGORIES.map((c) => (
        <button
          key={ c }
          onClick={ () => onSelect(c) }
          style={ pillStyle(active === c) }
        >
          { c }
        </button>
      )) }
    </div>
  );
}

function pillStyle(isActive) {
  return {
    background: isActive ? PALETTE.indigo : "transparent",
    border: `1px solid ${isActive ? PALETTE.indigo : PALETTE.line}`,
    borderRadius: 999,
    padding: "8px 18px",
    fontFamily: "'Inter', sans-serif",
    fontSize: 13.5,
    fontWeight: 500,
    color: isActive ? PALETTE.paper : PALETTE.inkSoft,
    cursor: "pointer",
  };
}

function BackButton({ onClick, label = "Back to home" }) {
  return (
    <button
      onClick={ onClick }
      style={ {
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        background: "#FFFFFFAA",
        border: `1px solid ${PALETTE.line}`,
        borderRadius: 999,
        padding: "9px 16px 9px 12px",
        color: PALETTE.indigo,
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(36, 31, 28, 0.06)",
      } }
      onMouseEnter={ (event) => {
        event.currentTarget.style.background = PALETTE.indigo;
        event.currentTarget.style.color = PALETTE.paper;
      } }
      onMouseLeave={ (event) => {
        event.currentTarget.style.background = "#FFFFFFAA";
        event.currentTarget.style.color = PALETTE.indigo;
      } }
    >
      <span style={ { fontSize: 17, lineHeight: 1 } }>←</span>
      { label }
    </button>
  );
}

function imageFallback(story) {
  return `https://picsum.photos/seed/${encodeURIComponent(story.id)}/900/600`;
}

function FeaturedCard({ story, onClick }) {
  return (
    <article
      className="featured-card"
      onClick={ onClick }
      style={ {
        position: "relative",
        borderRadius: 14,
        overflow: "hidden",
        minHeight: 440,
        display: "flex",
        alignItems: "flex-end",
        cursor: "pointer",
        boxShadow: "0 18px 40px rgba(36, 31, 28, 0.16)",
      } }
    >
      <img
        src={ story.image || imageFallback(story) }
        alt={ story.title }
        onError={ (event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = imageFallback(story);
        } }
        style={ {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        } }
      />

      <div
        style={ {
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(0deg, rgba(28,22,18,0.88) 0%, rgba(28,22,18,0.35) 55%, rgba(28,22,18,0.05) 100%)",
        } }
      />

      <div
        className="featured-card-content"
        style={ {
          position: "relative",
          padding: "48px 52px",
          color: "#FFFFFF",
          maxWidth: 640,
        } }
      >
        <span
          style={ {
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            letterSpacing: "0.02em",
            color: PALETTE.gold,
            fontWeight: 600,
          } }
        >
          Featured · { story.category }
        </span>

        <h2
          className="featured-card-title"
          style={ {
            fontFamily: "'Fraunces', serif",
            fontSize: 42,
            lineHeight: 1.15,
            fontWeight: 600,
            margin: "12px 0 12px",
          } }
        >
          { story.title }
        </h2>

        <p
          style={ {
            fontFamily: "'Fraunces', serif",
            fontStyle: "italic",
            fontSize: 16,
            lineHeight: 1.6,
            color: "#EDE6D8",
            margin: "0 0 14px",
          } }
        >
          { story.excerpt }
        </p>

        <span style={ { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#D8CDBB" } }>
          { story.author ? `${story.author} · ` : "" }
          { story.minutes } min read
        </span>
      </div>
    </article>
  );
}

function StoryGrid({ stories, onStoryClick }) {
  if (stories.length === 0) {
    return (
      <p
        style={ {
          fontFamily: "'Inter', sans-serif",
          color: PALETTE.inkSoft,
          fontSize: 14,
          padding: "24px 0",
        } }
      >
        No stories in this category yet.
      </p>
    );
  }

  return (
    <div
      className="story-grid"
      style={ {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 24,
      } }
    >
      { stories.map((s) => (
        <article
          key={ s.id }
          onClick={ () => onStoryClick(s) }
          style={ {
            background: PALETTE.card,
            border: `1px solid ${PALETTE.line}`,
            borderRadius: 14,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
            transition: "transform 0.15s ease",
          } }
        >
          <div style={ { width: "100%", height: 160, overflow: "hidden" } }>
            <img
              src={ s.image || imageFallback(s) }
              alt={ s.title }
              onError={ (event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = imageFallback(s);
              } }
              style={ { width: "100%", height: "100%", objectFit: "cover" } }
            />
          </div>

          <div
            style={ {
              padding: "18px 20px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              flexGrow: 1,
            } }
          >
            <span
              style={ {
                fontFamily: "'Inter', sans-serif",
                fontSize: 11.5,
                fontWeight: 600,
                color: PALETTE.berry,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              } }
            >
              { s.category }
            </span>

            <h3
              style={ {
                fontFamily: "'Fraunces', serif",
                fontSize: 19,
                fontWeight: 600,
                color: PALETTE.ink,
                margin: 0,
                lineHeight: 1.3,
              } }
            >
              { s.title }
            </h3>

            <p
              style={ {
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                lineHeight: 1.55,
                color: PALETTE.inkSoft,
                margin: 0,
                flexGrow: 1,
              } }
            >
              { s.excerpt }
            </p>

            { s.author && (
              <span
                style={ {
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: PALETTE.inkSoft,
                } }
              >
                By { s.author }
              </span>
            ) }

            <span
              style={ {
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: PALETTE.inkSoft,
                borderTop: `1px solid ${PALETTE.line}`,
                paddingTop: 10,
                marginTop: 4,
              } }
            >
              { s.minutes } min read
            </span>

            <span
              style={ {
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: PALETTE.indigo,
                marginTop: 5,
              } }
            >
              Read story →
            </span>
          </div>
        </article>
      )) }
    </div>
  );
}

function StoryDetail({ story, stories, onBack, onStoryClick }) {
  if (!story) {
    return (
      <main style={ { maxWidth: 820, margin: "0 auto", padding: "60px 24px" } }>
        <h1 style={ { fontFamily: "'Fraunces', serif", color: PALETTE.ink } }>
          Story not found
        </h1>

        <div style={ { marginTop: 20 } }>
          <BackButton onClick={ onBack } label="Back to stories" />
        </div>
      </main>
    );
  }

  return (
    <main
      className="story-detail"
      style={ {
        maxWidth: 820,
        margin: "0 auto",
        padding: "50px 24px 100px",
      } }
    >
      <div style={ { marginBottom: 30 } }>
        <BackButton onClick={ onBack } label="Back to stories" />
      </div>

      <div
        style={ {
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          color: PALETTE.berry,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 12,
        } }
      >
        { story.category }
      </div>

      <h1
        style={ {
          fontFamily: "'Fraunces', serif",
          fontSize: 46,
          lineHeight: 1.12,
          fontWeight: 600,
          color: PALETTE.ink,
          margin: "0 0 18px",
        } }
      >
        { story.title }
      </h1>

      <div
        style={ {
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: PALETTE.inkSoft,
          marginBottom: 30,
        } }
      >
        { story.author ? `By ${story.author} · ` : "" }
        { story.minutes } min read
      </div>

      <img
        className="story-detail-image"
        src={ story.image || imageFallback(story) }
        alt={ story.title }
        onError={ (event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = imageFallback(story);
        } }
        style={ {
          width: "100%",
          height: 430,
          objectFit: "cover",
          borderRadius: 16,
          display: "block",
          marginBottom: 36,
        } }
      />

      <p
        style={ {
          fontFamily: "'Fraunces', serif",
          fontSize: 21,
          lineHeight: 1.6,
          fontStyle: "italic",
          color: PALETTE.inkSoft,
          borderLeft: `3px solid ${PALETTE.gold}`,
          paddingLeft: 20,
          marginBottom: 36,
        } }
      >
        { story.excerpt }
      </p>

      <div
        style={ {
          fontFamily: "'Inter', sans-serif",
          fontSize: 16,
          lineHeight: 1.9,
          color: PALETTE.ink,
          whiteSpace: "pre-line",
        } }
      >
        { story.content }
      </div>

      { stories.filter(
        (relatedStory) =>
          relatedStory.id !== story.id &&
          relatedStory.category === story.category
      ).length > 0 && (
          <section
            style={ {
              marginTop: 60,
              paddingTop: 28,
              borderTop: `1px solid ${PALETTE.line}`,
            } }
          >
            <p
              style={ {
                margin: "0 0 8px",
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: PALETTE.berry,
              } }
            >
              Continue reading
            </p>
            <h2
              style={ {
                margin: "0 0 22px",
                fontFamily: "'Fraunces', serif",
                fontSize: 28,
                color: PALETTE.ink,
              } }
            >
              More from { story.category }
            </h2>
            <StoryGrid
              stories={ stories
                .filter(
                  (relatedStory) =>
                    relatedStory.id !== story.id &&
                    relatedStory.category === story.category
                )
                .slice(0, 3) }
              onStoryClick={ onStoryClick }
            />
          </section>
        ) }

      <div
        style={ {
          marginTop: 50,
          paddingTop: 20,
          borderTop: `1px solid ${PALETTE.line}`,
        } }
      >
        <button
          onClick={ onBack }
          style={ {
            background: PALETTE.indigo,
            color: PALETTE.paper,
            border: "none",
            borderRadius: 999,
            padding: "10px 18px",
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            cursor: "pointer",
          } }
        >
          More stories
        </button>
      </div>
    </main>
  );
}

function HomePage({ stories, onStoryClick }) {
  const [active, setActive] = useState("All");

  const featured = stories.find((s) => s.featured) || stories[0];

  const rest = stories
    .filter((s) => s.id !== featured?.id)
    .filter((s) => active === "All" || s.category === active);

  return (
    <main
      className="home-page"
      style={ {
        maxWidth: 960,
        margin: "0 auto",
        padding: "0 24px 80px",
      } }
    >
      <Hero />

      <CategoryShelf active={ active } onSelect={ setActive } />

      { active === "All" && featured && (
        <div style={ { marginBottom: 44 } }>
          <FeaturedCard story={ featured } onClick={ () => onStoryClick(featured) } />
        </div>
      ) }

      <StoryGrid stories={ rest } onStoryClick={ onStoryClick } />
    </main>
  );
}

function CategoriesPage({ stories, onStoryClick, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categoryStories = selectedCategory
    ? stories.filter((story) => story.category === selectedCategory)
    : [];

  return (
    <main
      className="categories-page"
      style={ {
        maxWidth: 960,
        margin: "0 auto",
        padding: "56px 24px 80px",
      } }
    >
      <BackButton onClick={ onBack } />

      <h1
        style={ {
          fontFamily: "'Fraunces', serif",
          fontSize: 30,
          margin: "28px 0 24px",
          color: PALETTE.ink,
        } }
      >
        Categories
      </h1>

      <p
        style={ {
          maxWidth: 560,
          margin: "0 0 34px",
          fontFamily: "'Fraunces', serif",
          fontStyle: "italic",
          fontSize: 18,
          lineHeight: 1.55,
          color: PALETTE.inkSoft,
        } }
      >
        Browse a small collection of fiction, poetry and thoughtful essays.
      </p>

      <div
        className="category-grid"
        style={ {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        } }
      >
        { CATEGORIES.map((c) => (
          <button
            key={ c }
            onClick={ () => setSelectedCategory(c) }
            style={ {
              border: `1px solid ${selectedCategory === c ? CATEGORY_ACCENTS[c] : PALETTE.line}`,
              borderTop: `5px solid ${CATEGORY_ACCENTS[c]}`,
              borderRadius: 4,
              minHeight: 154,
              padding: "20px 22px 18px",
              fontFamily: "'Fraunces', serif",
              fontSize: 22,
              color: PALETTE.ink,
              background:
                selectedCategory === c
                  ? "#F3E9D6"
                  : "linear-gradient(145deg, #FFFFFF 0%, #FBF5EA 100%)",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow:
                selectedCategory === c
                  ? `0 10px 22px ${CATEGORY_ACCENTS[c]}30`
                  : "0 6px 16px rgba(36, 31, 28, 0.06)",
            } }
          >
            <span
              style={ {
                color: CATEGORY_ACCENTS[c],
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              } }
            >
              Collection
            </span>
            <span
              style={ {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              } }
            >
              <span>{ c }</span>
              <span
                style={ {
                  color: CATEGORY_ACCENTS[c],
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                } }
              >
                0{ CATEGORIES.indexOf(c) + 1 }
              </span>
            </span>
            <span
              style={ {
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: PALETTE.inkSoft,
              } }
            >
              <span>{ stories.filter((story) => story.category === c).length } stories</span>
              <span style={ { color: CATEGORY_ACCENTS[c], fontSize: 18 } }>→</span>
            </span>
          </button>
        )) }
      </div>

      { selectedCategory && (
        <section
          style={ {
            marginTop: 52,
            paddingTop: 28,
            borderTop: `1px solid ${PALETTE.line}`,
          } }
        >
          <h2
            style={ {
              fontFamily: "'Fraunces', serif",
              fontSize: 26,
              color: PALETTE.ink,
              margin: "0 0 20px",
            } }
          >
            { selectedCategory } stories
          </h2>
          <StoryGrid stories={ categoryStories } onStoryClick={ onStoryClick } />
        </section>
      ) }
    </main>
  );
}

function AboutPage({ onBack }) {
  return (
    <main
      className="about-page"
      style={ {
        maxWidth: 640,
        margin: "0 auto",
        padding: "56px 24px 80px",
      } }
    >
      <BackButton onClick={ onBack } />

      <h1
        style={ {
          fontFamily: "'Fraunces', serif",
          fontSize: 30,
          margin: "28px 0 16px",
          color: PALETTE.ink,
        } }
      >
        About Little Stories
      </h1>

      <p
        style={ {
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          lineHeight: 1.7,
          color: PALETTE.inkSoft,
        } }
      >
        Some stories don't need three hundred pages. They need one good paragraph, said honestly.

        Little Stories started as a place to keep the small things — the poems that arrive in five minutes, the essays that only take one sitting, the fiction that fits in the time it takes your coffee to cool. Fiction, poetry, essays, and flash fiction, all written to be read in one breath and thought about for much longer.

        There's no scrolling fatigue here. No chapters to keep track of. Just short, complete things, written the way a good conversation ends — right when it should.
      </p>
    </main>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={ {
        borderTop: `1px solid ${PALETTE.line}`,
        background: PALETTE.paper,
        padding: "40px 24px 30px",
      } }
    >
      <div
        style={ {
          maxWidth: 960,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        } }
      >
        <div style={ { display: "flex", alignItems: "baseline", gap: 10 } }>
          <span
            style={ {
              fontFamily: "'Fraunces', serif",
              fontSize: 20,
              fontWeight: 600,
              color: PALETTE.ink,
              letterSpacing: "-0.01em",
            } }
          >
            Little Stories
          </span>
          <span
            style={ {
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: PALETTE.berry,
              display: "inline-block",
            } }
          />
        </div>

        <p
          style={ {
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: PALETTE.inkSoft,
            margin: 0,
            textAlign: "center",
          } }
        >
          A small home for short things — fiction, poetry, essays and flash fiction.
        </p>

        <div style={ { display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center", marginTop: 4 } }>
          <a
            href="#"
            style={ {
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: PALETTE.inkSoft,
              textDecoration: "none",
              transition: "color 0.2s",
            } }
            onMouseEnter={ (e) => { e.target.style.color = PALETTE.berry; } }
            onMouseLeave={ (e) => { e.target.style.color = PALETTE.inkSoft; } }
          >
            Home
          </a>
          <a
            href="#"
            style={ {
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: PALETTE.inkSoft,
              textDecoration: "none",
              transition: "color 0.2s",
            } }
            onMouseEnter={ (e) => { e.target.style.color = PALETTE.berry; } }
            onMouseLeave={ (e) => { e.target.style.color = PALETTE.inkSoft; } }
          >
            Categories
          </a>
          <a
            href="#"
            style={ {
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: PALETTE.inkSoft,
              textDecoration: "none",
              transition: "color 0.2s",
            } }
            onMouseEnter={ (e) => { e.target.style.color = PALETTE.berry; } }
            onMouseLeave={ (e) => { e.target.style.color = PALETTE.inkSoft; } }
          >
            About
          </a>
        </div>

        <div
          style={ {
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: PALETTE.inkSoft,
            marginTop: 8,
            opacity: 0.7,
          } }
        >
          © { currentYear } Little Stories. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [stories, setStories] = useState(STORIES);
  // "loading" while the Contentful request is in flight, "error" if it
  // failed (we keep showing the built-in stories either way), "idle"
  // once a successful fetch has replaced them.
  const [status, setStatus] = useState("loading");

  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    getStories()
      .then((contentfulStories) => {
        if (contentfulStories.length > 0) {
          setStories(contentfulStories);
        }
        setStatus("idle");
      })
      .catch((error) => {
        console.error("Unable to load Contentful stories:", error);
        setStatus("error");
      });
  }, []);

  const openStory = (story) => {
    setSelectedStory(story);
    setPage("story");
  };

  const closeStory = () => {
    setSelectedStory(null);
    setPage("home");
  };

  const handlePageChange = (newPage) => {
    setSelectedStory(null);
    setPage(newPage);
  };

  return (
    <div
      style={ {
        background: PALETTE.paper,
        minHeight: "100vh",
        color: PALETTE.ink,
        display: "flex",
        flexDirection: "column",
      } }
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap"
      />

      <Navbar page={ page } setPage={ handlePageChange } />

      <StatusBanner status={ status } />

      <div style={ { flex: 1 } }>
        { page === "home" && <HomePage stories={ stories } onStoryClick={ openStory } /> }

        { page === "categories" && (
          <CategoriesPage stories={ stories } onStoryClick={ openStory } onBack={ () => handlePageChange("home") } />
        ) }

        { page === "about" && <AboutPage onBack={ () => handlePageChange("home") } /> }

        { page === "story" && (
          <StoryDetail
            story={ selectedStory }
            stories={ stories }
            onBack={ closeStory }
            onStoryClick={ openStory }
          />
        ) }
      </div>

      <Footer />
    </div>
  );
}