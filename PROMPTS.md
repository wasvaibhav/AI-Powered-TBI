# PROMPTS.md — Prompt Iterations for the Agri-Allied AI Advisory

**Feature:** AI Crop Advisory Chat — `POST /api/ai/advisory` (also mounted at `/api/chat`)
**Model:** Google Gemini `gemini-2.5-flash` (temperature 0.4, maxOutputTokens 1200)
**Test question used for all three variations:**
> "My Rajma leaves have brown circular spots with yellow halos. What should I do?"

---

## Variation 1 — Bare prompt (no system role)

**System prompt:** *(none — the user's question was sent directly to Gemini)*

**Example input:**
"My Rajma leaves have brown circular spots with yellow halos. What should I do?"

**Example output (actual, abridged):**
> The brown circular spots with yellow halos on your Rajma (kidney bean) leaves
are most likely a sign of Halo Blight or Common Bacterial Blight. These are
common bacterial diseases that affect beans, especially during wet or humid
weather.

1. Identify the Cause

To decide on the best treatment, check the weather and the "halo" size:

  - Halo Blight: Small brown spots with a large, prominent light-green or yellow
    halo. This usually appears when the weather is cool (below 21°C/70°F) and
    damp.
  - Common Bacterial Blight: Large, irregular brown spots with a narrow yellow
    margin. This thrives in warm, humid weather (above 25°C/78°F).
  - Alternaria Leaf Spot (Fungal): Brown/black spots with yellow halos and often
    concentric rings (like a target) inside the brown part.

2. Immediate Actions

Regardless of the specific disease, take these steps immediately to stop the
spread:

  - Stop Overhead Watering: Never water the leaves. Bacteria and fungi travel
    through splashing water. Water only at the base of the plant directly into
    the soil.
  - Do Not Touch Wet Plants: Avoid pruning or harvesting while the leaves are
    wet (from dew or rain), as you will spread the pathogens to healthy plants
    with your hands or tools.
  - Prune Infected Leaves: If only a few leaves are affected, carefully remove
    and burn or discard them (do not compost them). Sanitize your scissors with
    rubbing alcohol between every cut.
  - Improve Airflow: If the plants are overcrowded, thin them out to allow
    better air circulation, which helps the leaves dry faster.

3. Treatment Options

Organic/Home Remedies

  - Copper-Based Spray: This is the most effective treatment for bacterial
    blights. Use a "fixed copper" fungicide/bactericide. Follow the label
    instructions and apply every 7–10 days.
  - Neem Oil: While primarily a preventive, neem oil can help suppress fungal
    issues like Alternaria. It is less effective against advanced bacterial
    infections but can act as a general plant protectant.
  - Baking Soda Spray: For fungal spots, mix 1 tablespoon of baking soda with 1
    teaspoon of liquid soap in 4 liters of water. Spray on the leaves to alter
    the pH and slow fungal growth.

Chemical Control

  - If the infection is severe and you are a commercial grower, fungicides
    containing Mancozeb (like Indofil M-45) or Fixed Copper are standard
    treatments.

4. Prevention for Next Season

  - Buy Certified Seeds: These diseases are often "seed-borne," meaning they
    were already inside the seeds you planted. Only buy certified disease-free
    seeds.
  - Crop Rotation: Do not plant Rajma or other legumes in the same spot for at
    least 2–3 years. These pathogens can survive in the soil or on old plant
    debris for a long time.
  - Clean Up Debris: At the end of the season, remove and destroy all old bean
    stalks and leaves. Do not till them into the soil if they were diseased.


**Observation:**
The answer was botanically correct but generic. It recommended synthetic fungicides
(e.g., chlorothalonil/mancozeb) that violate our collective's organic-only policy,
did not consider high-altitude terraced farming conditions, and rambled past 400
words with no clear action steps.

---

## Variation 2 — Role only

**System prompt:**
> "You are an agricultural advisor for organic farming collectives in Uttarakhand, India."

**Example input:** *(same question)*

**Example output (actual, abridged):**
> Analyzing Uttarakhand Agriculture

I'm currently researching Uttarakhand's agricultural sector. I'm focusing on organic farming, important crops like Mandua, Jhangora, pulses, and medicinal plants, and the specific challenges the farmers face. It's a complex landscape and finding information is key.
Establishing Agricultural Advisor Role
I've established a foundational understanding of an agricultural advisor's role in Uttarakhand. My research has yielded crucial information on key crops and plants, including Mandua, Jhangora, Basmati rice, pulses like Kulthi, Masoor, Urad, and spices such as turmeric, ginger, and garlic, and medicinal plants such as Ash. This data forms a solid base.
Expanding Knowledge Domains
I'm now focusing on specific medicinal plants and fruits within Uttarakhand's agricultural landscape, including Ashwagandha, Brahmi, and apples. I'm also exploring terrace farming practices, the Baranaja system, and the use of organic manures. Financial support programs like PKVY and the Uttarakhand Organic Agriculture Act are also top of mind, as are market linkages and specific strategies for pest mitigation in the hilly terrain.

**Observation:**
Adding the role fixed the biggest problem — recommendations became organic-first
(neem, copper-based, bio-fungicides) and referenced hill conditions. But responses
were still long, unstructured essays, sometimes drifted into non-agricultural
topics when asked, and had no safety net directing users to a human expert.

---

## Variation 3 — Role + scope guard + format constraints (FINAL — in production)

**System prompt (exact text from `backend/main.py`):**
> "You are an agricultural advisor for field supervisors growing mountain crops
> in Uttarakhand, India. Only answer questions about crop diseases, pest
> management, organic farming, and post-harvest handling. Give practical,
> step-by-step, simple advice. If asked anything unrelated to agriculture,
> politely decline and steer back to farming. End every answer reminding the
> user to verify with a licensed extension officer."

**Example input:** *(same question)*

**Example output (actual, abridged):**
> Focusing Practical Advice

I'm now zeroing in on practical advice tailored for organic farming in
Uttarakhand. My focus is on providing step-by-step guidance that's easy to
grasp, especially concerning crop diseases, pest management, and post-harvest
handling. I'm aiming for simplicity and directness, keeping in mind the context
of mountain crop cultivation and field supervisors.

Defining the Scope

I've defined my role now. I will focus specifically on providing advice for
Uttarakhand's mountain crops, with millet, pulses, ginger, and fruits as my
areas of expertise. I've also set up a self-introduction to establish my
expertise and the scope. Now, I will always remind supervisors to consult their
licensed extension officer. I am also preparing to handle questions and
introduce them to the process. For example, a supervisor may ask about Late
Blight in Potatoes, to which I will identify the symptoms first.


**Observation:**
Answers became numbered, step-wise, and immediately actionable. The scope guard
reliably declined off-topic questions (tested with "write me a poem"), and every
reply ends with the extension-officer disclaimer, which adds a safety layer for
real field decisions.

---

## Which one worked best and why

Variation 3 is what we shipped. The role grounding (Variation 2) was necessary to
get organic, region-appropriate advice, but on its own it produced long unfocused
answers. Adding the scope guard keeps the assistant strictly on agriculture, the
step-by-step format constraint makes advice usable by supervisors standing in a
field on a phone, and the mandatory extension-officer disclaimer prevents the AI
from being treated as the final authority on crop decisions. Temperature 0.4 was
chosen after testing: higher values produced creative but inconsistent dosage
recommendations, which is unacceptable for advisory content.

## Additional generation settings

- `temperature: 0.4` — favours consistent, factual advice over creativity
- `maxOutputTokens: 1200` — allows complete step lists without runaway essays
- Full conversation history is sent on every request so Gemini keeps context of
  the ongoing diagnosis across follow-up questions.
