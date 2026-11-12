# LOGOS — n8n workflow blueprint

n8n is optional automation. Core login, reading, publishing, follows and comments must work without it.

## Security rules

- Do not put n8n webhook secrets in frontend JavaScript.
- Trigger n8n from a trusted server-side source: Supabase Database Webhooks, Supabase Edge Functions, or a secured intermediary.
- Validate an HMAC/signature or shared secret at the receiving endpoint.
- Use HTTPS.
- Do not send passwords, access tokens, reset links or unnecessary personal data.
- Make workflows idempotent using an event ID.
- Store SMTP/email provider credentials in n8n Credentials, never in workflow JSON.
- Add error handling and avoid logging full user records.
- Test with dummy accounts before enabling.

## Workflow A — Welcome new member

Trigger: trusted server-side event after profile activation.

Expected minimal payload:
```json
{
  "event_id": "unique-event-id",
  "event": "member.created",
  "user_id": "uuid",
  "display_name": "New writer",
  "email": "recipient@example.com"
}
```

Node sequence:
1. Webhook (POST; production URL; authentication/signature validation).
2. Validate required fields and event type.
3. Check event ID against an idempotency store/table.
4. Send welcome email through configured provider.
5. Record successful event ID.
6. Respond with generic success; send failures to an error workflow.

## Workflow B — New article published

Trigger: trusted server-side event when article status changes to `published`.

Minimal payload: event ID, article ID, title, slug, author display name, public URL, published timestamp.

Node sequence:
1. Webhook + signature validation.
2. Validate event and URL host.
3. Deduplicate event ID.
4. Optional: notify admin or send digest/announcement.
5. Record event completion.
6. Error workflow on failure.

Do not expose draft content or private author details.

## Workflow C — New comment notification

Trigger: trusted event after a visible comment is inserted.

Minimal payload: event ID, article author ID, commenter display name, article title/URL, comment excerpt.

Node sequence:
1. Webhook + signature validation.
2. Validate payload and deduplicate.
3. Look up notification preference/email using trusted backend access.
4. Send notification if enabled.
5. Record completion.

Never include hidden comments or private drafts.

## Workflow D — New report alert

Trigger: report inserted.

Node sequence:
1. Webhook + signature validation.
2. Validate target type and report ID.
3. Deduplicate.
4. Send moderation alert to the configured administrator.
5. Do not include sensitive reporter data in broad channels.
6. Record event.

## Workflow E — Weekly community digest

Trigger: Schedule (weekly).
1. Query a trusted backend endpoint for published content from the last seven days.
2. Respect user notification preferences and opt-outs.
3. Build a concise digest.
4. Send only to opted-in members.
5. Log counts, not unnecessary personal data.

## Credentials and deployment

- Configure the n8n instance separately.
- Add email provider credentials through n8n Credentials.
- Configure production webhook URLs in Supabase Edge Functions/database webhook settings.
- Use separate test and production workflows.
- Keep the workflow inactive until the endpoint, signature validation and test email are verified.
- Self-hosted n8n needs an always-on host for continuous automation. A local laptop workflow only runs while the laptop and n8n process are available.
