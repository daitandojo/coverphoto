export interface SpecialtyField {
  key: string;
  label: string;
  type: "select" | "radio" | "text" | "toggle";
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  tagline: string;
  cost: number;
  fields: SpecialtyField[];
  generatePrompt: (config: Record<string, string>) => string;
}

const SPECIALTIES: Specialty[] = [
  {
    id: "tailored",
    name: "Tailored Photo",
    description: "A fully customised portrait with throne, robe, artefacts, and setting of your choice.",
    tagline: "Royal treatment, your way",
    cost: 4,
    fields: [
      { key: "seating", label: "Seating", type: "select", options: [
        { label: "Ornate throne", value: "ornate wooden throne with gold leaf and red velvet" },
        { label: "Classic armchair", value: "tailored leather armchair with brass studs" },
        { label: "Standing", value: "standing with regal posture, no chair" },
        { label: "Chaise lounge", value: "elegant chaise lounge draped in silk" },
      ]},
      { key: "robe", label: "Attire", type: "select", options: [
        { label: "English king robe", value: "a crimson velvet English king robe with ermine trim" },
        { label: "Victorian coat", value: "a tailored Victorian frock coat with gold buttons" },
        { label: "Modern tuxedo", value: "a classic black tuxedo with bow tie" },
        { label: "Evening gown", value: "a floor-length silk evening gown with subtle jewels" },
      ]},
      { key: "artifact", label: "Artifact", type: "select", options: [
        { label: "Sceptre", value: "a jewel-encrusted royal sceptre held firmly" },
        { label: "Cat on lap", value: "a regal cat sitting calmly on the lap" },
        { label: "Bouquet of tulips", value: "an enormous bouquet of colourful tulips resting in the arms" },
        { label: "Crown", value: "a golden crown placed gently on a velvet cushion beside" },
        { label: "Orb", value: "a golden orb and cross held in the right hand" },
      ]},
      { key: "setting", label: "Setting", type: "select", options: [
        { label: "Palace hall", value: "a grand palace hall with marble columns and crimson drapes" },
        { label: "English court", value: "an English royal court with dark oak panelling and chandeliers" },
        { label: "Pier at sunset", value: "a wooden pier stretching into the sea at golden hour" },
        { label: "Eiffel Tower", value: "a Parisian balcony with the Eiffel Tower lit at dusk" },
        { label: "Garden", value: "a formal English garden with hedges and fountains" },
      ]},
      { key: "celebrity", label: "Include celebrity (optional)", type: "text", placeholder: "Leave blank or enter a name (e.g. The Queen, Napoleon)" },
    ],
    generatePrompt: (cfg) =>
      `Portrait of a person, ${cfg.robe || "regal attire"}, seated on ${cfg.seating || "a throne"}. ` +
      `Holding or accompanied by ${cfg.artifact || "a royal sceptre"}. Setting: ${cfg.setting || "a grand palace hall"}. ` +
      `${cfg.celebrity ? `Standing beside them is ${cfg.celebrity}.` : ""} ` +
      `Photorealistic, 85mm portrait lens, masterful studio lighting, Canon R5, RAW quality. The subject is an exact likeness of the reference person.`,
  },
  {
    id: "bridal",
    name: "Bridal Portrait",
    description: "A full-body portrait as a bride or groom in exquisite wedding attire.",
    tagline: "Your wedding, immortalised",
    cost: 4,
    fields: [
      { key: "role", label: "Role", type: "radio", options: [
        { label: "Bride", value: "bride" },
        { label: "Groom", value: "groom" },
      ]},
      { key: "dress", label: "Dress style", type: "select", options: [
        { label: "Classic white gown", value: "a classic white lace wedding gown with a cathedral train" },
        { label: "Modern minimalist", value: "a modern minimalist silk wedding dress with clean lines" },
        { label: "Vintage", value: "a vintage 1950s ivory wedding dress with full skirt" },
        { label: "Prince charming suit", value: "a tailored white-tie tuxedo with tails" },
      ]},
      { key: "veil", label: "Veil / Headwear", type: "select", options: [
        { label: "Long cathedral veil", value: "a long cathedral-length veil with lace edge" },
        { label: "Birdcage veil", value: "a short birdcage veil with a vintage feel" },
        { label: "Floral crown", value: "a crown of fresh white roses and baby's breath" },
        { label: "Top hat", value: "a silk top hat with a satin band" },
      ]},
      { key: "bouquet", label: "Bouquet", type: "select", options: [
        { label: "White roses", value: "a cascading bouquet of white roses and eucalyptus" },
        { label: "Wildflowers", value: "a hand-tied bouquet of colourful wildflowers" },
        { label: "Tulips", value: "a bouquet of ivory and blush tulips" },
        { label: "Simple single stem", value: "a single long-stemmed red rose held elegantly" },
      ]},
      { key: "setting", label: "Setting", type: "select", options: [
        { label: "Church", value: "a sunlit stone church with stained glass windows" },
        { label: "Garden", value: "a blooming English garden with a wrought-iron archway" },
        { label: "Beach", value: "a white sand beach at golden hour with gentle waves" },
        { label: "Ballroom", value: "a grand ballroom with crystal chandeliers" },
      ]},
    ],
    generatePrompt: (cfg) =>
      `Full-body wedding portrait of a ${cfg.role === "groom" ? "man" : "woman"} wearing ${cfg.dress || "a classic white lace wedding gown"}. ` +
      `${cfg.role === "bride" ? `Wearing ${cfg.veil || "a cathedral veil"}, holding ${cfg.bouquet || "a bouquet of white roses"}.` : "Wearing a silk top hat."} ` +
      `Setting: ${cfg.setting || "a sunlit stone church"}. Photorealistic, full-body, 50mm lens, f/2.0, Canon R5, RAW. ` +
      `The subject is an exact likeness of the reference person.`,
  },
  {
    id: "passport-strip",
    name: "Passport Strip",
    description: "Regulation-compliant passport photos in strip format. Light beige background, no shadows, no smile, no objects.",
    tagline: "Official, compliant, ready",
    cost: 8,
    fields: [
      { key: "background", label: "Background", type: "select", options: [
        { label: "Light beige (official)", value: "light beige uniform background" },
        { label: "Pure white", value: "pure white background" },
        { label: "Light grey", value: "light grey uniform background" },
      ]},
    ],
    generatePrompt: (cfg) =>
      `Passport-style portrait of the person. Centred, straight-on, neutral expression, mouth closed, no smile, eyes open looking directly into the lens. ${cfg.background || "Light beige uniform background"}. ` +
      `No shadows on face or background. Even, flat, diffused lighting. Dark solid colour top, no patterns. Photorealistic, 105mm lens, f/8, maximum depth of field. ` +
      `The subject must be an exact likeness of the reference person.`,
  },
  {
    id: "hair-style",
    name: "Hair Styles",
    description: "Six variations of the same person with different hairstyles, with and without glasses.",
    tagline: "Find your next look",
    cost: 8,
    fields: [
      { key: "glasses", label: "Glasses", type: "radio", options: [
        { label: "With glasses", value: "wearing elegant tortoiseshell glasses" },
        { label: "Without glasses", value: "no glasses" },
        { label: "Both", value: "with and without glasses" },
      ]},
    ],
    generatePrompt: (cfg) =>
      `Studio portrait of a person. ` +
      `${cfg.glasses || "No glasses"}. Clean white background, soft even lighting, head and shoulders framing. ` +
      `Photorealistic, 85mm lens, f/2.8. The subject is an exact likeness of the reference person.`,
  },
  {
    id: "couple",
    name: "Couple Portrait",
    description: "A portrait combining two people (spouses, siblings, parent and child).",
    tagline: "Two souls, one frame",
    cost: 6,
    fields: [
      { key: "relationship", label: "Relationship", type: "select", options: [
        { label: "Spouses", value: "married couple" },
        { label: "Father and child", value: "father and child" },
        { label: "Mother and child", value: "mother and child" },
        { label: "Siblings", value: "brothers and sisters" },
        { label: "Engaged couple", value: "engaged couple" },
      ]},
      { key: "pose", label: "Pose / Interaction", type: "select", options: [
        { label: "She kisses his cheek", value: "she affectionately kisses him on the cheek, he smiles warmly" },
        { label: "State portrait", value: "standing side by side, formal posture, hands clasped together" },
        { label: "Wedding portrait", value: "facing each other, holding hands, foreheads gently touching" },
        { label: "Walking together", value: "walking arm in arm, laughing, candid joyful moment" },
      ]},
      { key: "setting", label: "Setting", type: "select", options: [
        { label: "Studio", value: "professional studio with seamless backdrop" },
        { label: "Garden", value: "a blooming garden with soft natural light" },
        { label: "City rooftop", value: "a city rooftop at sunset with skyline behind" },
        { label: "Living room", value: "a warm, elegant living room with fireplace" },
      ]},
    ],
    generatePrompt: (cfg) =>
      `Couple portrait of two people, a ${cfg.relationship || "married couple"}. ` +
      `Pose: ${cfg.pose || "standing side by side, holding hands"}. Setting: ${cfg.setting || "a professional studio with seamless backdrop"}. ` +
      `Photorealistic, 50mm lens, f/2.0, warm natural light, Canon R5, RAW quality. Both subjects are exact likenesses of the reference persons.`,
  },
  {
    id: "time-travel",
    name: "Time Travel",
    description: "Transport the subject to a historical era with authentic costume and setting.",
    tagline: "A portrait from another age",
    cost: 4,
    fields: [
      { key: "era", label: "Era", type: "select", options: [
        { label: "Victorian England", value: "Victorian England, 1880s" },
        { label: "Roaring Twenties", value: "the Roaring Twenties, Art Deco style" },
        { label: "Renaissance Italy", value: "Renaissance Italy, 1500s" },
        { label: "Ancient Egypt", value: "Ancient Egypt, the age of pharaohs" },
        { label: "Medieval Knight", value: "Medieval Europe, a knight in armour" },
        { label: "1920s Hollywood", value: "1920s Hollywood golden age" },
        { label: "Regency England", value: "Regency England, Jane Austen era" },
      ]},
      { key: "setting", label: "Setting", type: "select", options: [
        { label: "Period studio", value: "a historically accurate interior with period furnishings" },
        { label: "Outdoor landscape", value: "an outdoor landscape from the period" },
        { label: "Formal hall", value: "a grand formal hall of the period" },
      ]},
    ],
    generatePrompt: (cfg) =>
      `Portrait of a person from ${cfg.era || "Victorian England"}, transported back in time. ` +
      `They wear authentic period costume, posed in ${cfg.setting || "a historically accurate interior with period furnishings"}. ` +
      `Photorealistic, period-appropriate portrait style, natural lighting, 85mm lens equivalent. ` +
      `The subject is an exact likeness of the reference person, recognisable despite the period transformation.`,
  },
  {
    id: "celebrity-morph",
    name: "Celebrity Morph",
    description: "The subject morphed into a celebrity of your choice. Name a celebrity and the AI renders the subject in their style.",
    tagline: "Your icon, your face",
    cost: 6,
    fields: [
      { key: "celebrity", label: "Celebrity name", type: "text", placeholder: "e.g. Audrey Hepburn, James Dean, David Bowie" },
      { key: "style", label: "Style", type: "select", options: [
        { label: "Iconic photo", value: "recreated in the style of the celebrity's most iconic photograph" },
        { label: "Red carpet", value: "red carpet event, paparazzi lighting" },
        { label: "Studio portrait", value: "classic studio portrait, celebrity aesthetic" },
      ]},
    ],
    generatePrompt: (cfg) =>
      `${cfg.celebrity ? `Portrait of a person styled to resemble ${cfg.celebrity}, ` : "Portrait of a person in iconic celebrity style, "}` +
      `${cfg.style || "in the style of the celebrity's most iconic photograph"}. ` +
      `The facial structure remains that of the reference subject, but hair, makeup, wardrobe, and overall aesthetic reference the chosen celebrity. ` +
      `Photorealistic, masterful lighting, editorial quality.`,
  },
  {
    id: "holiday-france",
    name: "Holiday France",
    description: "The subject in iconic French locations having the time of their life — each render is a different, surprising holiday snapshot.",
    tagline: "A getaway in every frame",
    cost: 4,
    fields: [
      { key: "region", label: "Region", type: "select", options: [
        { label: "South (Côte d'Azur)", value: "the French Riviera, Côte d'Azur, with turquoise water and yachts" },
        { label: "North (Normandy)", value: "Normandy with dramatic cliffs, apple orchards, and half-timbered villages" },
        { label: "Paris", value: "Paris with the Eiffel Tower, charming cafés, and cobblestone streets" },
        { label: "Nice", value: "Nice with its Promenade des Anglais, palm trees, and pastel buildings" },
        { label: "Alps (Chamonix)", value: "the French Alps near Chamonix with snow-capped peaks and alpine meadows" },
        { label: "Cognac (vineyards)", value: "the Cognac region with rolling vineyards, chateaux, and wine cellars" },
      ]},
      { key: "activity", label: "Activity", type: "select", options: [
        { label: "Kite surfing", value: "kite surfing on sparkling turquoise water, wind in the hair, wetsuit, exhilarated expression" },
        { label: "Lying in the sun", value: "lying on a sunny beach towel, sunglasses, relaxed, a cool drink beside, soft sand" },
        { label: "Racing bike", value: "cycling on a racing bike through lavender fields or mountain roads, windblown, determined smile" },
        { label: "Off to the beach", value: "walking toward the beach with a towel over the shoulder, flip-flops, carefree, sun hat" },
        { label: "On a hike", value: "hiking on an alpine trail with a backpack, walking poles, surrounded by wildflowers and mountain views" },
        { label: "Café drink", value: "sitting at a Parisian café terrace, espresso or glass of wine, people-watching, beret" },
        { label: "Dinner with friends", value: "laughing at a long dinner table with friends, rustic French cuisine, warm string lights overhead, clinking glasses" },
      ]},
      { key: "companions", label: "With others", type: "select", options: [
        { label: "Solo", value: "alone, enjoying the moment" },
        { label: "With friends", value: "with a group of happy friends, all laughing and celebrating" },
        { label: "As a couple", value: "with a romantic partner, arms around each other, looking lovingly" },
      ]},
    ],
    generatePrompt: (cfg) =>
      `Holiday snapshot of the subject on vacation in ${cfg.region || "the French Riviera"}. ` +
      `Activity: ${cfg.activity || "enjoying the sun and sea"}. ` +
      `Companions: ${cfg.companions || "alone"}. ` +
      `Expression: joyful, radiant smile, genuinely happy, carefree. ` +
      `Candid, natural, vibrant colours, golden sunlight, photorealistic vacation photography, 35mm lens, Canon R5. ` +
      `Every image should feel like a spontaneous holiday moment. The subject is the exact likeness of the reference person.`,
  },
];

export function getSpecialty(id: string): Specialty | undefined {
  return SPECIALTIES.find((s) => s.id === id);
}

export { SPECIALTIES };
