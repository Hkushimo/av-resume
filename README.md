# Digital Resume

This is a small static digital resume site. The visible resume content is stored in `resume-data.json`, so updating experience, selected shows, skills, contact details, and show kit items does not require editing the HTML.

## Edit Your Resume

Open `resume-data.json` and update the arrays or text fields:

- `expertise`: skill chips
- `showKit`: gear and kit notes
- `experience`: work history and bullet highlights
- `selectedShows`: portfolio cards and filter categories

Keep the JSON syntax valid: strings need double quotes, array items are separated by commas, and there should be no trailing comma after the last item.

## Edit With The Offline Editor

Open `editor.html` in Chrome or Edge, then click **Open JSON** and choose `resume-data.json`.

- **Save JSON** saves back to the same file when the browser allows file saving.
- **Download copy** always exports a fresh `resume-data.json` file if direct saving is blocked.
- The editor is for local use only; you do not need to upload `editor.html`, `editor.css`, or `editor.js` to Cloudflare.

## Preview Locally

Run a local static server from this folder:

```powershell
python -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

When you put this on your domain, upload these files together:

- `index.html`
- `styles.css`
- `app.js`
- `resume-data.json`
- `assets/profile.webp`
