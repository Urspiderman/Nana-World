
export type LoveLetter = {
  id: string;
  title: string;
  coverTitle: string;
  subtitle: string;
  symbol: string;
  color: string;
  ink: string;
  pages: string[];
};

export const letters: LoveLetter[] = [
  {
    id: "favorite",
    title: "For My Favorite Person",
    coverTitle: "For My\nFavorite\nPerson",
    subtitle: "A little piece of my heart",
    symbol: "♡",
    color: "#84364F",
    ink: "#FFE3E5",
    pages: [
      `To my favorite person,

In a world filled with so many people, somehow you became my favorite part of every day.

It's the little things about you that make me smile. Your laugh, your stories, and even the quiet moments we share.

You make ordinary days feel special.

And I hope you know just how much you mean to me.`,

      `My love,

If I could collect every beautiful moment with you, I would keep them in a little book and read them over and over again.

Thank you for being you.

For all the laughter, the memories, and the happiness you bring into my life.

With all my love,
♡`,
    ],
  },
  {
    id: "sad",
    title: "When You Feel Sad",
    coverTitle: "When You\nFeel Sad",
    subtitle: "For the difficult days",
    symbol: "✿",
    color: "#E8A6B8",
    ink: "#713449",
    pages: [
      `Hey, my love,

I know that sometimes the world can feel a little too heavy.

And I wish I could take every worry away from your heart.

But until then, I hope this little letter reminds you that you don't have to be strong every single day.

It's okay to rest.
It's okay to cry.
It's okay to feel everything.`,

      `Please be gentle with yourself.

You deserve the same kindness that you give to everyone around you.

Even on your hardest days, you are still someone incredibly special.

I'm sending you the biggest imaginary hug right now.

Love you, always.
♡`,
    ],
  },
  {
    id: "miss",
    title: "When You Miss Me",
    coverTitle: "When You\nMiss Me",
    subtitle: "For the moments apart",
    symbol: "☾",
    color: "#F3D7C8",
    ink: "#85435B",
    pages: [
      `Hello, sweetheart.

If you're reading this, maybe you're missing me a little.

So imagine me sitting right beside you.

Imagine us talking about random things, laughing at something silly, or simply enjoying the quiet together.

I hope this letter makes the distance feel a little smaller.`,

      `Until we meet again, remember all our favorite moments.

The smiles.
The conversations.
The tiny adventures.

There are still so many beautiful memories waiting for us.

See you soon, my favorite person.
♡`,
    ],
  },
  {
    id: "smile",
    title: "When You Need a Smile",
    coverTitle: "When You\nNeed a Smile",
    subtitle: "A little happiness for you",
    symbol: "✧",
    color: "#C97E9B",
    ink: "#FFF0E7",
    pages: [
      `Psst... hey you!

Yes, you.

Did you know that your smile is one of my favorite things?

I hope something lovely happens today.

Maybe your favorite food, a beautiful sunset, or a funny little moment that makes you laugh.`,

      `And if today hasn't been very exciting, that's okay too.

Here's your reminder that you are loved, appreciated, and wonderfully unique.

Now give me a tiny smile.

There it is!

♡`,
    ],
  },
  {
    id: "believe",
    title: "When You Doubt Yourself",
    coverTitle: "Believe\nIn Yourself",
    subtitle: "For your brave little heart",
    symbol: "✦",
    color: "#B68A9D",
    ink: "#FFF1E7",
    pages: [
      `Dear you,

Sometimes we forget how far we've already come.

We look at everything we haven't achieved yet and forget all the little victories along the way.

But I see how hard you try.

And I hope you can see it too.`,

      `You don't have to figure everything out today.

Take one small step.
Then another.

You are allowed to grow at your own pace.

And no matter how long the journey takes, I hope you never stop believing in yourself.

I'm proud of you.
♡`,
    ],
  },
  {
    id: "secret",
    title: "A Little Secret",
    coverTitle: "A Little\nSecret",
    subtitle: "Something only for you",
    symbol: "♥",
    color: "#64263E",
    ink: "#F8D6DF",
    pages: [
      `Shhh...

I have a little secret.

Out of all the stories in the world, the one that has you in it is my favorite.

Every little memory we make becomes another page in a story I never want to forget.`,

      `And here's one more secret...

If every happy moment with you became a star, we'd have our very own galaxy.

Maybe that's why I call this little place Nana World.

Because some people deserve a universe of their own.

Forever and always.
♡`,
    ],
  },
];
