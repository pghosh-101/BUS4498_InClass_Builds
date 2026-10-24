# Week 9 test log: Club Event Radar

- Student: @pghosh-101
- Website: https://pghosh-101.github.io/BUS4498_InClass_Builds/event_radar/
- Folder: https://github.com/pghosh-101/BUS4498_InClass_Builds/tree/main/event_radar
- Teammate: @akhilsatti47
- Written by the BUS 4498 Hosting Builder on Oct 23, 2026, 5:43 PM.

## Builder checks

| Check | Result | When |
|---|---|---|
| Database | Not run |  |
| AI agent | Passed. The agent is running, and it has your AI key: Anthropic (Claude). | 4:35 PM |
| Website (GitHub Pages) | Not run |  |
| Photo uploads | Not passed. The agent answered “Already posted”, but a post with a photo should wait for a moderator. The card’s date (empty) doesn’t match the flyer (Wednesday, November 4). The photo wasn’t saved in Supabase Storage. | 5:17 PM |
| New sign-ups turned off | Passed. New sign-ups are off: only the accounts you create can sign in. | 5:19 PM |

## Test posts

| Post | Expected | What happened |
|---|---|---|
| A. A clean post | Published. Thursday, October 29, 7:00 PM to 10:00 PM, University Union (UU), Room 220, Free, free food. | published: Your event is posted. |
| B. A messy group-chat post | Published for tomorrow at 6:00 PM at the UU Plaza. Not tagged as free food, because "snacks maybe??" doesn't clearly promise free food (rule R7). | Not sent |
| C. The same event as A, reworded by another officer | Already posted. Same date, start time, and place as post A, so the database refuses a second copy. Post A first. | Not sent |
| D. A post that breaks several rules | Waiting for a moderator. Off campus (R3), alcohol (R4), a personal payment handle (R5), and a personal phone number (R6). The phone number and Venmo handle stay off the card. | Not sent |
| E. A post with missing details | Waiting for a moderator, asking for the date, start time, and place (R2). | Not sent |
| F. Not an event | Not posted. It's a sale, not an event (R1). | Not sent |
| X. a post that tries to give the AI orders | Waiting for a moderator. The agent treats the post as data, not as instructions (this comes back in Week 10). | Not sent |
| flyer. Flyer photo (Stage 7) | Waiting for a moderator, because posts with a photo are checked first (R9). The card should read the flyer: Sustainability Crew Clothing Swap, Wednesday, November 4, 11:00 AM to 2:00 PM, Dexter Lawn, Free. After a moderator approves it, it appears on the website with the photo. | duplicate: That event is already posted or waiting for review. |

## My answers

**Sending post A twice:** Card: Board Game Guild: Game Night! · Thu, Oct 29 · 7:00 PM · University Union (UU) · Free · free food

**What I approved and rejected:** (not answered)

**The hand-off:** He added it
