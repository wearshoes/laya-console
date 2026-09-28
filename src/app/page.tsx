"use client";

import { useEffect, useState } from "react";
import styles from "./site.module.css";

const faqs = [
  ["What are System One Models? What is Laya?", "System One Models are intelligence primitives designed to make decisions inside software. Laya is our first model, available in early access."],
  ["Is Laya just a smaller LLM?", "No. Laya is built for machine-native workflows, with a model and training loop optimized for calibrated decisions rather than conversation."],
  ["How is this different from JSON mode or structured outputs?", "Structured outputs shape a response. Laya reasons toward a typed decision and includes a confidence estimate that an application can use."],
  ["How can Laya be so fast and inexpensive?", "A purpose-built architecture removes the extra work that general chat models perform, so each decision takes less compute."],
  ["Can you make Laya even faster?", "Yes. We are still improving the model, the sampler, and the serving stack."],
  ["Are these prices temporary or subsidized?", "Our early access pricing reflects the economics of the current System One stack."],
  ["What is Laya good at? Where does it struggle?", "Laya is strongest at repeatable workflows with clear choices. Open-ended creative writing and broad world knowledge are outside its design center."],
  ["Can Laya still get things wrong?", "Yes. Confidence is a useful signal, not a promise. Good systems still define fallbacks and escalation paths."],
  ["Is Laya deterministic?", "The same input and configuration can produce the same decision, while controlled sampling remains available where it is useful."],
  ["How do I get started or ask a question?", "Read the docs or send a note to hello@wearglass.work and we will help you find the right starting point."],
] as const;

function LayaMark({ light = false }: { light?: boolean }) {
  return (
    <svg className={styles.mark} viewBox="0 0 72 84" aria-hidden="true">
      <g fill="none" stroke={light ? "#fefefe" : "#1e1e1e"} strokeWidth="4" strokeLinejoin="round">
        <path d="M36 3 59 17v27L36 58 13 44V17Z" />
        <path d="M36 30 59 17v27L36 58" />
        <path d="M36 30 13 17" />
        <path d="M36 30v27" />
        <path d="M36 58 59 44v27L36 84 13 71V44" />
        <path d="M36 58 13 44" />
        <path d="M36 84V58" />
      </g>
    </svg>
  );
}

function LayaLogo({ light = false }: { light?: boolean }) {
  return <span className={styles.logo}><LayaMark light={light} /><span>Laya</span></span>;
}

function Window({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return <div className={`${styles.window} ${className}`}><div className={styles.windowTitle}>{title}</div><div className={styles.windowBody}>{children}</div></div>;
}

function HeroLoader() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const start = window.setTimeout(() => setProgress(77), 450);
    const finish = window.setTimeout(() => setProgress(100), 2500);
    return () => { window.clearTimeout(start); window.clearTimeout(finish); };
  }, []);
  return <Window title="Laya 1.1" className={styles.loader}><p>Loading ...</p><p>Image Assets, Copy</p><div className={styles.progressTrack}><span style={{ width: `${progress}%` }} /><b>{progress}%</b></div></Window>;
}

function NewsCard({ date, title, action, href = "#" }: { date: string; title: string; action: string; href?: string }) {
  return <article className={styles.heroNewsCard}><div className={styles.heroNewsTitle}>{date}</div><div className={styles.heroNewsBody}><p>{title}</p><a href={href}>{action}</a></div></article>;
}

function HeroIntro() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);
  return <section className={styles.hero} id="top">
    <div className={styles.heroInner}>
      <div className={styles.heroNews}><NewsCard date="Sept 27, 2026 • Laya News" title="NO MORE WAITLIST\nLaya is now open to everyone" action="Create your account" href="/register" /><NewsCard date="Sept 15, 2026 • Laya News" title="🎉 Laya announces System One models and Laya" action="Read more" href="#docs" /></div>
      <p className={styles.heroTag}>Introducing Laya .................. Intelligence beyond chat</p>
      <div className={styles.heroHeadlineWrap}><span className={styles.heroBinary}>VHlwZVNhZmUgQUkgSW50ZWxsaWdlbmNlIE5vdw==</span><h1>The First<br />(Public) System<br />One Model: Laya<br />Gives AI The<br />Properties Of<br />Code</h1><div className={styles.heroCtas}><a href="https://laya.wearglass.work" target="_blank" rel="noreferrer">Join Discord</a><a href="#speed-compare">Watch Launch Video ▶︎</a></div></div>
    </div>
    {loading && <div className={styles.loaderOverlay}><HeroLoader /></div>}
  </section>;
}

function LabBoard() {
  const rows = [["Laya", "193.6x", "$0.39"], ["Claude Haiku 4.5", "6.2x", "$19.49"], ["Claude Opus 5", "2.1x", "$176.05"], ["Claude Sonnet 5", "1.0x", "$117.38"], ["Gpt-5.6-Luna", "6.0x", "$3.31"]];
  return <div className={styles.labBoard} aria-label="Laya research interface preview">
    <div className={styles.labToolbar}>Laya 1.1 <span>∵ ⩆</span></div>
    <Window title="Laya" className={styles.layaWindow}><div className={styles.miniRows}>{rows.map(([name, speed, cost]) => <div className={styles.miniRow} key={name}><strong>{name}</strong><span>{speed}</span><span>{cost}</span></div>)}</div></Window>
    <Window title="Laya" className={styles.aboutWindow}><p>Version 0.01</p><p>©2026. All rights reserved.</p><p>Made in SF. With Love.</p></Window>
    <Window title="Glider 1.1" className={styles.gliderWindow}><div className={styles.lifeGrid}>{Array.from({ length: 16 }, (_, i) => <i key={i} className={i % 4 === 0 || i % 7 === 0 ? styles.lifeOn : ""} />)}</div><p>Game of Life</p></Window>
    <div className={styles.boardNoise} />
  </div>;
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return <main className={styles.site}>
    <header className={styles.nav}>
      <a className={styles.navBrand} href="#top"><span className={styles.desktopBrand}>Laya</span><span className={styles.mobileBrand}><LayaMark light /></span></a>
      <nav className={styles.navLinks} aria-label="Main navigation"><a href="#manifesto">Manifesto</a><a href="#team"><span className={styles.desktopOnly}>Our </span>Team</a><a className={styles.docsLink} href="/docs">Docs</a><a className={styles.mobileContact} href="mailto:hello@wearglass.work">Contact</a></nav>
      <div className={styles.navActions}><a className={styles.signIn} href="/login">Sign in</a><a className={styles.contactLink} href="mailto:hello@wearglass.work">Contact Sales</a><a className={styles.mobileBook} href="/docs" aria-label="Docs">□</a><a className={styles.mobileLogin} href="/login" aria-label="Sign in">↪</a></div>
    </header>

    <HeroIntro />

    <section className={`${styles.pinkSection} ${styles.manifesto}`} id="manifesto">
      <LabBoard />
      <div className={styles.cornerFrame}><h1>We Took The<br />Opposite Research<br />Direction</h1></div>
      <div className={styles.manifestoGrid}>
        <article><p className={styles.kicker}>Not Chat</p><p>Reinforcement Learning from Human Feedback (RLHF) has led to LLMs that are optimized for human preferences. This has led to models that are superhuman at instruction following, and are what we now call “chat.” Yet RLHF creates inherent issues such as mode dropping, overconfidence, and lack of reliability. These flaws mean that LLMs require humans-in-the-loop.</p></article>
        <article><p className={styles.kicker}>A New Model</p><p>We built a new class of models, System One Models, to be natively used by machines. We’re building with a new architecture, a new sampler, and a new training algorithm: Reinforcement Learning for Calibrated Decisions (RLCD).</p></article>
        <article className={styles.binaryBlock}><p className={styles.kicker}>[b.64]</p><p>01011001 01101111 01110101 01110010 00100000 01110011 01101111 01100110 01110100 01110111 01100001 01110010 01100101 00100000 01110011 01101000 01101111 01110101 01101100 01100100 00100000 01101101 01100001 01101011 01100101 00100000 01100100 01100101 01100011 01101001 01110011 01101001 01101111 01101110 01110011 00101110</p></article>
      </div>
      <div className={styles.featureGrid}>
        <div className={styles.feature}><span>not chat</span><h2>Decisions,<br />not strings</h2><p>Typed outputs that software can act on.</p></div>
        <div className={styles.feature}><span>calibrated confidence</span><h2>Know when<br />to trust it</h2><p>Every decision includes an estimate of how confident the model is.</p></div>
        <div className={styles.feature}><span>more like code</span><h2>Reliable,<br />fast, type-safe.</h2><p>Machine-native intelligence for real workflows.</p></div>
      </div>
      <section className={styles.performance} id="speed-compare">
        <div className={styles.performanceHeadline}><p>Built for automation</p><h2>193.6x Faster,<br />444.6x Cheaper.</h2><small>*based on workflows for System One tasks</small></div>
        <div className={styles.proofTable}><div className={styles.proofHeader}><span>proof</span><span>Cost</span><span>Completed in</span></div><div className={styles.proofRow}><b>Laya</b><span>$0.000081</span><span>0.114s</span></div><div className={styles.proofRow}><b>LLMs</b><span>$0.013880</span><span>8.566s</span></div><button className={styles.videoButton} type="button"><span className={styles.playIcon}>▶</span> Watch the real video</button></div>
      </section>
      <section className={styles.automation} id="automation">
        <div className={styles.automationIntro}><div><p className={styles.kicker}>Built for automation</p></div><p className={styles.automationNarrative}>Laya returns typed decisions with calibrated probabilities, so your software can account for uncertainty. Set the thresholds for when it acts autonomously and when it asks for review. Combine those decisions in code to build larger workflows, with control over how the intelligence is used.</p><h2>Laya’s intelligence per dollar is literally off the charts.</h2></div>
        <div className={styles.chart} id="cost"><div className={styles.chartHeader}><span>Workflow Intelligence vs. Cost</span><span>Workflow Intelligence vs. Cost</span></div><div className={styles.chartGrid}><span className={styles.chartLaya}>Laya</span><span className={styles.chartLlm}>LLMs</span></div></div>
        <div className={styles.callouts}><article><p className={styles.kicker}>Machine-Native Intelligence</p><p>LLMs produce words for people. Laya produces typed decisions and is more like code: reliable, fast, self-consistent, and type-safe.</p></article><article><p className={styles.kicker}>Zero Hallucinations</p><p>Every Laya decision comes with a confidence estimate, so your software can act when confidence is high and escalate when it is not.</p></article></div>
        <div className={styles.metrics}><div><strong>$42</strong><span>Per Billion input tokens.</span></div><div><strong>238x</strong><span>Lower input price than Claude Fable 5.1</span></div></div>
      </section>
      <section className={styles.teamCta} id="team"><LayaLogo /><div><h2>Come Build With Us</h2><a href="mailto:hello@wearglass.work?subject=Open%20roles">➤ &nbsp;Open Roles</a></div></section>
    </section>

    <section className={styles.newsSection} id="docs"><div className={styles.newsHead}><p>Laya Blog</p><p>Company News</p></div><div className={styles.newsFeature}><a className={styles.newsImage} href="/docs"><img src="/laya/pvRPymJ0yRv5SHXNA3yDzieCZJk.webp" alt="Abstract blueprint illustration" /></a><div className={styles.newsCopy}><p className={styles.kicker}>Company News</p><h2>Introducing System One Models &amp; Laya</h2><p>After two years in stealth, we’re excited to finally introduce a new intelligence primitive for software.</p><a href="/docs">Read More <span>→</span></a></div></div><div className={styles.newsList}><article><p className={styles.kicker}>Thoughts</p><h3>The Bitterest Lesson</h3><p>TL;DR: Compute drives progress in AI, but what good is progress if you are not doing the right task!</p><a href="/docs">Read More <span>→</span></a></article><article><p className={styles.kicker}>Thoughts</p><h3>AI: too good to be true, too bad to be useful</h3><p>RLHF-trained language models please humans and assist rather than make reliable autonomous decisions. What comes next?</p><a href="/docs">Read More <span>→</span></a></article></div></section>

    <section className={styles.faqSection} id="faq"><h2>We give a FAQ</h2><div className={styles.faqList}>{faqs.map(([question, answer], index) => <div className={`${styles.faqItem} ${openFaq === index ? styles.faqOpen : ""}`} key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span>{question}</span><span className={styles.faqIcon}>{openFaq === index ? "−" : "+"}</span></button><div className={styles.faqAnswer}><p>{answer}</p></div></div>)}</div><div className={styles.faqMark}><LayaMark light /></div></section>

    <footer className={styles.footer}><LayaLogo light /><div className={styles.footerMeta}><span>Laya © 2026</span><div><a href="/legal/terms">Terms of Use</a><a href="/legal/privacy">Privacy Policy</a><a href="/legal/trust">Acceptable Use Policy</a></div><div><a href="https://www.linkedin.com/company/wearglass/" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://x.com/laya" target="_blank" rel="noreferrer">X</a><a href="mailto:hello@wearglass.work">hello@wearglass.work</a></div></div><div className={styles.footerBottom}><span>Version 0.01</span><span>Made in SF. With Love.</span><span>∵ ⩆</span></div></footer>
  </main>;
}
