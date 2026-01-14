# Digital Garden - Multiplayer Web Game

A multiplayer 8-bit pixel art digital garden where users can explore a miniature suburb, plant hand-drawn flowers, and adopt cats that follow them around.

## Features

- 🌸 **Plant Flowers**: Draw your own flowers crayon-style and plant them in the garden
- 🐱 **Adopt Cats**: Choose from 5 different cats that will follow you around
- 👥 **Multiplayer**: See other players walking around in real-time
- 🎮 **Pokemon-style**: Classic 8-bit graphics with bouncy walking animations

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### Setup

1. **Clone and install dependencies:**
   ```bash
   cd digital-garden
   npm run install:all
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key

3. **Set up Supabase database:**
   Run the following SQL in your Supabase SQL editor:
   ```sql
   CREATE TABLE flowers (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       x INTEGER NOT NULL,
       y INTEGER NOT NULL,
       image_data TEXT NOT NULL,
       created_by TEXT,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the game:**
   Navigate to `http://localhost:5173`

## Controls

- **Arrow Keys / WASD**: Move your character
- **F**: Open flower drawing modal
- **C**: Open cat adoption modal
- **Enter**: Place a flower (when in placement mode)

## Tech Stack

- **Frontend**: Vite + Vanilla JavaScript
- **Backend**: Node.js + Express + Socket.io
- **Database**: Supabase (PostgreSQL)
- **Content Filter**: TensorFlow.js (MobileNet)

## Testing

```bash
# Run all tests
npm test

# Run client tests only
npm run test:client

# Run server tests only
npm run test:server
```

## License

MIT

---

## Deployment & Hosting

### Exact Step-by-Step: Vercel (Frontend) + Railway (Backend)

---

#### Step 1: Push to GitHub
```bash
cd /Users/mayankjha/Desktop/test\ antigravity/digital-garden
git init
git add .
git commit -m "Initial commit"
gh repo create digital-garden --public --push
# Or manually create repo on github.com and push
```

---

#### Step 2: Deploy Backend to Railway

1. Go to **[railway.app](https://railway.app)** → Sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `digital-garden` repository
4. Click **"Add variables"** and add:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   PORT=3000
   ```
5. Click **Settings** → Set **Root Directory** to `server`
6. Click **Settings** → Set **Start Command** to `npm start`
7. Wait for deploy → Copy the **public URL** (e.g., `https://digital-garden-production.up.railway.app`)

---

#### Step 3: Update Client Config

Edit `client/src/network/SocketClient.js` and update the server URL:
```javascript
const SERVER_URL = 'https://your-railway-url.up.railway.app';
```

Or create `client/.env.production`:
```
VITE_SERVER_URL=https://your-railway-url.up.railway.app
```

---

#### Step 4: Deploy Frontend to Vercel

1. Go to **[vercel.com](https://vercel.com)** → Sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your `digital-garden` repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   ```
   VITE_SERVER_URL=https://your-railway-url.up.railway.app
   ```
6. Click **Deploy**

---

#### Step 5: Configure CORS on Backend

Update `server/src/index.js` to allow your Vercel domain:
```javascript
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'https://your-app.vercel.app'],
        methods: ['GET', 'POST']
    }
});
```

Commit and push → Railway auto-redeploys.

---

#### Step 6: Verify Deployment

1. Open your Vercel URL (e.g., `https://digital-garden.vercel.app`)
2. Enter nickname and enter game
3. Check browser console for WebSocket connection
4. Open in 2nd tab to verify multiplayer works

---

### Alternative: Render (All-in-One)

1. Go to **[render.com](https://render.com)**
2. **Backend**: New Web Service → Root: `server`, Start: `npm start`
3. **Frontend**: New Static Site → Root: `client`, Build: `npm run build`, Publish: `dist`
4. Set `VITE_SERVER_URL` env var on frontend

---

### Environment Variables Checklist

| Variable | Location | Value |
|----------|----------|-------|
| `SUPABASE_URL` | Railway/Server | Your Supabase URL |
| `SUPABASE_ANON_KEY` | Railway/Server | Your Supabase key |
| `VITE_SERVER_URL` | Vercel/Client | Railway backend URL |

---

### Post-Deploy Checklist
- [ ] Supabase `flowers` table exists
- [ ] Music plays (local asset bundled)
- [ ] Multiplayer works (2 tabs see each other)
- [ ] Flowers persist after refresh

