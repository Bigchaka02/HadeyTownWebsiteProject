// Everything written on the site lives here. Edit freely — the map and the
// character don't care what the pages say.
import type { ReactNode } from "react";
import Tags from "./components/Tags";
import type { PageId } from "./town";

export const SITE = {
  name: "Hadey Chaker",
  tagline: "Software Engineer & Full-Stack Developer",
  email: "hadey.chaker@gmail.com",
  github: "https://github.com/Bigchaka02",
};

type Project = {
  title: string;
  blurb: string;
  tags: string[];
  when?: string;
  link?: string;
};

const projects: Project[] = [
  {
    title: "LED Ping-Pong Wall",
    blurb:
      "23×23 LED matrix controlled by a Wii Nunchuck. Includes mini-games: Snake, Flappy Bird, Tetris and Space Invaders.",
    tags: ["C++", "Arduino"],
    link: "https://github.com/Bigchaka02/PingPong-LED-Wall",
  },
  {
    title: "Water-Flow Meter (Capstone)",
    blurb:
      "Arduino Uno + YF-S201 sensor with an LCD readout, ±3% accuracy after calibration. Python/Tkinter live UI with ThingSpeak cloud logging.",
    tags: ["Arduino", "Python", "ThingSpeak"],
    when: "Jan 2025 – May 2025",
  },
  {
    title: "Campus Navigation Web App",
    blurb:
      "Python app on the Google Maps API with custom routing via Dijkstra's algorithm and ADA-aware paths.",
    tags: ["Python", "Google Maps API"],
  },
  {
    title: "Secure Lock Box",
    blurb:
      "ATmega328P microcontroller driving a keypad, LEDs, relay and buzzer. C + assembly with state management and breach detection.",
    tags: ["C", "Assembly", "Embedded"],
  },
  {
    title: "Hadey Town (this site)",
    blurb:
      "An interactive pixel-art portfolio. Click a building and the character walks over and opens it.",
    tags: ["React", "TypeScript", "Vite"],
    link: "https://github.com/Bigchaka02/HadeyTownWebsiteProject",
  },
  {
    title: "Reverse Checkers",
    blurb: "Checkers in C where the last one standing loses.",
    tags: ["C"],
    link: "https://github.com/Bigchaka02/reverseCheckers",
  },
  {
    title: "VideoImageFun",
    blurb: "Messing around with image and video filters, plus a bit of facial recognition.",
    tags: ["Python", "OpenCV"],
    link: "https://github.com/Bigchaka02/VideoImageFun",
  },
  {
    title: "miniGameLED",
    blurb: "A mini-game built on an LED strip and a micro:bit.",
    tags: ["micro:bit"],
    link: "https://github.com/Bigchaka02/miniGameLED",
  },
];

type Job = { role: string; org: string; when: string; bullets: string[] };

const experience: Job[] = [
  {
    role: "Software Developer Intern",
    org: "Humana",
    when: "Feb 2023 – May 2023",
    bullets: [
      "Built front-end and back-end features for internal and client-facing apps using Vue.js, HTML, CSS and JavaScript.",
      "Created a corporate “tech radar” website for engineering leadership to track adoption and priorities.",
      "Developed a secure prescription-ordering site for a local pharmacy.",
    ],
  },
  {
    role: "Head of Communications & Developer",
    org: "ViralLEDs (startup)",
    when: "Sep 2020 – Apr 2021",
    bullets: [
      "Implemented customer communication systems and supervised a small team.",
      "Edited code for new products and improved a remote LED controller UI.",
    ],
  },
];

const skills: Record<string, string[]> = {
  Frontend: ["React", "Next.js", "TypeScript", "Tailwind", "Vue.js"],
  Backend: ["Node.js", "Express", "Fastify", "Prisma", "GraphQL"],
  Databases: ["PostgreSQL", "MongoDB", "Redis"],
  DevOps: ["Docker", "GitHub Actions", "Vercel", "AWS"],
  Other: ["Python", "C/C++", "Linux", "Git"],
};

export const PAGES: Record<PageId, { title: string; body: ReactNode }> = {
  about: {
    title: "About Me",
    body: (
      <>
        <p className="lead">Hello! I’m Hadey 👋</p>
        <p>
          I’m a software engineer and full-stack developer studying Computer Science &amp; Engineering at
          the University of Louisville (expected graduation December 2026). I build clean, performant
          web apps and backend services — and the occasional wall of LEDs.
        </p>

        <h3>Character sheet</h3>
        <dl className="stats">
          <dt>Class</dt>
          <dd>Full-Stack Developer</dd>
          <dt>Guild</dt>
          <dd>University of Louisville · B.S. Computer Science &amp; Engineering</dd>
          <dt>Home base</dt>
          <dd>Louisville, KY</dd>
          <dt>Current quest</dt>
          <dd>Finishing my degree and looking for software engineering roles</dd>
          <dt>Favourite loot</dt>
          <dd>Embedded gadgets, web apps, anything with blinking lights</dd>
        </dl>

        <h3>Contact</h3>
        <ul>
          <li>
            Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </li>
          <li>
            GitHub:{" "}
            <a href={SITE.github} target="_blank" rel="noopener noreferrer">
              github.com/Bigchaka02
            </a>
          </li>
        </ul>

        <p className="hint">
          Visit the clock tower for my resume, or the little house down the road for projects.
        </p>
      </>
    ),
  },

  projects: {
    title: "Projects",
    body: (
      <>
        <p className="lead">Things I’ve built.</p>
        <div className="cards">
          {projects.map((p) => (
            <article key={p.title} className="card">
              <h3>
                {p.link ? (
                  <a href={p.link} target="_blank" rel="noopener noreferrer">
                    {p.title} ↗
                  </a>
                ) : (
                  p.title
                )}
              </h3>
              {p.when && <p className="when">{p.when}</p>}
              <p>{p.blurb}</p>
              <Tags tags={p.tags} />
            </article>
          ))}
        </div>
        <p className="hint">
          More on{" "}
          <a href={SITE.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      </>
    ),
  },

  resume: {
    title: "Resume",
    body: (
      <>
        <h3>Experience</h3>
        <ol className="timeline">
          {experience.map((j) => (
            <li key={j.role + j.org}>
              <h4>
                {j.role} — {j.org}
              </h4>
              <p className="when">{j.when}</p>
              <ul>
                {j.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <h3>Education</h3>
        <ol className="timeline">
          <li>
            <h4>University of Louisville</h4>
            <p className="when">B.S. Computer Science &amp; Engineering · expected December 2026</p>
          </li>
        </ol>

        <h3>Skills</h3>
        <dl className="stats">
          {Object.entries(skills).map(([group, list]) => (
            <div key={group}>
              <dt>{group}</dt>
              <dd>
                <Tags tags={list} />
              </dd>
            </div>
          ))}
        </dl>

        <p className="hint">
          Want a copy? Email me at <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </>
    ),
  },
};
