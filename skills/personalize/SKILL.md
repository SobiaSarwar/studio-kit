---
name: personalize
description: Write a version of each campaign email for every lead group in leads/leads.csv. Use when a campaign's emails are final and you want one copy per group.
argument-hint: "[campaign folder]"
context: fork
allowed-tools: Read, Glob, Grep, Write
---

# Personalize a campaign for each lead group

Write one version of every email in a campaign for each lead group.

## Step 1: Check the argument

The campaign folder is: $ARGUMENTS

If no campaign folder was given, stop. Do not write any files. Use Glob to list the folders inside `campaigns/` and reply with that list, plus a line asking which one to use.

If the folder does not exist or has no `emails/` folder with files in it, stop and say so.

## Step 2: Find the groups

Read `leads/leads.csv`. The groups are the distinct values in the `group` column. If the file or the column is missing, stop and say so. Use only the group names. Do not copy names, emails or any other lead details into the emails.

Use Glob and Read to look for audience notes in `leads/` that describe each group. For each group, write down in one line who they are and what they care about.

If a group has no description, stop and ask the user to describe it. Do not guess.

## Step 3: Read the rules

Read `brand/voice.md`. Every version must follow it: the voice, the words to avoid and the claims never to make.

If `.claude/rules/emails.md` exists, read it too. Every version must still follow it.

## Step 4: Write the versions

Use Glob to list the files in `<campaign folder>/emails/`. For each email and each group, write a new file.

Keep these the same as the original:
- the structure and order of the sections
- the subject line
- the link
- the footer and sign-off, as plain text

Change only these two things:
- the opening line, so it fits the group
- one example, so it fits the group

Fit each version to the group description you found in Step 2. Think about who is reading and what matters to them.

Rules:
- Do not add new facts, prices, discounts, delivery dates or claims. Do not invent what the product or offer includes.
- Use the example only to change how something is framed, not what is true.
- Keep sentences short and plain.

## Step 5: Save the files

Save each version to `<campaign folder>/groups/<group>/emails/` with the same file name as the original. Do not change the original emails. Do not delete or overwrite anything outside `groups/`.

## Step 6: Reply with a short summary only

Reply with:
- how many files you wrote
- one example opening line for each group

Do not paste the full emails.
