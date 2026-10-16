# D.M & W.O.G Church Portal (Next.js + Supabase)
1. Create a free project at supabase.com. In the SQL editor run `supabase/schema.sql`.
2. Authentication > Users: add yourself (email + password). Then run in SQL:
   `insert into staff(user_id,role) values ('YOUR-USER-UUID','super');`
   For a province admin: `insert into staff(user_id,role,province) values ('UUID','province','Hwedza');`
3. Copy `.env.local.example` to `.env.local` and fill in the two values.
4. `npm install` then `npm run dev`. Public site: `/`. Admin: `/admin`.
5. Deploy free on Vercel (add the same two env vars).
