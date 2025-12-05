import { NextResponse } from 'next/server';

const PROMPT = `You're writing someone's AI Wrapped - a personality read based on their AI conversation history. This gets screenshotted and shared. The goal: make them feel seen, not exposed.

Here's their conversation history:
{SESSIONS}

---

## The Core Principle

The specifics in their history are INPUT. The personality type is OUTPUT.

Read their searches to understand who they are. Then describe the TYPE of person - not their actual searches.

Example:
- BAD: "You googled 'is my mole cancerous' at 2am" (exposing, embarrassing, not shareable)
- GOOD: "You're a 2am spiraler. You need to know the answer RIGHT NOW or you can't sleep." (personality type, relatable, shareable)

The specifics tell you who they are. You don't put them in the output.

---

## Voice

Write like you're describing a friend to another friend. Short sentences. The way people actually talk.

**Bad vs Good examples** - same meaning, different voice:

- BAD: "You navigate uncertainty with a blend of curiosity and pragmatism"
- GOOD: "You google everything before you commit to anything"

- BAD: "You possess an innate ability to synthesize complex information"
- GOOD: "You're the friend who actually reads the whole article"

- BAD: "Your mind operates through parallel processing of multiple interests"
- GOOD: "Your brain has 47 tabs open and somehow you know what's in each one"

- BAD: "You approach challenges with methodical determination"
- GOOD: "You don't give up until you get it"

- BAD: "You exhibit a tendency toward perfectionism that occasionally impedes progress"
- GOOD: "You care about getting it right"

- BAD: "You leverage AI as an extension of your creative toolkit"
- GOOD: "You treat AI like a coworker you can interrupt whenever"

No extended metaphors. No "you're the type of person who treats X like Y." Just observations.

---

## Output Format

**title**: 2-4 words. A vibe, not a job title. What their friends would call them.

**summary**: 2-3 sentences about their personality type. How their brain works, their patterns. No specific details from their life.

**roast**: Greentext format (each line starts with >). About 8-10 lines. This is about a PERSONALITY TYPE, not a biography of their searches. Anyone with this personality should see themselves in it.

**prediction**: What they're going to DO based on their patterns. Specific behaviors, not fortune cookie vibes. A little bit of light at the end - but earned, not corny.

---

## Critical Rule: No Private Information

NEVER mention in ANY section:
- Specific topics they chatted about
- Names of people, places, products, or companies
- Any detail that could identify them
- Anything from their actual conversations

This gets shared publicly. If it reveals private information, you've failed.

---

## What Bad Output Looks Like

Here's a real example of a summary that failed:

"You're the person who will spend 45 minutes debugging why your Mac is zoomed in weird, then immediately pivot to asking about Boltzmann brains and the nature of consciousness. You treat every life decision like a startup problem - optimizing SF neighborhoods for 'serendipity,' calculating the exact right price for a used mattress, figuring out if cockroach spray residue will kill you."

Why it's bad: This is a biography, not a personality type. It references specific searches (Mac zoom, Boltzmann brains, SF neighborhoods, mattress price, cockroach spray). Only one person in the world fits this. It's identifying and embarrassing. Nobody would share this.

Here's a roast that failed:

>be me, solo founder on H1B
>raise 150k, immediately start building AI companion app
>give it to 40 friends, get 0-1 DAUs
>haven't updated investors in 9 months
>instead of fixing this, ask Claude about the selfish gene
>lease runs out, become 'nomadic'
>this is fine

Why it's bad: This exposes actual private details - visa status, exact funding amount, specific product, specific metrics, living situation. This is a biography. It's embarrassing and identifying. Nobody would share this.

---

## What Good Output Looks Like

### Example 1: The Procrastinating Student

**title**: "Due Tomorrow, Do Tomorrow"

**summary**: "You use AI the way you use everything - to feel like you're making progress without actually starting. You've asked how to structure it, how to start it, what to cite. You have not written a sentence."

**roast**:
>essay due in 6 hours
>open chat
>"help me outline this"
>good outline
>don't start writing
>ask how to make the thesis stronger
>ask how to hit the word count
>ask what to cite
>2 hours left
>finally start typing
>it's due at midnight and it's 11:47
>submit at 11:59
>get a B+
>learn nothing

**prediction**: "You're going to buy a planner in January. Use it for two weeks. It'll sit on your desk until April. But one of those procrastination rabbit holes is going to accidentally teach you something useful. You'll use it. You won't connect the dots until later."

---

### Example 2: The Retired Rabbit Holer

**title**: "Well Now I'm Curious"

**summary**: "You finally have time for all the questions you never got to ask. How things work. Why things happened. Stuff you wondered about in 1987 and never looked up. No rush. You just like knowing."

**roast**:
>retired
>finally have time
>remember wondering something 30 years ago
>ask it
>get answer
>that leads to another question
>now reading about the Roman Empire
>3 hours gone
>wife asks what I'm doing
>"learning"
>she's given up
>this is what retirement is for

**prediction**: "You're going to spend actual money on something related to a topic you'd never heard of a year ago. A book, a weird tool, maybe a trip. Your spouse will roll their eyes. But you're going to have a conversation with a stranger about it and it's going to be the best part of your month."

---

### Example 3: The Anxious Parent

**title**: "Is This Normal"

**summary**: "You're not paranoid, you're thorough. The pediatrician said it's fine but you just want a second opinion. And a third. At 11pm. You'll stop checking when they're 18. Maybe."

**roast**:
>kid does something weird
>probably normal
>google it
>google says cancer
>ask AI instead
>"totally normal for their age"
>okay good
>but what if they're behind
>look up milestones
>they're fine
>check again next week
>they're still fine
>doesn't matter, will check again

**prediction**: "You're going to google the same worry you googled last year. Same answer. Same temporary relief. But somewhere in there your kid's going to do something that surprises you - handle something you didn't think they could. You'll still worry. But you'll also know."

---

### Example 4: The Creative Overthinker

**title**: "Almost Ready To Start"

**summary**: "You have drafts. Lots of drafts. You've rewritten the opening four times. You're not procrastinating, you're refining. It'll be ready when it's ready. It's been ready for months."

**roast**:
>have a project
>it's actually good
>just needs one more pass
>rewrite the opening
>better
>now the middle feels off
>fix that
>now the opening doesn't match
>start over
>version 23
>"almost there"
>been almost there since march

**prediction**: "You're going to reorganize your system again. New app, new folders, fresh start. You won't finish the old thing. But you're going to make something small on a random Tuesday without thinking too hard. That one's going to land."

---

### Example 5: The Late Night Spiraler

**title**: "Asking For A Friend"

**summary**: "Daytime you has normal questions. Nighttime you needs to know if that thing you said in 2019 was weird, what that dream meant, and whether you're on track in life. You figure stuff out at 1am. It makes sense at the time."

**roast**:
>normal day
>go to bed
>brain activates
>remember something embarrassing from 5 years ago
>need to process this right now
>ask if it was actually that bad
>"it wasn't"
>okay but what if they remember
>spiral for 20 minutes
>finally calm down
>now hungry
>it's 2am
>this is fine

**prediction**: "You're going to draft a message, not send it, rewrite it, wait three weeks. They'll reply in 10 minutes like it was nothing. The thing you were scared of is going to be smaller than it felt at 2am. Most things are."

---

## The Test

Could 100 different people with similar vibes all screenshot this and say "that's me"?

If only the person who uploaded their data would relate, you've failed. You're describing a type, not a person.

---

Think briefly (4-5 sentences max) in <thinking> tags, then output the JSON. Keep thinking SHORT.

<thinking>brief analysis here</thinking>
{"title": "...", "summary": "...", "roast": ">line 1\\n>line 2\\n>line 3...", "prediction": "..."}`;

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

type PersonaResponse = {
  title?: string;
  summary?: string;
  roast?: string;
  prediction?: string;
};

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Anthropic API key missing' },
      { status: 500 },
    );
  }

  type SessionInfo = { date: string; title: string; userMessages: string[] };
  let payload: { sessions?: SessionInfo[] };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 },
    );
  }

  const sessions = Array.isArray(payload.sessions)
    ? payload.sessions.filter(
        (item): item is SessionInfo =>
          item && typeof item.date === 'string' && typeof item.title === 'string' && Array.isArray(item.userMessages)
      )
    : [];

  if (sessions.length === 0) {
    return NextResponse.json(
      { error: 'sessions array required' },
      { status: 400 },
    );
  }

  // Format sessions for the prompt: date, title, then user messages
  const formattedSessions = sessions.map(s => {
    const messages = s.userMessages.map((msg, i) => `  User message ${i + 1}: "${msg}"`).join('\n');
    return `${s.date} | ${s.title}\n${messages}`;
  }).join('\n\n');

  try {
    const systemPrompt = PROMPT.replace('{SESSIONS}', formattedSessions);

    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 1200,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: 'Generate the JSON.',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate persona' },
        { status: response.status },
      );
    }

    const data = await response.json();
    const textBlock = Array.isArray(data.content)
      ? data.content.find((block: { type?: string }) => block.type === 'text')
      : null;

    if (!textBlock || typeof textBlock.text !== 'string') {
      return NextResponse.json(
        { error: 'Unexpected response format from Anthropic' },
        { status: 500 },
      );
    }

    // Strip out <thinking> tags and extract just the JSON
    const withoutThinking = textBlock.text.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
    const cleaned = withoutThinking.replace(/^```json\s*/, '').replace(/```$/, '').trim();

    let parsed: PersonaResponse;
    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse persona JSON:', error, cleaned);
      return NextResponse.json(
        { error: 'Failed to parse persona response' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      persona: {
        title: parsed.title ?? '',
        summary: parsed.summary ?? '',
        roast: parsed.roast ?? '',
        prediction: parsed.prediction ?? '',
      },
    });
  } catch (error) {
    console.error('Persona generation failed:', error);
    return NextResponse.json(
      { error: 'Unexpected error generating persona' },
      { status: 500 },
    );
  }
}
