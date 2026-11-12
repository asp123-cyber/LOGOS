import type { Profile, Article, Comment } from './database.types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    username: 'eleanor_vance',
    display_name: 'Eleanor Vance',
    bio: 'Researcher in epistemology and philosophy of science. Writing on logical inference, model-building, and intellectual discourse.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'admin',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    username: 'samreet_dhillon',
    display_name: 'Samreet Dhillon',
    bio: 'Physicist and essayist. Looking at the cosmos, mathematics, and philosophy through an empirical lens.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    role: 'member',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    username: 'marcus_k',
    display_name: 'Marcus Thorne',
    bio: 'Student of history and philosophy. Fascinated by ancient science and the evolution of rational argument.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    role: 'member',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111',
    author_id: '11111111-1111-1111-1111-111111111111',
    title: 'How to Argue with Logic: A Practical Guide to Thinking Clearly',
    slug: 'how-to-argue-with-logic-a-practical-guide',
    excerpt: 'A foundational inquiry into deductive validity, inductive probability, abductive inference, and the dismantling of cognitive fallacies with intellectual integrity.',
    cover_image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    category: 'Philosophy',
    tags: ['logic', 'epistemology', 'critical-thinking', 'philosophy-of-science'],
    status: 'published',
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'In contemporary public discourse, the word "argument" carries an unfortunate emotional connotation. We associate it with heated quarrels, tribal defensiveness, and personal antipathy. But in philosophy, mathematics, and the sciences, an argument is not a fight. It is a structure of thought. It is the vessel by which human beings test claims against reality and invite others to follow their reasoning without coercion.'
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'To master logic is not to acquire a cache of rhetorical tricks to crush opponents in debate. Rather, it is an act of intellectual self-defense. When you understand the architecture of an argument, you become less susceptible to manipulative headlines, emotional exploitation, and—above all—your own cognitive biases.'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '1. The Anatomy of an Argument' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Every legitimate argument consists of three core components: premises, inferential steps, and a conclusion.'
            }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Premises: ' },
                    { type: 'text', text: 'The foundational assertions, evidence, or empirical observations offered in support of the thesis.' }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Inference: ' },
                    { type: 'text', text: 'The logical bridge or deduction connecting the premises to the claim that follows.' }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Conclusion: ' },
                    { type: 'text', text: 'The final proposition that the premises purportedly justify.' }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Consider the classic syllogism:'
            }
          ]
        },
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Premise 1: All humans are mortal.\nPremise 2: Socrates is a human.\nConclusion: Therefore, Socrates is mortal.' }
              ]
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Notice what is occurring here: you do not need to assess Socrates’ charisma or feel emotionally attached to mortality. The structure does the heavy lifting. If you grant the premises, you are logically cornered into the conclusion.'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '2. The Three Families of Reasoning' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Human beings reason across three distinct modalities depending on whether certainty or empirical discovery is required:'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Deduction: Validity vs. Soundness' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Deduction guarantees its conclusion if the premises are secure. Validity is structural: an argument is valid if, assuming the premises were true, the conclusion could not possibly be false. Soundness requires both valid structure AND factual truth in reality.'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Induction: Probability and Sample Quality' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Induction generalizes from observed instances to broader probabilities. It underpins natural science and medicine. However, induction never yields mathematical certainty: one black swan disproves a millennium of white swan observations.'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Abduction: Inference to the Best Explanation' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Abduction starts with an observed phenomenon and asks: what hypothesis accounts for this with the greatest explanatory power and minimal arbitrary speculation? It is what detectives, physicians, and theoretical physicists do daily.'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '3. A Field Guide to Common Fallacies' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'A fallacy is a failure of inferential reasoning. Identifying them saves immense mental energy:'
            }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Straw Man: ' },
                    { type: 'text', text: 'Distorting someone\'s position into an absurd extreme that is easy to knock down.' }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Ad Hominem: ' },
                    { type: 'text', text: 'Attacking the person making the claim rather than the evidentiary validity of the claim.' }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'False Dilemma: ' },
                    { type: 'text', text: 'Pretending there are only two binary options when a nuanced spectrum exists.' }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Post Hoc Ergo Propter Hoc: ' },
                    { type: 'text', text: 'Confusing temporal order with causation (B happened after A, therefore A caused B).' }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Equivocation: ' },
                    { type: 'text', text: 'Using the same word with two different meanings across the argument.' }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '4. Steelmanning: The Ultimate Intellectual Virtue' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'When debating, the highest virtue is not destroying a poorly phrased counterpoint. It is steelmanning: actively reconstructing your interlocutor\'s argument in its strongest, most sophisticated possible form. If you can still point out an inconsistency in their steelmanned position, genuine discovery has been achieved.'
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'In a world inundated with emotional rhetoric and algorithmic outrage, clarity of mind is liberation.'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'bbbb2222-bbbb-2222-bbbb-2222bbbb2222',
    author_id: '22222222-2222-2222-2222-222222222222',
    title: 'From Pre-Socratics to Quantum Mechanics: The Continuity of Wonder',
    slug: 'from-pre-socratics-to-quantum-mechanics',
    excerpt: 'How Thales, Heraclitus, and Democritus framed the questions that Heisenberg, Bohr, and modern theoretical physicists continue to investigate today.',
    cover_image_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    category: 'Physics',
    tags: ['physics', 'quantum', 'pre-socratics', 'philosophy-of-science'],
    status: 'published',
    published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'When we study the history of physics, we often commit the chronological fallacy: assuming modern thought began with Galileo or Newton, and that ancient natural philosophy was mere superstition. But consider Democritus proposing indivisible units (atomos) moving through void, or Heraclitus arguing that reality is not static being, but perpetual flux (panta rhei).'
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Quantum field theory does not describe particles as miniature billiard balls, but as excited states of underlying continuous fields. In an astonishingly literal sense, Heraclitus and Democritus were wrestling with the twin poles of our most refined quantum formulations.'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'cccc3333-cccc-3333-cccc-3333cccc3333',
    author_id: '33333333-3333-3333-3333-333333333333',
    title: 'The Demarcation Problem: What Makes Science Distinct?',
    slug: 'the-demarcation-problem-what-makes-science-distinct',
    excerpt: 'Examining Karl Popper’s criterion of falsifiability, Thomas Kuhn’s paradigm shifts, and why defining science remains deeply philosophically relevant.',
    cover_image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
    category: 'Science',
    tags: ['science', 'popper', 'kuhn', 'epistemology'],
    status: 'published',
    published_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'What separates scientific knowledge from astrology, pseudo-science, or metaphysical dogma? In 1934, Karl Popper proposed falsifiability: a proposition is scientific if and only if it is susceptible to empirical refutation.'
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Decades later, Thomas Kuhn argued that science does not advance by linear accumulation of refutations, but through normal puzzle-solving punctuated by paradigm shifts. The debate remains critical in an era of complex computer simulations and unobservable string theories.'
            }
          ]
        }
      ]
    }
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    article_id: 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111',
    author_id: '22222222-2222-2222-2222-222222222222',
    body: 'The distinction between validity and soundness is the single most important concept in undergraduate philosophy. Too many people confuse formal structural validity with empirical truth.',
    status: 'visible',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'comm-2',
    article_id: 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111',
    author_id: '33333333-3333-3333-3333-333333333333',
    body: 'Steelmanning changes the nature of conversations. When you can articulate your opponent\'s thesis better than they did, antagonism turns into collaborative problem solving.',
    status: 'visible',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  }
];
