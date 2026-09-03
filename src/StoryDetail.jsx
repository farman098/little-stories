import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import client from "./contentfulClient";

const PALETTE = {
  paper: "#FAF3E7",
  ink: "#241F1C",
  inkSoft: "#5B5148",
  berry: "#8B3A42",
  gold: "#B9925A",
  line: "#E3D8BE",
};

export default function StoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStory() {
      try {
        setLoading(true);

        const response = await client.getEntry(id);

        const fields = response.fields;

        setStory({
          id: response.sys.id,
          title: fields.title || "",
          category: fields.category || "",
          excerpt: fields.excerpt || "",
          minutes: fields.minutes || 0,
          image: fields.image || null,
          content: fields.content || null,
        });
      } catch (err) {
        console.error(err);
        setError("Story nahi mili.");
      } finally {
        setLoading(false);
      }
    }

    fetchStory();
  }, [id]);

  if (loading) {
    return (
      <main
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "80px 24px",
          fontFamily: "'Inter', sans-serif",
          color: PALETTE.inkSoft,
        }}
      >
        Loading story...
      </main>
    );
  }

  if (error || !story) {
    return (
      <main
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            color: PALETTE.ink,
          }}
        >
          Story not found
        </h1>

        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: 20,
            background: PALETTE.berry,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          Back to Home
        </button>
      </main>
    );
  }

  const imageUrl = story.image?.fields?.file?.url
    ? `https:${story.image.fields.file.url}`
    : "";

  return (
    <main
      style={{
        background: PALETTE.paper,
        minHeight: "100vh",
        paddingBottom: 80,
      }}
    >
      <article
        style={{
          maxWidth: 820,
          margin: "0 auto",
          padding: "50px 24px",
        }}
      >
        {/* BACK BUTTON */}

        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            color: PALETTE.berry,
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            cursor: "pointer",
            padding: 0,
            marginBottom: 40,
          }}
        >
          ← Back
        </button>

        {/* CATEGORY */}

        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: PALETTE.berry,
            marginBottom: 14,
          }}
        >
          {story.category}
        </div>

        {/* TITLE */}

        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 48,
            lineHeight: 1.1,
            fontWeight: 600,
            color: PALETTE.ink,
            margin: "0 0 20px",
          }}
        >
          {story.title}
        </h1>

        {/* EXCERPT */}

        <p
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: "italic",
            fontSize: 20,
            lineHeight: 1.6,
            color: PALETTE.inkSoft,
            marginBottom: 18,
          }}
        >
          {story.excerpt}
        </p>

        {/* READ TIME */}

        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: PALETTE.inkSoft,
            marginBottom: 35,
          }}
        >
          {story.minutes} min read
        </div>

        {/* IMAGE */}

        {imageUrl && (
          <img
            src={imageUrl}
            alt={story.title}
            style={{
              width: "100%",
              maxHeight: 500,
              objectFit: "cover",
              borderRadius: 14,
              display: "block",
              marginBottom: 45,
            }}
          />
        )}

        {/* STORY CONTENT */}

        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 17,
            lineHeight: 1.8,
            color: PALETTE.inkSoft,
          }}
        >
          {story.content ? (
            documentToReactComponents(story.content)
          ) : (
            <p>
              This story does not have any content yet.
            </p>
          )}
        </div>

        {/* BOTTOM */}

        <div
          style={{
            borderTop: `1px solid ${PALETTE.line}`,
            marginTop: 50,
            paddingTop: 25,
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              background: PALETTE.berry,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "11px 20px",
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
            }}
          >
            ← More Stories
          </button>
        </div>
      </article>
    </main>
  );
}