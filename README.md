# Complaints App 💝

A romantic conflict-resolution app for couples to manage complaints, compensations, and reconciliations with style and grace.

## Features

- 🎯 Submit and track relationship complaints
- 💖 Manage a pool of compensations (girlfriend's domain)
- 🎲 Scratch-card compensation selection system
- 🔥 Escalation and resolution workflow
- 💬 Threaded replies with emoji reactions
- 📊 Stats and progress tracking

## Tech Stack

- React + Vite
- Supabase (Backend & Auth)
- TailwindCSS (Styling)
- Framer Motion (Animations)

## Setup

1. Clone the repository
```bash
git clone [repository-url]
cd complaints-app
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL migration in `supabase/migrations/20240318000000_initial_schema.sql`
   - Copy your project URL and anon key to the `.env` file

5. Start the development server
```bash
npm run dev
```

## User Roles

- 👑 Girlfriend (Queen)
  - Can create/manage compensations
  - Can escalate/de-escalate complaints
  - Can resolve complaints
  - Can reply and react to posts

- 🤴 Boyfriend (King)
  - Can create complaints
  - Can offer compensations
  - Can fulfill selected compensations
  - Can reply and react to posts

## Contributing

This is a personal project for managing relationship dynamics. Feel free to fork and adapt for your own use, but please maintain the spirit of love and respect! 💝

## License

MIT - Made with love, for love 💕
