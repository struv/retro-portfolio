## Vibe Coding Common Security Issues

Coding with cursor and Claude code is awesome. If I had known this tech would exist, I wouldn’t have wasted hundreds of hours learning syntax for multiple languages and focused more on higher level skills. Most important of which is Security, here are some things to look out for

### 1. Rate Limit Your Endpoints

If you forget this, bad actors can crash your application, open you to attacks, or drain your paid resources such as databases.

To prevent this you can use Edge Functions with a rate limiter, Vercel middleware, or even basic IP throttling with 

### 2. Enable Row-Level Security

Users could query other people’s data without this protection. You can enable this in Supabase and use policies like user_id = auth.uid()

### 3. Add CAPTCHA to your auth flows

Without it, bots can make infinite fake accounts

### 4. Enable Web Application Firewall

This blocks bad traffic. Easily enable in Vercel in security settings

### 5. Secure your API keys and secrets

Don’t accidentally upload this to Github lol, people will find your API key and drain your credits.

Instead, store keys in .env files and use server-only functions for anything sensitive.

### 6. Validate Inputs on the Backend

Frontend can be bypassed, so make sure ton have backend validation to prevent injection attacks.

### 7. Clean up Dependencies

Make sure to remove unused packages, you can run npm audit fix or yarn audit. This reduces attack vectors

### 8. Add Basic Monitoring and Logs

Having a robust logging systems can hep you see vulnerabilities before someone else does.

You can use Supabase Logs and Vercel Analytics to track failed logins, high traffic spikes, and unhandled errors.

Vibe coding is a valuable tool in 2025 but it’s important to take security seriously especially when developing enterprise applications that will handle sensitive data and large volumes of users.