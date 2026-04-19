import React from "react";
import { useNavigate } from "react-router-dom";

const HOME2_CARDS = [
  {
    title: "Set Your Goal",
    desc: "Define what you want to achieve, stay focused, and keep your study plan aligned with your academic targets.",
    accent: "#2563eb",
    bg: "#dbeafe",
    icon: "01",
  },
  {
    title: "Smart Learning AI",
    desc: "Upload lecture files and turn them into summaries, revision notes, and questions with the AI study flow.",
    accent: "#0ea5e9",
    bg: "#e0f2fe",
    icon: "AI",
  },
  {
    title: "Group Collaboration",
    desc: "Work with classmates in shared spaces where discussions, teamwork, and study coordination stay organized.",
    accent: "#16a34a",
    bg: "#dcfce7",
    icon: "03",
    link: "/groups",
  },
  {
    title: "Resource Sharing Platform",
    desc: "Share lecture material, notes, and study resources in one place so your group can learn faster together.",
    accent: "#be185d",
    bg: "#fce7f3",
    icon: "04",
  },
];

const STYLES = `
  .home2-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .home2-card {
    height: 100%;
  }

  .home2-card p {
    min-height: 96px;
  }

  .home2-card.clickable {
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .home2-card.clickable:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 1024px) {
    .home2-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .home2-grid {
      grid-template-columns: 1fr;
    }
  }
`;

function Home2() {
  const navigate = useNavigate();

  const handleCardClick = (link) => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <main className="home2-page">
      <style>{STYLES}</style>

      <section className="hero" style={{ minHeight: "78vh" }}>
        <div className="hero-bg-dots" />
        <div className="hero-glow" />
        <div className="hero-glow2" />

        <div className="hero-inner" style={{ alignItems: "center" }}>
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Welcome back, learner
            </div>
            <h1 className="hero-title">
              Your study space.
              <br />
              <span className="gradient-text">One clean dashboard.</span>
            </h1>
            <p className="hero-sub">
              Start with your goal, then use the AI study tools, collaborate with your group, and keep all your
              resources in one place.
            </p>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">
                <div className="dot dot-r" />
                <div className="dot dot-y" />
                <div className="dot dot-g" />
                <div className="card-url">study.nexus/home2</div>
              </div>
              <div className="card-metrics">
                <div className="metric-box">
                  <div className="metric-num">4</div>
                  <div className="metric-lbl">Core Paths</div>
                  <div className="metric-bar bar-blue" style={{ width: "85%" }} />
                </div>
                <div className="metric-box">
                  <div className="metric-num">AI</div>
                  <div className="metric-lbl">Smart Learning</div>
                  <div className="metric-bar bar-green" style={{ width: "90%" }} />
                </div>
                <div className="metric-box">
                  <div className="metric-num">24/7</div>
                  <div className="metric-lbl">Access</div>
                  <div className="metric-bar bar-amber" style={{ width: "100%" }} />
                </div>
              </div>
              <div className="ai-pill">
                <div className="ai-pill-icon">?</div>
                <div className="ai-pill-text">
                  <strong>Ready to continue</strong>
                  Choose the path that fits your study flow best.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hp-section features-section">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="section-head center">
            <div className="section-label">Quick Navigation</div>
            <h2 className="section-title">Everything you need, grouped into clear paths</h2>
            <p className="section-sub">
              Pick the area you want to open next. The layout stays clean on desktop and mobile.
            </p>
          </div>

          <div className="home2-grid">
            {HOME2_CARDS.map((card) => (
              <article 
                className={`feature-card home2-card ${card.link ? 'clickable' : ''}`} 
                key={card.title}
                onClick={() => handleCardClick(card.link)}
              >
                <div className="feature-icon-wrap" style={{ background: card.bg }}>
                  <span style={{ color: card.accent, fontWeight: 700 }}>{card.icon}</span>
                </div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home2;