// PreToolUse hook: blocks Resend calls that could reach the wrong people.
// Exit 0 = allow. Exit 2 = block (the reason on stderr goes back to Claude).

const ALWAYS_BLOCK = [
  "send-broadcast",
  "create-automation",
  "send-inbox-draft",
  "send-new-inbox-email",
];
const CHECK_ADDRESSES = ["send-email", "send-batch-emails"];

function block(reason) {
  console.error(`Blocked by send-guard: ${reason}`);
  process.exit(2);
}

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let call;
try {
  call = JSON.parse(raw);
} catch {
  block("could not read the tool call, so it was not allowed.");
}

const name = String(call?.tool_name ?? "").replace(/^mcp__resend__/, "");
const input = call?.tool_input ?? {};

if (ALWAYS_BLOCK.includes(name)) {
  block(`${name} can reach whole lists of people. Not allowed in this project.`);
}

if (CHECK_ADDRESSES.includes(name)) {
  const myEmail = (process.env.MY_EMAIL ?? "").trim().toLowerCase();
  // send-batch-emails takes a list of emails; send-email is a single one.
  const emails = Array.isArray(input) ? input : Array.isArray(input.emails) ? input.emails : [input];

  for (const email of emails) {
    for (const field of ["to", "cc", "bcc"]) {
      const value = email?.[field];
      if (value == null) continue;
      const list = Array.isArray(value) ? value : [value];
      for (const item of list) {
        // Accept "Name <a@b.com>" as well as "a@b.com".
        const text = String(item);
        const match = text.match(/<([^>]*)>/);
        const address = (match ? match[1] : text).trim().toLowerCase();
        const ok = address.endsWith("@resend.dev") || (myEmail !== "" && address === myEmail);
        if (!ok) {
          block(`${address || "(empty address)"} in "${field}" is not allowed. Only @resend.dev addresses and MY_EMAIL are allowed.`);
        }
      }
    }
  }
}

process.exit(0);
