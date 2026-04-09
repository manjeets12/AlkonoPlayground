import type { Problem } from "../types/problem";

export const DEFAULT_PROBLEMS: Problem[] = [
  {
    id: "memory-card-game",
    title: "Memory Card Game",
    description: `Build a card-flip memory game.

Render a 4×4 grid of cards, all face-down. On tap, flip two cards:
• If they match → stay face-up (matched state)
• If not → flip back after 800ms

Requirements:
  – 8 unique emoji pairs (16 cards total)
  – Shuffle deck on mount
  – Track and display move counter
  – Show "You won!" when all pairs are matched
  – Restart button resets the board`,
    durationMinutes: 45, // Medium
    level: "medium",
    isDefault: true,
  },
  {
    id: "advanced-todos",
    title: "Advanced TODOs with Tasks",
    description: `Build a multi-screen TODO application.
    
Features:
• Main screen: List, add, delete and update TODO items.
• Detail screen: Clicking a TODO opens its task list. Screen title matches the TODO title. Add tasks here.
• Task logic: Mark tasks as completed with a checkbox on the left.
• Interaction: Use a BottomSheet for creating TODOs/Tasks. Include one text input and a button (disabled if empty).

Bonus: Add a filter for TODOs with completed tasks.`,
    durationMinutes: 90, // hard
    level: "hard",
    isDefault: true,
  },
  {
    id: "hacker-news",
    title: "Hacker News Top Stories",
    description: `Build a Hacker News Top Stories reader.

Requirements:
• List: Display top stories using the HN API (https://github.com/HackerNews/API).
• Pagination: Support proper scrolling pagination.
• Refresh: Option to forcefully refresh the list.
• Links: Mention the HN platform/API in the UI.`,
    durationMinutes: 120, // Hard
    level: "hard",
    isDefault: true,
  },
  {
    id: "tip-calculator",
    title: "Premium Tip Calculator",
    description: `Build a comprehensive Tip Calculation App.

Features:
• Input: Bill amount (up to 2 decimal places).
• Tip Selection: Presets for 10%, 15%, 20%, 25% + custom tip %.
• Splitting: Split the bill among friends.
• Rounding: Option to round up the total bill (switch).
• Result: Show per-person bill share if more than 1 person.`,
    durationMinutes: 45, 
    level: "medium",
    isDefault: true,
  },
  {
    id: "task-assigner",
    title: "Task Assigner",
    description: `Build a React Native app called Task Assigner.

Initial Render:
• App title: Task Assigner
• Filter input at top.
• FlatList of tasks using the following data:

\`\`\`js
const TASKS = [
  { id: '1', title: 'Design UI', description: 'Create wireframes for the app', assignee: 'Alice' },
  { id: '2', title: 'Write Tests', description: 'Add unit tests for all modules', assignee: 'Bob' },
  { id: '3', title: 'Fix Bugs', description: 'Resolve open issues on GitHub', assignee: 'Alice' },
  { id: '4', title: 'Deploy App', description: 'Push latest build to production', assignee: 'Charlie' },
  { id: '5', title: 'Code Review', description: 'Review PRs from the team', assignee: '' },
];
\`\`\`

Features:
• Filter: Real-time case-insensitive filtering by assignee name.
• Remove: "Remove Assignee" button clears the assignee.
• Add: For unassigned tasks, show an inline text input + "Assign" button.

Criteria:
• Use FlatList for rendering.
• Tasks with no assignee show "Unassigned".
• State must stay in memory (no backend).`,
    durationMinutes: 60, 
    level: "hard",
    isDefault: true,
  },
  {
    id: "swipe-to-delete",
    title: "Swipe to Delete Contacts",
    description: `Build a contact list where each item can be swiped left to reveal a delete button.

Initial Data:
\`\`\`js
const CONTACTS = [
  { id: '1', name: 'Alice Johnson', phone: '+91 98765 43210' },
  { id: '2', name: 'Bob Smith', phone: '+91 91234 56789' },
  { id: '3', name: 'Charlie Brown', phone: '+91 99876 54321' },
  { id: '4', name: 'Diana Prince', phone: '+91 98123 45678' },
  { id: '5', name: 'Ethan Hunt', phone: '+91 97654 32109' },
  { id: '6', name: 'Fiona Green', phone: '+91 96543 21098' },
  { id: '7', name: 'George Miller', phone: '+91 95432 10987' },
  { id: '8', name: 'Hannah Lee', phone: '+91 94321 09876' },
  { id: '9', name: 'Ivan Drago', phone: '+91 93210 98765' },
  { id: '10', name: 'Julia Roberts', phone: '+91 92109 87654' },
];
\`\`\`

Features:
• Swipe left on any item reveals a red Delete button (80px wide).
• Tapping Delete removes the item from the list.
• Only one item can be swiped open at a time — opening a new one closes the previous.
• Smooth collapse animation on deletion (height animates to 0).

Constraints:
• Use FlatList for rendering.
• No external libraries — use PanResponder + Animated from React Native core.
• No react-native-gesture-handler or react-native-swipeable.`,
    durationMinutes: 45, // Medium
    level: "medium",
    isDefault: true,
  },
  {
    id: "bottom-sheet",
    title: "Draggable Bottom Sheet",
    description: `Build a draggable bottom sheet with three snap points.

Features:
• A trigger button opens the sheet to the 50% snap point.
• Drag handle at the top — dragging up/down snaps to the nearest point.
• Three snap points:
  – 25% of screen visible (resting/collapsed)
  – 50% of screen visible (default open)
  – 100% of screen visible (fully expanded)
• Tapping the backdrop closes the sheet (animates off screen).
• Sheet content is a scrollable list of 20 items — scrollable only at 100%.
• Spring animation between snap points.

Constraints:
• No external libraries — use PanResponder + Animated from React Native core.
• No @gorhom/bottom-sheet or similar.`,
    durationMinutes: 120, // Hard (Extended)
    level: "hard",
    isDefault: true,
  },
  {
    id: "chat-ui",
    title: "Chat UI with Bot Replies",
    description: `Build a working chat interface with sent and received messages.

Initial State:
• One initial message from the bot: "Hey! How can I help you?"

Features:
• Messages list — sent messages align right (purple), received align left (white).
• Each message shows a timestamp.
• Input bar stays above the keyboard (KeyboardAvoidingView).
• Send button (disabled when input is empty) adds the user's message.
• After each user message, a bot auto-replies after 1 second with a random response from:
\`\`\`js
const BOT_REPLIES = [
  'Got it!', 'Interesting...', 'Tell me more.',
  'I see what you mean.', 'That makes sense!',
  'Can you elaborate?', 'Noted!'
];
\`\`\`
• Show a "Bot is typing..." indicator during the 1 second delay.
• Auto-scroll to the latest message on send and on bot reply.`,
    durationMinutes: 45, // Medium
    level: "medium",
    isDefault: true,
  },
  {
    id: "pin-entry",
    title: "PIN Entry Screen",
    description: `Build a PIN entry screen with a custom number pad.

Features:
• 4 dot indicators — fill as the user types, empty on backspace.
• Custom number pad layout:
\`\`\`
1  2  3
4  5  6
7  8  9
   0  ⌫
\`\`\`
• On entering 4 digits, auto-verify against the correct PIN (use 1234).
• Wrong PIN: shake animation on the dots, increment attempt counter, clear input.
• After 3 wrong attempts: lock screen for 30 seconds with a countdown timer. Input disabled during lockout.
• Correct PIN: show a success state ("Access Granted" with a green checkmark).

Constraints:
• No TextInput — custom keypad only.
• Shake must use Animated (translateX sequence).`,
    durationMinutes: 45, // Medium
    level: "medium",
    isDefault: true,
  },
  {
    id: "progress-tracker",
    title: "Animated Progress Tracker",
    description: `Build a task progress tracker with animated progress bar.

Initial Tasks:
\`\`\`js
const TASKS = [
  { id: '1', label: 'Read the problem statement' },
  { id: '2', label: 'Plan the state shape' },
  { id: '3', label: 'Implement core logic' },
  { id: '4', label: 'Build the UI' },
  { id: '5', label: 'Test edge cases' },
];
\`\`\`

Features:
• Progress bar at the top fills smoothly as tasks are checked (Animated.timing).
• Percentage label updates live (e.g. "60%").
• Each task row has a circular checkbox — tap to toggle.
• Checked tasks show strikethrough text and a filled checkbox.
• Unchecking reduces the progress bar back.
• When all 5 tasks are checked:
  – Show an "All done!" banner below the list.
  – Animate the banner in with a scale spring (from 0 to 1).
  – Banner disappears if any task is unchecked.`,
    durationMinutes: 25, // Easy
    level: "easy",
    isDefault: true,
  },
  {
    id: "otp-input",
    title: "OTP Input with Resend Timer",
    description: `Build a 6-digit OTP input screen.

Features:
• 6 individual digit boxes in a row.
• Auto-focus moves to the next box on each digit entry.
• Backspace clears current box and moves focus to the previous box.
• Paste support — pasting a 6-digit string fills all boxes at once.
• "Verify" button appears only when all 6 digits are filled.
• Tapping Verify checks against correct OTP (use 123456):
  – Correct: show "Verified!" success state.
  – Wrong: shake animation + clear all boxes + refocus first box.
• Resend OTP button with a 30-second cooldown timer:
  – Disabled and shows "Resend in 24s" during cooldown.
  – Enabled after cooldown — tapping resets the timer.`,
    durationMinutes: 90, // Hard
    level: "hard",
    isDefault: true,
  },
  {
    id: "stopwatch-laps",
    title: "Stopwatch with Laps",
    description: `Build a stopwatch with lap tracking.

Features:
• Display elapsed time in MM:SS.ms format (e.g. 01:23.45).
• Three buttons:
  – Start / Stop toggle.
  – Lap — records current elapsed time as a lap (only active while running).
  – Reset — stops and clears everything (only active while stopped).
• Lap list below the timer — newest lap at the top.
• Each lap shows: lap number, lap split time (time since last lap), and total elapsed time.
• Highlight the fastest lap in green and slowest lap in red.

Constraints:
• Use Date.now() for elapsed time — not setInterval counter (avoids drift).
• useRef for the interval, not useState.`,
    durationMinutes: 45, // Medium
    level: "medium",
    isDefault: true,
  },
  {
    id: "nested-comments",
    title: "Nested Comments (Reddit-style)",
    description: `Build a Reddit-style nested comment thread.

Initial Data:
\`\`\`js
const COMMENTS = [
  {
    id: '1', author: 'alice', text: 'Great post!', likes: 12,
    replies: [
      {
        id: '1-1', author: 'bob', text: 'Totally agree.', likes: 5,
        replies: [
          { id: '1-1-1', author: 'carol', text: 'Same here!', likes: 2, replies: [] }
        ]
      },
      { id: '1-2', author: 'dave', text: 'Not sure about this.', likes: 1, replies: [] }
    ]
  },
  {
    id: '2', author: 'eve', text: 'Interesting perspective.', likes: 8,
    replies: [
      { id: '2-1', author: 'frank', text: 'Can you elaborate?', likes: 3, replies: [] }
    ]
  },
];
\`\`\`

Features:
• Render comments recursively — each reply is indented by 16px per depth level.
• Each comment shows: author, text, like count, Reply button, Collapse button.
• Collapse button hides all replies under that comment (toggle).
• Reply button shows an inline TextInput + Submit below the comment.
  – Submit adds the new reply to that comment's replies array.
  – Input clears and hides after submit.
  – Submit disabled when input is empty.
• Like button increments the like count for that comment.

Constraints:
• No FlatList — use recursive component rendering (ScrollView + map).
• All state in memory — no backend.
• Must support arbitrary nesting depth.`,
    durationMinutes: 120, // Hard (Extended)
    level: "hard",
    isDefault: true,
  },
  {
    id: "file-explorer",
    title: "File Explorer Tree",
    description: `Build a file system explorer with nested folders.

Initial Data:
\`\`\`js
const FILE_TREE = {
  id: 'root', name: 'root', type: 'folder', children: [
    {
      id: 'src', name: 'src', type: 'folder', children: [
        { id: 'app', name: 'App.tsx', type: 'file' },
        { id: 'index', name: 'index.ts', type: 'file' },
        {
          id: 'components', name: 'components', type: 'folder', children: [
            { id: 'btn', name: 'Button.tsx', type: 'file' },
            { id: 'modal', name: 'Modal.tsx', type: 'file' },
          ]
        },
      ]
    },
    {
      id: 'assets', name: 'assets', type: 'folder', children: [
        { id: 'logo', name: 'logo.png', type: 'file' },
      ]
    },
    { id: 'pkg', name: 'package.json', type: 'file' },
  ]
};
\`\`\`

Features:
• Folders show a chevron (> collapsed, v expanded) — tap to toggle.
• Files show a file icon. Tapping a file highlights it (selected state).
• Each level is indented by 16px.
• Add button (+ icon) next to each folder — tapping opens an inline input to name a new file. Press confirm to add it.
• Delete button (x icon) next to each node — removes it (and all children if folder).
• Rename: long-press any node to make its name inline-editable.

Constraints:
• No external libraries.
• All state in memory.
• Must support arbitrary nesting depth.`,
    durationMinutes: 60, // Hard (Extended)
    level: "medium",
    isDefault: true,
  },
  {
    id: "multi-step-form",
    title: "Multi-Step Form",
    description: `Build a 3-step registration form with validation.

Steps:
• Step 1 — Personal Info:
  – Full Name (required, min 2 chars)
  – Email (required, valid email format)
  – Phone (required, 10 digits)

• Step 2 — Address:
  – Street Address (required)
  – City (required)
  – PIN Code (required, 6 digits)

• Step 3 — Review & Submit:
  – Read-only summary of all entered data.
  – Edit button per section takes user back to that step.
  – Submit button shows a success screen.

Features:
• Progress bar at top showing current step (1/3, 2/3, 3/3).
• Next button disabled until all fields in current step are valid.
• Inline error messages appear on blur (not on every keystroke).
• Back button returns to previous step (data is preserved).
• On mobile — active input must not be obscured by keyboard (KeyboardAvoidingView).

Constraints:
• No form libraries (no Formik, no react-hook-form).
• Validation logic must be custom.`,
    durationMinutes: 45, // Medium
    level: "medium",
    isDefault: true,
  },
  {
    id: "image-carousel",
    title: "Image Carousel",
    description: `Build an auto-playing image carousel.

Initial Data — use these placeholder image URLs:
\`\`\`js
const SLIDES = [
  { id: '1', uri: 'https://picsum.photos/seed/a/400/250', caption: 'Mountain View' },
  { id: '2', uri: 'https://picsum.photos/seed/b/400/250', caption: 'Ocean Sunset' },
  { id: '3', uri: 'https://picsum.photos/seed/c/400/250', caption: 'City Lights' },
  { id: '4', uri: 'https://picsum.photos/seed/d/400/250', caption: 'Forest Path' },
  { id: '5', uri: 'https://picsum.photos/seed/e/400/250', caption: 'Desert Dunes' },
];
\`\`\`

Features:
• Full-width image with caption below.
• Auto-advances every 3 seconds.
• Dot indicators at the bottom — active dot is larger/filled.
• Swipe left/right to navigate manually (PanResponder).
• Prev / Next arrow buttons.
• Auto-play pauses when user interacts (swipe or button tap) and resumes after 5 seconds of inactivity.
• Smooth slide animation between images.

Mobile-specific considerations:
• Touch target for arrows must be at least 44×44pt.
• Dots must have sufficient spacing to be tappable (min 8px gap).
• Image must not cause layout shift while loading — reserve fixed height (250px).`,
    durationMinutes: 45, // Medium
    level: "medium",
    isDefault: true,
  },
  {
    id: "counter-history",
    title: "Counter with History",
    description: `Build an interactive counter that tracks its action history.

Features:
• Display current count (starts at 0).
• Three action buttons: Increment (+1), Decrement (-1), Reset (back to 0).
• History list showing the last 10 actions — newest at top.
  – Each entry shows: action name, resulting value, and timestamp.
  – e.g. "Increment → 5  •  10:32:01"
• Undo button — reverts the last action (restores previous count and removes it from history).
• Undo is disabled when history is empty.
• History is capped at 10 entries — oldest entry drops off when limit is exceeded.

Mobile-specific considerations:
• Buttons must have minimum touch target of 44×44pt — use padding, not just text size.
• Counter value should be large and centered (fontSize 64) — easy to read at a glance.
• History list should be in a ScrollView capped at 300px height.`,
    durationMinutes: 25, // Easy
    level: "easy",
    isDefault: true,
  },
  {
    id: "color-picker",
    title: "Color Picker",
    description: `Build a color picker with a swatch grid and hex preview.

Colors to display:
\`\`\`js
const COLORS = [
  '#FF6B6B','#FF8E53','#FFC300','#2ECC71','#1ABC9C',
  '#3498DB','#9B59B6','#E91E63','#607D8B','#795548',
  '#F44336','#FF9800','#FFEB3B','#4CAF50','#00BCD4',
  '#2196F3','#673AB7','#E040FB','#455A64','#BDBDBD',
];
\`\`\`

Features:
• 4-column grid of circular color swatches.
• Tapping a swatch selects it — show a checkmark on the selected swatch.
• Selected color preview rectangle (80px tall, full width) below the grid.
• Hex value label below the preview (e.g. "#3498DB").
• Copy button — copies hex to clipboard and shows "Copied!" toast for 2 seconds.
• Recently used section — last 5 selected colors shown in a horizontal row above the grid.
  – Tapping a recent color re-selects it.

Mobile-specific considerations:
• Swatches must be at least 44×44pt with adequate spacing — use a 4-column grid with flex.
• Copy feedback must be a non-blocking toast (absolute positioned), not an alert().
• Use a mock for copying behavior for the mobile app, as external libraries are not supported`,
    durationMinutes: 45, 
    level: "medium",
    isDefault: true,
    images: ["https://i.ibb.co/vvVRGGp9/Chat-GPT-Image-Apr-9-2026-01-57-26-PM.png"],
  },
  {
    id: "character-counter",
    title: "Character Counter",
    description: `Build a text input with live character counting and limit enforcement.

Features:
• A multiline TextInput with a 280 character limit (Twitter-style).
• Live character counter shown as "characters remaining" (e.g. "94 remaining").
• Counter color changes:
  – Default: gray
  – Below 20 remaining: amber/orange
  – Below 10 remaining: red
  – At 0: red + input border turns red
• Circular progress indicator (using Animated + border trick) that fills as the user types.
• Post button:
  – Disabled when input is empty or over the limit.
  – On press: clears input, shows "Posted!" confirmation for 2 seconds.
• If pasted text exceeds the limit — trim to 280 and show "Text trimmed to 280 characters" toast.

Mobile-specific considerations:
• Use multiline TextInput with scrollEnabled.
• KeyboardAvoidingView so the counter stays visible above the keyboard.
• Minimum input height 120px, expands up to 200px then scrolls.`,
    durationMinutes: 25, // Easy
    level: "easy",
    isDefault: true,
  },
  {
    id: "searchable-dropdown",
    title: "Searchable Dropdown",
    description: `Build a searchable dropdown selector for a country list.

Initial Data:
\`\`\`js
const COUNTRIES = [
  'Afghanistan','Australia','Brazil','Canada','China',
  'Denmark','Egypt','France','Germany','India',
  'Indonesia','Iran','Italy','Japan','Kenya',
  'Mexico','Netherlands','Nigeria','Pakistan','Russia',
  'Saudi Arabia','South Africa','South Korea','Spain',
  'Sweden','Thailand','Turkey','Ukraine','United Kingdom','United States',
];
\`\`\`

Features:
• A tappable input field showing selected value or "Select a country..." placeholder.
• Tapping opens a Modal with a search TextInput at the top and a filtered FlatList below.
• Typing filters the list in real-time (case-insensitive).
• Tapping an item selects it, closes the modal, and shows the value in the trigger field.
• Clear button (x) in the trigger field when a value is selected — clears selection.
• Show "No results found" when filter returns empty.

Mobile-specific considerations:
• Use Modal (not absolute positioning) so it works correctly on both iOS and Android.
• Search input must auto-focus when the modal opens (autoFocus prop).
• FlatList inside modal must have keyboardShouldPersistTaps="handled" so tapping
  a list item while keyboard is open works correctly.
• Modal must have a visible Cancel button — do not rely solely on backdrop tap
  since Android back button behavior differs from iOS.
• Minimum list item height 48px for comfortable touch targets.`,
    durationMinutes: 45, // Medium
    level: "medium",
    isDefault: true,
  },
];
