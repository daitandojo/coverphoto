#!/usr/bin/env bash
# Generate brand assets using gpt-image-2
# Usage: bash scripts/generate-assets.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

generate_image() {
  local prompt="$1"
  local output="$2"

  echo "Generating: $output"
  curl -s https://api.openai.com/v1/images/generations \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d "{
      \"model\": \"gpt-image-2\",
      \"prompt\": $(echo "$prompt" | jq -Rs '.'),
      \"n\": 1,
      \"size\": \"1024x1024\"
    }" | python3 -c "
import json,sys,urllib.request
d=json.load(sys.stdin)
url=d['data'][0]['url']
urllib.request.urlretrieve(url, '$output')
print('Saved: $output')
"
}

# Generate brand logo
generate_image \
  "A minimalist luxury brand logo for CoverPhoto. An elegant monogram CP in warm platinum serif lettering on a pure black background. Sophisticated editorial fashion-house energy. Clean lines, refined, premium. High-end photography studio watermark." \
  "$PROJECT_DIR/public/logo.png"

# Generate sample portraits for landing page
mkdir -p "$PROJECT_DIR/public/samples"

STYLES=("executive" "founder" "statesperson" "outdoors")
PROMPTS=(
  "Professional executive portrait, man in charcoal suit, headshot, studio lighting, Rembrandt lighting, photorealistic"
  "Entrepreneur portrait, woman in merino sweater, three-quarter turn, warm ambient light, approachable, photorealistic"
  "Formal statesman portrait, man in black tie, dramatic lighting, architectural background, dignified, photorealistic"
  "Casual outdoor portrait, man in open-collar linen shirt, golden hour lighting, natural landscape background, photorealistic"
)

for i in "${!STYLES[@]}"; do
  generate_image "${PROMPTS[$i]}" "$PROJECT_DIR/public/samples/${STYLES[$i]}.jpg"
done

echo "All assets generated."
