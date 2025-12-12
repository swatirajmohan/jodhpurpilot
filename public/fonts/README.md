# Font Files for PDF Generation

## Required Fonts

This folder must contain the following TrueType font files:

1. **Roboto-Regular.ttf** - For English text
2. **NotoSansDevanagari-Regular.ttf** - For Hindi text

## How to Add Fonts

### Option 1: Download from Google Fonts

**Roboto:**
1. Go to https://fonts.google.com/specimen/Roboto
2. Download the font family
3. Extract and copy `Roboto-Regular.ttf` to this folder

**Noto Sans Devanagari:**
1. Go to https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari
2. Download the font family
3. Extract and copy `NotoSansDevanagari-Regular.ttf` to this folder

### Option 2: Use System Fonts

If you have these fonts installed on your system, copy them from:
- macOS: `/System/Library/Fonts/` or `~/Library/Fonts/`
- Windows: `C:\Windows\Fonts\`
- Linux: `/usr/share/fonts/` or `~/.fonts/`

## After Adding Fonts

Run the following command to generate the VFS file:

```bash
npm run build:vfs
```

This will create `src/pdf/customVfs.ts` with base64-encoded fonts.

## Files Needed

- [ ] Roboto-Regular.ttf
- [ ] NotoSansDevanagari-Regular.ttf

## Current Status

⚠️ **TODO: Add actual font files to this folder**

Placeholder files have been created. Replace them with real TTF files before running `npm run build:vfs`.

