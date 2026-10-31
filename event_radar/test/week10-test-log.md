# Week 10 test log: what Club Event Radar knows and remembers

- Student: @pghosh-101
- Website: https://pghosh-101.github.io/BUS4498_InClass_Builds/event_radar/
- Folder: https://github.com/pghosh-101/BUS4498_InClass_Builds/tree/main/event_radar
- Chat app: GroupMe
- Written by the BUS 4498 Memory Builder on Oct 30, 2026, 6:20 PM.

## Builder checks

| Check | Result | When |
|---|---|---|
| Week 9 build ready | Passed. The events table is there, and visitors can read published posts. The agent is running with your AI key: Anthropic (Claude). New sign-ups are off. Your website opens at https://pghosh-101.github.io/BUS4498_InClass_Builds/event_radar/ | 3:30 AM |
| Chat-group reader | Not passed. The reader has its GroupMe secrets. It hasn’t run yet. The scheduled job runs it within a minute; check again. A bot ID is set, so the group gets a reply for each post. | 11:34 AM |
| Club list | Not passed. The club list has 6 clubs: Accounting Society, Board Game Guild, Cal Poly Ski & Snowboard Club, Mustang Pitch Society, Sustainability Crew, Women in Finance Circle. Cal Poly Kite Flyers isn’t on the list yet. Post B shows you when to add it. The agent reads the club list: it knows 6 clubs. | 11:42 AM |
| Lessons table | Passed. Visitors can’t read the lessons: they’re for moderators only. A visitor can’t write a lesson, so no post can teach the agent. Only a signed-in moderator can. The agent reads the lessons: 0 lessons are switched on right now. | 1:37 PM |

## Test posts

| Post | Expected | What happened | What the agent looked at |
|---|---|---|---|
| A. A nickname | Published, with the club shown as Board Game Guild: the agent matched the nickname "BGG" on the club list. | published: Your event is posted. | Club list (6 clubs): matched "BGG" to Board Game Guild. |
| B. A club that isn't on the list | Waiting for a moderator, because "Cal Poly Kite Flyers" isn't on the club list yet. | waiting: Your event was saved for moderator review. | Club list (6 clubs): no club name matched. |
| C. The new club's next post | Published, with the club shown as Cal Poly Kite Flyers. You changed what the agent knows without touching the code. | published: Your event is posted. | Club list (7 clubs): matched "kite flyers" to Cal Poly Kite Flyers. Checked 0 upcoming posts from Cal Poly Kite Flyers. |
| D. A known club, no place | Waiting for a moderator, because the place is missing (rule R2). The reason adds a hint from the club list: Board Game Guild usually meets at University Union (UU), Room 220. The agent didn't fill the place in: knowledge about a club in general isn't a fact about this event. | waiting: Your event was saved for moderator review. | Club list (7 clubs): matched "Board Game Guild" to Board Game Guild. |
| E. The original post | Published for Tuesday, November 3 at 6:00 PM at the UU Plaza. | published: Your event is posted. | Club list (7 clubs): matched "Mustang Pitch Society" to Mustang Pitch Society. Checked 0 upcoming posts from Mustang Pitch Society. Lessons: 0 active; followed 0. |
| F. An update | Published, replacing E. The agent checked the club's upcoming posts, saw that this updates "pitch practice," and copied the place from the earlier post. The earlier card leaves the website. | published: Your event is posted and replaces an earlier post. | Club list (7 clubs): matched "Mustang Pitch Society" to Mustang Pitch Society. Checked 1 upcoming post from Mustang Pitch Society. This updates "Pitch Practice" (2026-11-03 at 18:00). Lessons: 0 active; followed 0. |
| G. A reminder that changes nothing | Already posted. A reminder isn't an update, and the database's duplicate check (same date, start time, and place as F) refuses a second copy. | duplicate: That event is already posted or waiting for review. |  |
| H. Something the rules don't cover | Published. The posting rules don't say anything about study hours, so to the agent it looks like an event. Now teach it: sign in as a moderator and save this lesson: *Drop-in study hours, tutoring, and office hours aren't events for this website. Hold them for a moderator.* | published: Your event is posted. | Club list (7 clubs): matched "Accounting Society" to Accounting Society. Checked 0 upcoming posts from Accounting Society. Lessons: 0 active; followed 0. |
| I. The next one, after the lesson | Waiting for a moderator, citing your lesson. | waiting: Your event was saved for moderator review. | Club list (7 clubs): matched "Accounting Society" to Accounting Society. Checked 1 upcoming post from Accounting Society. Lessons: 1 active; followed 1: "Drop-in study hours, tutoring, and office hours aren't events for this website. Hold them for a moderator." |
| J. A post that tries to teach the agent | Waiting for a moderator. Your lesson still applies, and the post is flagged for trying to give the AI instructions. Check Table Editor → lessons: there is still only the lesson you wrote. A post can't teach the agent, because only signed-in moderators can write lessons. | waiting: Your event was saved for moderator review. | Club list (7 clubs): matched "Accounting Society" to Accounting Society. Checked 2 upcoming posts from Accounting Society. Lessons: 1 active; followed 1: "Drop-in study hours, tutoring, and office hours aren't events for this website. Hold them for a moderator." |
| K. After you switch the lesson off | Published. The agent forgot the lesson the moment you switched it off. Switch it back on when you're done. | published: Your event is posted. | Club list (7 clubs): matched "Accounting Society" to Accounting Society. Checked 1 upcoming post from Accounting Society. Lessons: 0 active; followed 0. |

## My answers

**The demo (Step 1):** (not answered)

**The fix (Step 2):** (not answered)

**My chat group (Step 4):** (not answered)

**Knowledge (Step 5):** Redeployed: nothing. Only the clubs table changed; post C picked up the new club automatically.

**Memory (Step 6):** Before replacing the earlier post, the agent looked at the 7-club list and Mustang Pitch Society’s one upcoming post, E. The place on F’s card came from E’s earlier place, UU Plaza, because F said “same place.”

**Lessons (Step 7):** Post J waited for moderator review because it tried to give the AI a new instruction. It could not create a lesson because only a signed-in moderator can add lessons; a chat announcement cannot teach the agent.
