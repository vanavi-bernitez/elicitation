// Evaluation test script for music-profiler prompts
// Usage: node --env-file=.env test/eval.mjs

const API_KEY = process.env.VITE_ANTHROPIC_API_KEY;
const MODEL = process.env.VITE_CLAUDE_MODEL || "claude-sonnet-4-6";

if (!API_KEY) {
  console.error("Missing VITE_ANTHROPIC_API_KEY in .env");
  process.exit(1);
}

const QUESTIONS = [
  "Why do you think some people are so devoted to listening to albums front-to-back — not skipping a single track? What do you think they're getting out of it?",
  "We all have that one genre we'd never admit to liking — but there's always that one song that broke through anyway. What's yours, and what made it impossible to ignore?",
  "You're hosting a get-together, and everyone in the room has completely different taste. Walk me through how you'd handle the music — what's your move?",
  "If you had to describe your childhood purely through sound — what was playing in the background? What were the songs, artists, or sounds that just lived in your house?",
  "Is there a musician or artist whose taste you trust so completely that you'd follow any recommendation they made — no preview needed? What did they do to earn that?",
  "Is there a critically acclaimed album that everyone seems to love, and you've genuinely tried — but it just doesn't land for you? What do you think is missing?",
  "Think of a song that is completely inseparable from a specific moment or period of your life. Not necessarily your favorite — just one that belongs to a time. What's the song, and what does it take you back to?",
  "How does new music usually find you — do you go looking for it, or does it tend to arrive on its own? And when something new actually sticks, what usually made it happen?",
];

const PERSONAS = [
  {
    name: "Indie Folk Purist",
    answers: [
      "I think they're getting the full narrative arc — like reading a novel vs. reading random chapters. The artist placed those songs in that order for a reason, and skipping breaks the emotional logic. You lose the quiet moments that make the loud ones hit.",
      "Guilty pleasure: mainstream country. There's this one song, 'Before He Cheats' by Carrie Underwood, that I genuinely can't skip. It has this raw anger that bypasses all my pretensions — it's just emotionally honest in a way I can't deny.",
      "I'd put on something ambient and textured — probably Grouper or William Bassman — something that feels like a space rather than a playlist. I don't want to dominate the room, I want the music to be air.",
      "My parents played a lot of old folk records — Joan Baez, early Bob Dylan, some Joni Mitchell. The sound of vinyl crackling before a song started is basically a Pavlovian trigger for me now.",
      "Joni Mitchell completely. Her Hejira period especially. She hears music structurally and emotionally at the same time — if she recommends something I know it'll reward close listening.",
      "Kid A by Radiohead. I've tried many times. I can see intellectually why people love it but it feels cold and evasive to me — like it's deliberately withholding the emotional entry point I need.",
      "'Casimir Pulaski Day' by Sufjan Stevens — I first heard it during a really dark winter in my early 20s. It was playing late at night and I just sat with it for an hour. That song belongs to that grief.",
      "Music tends to find me through long reads — music journalism, essays. When something sticks it's usually because it has a quality I can't name at first, something I have to go back to figure out.",
    ],
    fits: ["Sufjan Stevens – Illinois", "Bon Iver – For Emma, Forever Ago"],
    misfits: ["Daft Punk – Random Access Memories", "Taylor Swift – 1989"],
  },
  {
    name: "Jazz-Head",
    answers: [
      "Albums are the only honest format for jazz. You can't pull one track from Kind of Blue and understand it — the conversation between musicians builds across the whole session. Front-to-back listening is just respecting what music actually is.",
      "Pop-punk, embarrassingly. A random Paramore song got into my head once and I couldn't shake it for weeks. What got me was the rhythmic tightness — it was almost like a tight jazz combo in terms of how locked in the rhythm section was.",
      "I'd play something nobody knows — early '60s Blue Note stuff, maybe Lee Morgan or Hank Mobley. I'm not trying to educate anyone, I just can't pretend to have different taste. If people get into it, great.",
      "My father played saxophone. The house always had live playing in it, never recorded music — so I grew up hearing music as a physical, imperfect, breathing thing. Recorded music felt slightly fake to me for years.",
      "I'd follow anything recommended by Wynton Marsalis, even when I disagree with his conservatism. His ears are impeccable. He hears what's structurally happening at every level.",
      "Sgt. Pepper's. I respect the ambition but the production is so of-its-time and the song forms are so basic underneath the arrangements. The Beatles were great songwriters trapped by their own myth.",
      "'So What' by Miles Davis. I was 14, heard it on the radio, didn't know what it was. It was the first time I understood music could be a question instead of an answer.",
      "I actively hunt. I spend time in record shops, read liner notes, follow musicians I love to see who they cite. When something sticks it's because it opens up a whole world I didn't know existed.",
    ],
    fits: ["Miles Davis – Kind of Blue", "John Coltrane – A Love Supreme"],
    misfits: ["Ed Sheeran – ÷", "Billie Eilish – HappierThanEver"],
  },
  {
    name: "Emotional Pop Listener",
    answers: [
      "Honestly I think it's more of a personality type than a music type — some people just need the complete experience. I respect it but I'm a song person. If a track doesn't grab me I move on. Life's short.",
      "Death metal. There's this one Opeth song I heard in college, 'Blackwater Park' — something about the dynamics got me, the way it went completely quiet and then erupted. I'd never admit that to anyone who knows my Spotify.",
      "I'd put on something crowd-pleasing — probably a feel-good indie pop playlist. I want everyone comfortable. I can do my own listening later, this is about the vibe of the room.",
      "My mom played a lot of Céline Dion and Mariah Carey. I know every word to every ballad from the '90s. That era of huge pop production is basically emotional shorthand for me.",
      "Taylor Swift. I know it's basic but her track record is undeniable. She understands what a song needs to make you feel something — and she never phones it in.",
      "Radiohead's OK Computer. I've put it on five times and I just can't connect. It feels like it's asking me to work for an emotional payoff that never fully arrives. I need to feel something sooner.",
      "'The Night Will Always Win' by Manchester Orchestra. I was going through a breakup and that song found me. The way the chorus opens up felt like breathing again.",
      "Music finds me through playlists and friends mostly. When something sticks it's usually because someone specific put it on and the context made it land — music is social for me.",
    ],
    fits: ["Lorde – Pure Heroine", "Phoebe Bridgers – Punisher"],
    misfits: ["Aphex Twin – Selected Ambient Works Vol. II", "Death Grips – The Money Store"],
  },
];

const PROFILE_SYSTEM_PROMPT = `You are a music psychologist, cultural anthropologist, and veteran music critic with 30 years of experience profiling listeners. You have deep knowledge across all genres — from hyper-specific microgenres to mainstream pop — and understand the psychological, sociological, and neurological dimensions of musical preference.

          Your task: analyze someone's answers to 8 carefully designed questions and construct a precise, layered music taste profile. These questions were engineered to bypass surface-level genre preference and reveal deeper truths about how someone RELATES to music.

          Each question targets a specific psychological dimension:
          - Q1 (album vs. tracks) → reveals relationship with context, patience, and artistic intentionality
          - Q2 (guilty pleasure) → reveals the gap between identity and instinct — what they suppress vs. what moves them
          - Q3 (social listening) → reveals dominance vs. adaptability, and how music functions socially for them
          - Q4 (childhood sounds) → reveals foundational sonic imprinting and emotional baseline
          - Q5 (trusted artist) → reveals what values they outsource — innovation, curation, authenticity, taste-signaling
          - Q6 (album they can't love) → reveals aesthetic dealbreakers, what actively repels them
          - Q7 (memory-linked song) → reveals the emotional function music plays in their life (escapism, anchoring, nostalgia)
          - Q8 (discovery behavior) → reveals openness, passivity vs. agency, and how they build their musical identity

          When writing the profile:
          1. IDENTIFY the 2-3 core underlying values (e.g., "emotional honesty over technical perfection", "music as social ritual", "sound as memory archive")
          2. DIAGNOSE their listener archetype (e.g., Devoted Contextualist, Instinct-Led Eclectic, Nostalgic Purist, Social Chameleon, Reluctant Explorer)
          3. SURFACE the tension or contradiction in their taste — the gap between who they think they are musically and what their answers actually reveal
          4. PREDICT what they likely love that they haven't mentioned, and what would immediately turn them off

          Output format — write in second person ("You are someone who..."), 4-5 sentences, no bullet points, no highlighted text ("**emotional texture rather than...**").
          Be precise, psychologically sharp.
          Sound like a brilliant friend who listened between the lines — not a Spotify algorithm.
          Never list genres as the core of the profile. Genres are symptoms; values are the diagnosis.`;

function evalSystemPrompt(profile) {
  return `You are a music taste evaluator. Here is the user's taste profile:\n\n${profile}\n\nWhen the user gives you an album, artist, song, or playlist, evaluate whether it matches their taste profile. Be specific — reference actual qualities from their profile. Be honest if it won't land for them and explain why. Write 3-4 sentences, warm but direct. No bullet points. Write as if you're a friend who knows their taste deeply.`;
}

async function callClaude(messages, systemPrompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.[0]?.text || "";
}

function hr(char = "─", len = 70) {
  return char.repeat(len);
}

function wrap(text, width = 68) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + word).length > width) {
      lines.push(line.trimEnd());
      line = "";
    }
    line += word + " ";
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines.map((l) => `  ${l}`).join("\n");
}

async function run() {
  console.log(`\n${hr("═")}`);
  console.log("  MUSIC PROFILER — PROMPT EVALUATION SCRIPT");
  console.log(`  Model: ${MODEL}`);
  console.log(`${hr("═")}\n`);

  for (const persona of PERSONAS) {
    console.log(`${hr()}`);
    console.log(`  PERSONA: ${persona.name.toUpperCase()}`);
    console.log(`${hr()}\n`);

    // Build QA pairs
    const qa = QUESTIONS.map((q, i) => `Q: ${q}\nA: ${persona.answers[i]}`).join("\n\n");

    // Step 1: Generate taste profile
    process.stdout.write("  Generating taste profile... ");
    const profile = await callClaude(
      [{ role: "user", content: `Here are my answers to 8 music questions:\n\n${qa}\n\nPlease write my taste profile.` }],
      PROFILE_SYSTEM_PROMPT
    );
    console.log("done.\n");

    console.log("  TASTE PROFILE:");
    console.log(wrap(profile));
    console.log();

    // Step 2: Evaluate songs
    const allSongs = [
      ...persona.fits.map((s) => ({ name: s, expected: "FIT" })),
      ...persona.misfits.map((s) => ({ name: s, expected: "MISFIT" })),
    ];

    console.log("  SONG EVALUATIONS:");
    console.log(`  ${"─".repeat(66)}`);

    for (const song of allSongs) {
      process.stdout.write(`  [${song.expected.padEnd(6)}] ${song.name.padEnd(40)} evaluating...`);
      const evaluation = await callClaude(
        [{ role: "user", content: `Evaluate this for me: "${song.name}"` }],
        evalSystemPrompt(profile)
      );
      console.log(" done.");
      console.log(wrap(evaluation));
      console.log();
    }
  }

  console.log(`${hr("═")}`);
  console.log("  EVALUATION COMPLETE");
  console.log(`${hr("═")}\n`);
}

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
