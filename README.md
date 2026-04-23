# WhyCrew Certificate Builder

An editable certificate web page (Black/Gold + White themes) with a PDF export button.

## How to run

Open `index.html` in a browser.

If you prefer a local server (recommended for best font rendering consistency):

```bash
cd "/Users/zainabtariq/Projects/whycrew-certificate"
python3 -m http.server 5173
```

Then open `http://localhost:5173`.

## How to export PDF

- Click **Export PDF**
- In the print dialog:
  - Destination: **Save as PDF**
  - Paper: **A4**
  - Margins: **None**
  - Background graphics: **On** (important for the theme)

## Notes

- You can edit text from the left panel or click directly on the certificate.
- Logo upload is embedded in the saved PDF.
- Your edits are saved in the browser (localStorage) so they persist after refresh.

