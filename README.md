# ask-marcel-office-cli

Microsoft Graph CLI — designed for LLM consumption via skills. Explicit commands, compact JSON output, zero interactive prompts beyond auth.

## Commands

### Authentication

| Command | Description |
|---------|-------------|
| `login` | Authenticate (cached → refresh → browser fallback) |
| `logout` | Clear cached tokens |

### OneDrive Files

| Command | Description | Required params |
|---------|-------------|-----------------|
| `list-drives` | List all drives for the authenticated user | _(none)_ |
| `get-drive-root-item` | Get the root folder of a drive | `--drive-id` |
| `list-folder-files` | List children of a folder/item | `--drive-id`, `--item-id` |
| `download-onedrive-file-content` | Get download URL for a file | `--drive-id`, `--item-id` |
| `get-drive-item` | Get metadata for a file/folder | `--drive-id`, `--item-id` |
| `list-drive-item-permissions` | List sharing permissions | `--drive-id`, `--item-id` |
| `list-drive-item-versions` | List file versions | `--drive-id`, `--item-id` |
| `search-onedrive-files` | Search files by query | `--drive-id`, `--query` |
| `get-drive-delta` | Get changes since last sync | `--drive-id`, `--item-id` |

### Excel (workbook files)

| Command | Description | Required params |
|---------|-------------|-----------------|
| `list-excel-worksheets` | List worksheets in a workbook | `--drive-id`, `--item-id` |
| `list-excel-tables` | List tables in a workbook | `--drive-id`, `--item-id` |
| `get-excel-table` | Get table details | `--drive-id`, `--item-id`, `--table-id` |
| `list-excel-table-rows` | List rows in a table | `--drive-id`, `--item-id`, `--table-id` |
| `get-excel-range` | Get cell values by address | `--drive-id`, `--item-id`, `--worksheet-id`, `--address` |

### SharePoint Sites

| Command | Description | Required params |
|---------|-------------|-----------------|
| `search-sharepoint-sites` | Search all SharePoint sites | _(none)_ |
| `get-sharepoint-site` | Get site by ID | `--site-id` |
| `get-sharepoint-sites-delta` | Get site changes since last sync | _(none)_ |
| `get-sharepoint-site-by-path` | Get site by URL path | `--site-id`, `--path` |
| `list-sharepoint-site-drives` | List drives on a site | `--site-id` |
| `get-sharepoint-site-drive-by-id` | Get site drive by ID | `--site-id`, `--drive-id` |
| `list-sharepoint-site-items` | List items on a site | `--site-id` |
| `get-sharepoint-site-item` | Get site item by ID | `--site-id`, `--baseItem-id` |
| `list-sharepoint-site-lists` | List lists on a site | `--site-id` |
| `get-sharepoint-site-list` | Get list by ID | `--site-id`, `--list-id` |
| `list-sharepoint-site-list-items` | List items in a list | `--site-id`, `--list-id` |
| `get-sharepoint-site-list-item` | Get list item by ID | `--site-id`, `--list-id`, `--listItem-id` |

### Tasks (To Do + Planner)

| Command | Description | Required params |
|---------|-------------|-----------------|
| `list-todo-task-lists` | List To Do task lists | _(none)_ |
| `list-todo-tasks` | List tasks in a To Do list | `--todo-task-list-id` |
| `get-todo-task` | Get a To Do task | `--todo-task-list-id`, `--todo-task-id` |
| `list-todo-linked-resources` | List resources linked to a To Do task | `--todo-task-list-id`, `--todo-task-id` |
| `list-planner-tasks` | List Planner tasks for user | _(none)_ |
| `get-planner-plan` | Get Planner plan by ID | `--planner-plan-id` |
| `list-plan-tasks` | List tasks in a Planner plan | `--planner-plan-id` |
| `get-planner-task` | Get Planner task by ID | `--planner-task-id` |
| `get-planner-task-details` | Get Planner task details | `--planner-task-id` |
| `list-plan-buckets` | List buckets in a Planner plan | `--planner-plan-id` |
| `get-planner-bucket` | Get Planner bucket by ID | `--planner-bucket-id` |

### Mail

| Command | Description | Required params |
|---------|-------------|-----------------|
| `list-mail-messages` | List messages in inbox | _(none)_ |
| `list-mail-folders` | List mail folders | _(none)_ |
| `list-mail-child-folders` | List subfolders of a mail folder | `--mail-folder-id` |
| `list-mail-folder-messages` | List messages in a mail folder | `--mail-folder-id` |
| `get-mail-message` | Get a message by ID | `--message-id` |
| `list-mail-attachments` | List attachments on a message | `--message-id` |
| `get-mail-attachment` | Get an attachment by ID | `--message-id`, `--attachment-id` |
| `list-mail-rules` | List message rules for a folder | `--mail-folder-id` |
| `get-mailbox-settings` | Get mailbox settings | _(none)_ |

### Notes (OneNote)

| Command | Description | Required params |
|---------|-------------|-----------------|
| `list-onenote-notebooks` | List OneNote notebooks | _(none)_ |
| `list-onenote-notebook-sections` | List sections in a notebook | `--notebook-id` |
| `list-all-onenote-sections` | List all sections across notebooks | _(none)_ |
| `list-onenote-section-pages` | List pages in a section | `--onenote-section-id` |
| `get-onenote-page-content` | Get OneNote page content | `--onenote-page-id` |

### User

| Command | Description | Required params |
|---------|-------------|-----------------|
| `get-current-user` | Get current user profile | _(none)_ |
| `get-my-profile-photo` | Get current user profile photo | _(none)_ |

### Calendar

| Command | Description | Required params |
|---------|-------------|-----------------|
| `list-calendars` | List all calendars | _(none)_ |
| `list-calendar-events` | List events in default calendar | _(none)_ |
| `get-calendar-event` | Get event by ID | `--event-id` |
| `list-specific-calendar-events` | List events in a specific calendar | `--calendar-id` |
| `get-specific-calendar-event` | Get event in a specific calendar | `--calendar-id`, `--event-id` |
| `get-calendar-view` | Get calendar view (expanded recurrences) | _(none)_ |
| `get-specific-calendar-view` | Get calendar view for a specific calendar | `--calendar-id` |
| `list-calendar-event-instances` | List instances of a recurring event | `--calendar-id`, `--event-id` |
| `list-calendar-events-delta` | Incremental sync of events | _(none)_ |
| `list-calendar-view-delta` | Incremental sync within a time window | _(none)_ |

### Contacts

| Command | Description | Required params |
|---------|-------------|-----------------|
| `list-outlook-contacts` | List Outlook contacts | _(none)_ |
| `get-outlook-contact` | Get contact by ID | `--contact-id` |

### Chats

| Command | Description | Required params |
|---------|-------------|-----------------|
| `list-chats` | List Teams chats | _(none)_ |
| `get-chat` | Get chat by ID | `--chat-id` |
| `list-chat-members` | List chat members | `--chat-id` |
| `list-chat-messages` | List chat messages | `--chat-id` |
| `get-chat-message` | Get chat message by ID | `--chat-id`, `--chat-message-id` |
| `list-chat-message-hosted-contents` | List message hosted content | `--chat-id`, `--chat-message-id` |
| `get-chat-message-hosted-content` | Get hosted content bytes | `--chat-id`, `--chat-message-id`, `--chat-message-hosted-content-id` |
| `list-chat-message-replies` | List message replies | `--chat-id`, `--chat-message-id` |
| `list-pinned-chat-messages` | List pinned messages | `--chat-id` |

### Teams

| Command | Description | Required params |
|---------|-------------|-----------------|
| `list-joined-teams` | List joined Teams | _(none)_ |
| `get-team` | Get team by ID | `--team-id` |
| `list-team-channels` | List team channels | `--team-id` |
| `get-team-channel` | Get channel by ID | `--team-id`, `--channel-id` |
| `list-channel-messages` | List channel messages | `--team-id`, `--channel-id` |
| `get-channel-message` | Get channel message by ID | `--team-id`, `--channel-id`, `--chat-message-id` |
| `list-channel-message-hosted-contents` | List message hosted content | `--team-id`, `--channel-id`, `--chat-message-id` |
| `get-channel-message-hosted-content` | Get hosted content bytes | `--team-id`, `--channel-id`, `--chat-message-id`, `--chat-message-hosted-content-id` |
| `list-channel-message-replies` | List message replies | `--team-id`, `--channel-id`, `--chat-message-id` |
| `list-channel-tabs` | List channel tabs | `--team-id`, `--channel-id` |
| `list-team-members` | List team members | `--team-id` |
| `get-channel-files-folder` | Get channel files folder | `--team-id`, `--channel-id` |

## Usage

```bash
# Install
bun install

# Authenticate (cached → refresh → browser fallback)
bun run src/main.ts login

# List drives
bun run src/main.ts list-drives

# Search for files
bun run src/main.ts search-onedrive-files --drive-id abc123 --query "report"

# Get Excel table data
bun run src/main.ts list-excel-table-rows --drive-id abc123 --item-id xyz789 --table-id table1

# Search SharePoint sites
bun run src/main.ts search-sharepoint-sites

# List SharePoint site lists
bun run src/main.ts list-sharepoint-site-lists --site-id contoso.sharepoint.com,1234-5678

# Clear tokens
bun run src/main.ts logout

# See all commands
bun run src/main.ts --help
```

## Architecture

```
src/
  domain/          — Result<T,E> type, utilities
  infra/           — Auth recovery ladder (cache → refresh → Playwright browser), Graph API HTTP client, Winston logger
  use-cases/       — Commands (schemas + execute functions), ports
  composition/     — CLI wiring (Commander), dependency graph
  presenter/       — Compact JSON output formatting
```

- **Auth**: Three-rung recovery ladder — file-based cached JWT → OAuth refresh_token exchange → Playwright browser intercepting Teams login
- **Client ID**: `5e3ce6c0-2b1f-4285-8d4b-75ee78787346` (Teams Web)
- **Scopes**: `https://graph.microsoft.com/.default openid profile offline_access`
- **Token cache**: `~/.ask-marcel/token-cache.json`
- **Browser profile**: `~/.ask-marcel/browser-profile` (used by Playwright for persistent session)
- **Output**: Compact JSON via `JSON.stringify` — no indentation, optimised for LLM token efficiency

## Quality gates

```bash
bun test           # 254 tests
bun run lint       # ESLint (0 warnings, 0 errors)
bun run stryker    # Mutation testing (>90% break threshold)
```
