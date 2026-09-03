# Vercel KV Setup (Required for persistent leaderboard)

## One-time setup (2 minutes)

1. Go to https://vercel.com/dashboard
2. Select your **streaktrader** project
3. Click **Storage** tab → **Create Database** → **KV**
4. Choose a region (closest to you)
5. Click **Create** → **Connect to Project** → select **streaktrader**

That's it. Vercel automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` env vars.

## Verify it works

After deployment, check:
```bash
curl https://streaktrader.sithunyein.com/api/leaderboard
```

Response should show `"storage":"kv"` instead of `"storage":"memory"`.

## How it works

- **With KV**: Streak data persists across serverless cold starts. Leaderboard shows real cross-device data.
- **Without KV** (current): Data lives in serverless memory. Resets on every cold start (~1-2 hours of inactivity). Works fine for demo recording.
