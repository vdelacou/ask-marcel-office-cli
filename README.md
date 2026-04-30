# ask-marcel-office-cli

Microsoft Graph CLI — designed for LLM consumption via skills. Explicit commands, compact JSON output, zero interactive prompts beyond auth.

## Commands

### Authentication

| Command | Description |
|---------|-------------|
| `login` | Authenticate (cached → refresh → browser fallback) |
| `logout` | Clear cached tokens |
| `update` | Update ask-marcel to the latest version on npm (auto-detects npm vs bun) |
| `docs <cmd>` | Print Markdown docs for a single command (full machine-readable manifest at [`docs/commands.json`](docs/commands.json) or via `import manifest from 'ask-marcel-office-cli/commands.json'`) |

<!-- AUTO-GENERATED-COMMANDS:BEGIN -->

### OneDrive Files

| Command | Description | Required params | Graph endpoint |
|---------|-------------|-----------------|----------------|
| `download-onedrive-file-content` | Download (or follow the redirect to) the binary content of a file stored in OneDrive / SharePoint. | `--drive-id`, `--item-id` | `GET /drives/{drive-id}/items/{item-id}/content` |
| `get-drive-delta` | Get the incremental change set (added / modified / deleted items) under a OneDrive / SharePoint folder. Use the `@odata.deltaLink` from a previous response to resume. | `--drive-id`, `--item-id` | `GET /drives/{drive-id}/items/{item-id}/delta()` |
| `get-drive-item` | Get the metadata (driveItem resource) of a single file or folder in OneDrive / SharePoint. | `--drive-id`, `--item-id` | `GET /drives/{drive-id}/items/{item-id}` |
| `get-drive-root-item` | Get the root folder (driveItem) of a OneDrive / SharePoint drive. | `--drive-id` | `GET /drives/{drive-id}/root` |
| `list-drive-item-permissions` | List the sharing permissions on a OneDrive / SharePoint file or folder. | `--drive-id`, `--item-id` | `GET /drives/{drive-id}/items/{item-id}/permissions` |
| `list-drive-item-versions` | List the historical versions of a OneDrive / SharePoint file (each save creates a new version). | `--drive-id`, `--item-id` | `GET /drives/{drive-id}/items/{item-id}/versions` |
| `list-drives` | List all OneDrive / SharePoint drives the signed-in user has access to. | _(none)_ | `GET /me/drives` |
| `list-folder-files` | List the children (files and subfolders) of a folder in OneDrive / SharePoint. | `--drive-id`, `--item-id` | `GET /drives/{drive-id}/items/{item-id}/children` |
| `search-my-documents` | Search the signed-in user’s default OneDrive for documents matching a free-text query (filename, content, metadata). | `--query` | `GET /me/drive/search(q='{query}')` |
| `search-onedrive-files` | Search a single OneDrive / SharePoint drive for files and folders matching a free-text query. | `--drive-id`, `--query` | `GET /drives/{drive-id}/search(q='{query}')` |

### Excel (workbook files)

| Command | Description | Required params | Graph endpoint |
|---------|-------------|-----------------|----------------|
| `get-excel-range` | Get the cell values, formulas, and formats of a specific Excel range (e.g. `A1:C10`). | `--drive-id`, `--item-id`, `--worksheet-id`, `--address` | `GET /drives/{drive-id}/items/{item-id}/workbook/worksheets/{worksheet-id}/range(address='{address}')` |
| `get-excel-table` | Get the metadata (style, header row, total row) of a single named Excel table. | `--drive-id`, `--item-id`, `--table-id` | `GET /drives/{drive-id}/items/{item-id}/workbook/tables/{table-id}` |
| `list-excel-table-rows` | List the data rows of a named Excel table (excluding the header row). | `--drive-id`, `--item-id`, `--table-id` | `GET /drives/{drive-id}/items/{item-id}/workbook/tables/{table-id}/rows` |
| `list-excel-tables` | List the named tables across every worksheet in an Excel workbook. | `--drive-id`, `--item-id` | `GET /drives/{drive-id}/items/{item-id}/workbook/tables` |
| `list-excel-worksheets` | List the worksheets (tabs) inside an Excel workbook stored in OneDrive / SharePoint. | `--drive-id`, `--item-id` | `GET /drives/{drive-id}/items/{item-id}/workbook/worksheets` |

### SharePoint Sites

| Command | Description | Required params | Graph endpoint |
|---------|-------------|-----------------|----------------|
| `get-sharepoint-site` | Get the metadata of a single SharePoint site by its site ID. | `--site-id` | `GET /sites/{site-id}` |
| `get-sharepoint-site-by-path` | Resolve a SharePoint subsite by its server-relative path under a parent site (e.g. `/teams/marketing`). | `--site-id`, `--path` | `GET /sites/{site-id}/getByPath(path='{path}')` |
| `get-sharepoint-site-drive-by-id` | Get the metadata of a single document library (drive) on a SharePoint site by drive ID. | `--site-id`, `--drive-id` | `GET /sites/{site-id}/drives/{drive-id}` |
| `get-sharepoint-site-item` | Get a single baseItem (page, root-level item, etc.) on a SharePoint site by ID. | `--site-id`, `--base-item-id` | `GET /sites/{site-id}/items/{base-item-id}` |
| `get-sharepoint-site-list` | Get the metadata (display name, template, columns) of a single SharePoint list. | `--site-id`, `--list-id` | `GET /sites/{site-id}/lists/{list-id}` |
| `get-sharepoint-site-list-item` | Get a single row (listItem) of a SharePoint list by ID. | `--site-id`, `--list-id`, `--list-item-id` | `GET /sites/{site-id}/lists/{list-id}/items/{list-item-id}` |
| `get-sharepoint-sites-delta` | Get the incremental change set of SharePoint sites in the tenant. Use the `@odata.deltaLink` from a previous response to resume. | _(none)_ | `GET /sites/delta()` |
| `list-sharepoint-site-drives` | List the document libraries (drives) attached to a SharePoint site. | `--site-id` | `GET /sites/{site-id}/drives` |
| `list-sharepoint-site-items` | List the baseItem resources directly under a SharePoint site (typically pages and root-level items). | `--site-id` | `GET /sites/{site-id}/items` |
| `list-sharepoint-site-list-items` | List the rows (listItem resources) of a single SharePoint list. | `--site-id`, `--list-id` | `GET /sites/{site-id}/lists/{list-id}/items` |
| `list-sharepoint-site-lists` | List all SharePoint lists (custom + built-in document libraries) on a site. | `--site-id` | `GET /sites/{site-id}/lists` |
| `search-sharepoint-sites` | List the SharePoint sites the signed-in user has access to (returns the followed sites by default). | _(none)_ | `GET /sites` |
| `search-sharepoint-sites-by-name` | Search the tenant for SharePoint sites whose display name or description matches a free-text query (returns up to 25). | `--query` | `GET /sites?search={query}` |

### Tasks (To Do + Planner)

| Command | Description | Required params | Graph endpoint |
|---------|-------------|-----------------|----------------|
| `get-planner-bucket` | Get the metadata of a single Microsoft Planner bucket (column / lane). | `--planner-bucket-id` | `GET /planner/buckets/{planner-bucket-id}` |
| `get-planner-plan` | Get the metadata of a single Microsoft Planner plan (title, owner group, container). | `--planner-plan-id` | `GET /planner/plans/{planner-plan-id}` |
| `get-planner-task` | Get the metadata of a single Microsoft Planner task (title, assignees, dates, completion). | `--planner-task-id` | `GET /planner/tasks/{planner-task-id}` |
| `get-planner-task-details` | Get the rich details (description, checklist, references) of a Microsoft Planner task. | `--planner-task-id` | `GET /planner/tasks/{planner-task-id}/details` |
| `get-todo-task` | Get a single Microsoft To Do task by its ID and its parent list ID. | `--todo-task-list-id`, `--todo-task-id` | `GET /me/todo/lists/{todo-task-list-id}/tasks/{todo-task-id}` |
| `list-plan-buckets` | List the buckets (columns / lanes) of a Microsoft Planner plan. | `--planner-plan-id` | `GET /planner/plans/{planner-plan-id}/buckets` |
| `list-plan-tasks` | List every task within a Microsoft Planner plan. | `--planner-plan-id` | `GET /planner/plans/{planner-plan-id}/tasks` |
| `list-planner-tasks` | List every Microsoft Planner task assigned to or owned by the signed-in user, across all plans. | _(none)_ | `GET /me/planner/tasks` |
| `list-todo-linked-resources` | List the linked resources (URLs, emails, files) attached to a Microsoft To Do task. | `--todo-task-list-id`, `--todo-task-id` | `GET /me/todo/lists/{todo-task-list-id}/tasks/{todo-task-id}/linkedResources` |
| `list-todo-task-lists` | List the signed-in user’s Microsoft To Do task lists (e.g. `Tasks`, `Flagged Emails`, custom lists). | _(none)_ | `GET /me/todo/lists` |
| `list-todo-tasks` | List the tasks in a single Microsoft To Do task list. | `--todo-task-list-id` | `GET /me/todo/lists/{todo-task-list-id}/tasks` |

### Mail

| Command | Description | Required params | Graph endpoint |
|---------|-------------|-----------------|----------------|
| `get-mail-attachment` | Get a single attachment on an Outlook message (metadata, plus the base64 `contentBytes` for file attachments). | `--message-id`, `--attachment-id` | `GET /me/messages/{message-id}/attachments/{attachment-id}` |
| `get-mail-message` | Get a single Outlook message by ID, including subject, sender, body, and flags. | `--message-id` | `GET /me/messages/{message-id}` |
| `get-mailbox-settings` | Get the signed-in user’s Outlook mailbox settings (timezone, working hours, automatic replies). | _(none)_ | `GET /me/mailboxSettings` |
| `list-mail-attachments` | List the attachments (file, item, reference) on a single Outlook message. | `--message-id` | `GET /me/messages/{message-id}/attachments` |
| `list-mail-child-folders` | List the subfolders of a single Outlook mail folder (e.g. subfolders of Inbox). | `--mail-folder-id` | `GET /me/mailFolders/{mail-folder-id}/childFolders` |
| `list-mail-folder-messages` | List the messages inside a specific Outlook mail folder (Inbox, custom folder, etc.). | `--mail-folder-id` | `GET /me/mailFolders/{mail-folder-id}/messages` |
| `list-mail-folders` | List the top-level mail folders in the signed-in user’s Outlook mailbox (Inbox, Sent Items, etc.). | _(none)_ | `GET /me/mailFolders` |
| `list-mail-messages` | List the most recent messages in the signed-in user’s default Outlook inbox (no filter). | _(none)_ | `GET /me/messages` |
| `list-mail-rules` | List the inbox / folder rules attached to a single Outlook mail folder. | `--mail-folder-id` | `GET /me/mailFolders/{mail-folder-id}/messageRules` |
| `search-mail-messages` | Search the signed-in user’s entire Outlook mailbox using KQL or free text. Results are ranked by Graph relevance. | `--query` | `GET /me/messages?$search="{query}"` |

### Notes (OneNote)

| Command | Description | Required params | Graph endpoint |
|---------|-------------|-----------------|----------------|
| `get-onenote-page-content` | Get the HTML body of a single OneNote page. | `--onenote-page-id` | `GET /me/onenote/pages/{onenote-page-id}/content` |
| `list-all-onenote-sections` | List every OneNote section the signed-in user can see, across all notebooks. | _(none)_ | `GET /me/onenote/sections` |
| `list-onenote-notebook-sections` | List the sections of a single OneNote notebook. | `--notebook-id` | `GET /me/onenote/notebooks/{notebook-id}/sections` |
| `list-onenote-notebooks` | List the OneNote notebooks owned by the signed-in user. | _(none)_ | `GET /me/onenote/notebooks` |
| `list-onenote-section-pages` | List the pages inside a single OneNote section. | `--onenote-section-id` | `GET /me/onenote/sections/{onenote-section-id}/pages` |
| `search-onenote-pages` | Search the signed-in user’s OneNote pages by free-text. Matches page title and visible text content across every notebook. | `--query` | `GET /me/onenote/pages?$search={query}` |

### User

| Command | Description | Required params | Graph endpoint |
|---------|-------------|-----------------|----------------|
| `get-current-user` | Return the signed-in user’s Microsoft Graph profile (id, displayName, mail, jobTitle, etc.). | _(none)_ | `GET /me` |
| `get-my-profile-photo` | Download the binary content of the signed-in user’s profile photo (largest available size). | _(none)_ | `GET /me/photo/$value` |

### Calendar

| Command | Description | Required params | Graph endpoint |
|---------|-------------|-----------------|----------------|
| `get-calendar-event` | Fetch a single calendar event by ID from the signed-in user’s default calendar. | `--event-id` | `GET /me/events/{event-id}` |
| `get-calendar-view` | List the calendar events in the signed-in user’s default calendar with recurrence expanded into individual occurrences. Pass `?startDateTime=…&endDateTime=…` via the URL to filter (not yet exposed as a CLI flag). | _(none)_ | `GET /me/calendarView` |
| `get-specific-calendar-event` | Fetch a single calendar event by ID from a specific (non-default) calendar. | `--calendar-id`, `--event-id` | `GET /me/calendars/{calendar-id}/events/{event-id}` |
| `get-specific-calendar-view` | List the events in a specific (non-default) calendar with recurrence expanded into individual occurrences. | `--calendar-id` | `GET /me/calendars/{calendar-id}/calendarView` |
| `list-calendar-event-instances` | List the individual occurrences of a recurring calendar event over a date range. Pass `?startDateTime=…&endDateTime=…` via the URL to filter (not yet exposed as a CLI flag). | `--calendar-id`, `--event-id` | `GET /me/calendars/{calendar-id}/events/{event-id}/instances` |
| `list-calendar-events` | List the events in the signed-in user’s default calendar (does not expand recurrences). | _(none)_ | `GET /me/events` |
| `list-calendar-events-delta` | Get the incremental change set (added / modified / deleted events) for the signed-in user’s default calendar. Use the `@odata.deltaLink` from a previous response to resume. | _(none)_ | `GET /me/events/delta()` |
| `list-calendar-view-delta` | Get the incremental change set of expanded calendar-view occurrences over a date range. Pass `?startDateTime=…&endDateTime=…` via the URL on the first call (not yet exposed as a CLI flag). | _(none)_ | `GET /me/calendarView/delta()` |
| `list-calendars` | List the calendars in the signed-in user’s mailbox (default + secondary calendars + shared calendars). | _(none)_ | `GET /me/calendars` |
| `list-specific-calendar-events` | List the events in a specific (non-default) calendar (does not expand recurrences). | `--calendar-id` | `GET /me/calendars/{calendar-id}/events` |
| `search-calendar-events` | Search the signed-in user’s calendar events using KQL or free text. Matches subject, body, and location. | `--query` | `GET /me/events?$search="{query}"` |

### Contacts

| Command | Description | Required params | Graph endpoint |
|---------|-------------|-----------------|----------------|
| `get-outlook-contact` | Get a single personal Outlook contact by its ID. | `--contact-id` | `GET /me/contacts/{contact-id}` |
| `list-outlook-contacts` | List the personal Outlook contacts in the signed-in user’s default contacts folder. | _(none)_ | `GET /me/contacts` |
| `search-outlook-contacts` | Search the signed-in user’s Outlook contacts using KQL or free text. Matches name, email, company, and phone fields. | `--query` | `GET /me/contacts?$search="{query}"` |

### Chats

| Command | Description | Required params | Graph endpoint |
|---------|-------------|-----------------|----------------|
| `get-chat` | Get the metadata of a single Microsoft Teams chat (topic, type, members count, last update). | `--chat-id` | `GET /chats/{chat-id}` |
| `get-chat-message` | Get a single message in a Microsoft Teams chat by its ID. | `--chat-id`, `--chat-message-id` | `GET /chats/{chat-id}/messages/{chat-message-id}` |
| `get-chat-message-hosted-content` | Download the binary bytes of a single inline hosted content (image, GIF, code-snippet) from a Microsoft Teams chat message. | `--chat-id`, `--chat-message-id`, `--chat-message-hosted-content-id` | `GET /chats/{chat-id}/messages/{chat-message-id}/hostedContents/{chat-message-hosted-content-id}/$value` |
| `list-chat-members` | List the members of a single Microsoft Teams chat. | `--chat-id` | `GET /chats/{chat-id}/members` |
| `list-chat-message-hosted-contents` | List the inline hosted contents (image, GIF, code-snippet) attached to a Microsoft Teams chat message. | `--chat-id`, `--chat-message-id` | `GET /chats/{chat-id}/messages/{chat-message-id}/hostedContents` |
| `list-chat-message-replies` | List the replies in a Microsoft Teams chat message thread. | `--chat-id`, `--chat-message-id` | `GET /chats/{chat-id}/messages/{chat-message-id}/replies` |
| `list-chat-messages` | List the messages in a single Microsoft Teams chat thread (1:1, group, or meeting chat). | `--chat-id` | `GET /chats/{chat-id}/messages` |
| `list-chats` | List the Microsoft Teams chats (1:1, group, meeting) the signed-in user is a member of. | _(none)_ | `GET /me/chats` |
| `list-pinned-chat-messages` | List the pinned messages in a Microsoft Teams chat. | `--chat-id` | `GET /chats/{chat-id}/pinnedMessages` |

### Teams

| Command | Description | Required params | Graph endpoint |
|---------|-------------|-----------------|----------------|
| `get-channel-files-folder` | Get the SharePoint files folder (driveItem) backing a Microsoft Teams channel’s `Files` tab. | `--team-id`, `--channel-id` | `GET /teams/{team-id}/channels/{channel-id}/filesFolder` |
| `get-channel-message` | Get a single root message in a Microsoft Teams channel by ID. | `--team-id`, `--channel-id`, `--chat-message-id` | `GET /teams/{team-id}/channels/{channel-id}/messages/{chat-message-id}` |
| `get-channel-message-hosted-content` | Download the binary bytes of a single inline hosted content (image, GIF, code-snippet) from a Microsoft Teams channel message. | `--team-id`, `--channel-id`, `--chat-message-id`, `--chat-message-hosted-content-id` | `GET /teams/{team-id}/channels/{channel-id}/messages/{chat-message-id}/hostedContents/{chat-message-hosted-content-id}/$value` |
| `get-team` | Get the metadata of a single Microsoft Team (display name, settings, member-settings, owner group). | `--team-id` | `GET /teams/{team-id}` |
| `get-team-channel` | Get the metadata of a single channel inside a Microsoft Team. | `--team-id`, `--channel-id` | `GET /teams/{team-id}/channels/{channel-id}` |
| `list-channel-message-hosted-contents` | List the inline hosted contents (image, GIF, code-snippet) attached to a Microsoft Teams channel message. | `--team-id`, `--channel-id`, `--chat-message-id` | `GET /teams/{team-id}/channels/{channel-id}/messages/{chat-message-id}/hostedContents` |
| `list-channel-message-replies` | List the replies in a Microsoft Teams channel message thread. | `--team-id`, `--channel-id`, `--chat-message-id` | `GET /teams/{team-id}/channels/{channel-id}/messages/{chat-message-id}/replies` |
| `list-channel-messages` | List the root messages in a Microsoft Teams channel. | `--team-id`, `--channel-id` | `GET /teams/{team-id}/channels/{channel-id}/messages` |
| `list-channel-tabs` | List the pinned tabs (Wiki, Planner, Website, custom apps) of a Microsoft Teams channel. | `--team-id`, `--channel-id` | `GET /teams/{team-id}/channels/{channel-id}/tabs` |
| `list-joined-teams` | List the Microsoft Teams the signed-in user is a member of. | _(none)_ | `GET /me/joinedTeams` |
| `list-team-channels` | List the channels (standard, private, shared) inside a single Microsoft Team. | `--team-id` | `GET /teams/{team-id}/channels` |
| `list-team-members` | List the members of a single Microsoft Team. | `--team-id` | `GET /teams/{team-id}/members` |
| `search-graph-messages` | Search Microsoft Teams channel messages and 1:1 / group chat messages with a free-text or KQL query (Microsoft Search API). | `--query` | `POST /search/query` |

<!-- AUTO-GENERATED-COMMANDS:END -->
## Install

Requires Node ≥20 **or** Bun ≥1.0 on the user's machine. Works on Windows, macOS, and Linux.

```bash
npm i -g ask-marcel-office-cli      # any platform with Node
# — or —
bun add -g ask-marcel-office-cli    # any platform with Bun
```

The first launch prints a one-time notice if a newer version is on npm; update with the same command above plus `@latest`.

## Usage (CLI)

```bash
# authenticate (cached → refresh → browser fallback)
ask-marcel login

# list drives
ask-marcel list-drives

# search for files
ask-marcel search-onedrive-files --drive-id abc123 --query "report"

# get Excel table data
ask-marcel list-excel-table-rows --drive-id abc123 --item-id xyz789 --table-id table1

# search SharePoint sites
ask-marcel search-sharepoint-sites

# list SharePoint site lists
ask-marcel list-sharepoint-site-lists --site-id contoso.sharepoint.com,1234-5678

# update to the latest version (auto-detects npm vs bun)
ask-marcel update

# clear tokens
ask-marcel logout

# see all commands
ask-marcel --help
```

`ask-marcel update` auto-detects whether the CLI was installed via npm or bun (based on the bin path) and reinstalls globally with the matching tool. You can still run the install manually: `npm i -g ask-marcel-office-cli@latest` or `bun add -g ask-marcel-office-cli@latest`.

During development from a clone you can keep using `bun run src/main.ts <command>`.

## Usage (library)

The package exports a typed library API for embedding inside your own CLI, agent, or service.

```ts
import { commands, createGraphClient, buildDeps, type Result } from 'ask-marcel-office-cli';

// option 1 — full ladder with built-in OAuth and file cache
const { graph } = buildDeps();
const result = await commands['list-drives'].execute(graph, {});
if (result.ok) console.log(result.value);

// option 2 — bring your own AuthManager / token
const graph = createGraphClient({
  getAccessToken: async () => ({ ok: true, value: process.env.MS_GRAPH_TOKEN as never }),
  logout: async () => ({ ok: true, value: undefined }),
});
const me = await commands['get-current-user'].execute(graph, {});
```

The full export list (registry, factories, `Result`, branded types, ports) is in [src/index.ts](src/index.ts).

## Architecture

```
src/
  domain/          — Result<T,E>, branded value-object types (AccessToken, EnvVar), JWT utilities, format-error
  infra/           — Auth recovery ladder (cache → refresh → Playwright browser), Graph API HTTP client, Winston logger
  use-cases/       — Commands (schemas + execute functions), ports
  composition/     — CLI wiring (Commander), dependency graph
  presenter/       — Compact JSON output formatting
```

- **Auth**: Three-rung recovery ladder — file-based cached JWT → OAuth refresh_token exchange → Playwright browser intercepting Teams login
- **Client ID**: `5e3ce6c0-2b1f-4285-8d4b-75ee78787346` (Teams Web)
- **Scopes**: `https://graph.microsoft.com/.default openid profile offline_access`
- **Token cache**: `~/.ask-marcel/token-cache.json` (overridable via `BuildDepsConfig.cachePath`)
- **Browser profile**: `~/.ask-marcel/browser-profile` (overridable via `ASKMARCEL_BROWSER_PROFILE`)
- **Output**: Compact JSON via `JSON.stringify` — no indentation, optimised for LLM token efficiency

## Configuration

Environment variables read at composition time:

| Variable | Used by | Default |
|---|---|---|
| `ASKMARCEL_LOG_LEVEL` | Winston logger; all output goes to **stderr** (stdout reserved for command JSON). Namespaced so a generic `LOG_LEVEL` exported by another tool in your shell does not leak into ours. | `error` (use `info` or `debug` for troubleshooting) |
| `HOME` / `USERPROFILE` | Default cache and browser-profile paths | _(required)_ |
| `ASKMARCEL_BROWSER_PROFILE` | Override Playwright user-data-dir | _(none)_ |

`HTTP_PROXY` / `HTTPS_PROXY` / `http_proxy` / `https_proxy` are stripped from the process environment immediately before launching Playwright (see `src/infra/browser-auth.ts`).

## Quality gates (atelier four-check loop)

```bash
bun test           # 303 tests
bun run lint       # ESLint (0 warnings, 0 errors)
bun run typecheck  # tsc --noEmit
bun run coverage   # per-tier gates (100% domain + use-cases, 80% infra + composition + presenter)
bun run mutate:changed  # mutation testing on changed domain/use-case files (>90% kill threshold)
```

### Pre-commit hook (atelier 8 gates)

The repo ships an 8-gate hook at `.githooks/pre-commit` (commit size → package.json → gitleaks → tests → strict lint → typecheck → coverage → mutation). Install once per clone:

```bash
git config core.hooksPath .githooks
```

Optional but recommended: install [gitleaks](https://github.com/gitleaks/gitleaks) (`brew install gitleaks`) to enable gate 3. The hook degrades gracefully if it's missing.
