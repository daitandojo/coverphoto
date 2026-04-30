export interface PortraitBrief {
  id: string;
  name: string;
  tagline: string;
  photographer: string;
  prompt: string;
}

const BRIEFS: PortraitBrief[] = [
  {
    id: "executive",
    name: "The Executive",
    tagline: "Formal studio portrait",
    photographer: "Marcus Sterling",
    prompt: `You are Marcus Sterling, lead portrait photographer at CoverPhoto, whose client list includes Fortune 500 CEOs and world leaders. Your brief for this portrait:

COMPOSITION: Tight head-and-shoulders frame, subject looking directly into the lens with quiet authority. Rule of thirds positioning, shallow depth of field.

WARDROBE: Charcoal wool suit, white poplin shirt, no tie — the CFO who closed the deal but loosened his collar at dinner.

LIGHTING: Rembrandt lighting setup. Single key light at 45°, soft fill. Deep shadows on the far cheek.

MOOD: Composed power. This is a person who makes decisions that move markets.

TECHNICAL: Photorealistic, 85mm portrait lens equivalent, f/1.8, Canon R5, RAW file quality. Studio backdrop: seamless grey.

SUBJECT FIDELITY: The subject must be an exact likeness of the person in the reference images. Preserve: facial structure, eye colour, skin tone, age, distinguishing features. This is a portrait commission, not an idealisation.`,
  },
  {
    id: "founder",
    name: "The Founder",
    tagline: "Smart-casual, approachable",
    photographer: "Elena Vasquez",
    prompt: `You are Elena Vasquez, lead portrait photographer at CoverPhoto, known for capturing the new generation of innovators. Your brief for this portrait:

COMPOSITION: Slight three-quarter turn, subject leaning slightly forward, hands loosely clasped. Environmental portrait feel.

WARDROBE: Smart-casual — charcoal merino crewneck, tailored chinos, no jacket. The founder who just pitched and won.

LIGHTING: Warm ambient key light from camera-left, subtle rim light revealing jawline. Soft, inviting shadows.

MOOD: Approachable ambition. This person is building the future and welcomes you to join.

TECHNICAL: Photorealistic, 50mm portrait lens equivalent, f/2.0, Canon R5, RAW file quality. Studio backdrop: warm taupe.

SUBJECT FIDELITY: The subject must be an exact likeness of the person in the reference images. Preserve: facial structure, eye colour, skin tone, age, distinguishing features. This is a portrait commission, not an idealisation.`,
  },
  {
    id: "statesperson",
    name: "The Statesperson",
    tagline: "Formal, dramatic, architectural",
    photographer: "James Whitfield",
    prompt: `You are James Whitfield, lead portrait photographer at CoverPhoto, whose work hangs in galleries and government buildings. Your brief for this portrait:

COMPOSITION: Formal standing pose, subject's body angled three-quarters, head turned to camera. Architectural frame with leading lines.

WARDROBE: Black tie perfection — midnight velvet dinner jacket, crisp white formal shirt, black bow tie. Or floor-length evening gown with subtle jewellery.

LIGHTING: Dramatic split lighting. Main key at 90°, deep chiaroscuro. A single silver reflector for catchlights.

MOOD: Dignified presence. This is a statesperson whose decisions shape history.

TECHNICAL: Photorealistic, 70mm portrait lens equivalent, f/2.8, Canon R5, RAW file quality. Background: architectural column detail with soft shadow.

SUBJECT FIDELITY: The subject must be an exact likeness of the person in the reference images. Preserve: facial structure, eye colour, skin tone, age, distinguishing features. This is a portrait commission, not an idealisation.`,
  },
  {
    id: "outdoors",
    name: "The Outdoorsman",
    tagline: "Natural light, environmental",
    photographer: "River Chen",
    prompt: `You are River Chen, lead portrait photographer at CoverPhoto, celebrated for environmental portraiture. Your brief for this portrait:

COMPOSITION: Wide shoulders, head slightly tilted, looking into the distance beyond camera. Natural environmental framing.

WARDROBE: Open-collar linen shirt in ivory, sleeves rolled once. Light khaki field jacket draped over shoulder.

LIGHTING: Golden hour simulation — warm key light at 15° above, long shadows, lens flare kiss on the left edge. Gentle wind stirs the hair.

MOOD: Quiet confidence. This person is at home in the world, comfortable in their own skin.

TECHNICAL: Photorealistic, 35mm portrait lens equivalent, f/2.0, Canon R5, RAW file quality. Background: soft-focus natural landscape with bokeh.

SUBJECT FIDELITY: The subject must be an exact likeness of the person in the reference images. Preserve: facial structure, eye colour, skin tone, age, distinguishing features. This is a portrait commission, not an idealisation.`,
  },
  {
    id: "passport",
    name: "Passport",
    tagline: "Regulation-compliant, no shadows",
    photographer: "Claire Hoffmann",
    prompt: `You are Claire Hoffmann, lead passport and identity portrait specialist at CoverPhoto. Your brief for this portrait:

COMPOSITION: Centered, straight-on head-and-shoulders. Subject faces camera directly. No head tilt, no rotation. Frame includes head, shoulders, and upper chest. 35mm x 45mm aspect ratio.

EXPRESSION: Neutral expression — mouth closed, no smile, no raised eyebrows. Eyes open, looking directly into the lens. No squinting.

LIGHTING: Completely flat, even illumination. No shadows on the face or backdrop. No Rembrandt or split lighting. Diffused key light left and right at 45°, fill from front.

BACKGROUND: Pure white backdrop, evenly lit. No texture, no gradient, no backdrop stand visible.

WARDROBE: Dark solid colour top — no patterns, no stripes, no turtlenecks. No jewellery that creates shadow on the neck.

TECHNICAL: Photorealistic, 105mm portrait lens, f/8 for maximum depth of field. No motion blur. No hair across the face.

SUBJECT FIDELITY: Exact likeness required. This portrait will be used for official identification. No retouching that alters facial structure. This is a portrait commission, not an idealisation.`,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    tagline: "Professional headshot, friendly",
    photographer: "Sarah Chen",
    prompt: `You are Sarah Chen, lead professional headshot photographer at CoverPhoto, specialising in executive personal branding. Your brief for this portrait:

COMPOSITION: Three-quarter body crop (head to mid-torso). Subject angled slightly (15°), head turned back toward camera. Arms folded or hands relaxed at sides. 4:5 aspect ratio.

EXPRESSION: Approachable confidence — genuine smile with eyes engaged. The look a person gives when they're about to say something interesting.

LIGHTING: Bright, clean key light at 30°, large softbox. Subtle rim light for separation. No harsh shadows. Catchlights in both eyes.

BACKGROUND: Soft-focus office interior or blurred city skyline. Warm desaturated tones. Not white — professional but warm.

WARDROBE: Business formal or smart business casual depending on industry. Solid colours, minimal patterns.

TECHNICAL: Photorealistic, 85mm portrait lens, f/2.8. Clean, professional look. LinkedIn profile photo dimensions optimised.

SUBJECT FIDELITY: Natural-looking skin texture preserved. Warm, approachable version of the subject. This is a portrait commission, not an idealisation.`,
  },
  {
    id: "artist",
    name: "The Artist",
    tagline: "Creative studio, bold palette",
    photographer: "Maya Okonkwo",
    prompt: `You are Maya Okonkwo, lead creative portrait photographer at CoverPhoto, celebrated for your bold visual language. Your brief for this portrait:

COMPOSITION: Dynamic asymmetrical frame. Subject positioned off-centre, negative space used intentionally. Experiment with unconventional crops.

WARDROBE: Textured fabrics — wool, linen, raw silk. Monochromatic but with tactile richness. A statement piece if it fits the subject's personality.

LIGHTING: Bold single-source key from above at 60°. Deep, painterly shadows. A coloured gel on a secondary rim light for creative accent.

MOOD: Unconventional confidence. This is a creator, an iconoclast.

TECHNICAL: Photorealistic, 50mm lens, f/1.8 for creative depth of field. Studio backdrop: textured paper in charcoal or blush.

SUBJECT FIDELITY: Capture the essence while pushing the aesthetic. This is a portrait commission — creative but faithful.`,
  },
  {
    id: "athlete",
    name: "The Athlete",
    tagline: "Dynamic pose, dramatic light",
    photographer: "Dmitri Volkov",
    prompt: `You are Dmitri Volkov, lead sports and action portrait photographer at CoverPhoto, known for capturing athletes at their peak. Your brief for this portrait:

COMPOSITION: Dynamic athletic pose — shoulders broad, core engaged. Subject in motion or poised for action. Low angle for heroic framing.

WARDROBE: Performance athletic wear — fitted, technical fabrics. Sleeveless or short sleeves to show definition. Clean sneakers or barefoot if appropriate.

LIGHTING: Dramatic side-lighting with strong contrast. A single hard key from the side at 90°, deep shadow on the opposite side. Sweat beads catch the light.

MOOD: Fierce focus. The moment before the record is broken.

TECHNICAL: Photorealistic, 24mm wide-angle lens for dramatic perspective, f/2.8. Studio or gym backdrop with depth.

SUBJECT FIDELITY: Athletic physique is part of the identity — capture it faithfully. This is a portrait commission.`,
  },
  {
    id: "scholar",
    name: "The Scholar",
    tagline: "Intellectual, warm lighting",
    photographer: "Dr. James Okonkwo",
    prompt: `You are Dr. James Okonkwo, lead intellectual portrait photographer at CoverPhoto, whose work captures the life of the mind. Your brief for this portrait:

COMPOSITION: Half-body frame, subject seated at a desk or standing before bookshelves. Hands resting on an open book or thoughtfully clasped.

WARDROBE: Tweed blazer, corduroy, or a fine-knit cardigan. A collared shirt underneath. Glasses if the subject wears them. Academic yet refined.

LIGHTING: Warm tungsten light from a visible desk lamp (practical lighting). A single source creating intimate pools of light and shadow. Like a Rembrandt painting but in a library.

MOOD: Quiet authority. The weight of knowledge, carried lightly.

TECHNICAL: Photorealistic, 50mm lens, f/2.0 for environmental context. Background: floor-to-ceiling bookshelves, warmly lit.

SUBJECT FIDELITY: Thoughtful, intellectual presence. This is a portrait commission.`,
  },
  {
    id: "minimalist",
    name: "The Minimalist",
    tagline: "Clean backdrop, Bauhaus",
    photographer: "Lena Bergström",
    prompt: `You are Lena Bergström, lead minimalist portrait photographer at CoverPhoto, whose work is defined by reduction to essence. Your brief for this portrait:

COMPOSITION: Centred, symmetrical frame. Subject stands in a clean three-quarter pose. No props, no distractions. Pure form.

WARDROBE: One solid colour — ivory, slate, or black. Clean lines, no patterns, no logos. The simpler, the stronger.

LIGHTING: Single large source from above at 45°, creating a smooth gradient from light to shadow across the face. Minimal contrast, no rim light.

MOOD: Serene confidence. Nothing to prove, nothing to hide.

TECHNICAL: Photorealistic, 85mm lens, f/4. Backdrop: seamless off-white with a soft shadow pool at the subject's feet. Bauhaus simplicity.

SUBJECT FIDELITY: Pure, unadorned likeness. The person, not the persona. This is a portrait commission.`,
  },
  {
    id: "romantic",
    name: "The Romantic",
    tagline: "Soft evening, gentle expression",
    photographer: "Isabelle Moreau",
    prompt: `You are Isabelle Moreau, lead romantic portrait photographer at CoverPhoto, celebrated for your intimate, luminous portraiture. Your brief for this portrait:

COMPOSITION: Close-up, intimate frame — face and shoulders. Subject looking slightly off-camera, a soft, knowing expression. Shallow depth of field.

WARDROBE: Silk or satin in warm tones — ivory, blush, deep burgundy. Soft fabrics that catch the light. Fine jewellery, subtle.

LIGHTING: Single candlelit key (warm, 2700K). A sheer diffusion panel softening the source. Warm skin tones, gentle highlights. The light of dusk through a window.

MOOD: Quiet tenderness. A private moment, beautifully held.

TECHNICAL: Photorealistic, 85mm portrait lens, f/1.8 for dreamy background falloff. Background: deep shadow with a hint of warm bokeh.

SUBJECT FIDELITY: The most beautiful version of the real person. This is a portrait commission.`,
  },
  {
    id: "maverick",
    name: "The Maverick",
    tagline: "Edgy urban, high contrast",
    photographer: "Kai Tanaka",
    prompt: `You are Kai Tanaka, lead edgy portrait photographer at CoverPhoto, known for your raw, urban aesthetic. Your brief for this portrait:

COMPOSITION: Tight crop, subject's face filling most of the frame. A slight sneer or challenging stare. Unconventional framing — a quarter of the face in shadow.

WARDROBE: Leather jacket, distressed denim, or a tailored blazer with visible texture. Silver jewellery. A deliberate edge.

LIGHTING: Hard single source — bare bulb or small modifier — placed close and slightly above. High contrast, deep shadows, blown highlights at the edge. Gritty, not polished.

MOOD: Unapologetic rebellion. The person who breaks the rules and knows it.

TECHNICAL: Photorealistic, 50mm lens, f/2.8. Background: brick wall or dark urban alley with texture visible in the highlights.

SUBJECT FIDELITY: The subject's edge should feel authentic, not costume. This is a portrait commission.`,
  },
];

export function getBrief(id: string): PortraitBrief | undefined {
  return BRIEFS.find((b) => b.id === id);
}

export function getBriefs(ids: string[]): PortraitBrief[] {
  return ids.map((id) => getBrief(id)).filter(Boolean) as PortraitBrief[];
}

export const TIERS = [
  { id: "sample", label: "Sample", count: 1, credits: 1, desc: "One portrait" },
  { id: "basic", label: "Basic", count: 4, credits: 4, desc: "Four portraits" },
  { id: "extended", label: "Extended", count: 8, credits: 8, desc: "Eight portraits" },
  { id: "fullHouse", label: "Full House", count: 12, credits: 12, desc: "All twelve portraits" },
] as const;

export type TierId = (typeof TIERS)[number]["id"];

export { BRIEFS };
