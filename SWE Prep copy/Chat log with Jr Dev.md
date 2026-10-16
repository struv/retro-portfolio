
Just wanted to confirm this with you.

She asked to remove “HARK” and “HITS” for males 22+.

However, these aren’t coming from the “Adult 22+” group. They’re coming from “Adult 21+,” which is currently active on the Adult Well visit.

What I found:

- “Adult 22+” already has neither HARK nor HITS.
- “Adult 21+” has HARK but not HITS.
- “Adult 21+” is not gender/age restricted, so it’s being sent to all patients, which is why males are receiving it.

Claude says:

1. Remove HARK from “Adult 21+” → this stops it for males, but also removes it for females.
2. Switch Adult Well to “Adult 22+” and add “Females 22–49Y” for HARK/HITS so only eligible females receive it.  
    (im not sure about this switching thing)

> PLEASE REMOVE HARK & HIT FORMS FROM MALE PTS 22 & UP - ONLY FEMALES 22 & UP !! Akila Lankathilaka Pratheesh Thangarajah > **William Struve**
> 
> Thanks for identifying the issue, do you think you'd be able to fix it? I can also work on it if needed

I’ve applied the fix and deployed it. It looks good so far. I’ll continue monitoring today to make sure everything is working as expected. > **Akila Lankathilaka**
> 
> Just wanted to confirm this with you. She asked to remove “HARK” and “HITS” for males 22+. However, these aren’t coming from the “Adult 22+” group. They’re coming from “Adult 21+,” which is currently…

any update on this? Yeah I think you should switch it Yeah you can proceed with what claude recommended, no issues with changing those groups > **Akila Lankathilaka**
> 
> I’ve applied the fix and deployed it. It looks good so far. I’ll continue monitoring today to make sure everything is working as expected.

Thanks for fixing the issue! Anytime! ![🙂](https://statics.teams.cdn.office.net/evergreen-assets/personal-expressions/v2/assets/emoticons/smile/default/20_f.png "Anytime! 🙂")   > **William Struve**
> 
> Yeah you can proceed with what claude recommended, no issues with changing those groups

Good morning, Will!

I think you'll have to take a look at this when you have some time. It's actually pretty complicated because changing the form groups also changes the entire set of forms patients receive for the visit type so I might have to bother you more to map everything correctly lol. 

Request:  
Remove HARK & HITS for males 22+, but keep them for females 22+.

What I found:

- Adult Well Exam only has "Adult 21+" attached. There are no age or gender filters, so everyone gets the same form group.
- "Adult 21+" has HARK, but it never had HITS. So everyone is currently only getting HARK.
- "Females 22-49Y" (contains HARK + HITS and is female-only) and "Adult 22+" (contains no HARK or HITS) already exist, but neither is attached to Adult Well.

Removing HARK from "Adult 21+" is easy. It's just one click. But that removes it for everyone, including females and 21 year olds (fine ig?).

Switching Adult Well to "Adult 22+" won't work either because it's a different form group. Patients would lose Hep Risk and Vaccine Screening Adults, and gain TAPS instead. That's not what Natalie asked for.

The tricky part is keeping HARK + HITS for females only. The system only assigns one matching form group per patient, so I can't just attach both "Adult 21+" and "Females 22-49Y". The system could still pick the generic group instead of the female-specific one.

Claude suggested this approach:

- Remove HARK from "Adult 21+" (UI).
- Add Hep Risk and Vaccine Screening Adults to "Females 22-49Y" so females don't lose those forms (CONFIRM IF ITS FINE).
- Attach "Females 22-49Y" to Adult Well (UI).
- Add a small code change so that if both groups match, the system prioritizes the female-specific group over the generic one.
- Do the same for the Spanish versions. Hey Akila, I'll be able to fix this on Thursday probably. My schedule is completely busy until then haha > **William Struve**
> 
> Hey Akila, I'll be able to fix this on Thursday probably. My schedule is completely busy until then haha

Haha, sounds good. Thanks for the update! Yo actually will have time to do it tmrw 😂 Important!

Hey Will, Modulo isn't working. Bill overdue i think? > **Akila Lankathilaka**
> 
> Hey Will, Modulo isn't working. Bill overdue i think?

yeah, thanks for finding the issue haha > **William Struve**
> 
> yeah, thanks for finding the issue haha

Ayee, no problem! 😂

Btw, I got called into the boardroom and had to answer  bunch of questions about why we couldn't pay it, what happened, and all that. Hopefully it wasn't an inquiry or something. I was panicking too ngl. 😭 Especially after you said you couldn't access AWS lol. Thank God it was just Vercel. 😂

is Everything's good? Mr. Sunil wasn't upset or anything? Damn lol that's stressful, it was kind of like that back here as well. Sunil is pretty happy though now that we got it back online, I don't think it will be an issue haha I got AWS access back, I just had to wait for support to call me back and fix everything btw, I was checking the issue Nisitha mentioned yesterday about a message not sending to a patient.

His message hit the GoTo rate limit, and it looks like our message queue retry problem still isn't fully fixed. You added the cron jobs, so I assumed it was sorted, but the message hit the GoTo rate limit and only went out hours later. Some messages are taking anywhere from 6 to 33 hours to send.

Claude says the production SMS queue is only draining once a day instead of every minute.

Since you have it set to run once a day, I'm not sure if there was a reason for that. Claude suggests just running it every minute and says there shouldn't be any extra cost or issues with doing that. Could you take a look when you're free? I'm just not sure why it didn't suggest running it every minute in the first place. Hey Akila, I changed it to run every minute now Anything that needs to be done in Modulo? Thisuri called me and said that some messages were not sending or something > **William Struve**
> 
> Hey Akila, I changed it to run every minute now

hey great, btw, can i know these 2 values too? I need to check them to test some things yeah sure > **William Struve**
> 
> Anything that needs to be done in Modulo? Thisuri called me and said that some messages were not sending or something

yea, idk about messages not sending. I asked her to gimme patient charts, if there are any recent complaints about not receiving messages to test our Ktdoctor domain fix.  Nisitha mentioned these issues. 

1st one might be fixed with the cron fix u just did

2nd one - they gets logged out sometimes to the login page. like 20 times a day atleast. ive noticed that aswell fewtimes. have to check whats wrong

3rd one - he asked to extend the appointment link expiration to atleast 7 days. small fix, i think i can fix it

4th one - he said patients complain sometimes that form links doesn't work. they say they see like an confirm link, or some random things sometimes when they click the link. 

> Messages GOTO limit
> 
> Signing out
> 
> Edit past appointments (expiration date 7 days)
> 
> Forms link, patients complain they get only confirmation link I also noticed the subdomain not triggering for some of the messages, I'm gonna start by trying the ktdoctor one 4th one related-  when they click the link, they said it opened this![🥲](https://statics.teams.cdn.office.net/evergreen-assets/personal-expressions/v2/assets/emoticons/smilingfacewithtear/default/20_f.png "Smiling face with tear") What that's crazy lol will look into it > **Akila Lankathilaka**
> 
> hey great, btw, can i know these 2 values too? I need to check them to test some things 📷

There is no easy way for me to get these for you since they are sensitive > **William Struve**
> 
> What that's crazy lol will look into it

yea LOL > **William Struve**
> 
> There is no easy way for me to get these for you since they are sensitive

oh, maybe its in somewhere in your AI chat history? my claude is asking what its in there. he checked the db and says there are still messages stuck on queue Root cause was not either environment variable: Vercel was invoking /api/cron/sms-queue, but the handler attempted 80 messages and hit the 60-second runtime limit (504) mid-batch.

  I changed the Vercel cron path to process 25 messages per invocation while leaving the persistent-server default at 80. The change is merged to main in PR #232  
  ([https://github.com/struv/forms/pull/232)](https://github.com/struv/forms/pull/232\) "https://github.com/struv/forms/pull/232)") and the Git-backed production deployment is live.

  Validation passed:

  - pnpm check  
  - pnpm vitest run server/services/smsQueueService.test.ts

  The queue is actively processing again; its latest successful-send timestamp is advancing. The due count may rise and fall as reminder jobs enqueue new items, but no secret rotation  
  was needed or performed.


Mappings look good to me! NICHQ gives me an idea for a new feature:   > **William Struve**
> 
> Wow that's a huge form, patients are gonna be so upset filling it out XD

Yea it took me 3 days to map LOL For multi-page forms with repeated fields. e.g. Patient Name field at the top of every page, we can implement a way for the patient to only fill the first page and auto-populate the duplicate fields on the rest of the pages > **Akila Lankathilaka**
> 
> Yea it took me 3 days to map LOL

Thanks so much for taking care of that haha > **William Struve**
> 
> For multi-page forms with repeated fields. e.g. Patient Name field at the top of every page, we can implement a way for the patient to only fill the first page and auto-populate the duplicate fields…

Okay, ill take a look!! Are you working on the EMR project right now? Yea. EMR, helpdesk, Modulo if needed > **William Struve**
> 
> For multi-page forms with repeated fields. e.g. Patient Name field at the top of every page, we can implement a way for the patient to only fill the first page and auto-populate the duplicate fields…

Okay, I'll implement this one haha Haha, okay Hey Akila, you think I could tweak the ktmg helpdesk since I'm one of the primary users? There's a couple things I want to add tbh biggest issue is that tickets are hard to find since they have same names that are vague  > **William Struve**
> 
> tbh biggest issue is that tickets are hard to find since they have same names that are vague 📷

Hey. Yeah, of course! I think Josh wanted it that way, but we can definitely change it. Maybe let people type the title themselves like we do for IT support tickets? what do u think? **A. Search the description (and optionally message bodies).** One extra OR branch in the existing search. "kitchen aircon" then finds the ticket whose title is just "A/C". Fixes the entire existing backlog, no data migration, no UI change. Cheapest and highest payoff.

**B. Make the row self-identifying.** Under the title, show a one-line description snippet, or render the title as category plus location. Location is already a column for admin support. Also retroactive, display only.

Claude suggests these  I guess the easiest thing to add for now would be a way to view just the tickets assigned to me, since I don't really care too much about other people's tickets Nevermind, let me explore this zones view for a bit, I didn't know it existed. Seems to solve a lot of the problems I had with the My Tickets view Thanks, it's a lot better now! > **William Struve**
> 
> Thanks, it's a lot better now!

Great! Btw, since you're using the system, let me know if you notice any issues or small improvements we can make. I'm working heavily on the EMR right now, but I'll still try my best to improve the system as much as I can. > NICHQ-Vanderbilt-Assessment-Scales
> 
> social_needs_ES_  
> PHQ-9 and GAD-7 
> 
> CRAFFT
> 
> PHQ-9
> 
> Hepatitis Risk Assessment Tool
> 
> Youth Nutrition Activity Assessment

> A report to get the number of forms done for these documents for period of 01/01/2026 - 06/30/2026 ## How the numbers were counted

1. **Window** — forms submitted 1 Jan – 30 Jun 2026, Pacific time.
2. **"Done"** = the patient personally answered at least one question on that form.
3. **Autofill ignored** — prefilled name, DOB, today's date, untouched pre-ticked boxes. Modulo writes those onto every form in a packet at submit, even untouched ones.
4. **PDFs not counted** — a PDF is generated for every form in a packet, blank ones included.
5. **English only**, except social needs where Spanish was requested.

## Results

**Requested period: 01/01/2026 – 06/30/2026**

|Document|Forms done|First use|Last use|Actual span|
|---|---|---|---|---|
|Hepatitis Risk Assessment Tool|**5,757**|31 Mar|30 Jun|3 months|
|Youth Nutrition Activity Assessment|**2,681**|19 Jan*|30 Jun|5.4 months|
|CRAFFT|**520**|17 Apr|30 Jun|2.5 months|
|PHQ-9|**460**|17 Apr|30 Jun|2.5 months|
|social_needs_ES|**409**|27 Apr|30 Jun|2.1 months|
|PHQ-9 and GAD-7|No data|—|—|Form added 14 Aug 2026|
|NICHQ-Vanderbilt-Assessment-Scales|No data|—|—|Form added 14 Aug 2026|

## Files behind each number

|Requested|Files counted|Uploaded|
|---|---|---|
|Hepatitis Risk Assessment Tool|`Hepatitis Risk Assessment Tool`|31 Mar 2026|
|Youth Nutrition Activity Assessment|`Youth Nutrition Activity Assessment`|1 Jan 2026 (bulk import stamp)|
|CRAFFT|`CRAFFT` only|17 Apr 2026|
|PHQ-9|`PHQ-9` + `PHQ-9-new`|17 Apr + 27 May 2026|
|social_needs_ES|`social needs ES` + `social_needs_ES_es-new`|27 Apr + 27 May 2026|
|PHQ-9 and GAD-7|none — not usable in period|14 Aug 2026|
|NICHQ-Vanderbilt|none — not usable in period|14 Aug 2026|  Hey Will!

Anchana asked me for the counts of these forms, so this is how I got the count for each one using Claude. Hope they’re right!

I guess they had some issues in EPT with doc uploads (I think you’re already aware?), and they also asked Pratheesh and me to join the EPT meeting on Tuesday. Just letting you know! Hey Akila, thx for letting me know, let me take a look rn I wonder why the last ones have no data > **William Struve**
> 
> I wonder why the last ones have no data

Anchana asked for the data till 6th month Hey Will, Staff keep asking about syncing Modulo with ECW. is there anything we can do for that? u did said its pretty complicated stuff and i think we have to pay them too for that?![🫤](https://statics.teams.cdn.office.net/evergreen-assets/personal-expressions/v2/assets/emoticons/diagonalmouth/default/20_f.png "Face with diagonal mouth") yeah we gotta pay eCW a bunch of money to access their apis Hey Will, I added and mapped the new LAIPT form. Everything looks okay, but if you want to take a look and confirm, just letting you know! Hey Will, Claude says Modulo appointment reminders haven't gone out since Aug 9. About 5,216 are still pending, and the queue drain last ran on Aug 16. Could you maybe check if the "/api/cron/sms-queue" cron stopped firing in prod on Vercel or if its any other issue? Hey good morning Akila, I'll try to see if I can fix it Ah okay, Thank you!

Btw, I've applied a fix for this issue before, but it happened again yesterday. I think there's too much data loading on that page, which might be causing the issue. If you get a chance, could you check this? I'm trying to find a fix too.

Claude says the "Pending Upload" query loads all 25,197 completed sessions into memory and paginates in JS, which can time out under load. The page also has no error state, so a failed load shows "No form packets pending upload" instead of an error.

> Completed forms doesn't shows up in that relevant section Akila Lankathilaka William Struve I'm pushing my update rn, hopefully it's able to fix it
> 
> 