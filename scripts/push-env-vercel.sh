#!/bin/bash
# Run this on your local machine: bash scripts/push-env-vercel.sh
# Requires: curl
# Usage: VERCEL_TOKEN=<token> bash scripts/push-env-vercel.sh [project-name]

TOKEN="${VERCEL_TOKEN:?Set VERCEL_TOKEN env var before running this script}"
PROJECT="${1:-}"

# Discover project if not provided
if [ -z "$PROJECT" ]; then
  echo "Fetching Vercel projects..."
  PROJECTS=$(curl -s "https://api.vercel.com/v9/projects" \
    -H "Authorization: Bearer $TOKEN")
  echo "$PROJECTS" | node -e "
    const d=require('fs').readFileSync('/dev/stdin','utf8');
    const j=JSON.parse(d);
    console.log('Your projects:');
    (j.projects||[]).forEach((p,i)=>console.log(i+1+'.', p.name, '('+p.id+')'));
  " 2>/dev/null
  echo ""
  read -p "Enter project name from above: " PROJECT
fi

echo "Pushing env vars to project: $PROJECT"

push_env() {
  local KEY="$1"
  local VAL="$2"
  local TYPE="${3:-encrypted}"  # encrypted or plain

  BODY=$(node -e "console.log(JSON.stringify({
    key: process.argv[1],
    value: process.argv[2],
    type: '$TYPE',
    target: ['production','preview','development']
  }))" "$KEY" "$VAL")

  RES=$(curl -s -X POST "https://api.vercel.com/v10/projects/${PROJECT}/env" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$BODY")

  if echo "$RES" | grep -q '"key"'; then
    echo "  ✓ $KEY"
  else
    # Try upsert if already exists
    RES2=$(curl -s -X PATCH "https://api.vercel.com/v10/projects/${PROJECT}/env" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$BODY")
    echo "  ~ $KEY (updated)"
  fi
}

# ── Supabase ────────────────────────────────────────────────────────────────
push_env "NEXT_PUBLIC_SUPABASE_URL"    "https://synzqjuoxxruzwswsmhs.supabase.co" "plain"
push_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "sb_publishable_pfB1IdQ0ZervuTTME30IkA_5U8WVHOi" "plain"
push_env "SUPABASE_SERVICE_ROLE_KEY"   "xsb_secret_lsOSKlhkXTCejkp_UTrK_Q_S5Cnzcs"
push_env "DATABASE_URL"                "postgresql://postgres:ix%25%2A8W.%24_6Tdjm3@db.synzqjuoxxruzwswsmhs.supabase.co:5432/postgres"

# ── Gemini ──────────────────────────────────────────────────────────────────
push_env "GOOGLE_API_KEY"              "AIzaSyBdbwg3kAQXzK-FJvC9jMCJW8J7pUiqWUg"
push_env "GEMINI_FLASH_MODEL"          "gemini-2.5-flash" "plain"
push_env "GEMINI_PRO_MODEL"            "gemini-2.5-pro"   "plain"

# ── Site ────────────────────────────────────────────────────────────────────
# Update this after first Vercel deploy to your actual URL
push_env "NEXT_PUBLIC_SITE_URL"        "https://equity.vercel.app" "plain"

# ── Ingestion ───────────────────────────────────────────────────────────────
push_env "PUBMED_API_KEY"              "889adb76ad93ff0e1e58eb641feb272f2d09"
push_env "PUBMED_EMAIL"               "vykeshcc@gmail.com" "plain"
push_env "CRON_SECRET"                "$(openssl rand -hex 20)" "plain"

# ── Feature flags ───────────────────────────────────────────────────────────
push_env "ENABLE_AUTO_INGEST"          "true" "plain"

echo ""
echo "Done! Trigger a redeploy in the Vercel dashboard to apply."
