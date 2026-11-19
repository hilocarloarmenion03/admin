# Password recovery

Each Loxada sign-in page offers **Forgot password?**. Readers, subscribers, buyers, suppliers, department admins, executives, and technical admins use the email address on their account. They open the reset link in the browser that requested it, choose a new password, and sign in again. Existing department roles, account access rules, and supplier invitation requirements continue to apply.

The request screen uses a neutral confirmation for any valid email address. Supabase Auth handles link expiry and request limits. The portal exchanges the one-time code, then restricts the reset form to that recovery session for ten minutes.

## Hosted Auth settings

Set **Authentication → URL Configuration → Site URL** in each Supabase project to the corresponding production URL.

| System | Site URL |
| --- | --- |
| Headquarters | https://admin-nu-rose.vercel.app |
| Manga & Light Novel | https://mangalightnovel-da1l.vercel.app |
| Anime | https://anime-rust-zeta.vercel.app |
| Merchandise | https://merch-three-fawn.vercel.app |

The app sends the production root as the recovery return URL. If `APP_ORIGIN` is set, its origin should match the site's URL. Preserve the redirects used by existing confirmation and supplier invitation emails.

The **Reset password** email template must link to Supabase’s `{{ .ConfirmationURL }}` so Auth can issue the one-time code. Production email delivery uses the project's Supabase SMTP configuration. The Supabase default email service is restricted to project team recipients. Configure a production SMTP sender for external recipients. [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls) · [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

When verifying a hosted environment, request a link for an authorized test mailbox and open it from the browser that requested it. Check that the link opens the matching production site and that the account reaches the same dashboard after sign-in.
