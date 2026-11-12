-- ====================================================================
-- LOGOS SEED ESSAY: How to Argue with Logic: A Practical Guide to Thinking Clearly
-- ====================================================================
-- Run this in the Supabase SQL Editor AFTER running schema.sql and creating your
-- first admin/author user account.
-- Replace '00000000-0000-0000-0000-000000000000' below with your actual profile ID,
-- or use the subquery below which assigns it to the first registered admin/profile.

do $$
declare
  target_author_id uuid;
begin
  -- Find an author (prefers admin, fallbacks to any existing profile)
  select id into target_author_id
  from public.profiles
  order by (role = 'admin') desc, created_at asc
  limit 1;

  if target_author_id is null then
    raise notice 'No profiles exist yet. Please create an account in LOGOS, then re-run this seed script.';
    return;
  end if;

  insert into public.articles (
    author_id,
    title,
    slug,
    excerpt,
    category,
    tags,
    status,
    published_at,
    cover_image_url,
    content
  ) values (
    target_author_id,
    'How to Argue with Logic: A Practical Guide to Thinking Clearly',
    'how-to-argue-with-logic-a-practical-guide',
    'A foundational guide to deductive validity, inductive strength, inference to the best explanation, and dismantling cognitive fallacies with intellectual integrity.',
    'Philosophy',
    array['logic', 'epistemology', 'critical-thinking', 'philosophy-of-science'],
    'published',
    now(),
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    '{
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "In contemporary public discourse, the word \"argument\" carries an unfortunate emotional connotation. We associate it with heated dinner-table quarrels, vitriolic social media exchanges, and defensive posture. But in philosophy, mathematics, and the natural sciences, an argument is not an altercation. It is a structure of thought. It is the vehicle by which human beings test claims against reality and invite others to follow their reasoning without coercion."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "To master logic is not to acquire a set of rhetorical weapons to humiliate conversational partners. Rather, it is an act of intellectual self-defense and cognitive hygiene. When you understand the architecture of an argument, you become less vulnerable to manipulation by charismatic demagogues, deceptive headlines, and—most importantly—your own cognitive biases."
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "1. The Anatomy of an Argument" }]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Every legitimate argument consists of three core components: premises, inferential steps, and a conclusion."
            }
          ]
        },
        {
          "type": "bulletList",
          "content": [
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    { "type": "text", "marks": [{ "type": "bold" }], "text": "Premises: " },
                    { "type": "text", "text": "The foundational propositions offered as reasons or evidence." }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    { "type": "text", "marks": [{ "type": "bold" }], "text": "Inference: " },
                    { "type": "text", "text": "The logical movement or bridge that connects the premises to what follows." }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    { "type": "text", "marks": [{ "type": "bold" }], "text": "Conclusion: " },
                    { "type": "text", "text": "The terminal claim that the premises purportedly justify." }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Consider the classical syllogism:"
            }
          ]
        },
        {
          "type": "blockquote",
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "Premise 1: All humans are mortal.\nPremise 2: Hypatia is a human.\nConclusion: Therefore, Hypatia is mortal." }
              ]
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Notice that the validity here is structural: if Premises 1 and 2 are true, the conclusion is non-negotiable. Denying the conclusion requires either demonstrating that Hypatia is not human, that some humans are immortal, or abandoning rational deduction entirely."
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "2. Claims, Evidence, and Hidden Assumptions" }]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "In conversational speech, premises are rarely enumerated cleanly. They are frequently buried under rhetoric, or worse, left unstated as tacit presuppositions (enthymemes)."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "For instance: \"We must ban artificial intelligence research because it will destroy human employment.\" The unstated premise is that any technology that displaces existing labor models cannot create new forms of human flourishing, or that economic dislocation is inherently irremediable. When dissecting an argument, your primary task is to surface these suppressed assumptions."
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "3. The Three Modes of Reasoning" }]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Rigorous thinking relies on distinguishing three distinct inferential modalities:"
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "Deductive Reasoning (Validity vs. Soundness)" }]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "A deductive argument aims for certainty. We evaluate it on two separate criteria:\n• Validity: The formal relationship between premises and conclusion. If the premises were true, could the conclusion be false? If no, it is valid.\n• Soundness: An argument is sound if and only if it is valid AND its premises are factually true in the actual universe."
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "Inductive Reasoning (Strength and Probability)" }]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Induction extrapolates from finite observed instances to general principles. Every sunrise observed by humanity provides strong inductive evidence that the sun will rise tomorrow, but it does not carry mathematical certainty. Inductive strength depends strictly on sample size, representative variance, and avoiding hasty generalizations."
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "Abductive Reasoning (Inference to the Best Explanation)" }]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Used by clinicians, detectives, and theoretical physicists alike. Given an observation (e.g., cosmic microwave background radiation), which hypothesis accounts for all the data with the fewest ad hoc assumptions and the greatest explanatory coherence?"
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "4. Necessary vs. Sufficient Conditions" }]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "A frequent source of logical confusion is conflating necessity and sufficiency:\n• Necessary condition: Must be present for an event to occur (e.g., oxygen is necessary for human life).\n• Sufficient condition: If present, guarantees the event (e.g., decapitation is sufficient for human death).\nOxygen is necessary for life, but having oxygen alone is not sufficient to keep someone alive."
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "5. A Catalog of Classic Fallacies" }]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Fallacies are structural defects in reasoning. Beware of these ten common traps:"
            }
          ]
        },
        {
          "type": "bulletList",
          "content": [
            {
              "type": "listItem",
              "content": [{ "type": "paragraph", "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Straw Man: " }, { "type": "text", "text": "Caricaturing an opponent''s stance to make it trivially refutable." }] }]
            },
            {
              "type": "listItem",
              "content": [{ "type": "paragraph", "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Ad Hominem: " }, { "type": "text", "text": "Attacking the advocate''s moral pedigree or identity rather than their propositions." }] }]
            },
            {
              "type": "listItem",
              "content": [{ "type": "paragraph", "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "False Dilemma: " }, { "type": "text", "text": "Forcing an artificial binary choice when a spectrum of nuanced alternatives exists." }] }]
            },
            {
              "type": "listItem",
              "content": [{ "type": "paragraph", "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Slippery Slope: " }, { "type": "text", "text": "Claiming that step A will inevitably cascade into disaster Z without demonstrating causal necessity." }] }]
            },
            {
              "type": "listItem",
              "content": [{ "type": "paragraph", "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Hasty Generalization: " }, { "type": "text", "text": "Deriving universal conclusions from an unrepresentative or negligible sample." }] }]
            },
            {
              "type": "listItem",
              "content": [{ "type": "paragraph", "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Post Hoc Ergo Propter Hoc: " }, { "type": "text", "text": "Confusing temporal sequence with causal agency (B followed A, therefore A caused B)." }] }]
            },
            {
              "type": "listItem",
              "content": [{ "type": "paragraph", "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Circular Reasoning (Petitio Principii): " }, { "type": "text", "text": "Smuggling the conclusion into the premises." }] }]
            },
            {
              "type": "listItem",
              "content": [{ "type": "paragraph", "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Equivocation: " }, { "type": "text", "text": "Shifting the semantic definition of a key term mid-argument." }] }]
            },
            {
              "type": "listItem",
              "content": [{ "type": "paragraph", "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "False Analogy: " }, { "type": "text", "text": "Comparing two phenomena whose structural differences outweigh their superficial resemblances." }] }]
            },
            {
              "type": "listItem",
              "content": [{ "type": "paragraph", "content": [{ "type": "text", "marks": [{"type": "bold"}], "text": "Uncritical Appeal to Authority: " }, { "type": "text", "text": "Citing an authority figure on topics outside their domain of genuine expertise." }] }]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "6. The Art of Steelmanning & Constructive Disagreement" }]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "The highest mark of intellectual virtue is the steelman. Instead of dismantling a flawed or clumsily expressed version of your interlocutor''s claim, you first reconstruct their argument in its strongest, most sophisticated form. Only once both parties agree that the strongest possible case has been articulated do you proceed to locate its potential fractures."
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "7. The Debater''s Analytical Checklist" }]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Before formulating a counterargument, run this mental audit:\n1. What is the precise conclusion being defended?\n2. What are the explicit premises? What are the unstated assumptions?\n3. Is the inferential bridge valid? If deductive, would true premises guarantee the conclusion?\n4. If inductive or abductive, what empirical counterevidence would falsify the claim?\n5. Are all terms used consistently without equivocation?\n6. Am I attacking the argument itself, or merely reacting to tone and affiliation?"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "When we approach conversation not as a battlefield to conquer, but as a collaborative excavation of truth, disagreement ceases to be toxic. It becomes the engine of human wisdom."
            }
          ]
        }
      ]
    }'::jsonb
  )
  on conflict (slug) do nothing;

  raise notice 'Seed essay inserted successfully for author %', target_author_id;
end $$;
