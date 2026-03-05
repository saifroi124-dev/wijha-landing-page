# Telegram notifications for new leads (fully free)

When someone submits the booking form, you get a Telegram message on your phone with their name, phone, and source.

---

## Quick setup (Wijha project)

Your bot: **[@wijha_leads_bot](https://t.me/wijha_leads_bot)**  
Your Supabase function URL: `https://ojbmsklrksicujieiprl.supabase.co/functions/v1/notify-telegram`

**Security:** If you shared your bot token anywhere (e.g. in a chat), go to [@BotFather](https://t.me/BotFather), send `/revoke`, select your bot, and get a **new token**. Use the new token below; the old one is no longer safe.

1. **Get your chat ID**
   - Open [t.me/wijha_leads_bot](https://t.me/wijha_leads_bot) and send **/start** (or any message).
   - In your browser open:  
     `https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates`  
     (replace `YOUR_BOT_TOKEN` with your current token.)
   - In the JSON find `"chat":{"id": 123456789, ...}` — that number is your **chat ID**.

2. **Deploy and set secrets** (from the project folder):
   ```powershell
   cd "c:\Users\Med Saief Allah\Desktop\WIJHA LANDING PAGE"
   npx supabase link --project-ref ojbmsklrksicujieiprl
   npx supabase secrets set TELEGRAM_BOT_TOKEN=YOUR_TOKEN TELEGRAM_CHAT_ID=YOUR_CHAT_ID
   npx supabase functions deploy notify-telegram
   ```

3. **Add the Database Webhook** in Supabase:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ojbmsklrksicujieiprl) → **Database** → **Webhooks** → **Create webhook**.
   - **Table:** `public.leads` · **Events:** Insert only.
   - **URL:** `https://ojbmsklrksicujieiprl.supabase.co/functions/v1/notify-telegram`
   - **Headers:** add `Authorization` = `Bearer YOUR_SERVICE_ROLE_KEY` (from **Project Settings** → **API**).
   - Save.

   Or run this in **SQL Editor** (replace `YOUR_SERVICE_ROLE_KEY` with the key from **Project Settings** → **API**):
   ```sql
   create extension if not exists pg_net with schema extensions;
   create trigger "notify_telegram_on_lead"
   after insert on public.leads
   for each row
   execute function supabase_functions.http_request(
     'https://ojbmsklrksicujieiprl.supabase.co/functions/v1/notify-telegram',
     'POST',
     '{"Content-Type":"application/json", "Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}',
     '{}',
     '5000'
   );
   ```

4. **Test:** Submit a booking on your site; you should get a Telegram message within a few seconds.

---

## 1. Create a Telegram bot

1. Open Telegram and search for **@BotFather**.
2. Send: `/newbot`
3. Choose a name (e.g. **Wijha Leads**).
4. Choose a username (e.g. `wijha_leads_bot` — must end in `bot`).
5. Copy the **token** BotFather gives you (looks like `7123456789:AAH...`). You’ll need it in step 4.

---

## 2. Get your chat ID

Your bot can only send messages to you after you’ve talked to it once.

1. In Telegram, search for your bot by its username (e.g. `@wijha_leads_bot`) and open the chat.
2. Send any message to the bot, e.g. **Hello** or **/start**.
3. In your browser, open this URL (replace `YOUR_BOT_TOKEN` with the token from step 1):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. In the JSON you see something like: `"chat":{"id": 123456789, ...}`.  
   That number (`123456789`) is your **chat ID**. Copy it for step 4.

---

## 3. Deploy the Edge Function in Supabase

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and log in:
   ```bash
   npm install -g supabase
   supabase login
   ```
2. Link your project (from your project’s dashboard URL: `https://supabase.com/dashboard/project/<PROJECT_REF>`):
   ```bash
   cd "c:\Users\Med Saief Allah\Desktop\WIJHA LANDING PAGE"
   supabase link --project-ref YOUR_PROJECT_REF
   ```
3. Set the secrets (use your real bot token and chat ID):
   ```bash
   supabase secrets set TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   supabase secrets set TELEGRAM_CHAT_ID=123456789
   ```
4. Deploy the function:
   ```bash
   supabase functions deploy notify-telegram
   ```
5. Note your function URL (you’ll need it in step 4):
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-telegram
   ```

---

## 4. Add a Database Webhook so each new lead triggers the function

1. In Supabase go to **Database** → **Webhooks** (or **Project Settings** → **Integrations** → **Webhooks**).
2. Click **Create a new webhook**.
3. Set:
   - **Name:** e.g. `Notify Telegram on new lead`
   - **Table:** `public.leads`
   - **Events:** tick **Insert**
   - **URL:**  
     `https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-telegram`
4. If your dashboard has a **Headers** section, add:
   - **Key:** `Authorization`  
   - **Value:** `Bearer YOUR_SERVICE_ROLE_KEY`  
   (Find the service role key in **Project Settings** → **API**.)
5. Save the webhook.

If your Supabase version uses **SQL** instead of a webhook UI, run this in the SQL Editor (replace the URL and, if you use a secret, the header):

```sql
-- Enable pg_net if not already
create extension if not exists pg_net with schema extensions;

-- Replace YOUR_PROJECT_REF with your Supabase project ref
-- Replace YOUR_SERVICE_ROLE_KEY with your service_role key (Project Settings → API)
create trigger "notify_telegram_on_lead"
after insert on public.leads
for each row
execute function supabase_functions.http_request(
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-telegram',
  'POST',
  '{"Content-Type":"application/json", "Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}',
  '{}',
  '5000'
);
```

---

## 5. Test

1. Submit a test booking on your site (name + phone + source).
2. Within a few seconds you should get a Telegram message like:
   ```
   🆕 طلب جديد — وِجْهة
   الاسم: Test User
   الهاتف: 12 345 678
   المصدر: أصحاب المشاريع
   ```

---

## Optional: secret for the webhook

To avoid anyone who knows the function URL from triggering it:

1. Choose a long random string (e.g. `mySecret123!xyz`).
2. Set it in Supabase:
   ```bash
   supabase secrets set NOTIFY_WEBHOOK_SECRET=mySecret123!xyz
   ```
3. Redeploy:
   ```bash
   supabase functions deploy notify-telegram
   ```
4. In the Database Webhook, add a header:
   - **Key:** `x-webhook-secret`
   - **Value:** `mySecret123!xyz`  
   (If you used the SQL trigger, update the `Authorization` header section to include this header in the JSON.)

---

## Troubleshooting

- **No message in Telegram**  
  - Check that you sent at least one message to the bot (step 2).  
  - Check Supabase **Edge Functions** → **notify-telegram** → **Logs** for errors.  
  - Check **Database** → **Webhooks** (or **net** schema) for failed requests.

- **401 Unauthorized**  
  - If you use the SQL trigger, make sure the `Authorization: Bearer YOUR_SERVICE_ROLE_KEY` header is correct.  
  - If you set `NOTIFY_WEBHOOK_SECRET`, ensure the webhook sends the same value in `x-webhook-secret`.

- **502 / Telegram send failed**  
  - Confirm `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set correctly in Supabase secrets.  
  - Confirm `chat_id` is the one you got from `getUpdates` after messaging the bot.
