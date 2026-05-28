# Tangled-Inspired Cinematic Birthday Website

A premium, animated, fantasy birthday experience built with:

- HTML5
- CSS3
- JavaScript
- GSAP
- ScrollTrigger
- Lenis smooth scroll

## Folder Structure

```text
tangled-birthday-site/
├── index.html
├── README.md
└── assets/
    ├── audio/
    │   └── fantasy-theme.mp3          # replace with your music
    ├── css/
    │   └── styles.css
    ├── images/
    │   ├── photo-1.jpg                # replace with your photos
    │   ├── photo-2.jpg
    │   ├── photo-3.jpg
    │   ├── photo-4.jpg
    │   ├── photo-5.jpg
    │   ├── photo-6.jpg
    │   └── photo-7.jpg
    └── js/
        └── app.js
```

## Replace These Customizable Parts

### 1) Her name and subtitle
In `index.html`, edit:

```js
window.BIRTHDAY_CONFIG = {
  name: "[ADD NAME]",
  subtitle: "[ADD SUBTITLE]",
```

### 2) Memory photos and messages
In `index.html`, edit the `memories` array:

```js
memories: [
  {
    title: "Memory One",
    image: "assets/images/photo-1.jpg",
    message: "[ADD MESSAGE 1]"
  }
]
```

### 3) Final full-screen letter
In `index.html`, edit:

```js
finalLetter: `Dear [ADD NAME],\n\n[ADD LETTER]\n\nWith love always,\n[YOUR NAME]`
```

### 4) Background music
Put your soundtrack inside:

```text
assets/audio/fantasy-theme.mp3
```

Or change the file path in `index.html`:

```html
<audio id="bgMusic" loop preload="auto">
  <source src="assets/audio/fantasy-theme.mp3" type="audio/mpeg" />
</audio>
```

## Deployment on GitHub Pages

1. Create a new GitHub repository.
2. Upload all files while preserving the same folder structure.
3. Commit and push to GitHub.
4. Go to **Settings → Pages**.
5. Under **Build and deployment**, choose:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/root`
6. Save.
7. Wait a minute for GitHub Pages to publish.
8. Your site will be available at:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

## Notes

- If a photo is missing, the site automatically shows a stylized placeholder.
- The website is responsive and optimized to reduce particle count on mobile.
- For best results, compress your photos before uploading.
- Recommended image size: around 1200px tall JPG/WebP.
- Recommended audio: a compressed MP3 under 8 MB for quick loading.
