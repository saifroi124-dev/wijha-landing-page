# Telegram notifications

**Step 1 and 2 are done.** Your bot and Chat ID are set. You only need to do **Step 3** below (run one SQL in Supabase).

---

## Step 1 — Get your Chat ID — DONE

1. Open Telegram and open your bot: **[Open @wijha_leads_bot](https://t.me/wijha_leads_bot)**  
   Send: **/start**

2. Then in your **browser** open this link (it will show some text):  
   **[Open this link to get your Chat ID](https://api.telegram.org/bot8680614430:AAGXIL3w1p2L9fW191b2lTNu_yIs2qysNXo/getUpdates)**

3. On that page you’ll see something like:  
   `"chat":{"id": 123456789,`  
   **Copy only the number** (e.g. `123456789`). That’s your Chat ID. Keep it for Step 2.

---

## Step 2 — Put your Chat ID in Supabase — DONE

Your Chat ID (`7643737849`) is already set. Nothing to do.

---

## Step 3 — Turn on the webhook (one time)

1. Open: **[Supabase SQL Editor](https://supabase.com/dashboard/project/ojbmsklrksicujieiprl/sql/new)**

2. In your project open **`supabase/run-once-webhook.sql`** (it already has everything, no keys to paste).

3. Copy the whole file, paste into the SQL Editor, click **Run**.

4. If it says Success (or no error), you're done. Then go to **Project Settings → API** and **regenerate** the service_role key (you shared it earlier).

---

## Done

Submit a test booking on your site. You should get a Telegram message in a few seconds.

If you don’t:
- Check that you did Step 1 (sent /start to the bot and used the getUpdates link).
- Check that in Step 2 you added `TELEGRAM_CHAT_ID` with the number from Step 1.
- Check that in Step 3 you ran the full **`supabase/run-once-webhook.sql`** in the SQL Editor.

If you’re stuck, say which step you’re on (1, 2, or 3) and what you see on the screen.
