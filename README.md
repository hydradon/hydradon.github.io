# hydradon.github.io

Personal portfolio site of Quang N. Vu, served by GitHub Pages at https://hydradon.github.io/.

Plain HTML, CSS and vanilla JavaScript. No build step: push to the default branch and GitHub Pages serves the files as they are.

## Structure

```
index.html            Single page: intro, skills, experience, education, projects, GitHub repos
404.html              Not-found page (served automatically by GitHub Pages)
assets/css/style.css  All styles (dark theme, colour tokens in :root)
assets/js/main.js     Mobile menu, active nav link, scroll reveal, GitHub repo list, footer year
images/               Avatar and favicons
cv/                   Older local copy of the resume; the page does not link to it (the CV button uses Google Drive)
robots.txt, sitemap.xml
.nojekyll             Tells GitHub Pages to skip Jekyll processing
```

The "Open source on GitHub" section loads public, non-fork repositories from the GitHub API in the browser and caches the result in `sessionStorage` for an hour. If the API call fails (for example, rate limiting), the section keeps a link to the GitHub profile.

## Preview locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000/.
