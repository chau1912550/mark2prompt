# Mark2Prompt

Draw on a screenshot, number the spots that need to change, and get a clean image plus a structured prompt to paste
into an AI chat (Claude, ChatGPT, Gemini…). No more "the button on the left, no, the other one".

Everything runs in your browser. Images are never uploaded anywhere.

## Features

- **Load images**: paste (Ctrl+V), drag and drop, or open files. Several images per project, one tab each
  with a thumbnail and mark count.
- **Drawing tools**: numbered pin, box, circle, arrow, line, freehand pen, highlight, text label,
  pixelate (hide private info), crop.
- **Edit marks**: move, resize with corner handles, drag line end points, duplicate (Ctrl+D), nudge with arrow keys,
  change color / size / solid or dashed stroke of the selected mark, undo/redo (crop too).
- **Notes for the AI**: every pin/box/arrow gets a number and a card with an action
  (Change, Remove, Add, Move, Recolor, Resize, Fix, Replace, Question, Keep), a priority and your note.
- **Context**: one project goal and an "image context" line per image.
- **Prompt styles**: General, UI / code change, Image editing, Technical drawing review, Explain, Design feedback.
- **Export**: copy the marked image, copy the prompt, or download PNG / Markdown. Optional notes legend drawn under
  the image, so one picture carries everything. The prompt lists each number with its action, priority,
  position (% of width/height) and note.
- **View**: zoom, pan, fit, hide marks to see the original, light / dark / system theme.
- **Saving**: autosaves in this browser (IndexedDB); Save/Open a `.json` project file to keep or move your work.

## Shortcuts

| Key | Tool | Key | Tool |
|---|---|---|---|
| V | Select / move | M | Pin |
| R | Box | E | Circle |
| A | Arrow | L | Line |
| P | Pen | G | Highlight |
| T | Text | B | Pixelate |
| C | Crop (Enter to apply) | O | Hide / show marks |
| H / hold Space | Pan | 0 | Fit to screen |
| + / − / wheel | Zoom | Del | Delete selected |
| Ctrl+Z / Ctrl+Y | Undo / Redo | Ctrl+D | Duplicate |
| Arrow keys | Nudge (Shift = ×10) | Ctrl+S | Save project |

Hold Shift while drawing for a square/circle or a 45° line.

## Run locally

It is a static site with no build step. Open `index.html` directly, or serve the folder:

```bash
python -m http.server 5173
```

Then open http://localhost:5173.

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project → Import** the repository.
3. Framework preset: **Other**. Leave Build Command and Output Directory empty.
4. Deploy. Every push to `main` redeploys automatically.

## Files

| File | What it does |
|---|---|
| `index.html` | Page layout |
| `styles.css` | Styles (light and dark) |
| `app.js` | Drawing, notes, prompt builder, export, autosave |
