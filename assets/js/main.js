(function () {
	"use strict";

	var root = document.documentElement;
	var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	var yearEl = document.getElementById("year");
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	var header = document.querySelector(".site-header");
	var toggle = document.querySelector(".nav-toggle");
	var menu = document.getElementById("nav-menu");

	function setMenu(open) {
		if (!toggle || !menu) return;
		toggle.setAttribute("aria-expanded", String(open));
		toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
		menu.classList.toggle("open", open);
	}

	if (toggle && menu) {
		toggle.addEventListener("click", function () {
			setMenu(toggle.getAttribute("aria-expanded") !== "true");
		});
		menu.addEventListener("click", function (e) {
			if (e.target.closest("a")) setMenu(false);
		});
		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && menu.classList.contains("open")) {
				setMenu(false);
				toggle.focus();
			}
		});
	}

	if (header) {
		var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
	}

	if ("IntersectionObserver" in window) {
		var navLinks = menu ? Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]')) : [];
		var sections = navLinks
			.map(function (a) { return document.querySelector(a.getAttribute("href")); })
			.filter(Boolean);

		// Thin band near the top of the viewport decides which section is "current".
		// When no nav section is in the band (e.g. back in the hero), no link is active.
		var inBand = {};
		var spy = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) { inBand[entry.target.id] = entry.isIntersecting; });
			var currentId = null;
			for (var i = sections.length - 1; i >= 0; i--) {
				if (inBand[sections[i].id]) { currentId = sections[i].id; break; }
			}
			navLinks.forEach(function (a) {
				var match = currentId !== null && a.getAttribute("href") === "#" + currentId;
				a.classList.toggle("active", match);
				if (match) a.setAttribute("aria-current", "location");
				else a.removeAttribute("aria-current");
			});
		}, { rootMargin: "-30% 0px -65% 0px" });
		sections.forEach(function (s) { spy.observe(s); });

		if (!reduceMotion) {
			root.classList.add("js");
			var revealer = new IntersectionObserver(function (entries, obs) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add("visible");
						obs.unobserve(entry.target);
					}
				});
			}, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
			document.querySelectorAll(".reveal").forEach(function (el) { revealer.observe(el); });
		}
	}

	loadRepos();

	function loadRepos() {
		var grid = document.getElementById("repo-grid");
		if (!grid || !window.fetch) return;

		var KEY = "hydradon-repos-v1";
		var TTL = 60 * 60 * 1000;
		var URL = "https://api.github.com/users/hydradon/repos?sort=updated&per_page=100";

		var cached = null;
		try {
			var raw = sessionStorage.getItem(KEY);
			if (raw) {
				var parsed = JSON.parse(raw);
				if (parsed && Date.now() - parsed.t < TTL && isValidRepoList(parsed.data)) cached = parsed.data;
			}
		} catch (e) { /* storage unavailable */ }

		if (cached) { render(cached); return; }

		function isValidRepoList(list) {
			return Array.isArray(list) && list.every(function (r) {
				return r && typeof r.name === "string" && typeof r.stars === "number";
			});
		}

		fetch(URL, { headers: { Accept: "application/vnd.github+json" } })
			.then(function (res) {
				if (!res.ok) throw new Error("GitHub API " + res.status);
				return res.json();
			})
			.then(function (data) {
				if (!Array.isArray(data)) throw new Error("Unexpected response");
				var slim = data.map(function (r) {
					return {
						name: r.name,
						description: r.description,
						language: r.language,
						stars: r.stargazers_count,
						url: r.html_url,
						fork: r.fork,
						archived: r.archived,
						updated: r.pushed_at || r.updated_at
					};
				});
				try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), data: slim })); } catch (e) { /* ignore */ }
				render(slim);
			})
			.catch(function () { /* keep the static fallback text and profile link */ });

		function render(repos) {
			var top = repos
				.filter(function (r) { return !r.fork; })
				.sort(function (a, b) {
					return (b.stars - a.stars) || (new Date(b.updated) - new Date(a.updated));
				})
				.slice(0, 6);
			if (!top.length) return;

			grid.textContent = "";
			top.forEach(function (r) {
				var a = el("a", "card repo");
				a.href = r.url;
				a.target = "_blank";
				a.rel = "noopener";

				var name = el("span", "repo-name");
				name.appendChild(svgIcon("i-code"));
				name.appendChild(document.createTextNode(r.name));
				a.appendChild(name);

				var desc = el("p", "repo-desc");
				desc.textContent = r.description || "No description provided.";
				a.appendChild(desc);

				var meta = el("div", "repo-meta");
				if (r.language) {
					var lang = el("span");
					lang.appendChild(el("i", "lang-dot"));
					lang.appendChild(document.createTextNode(r.language));
					meta.appendChild(lang);
				}
				var stars = el("span");
				stars.appendChild(svgIcon("i-star"));
				stars.appendChild(document.createTextNode(String(r.stars)));
				var starsLabel = el("span", "sr-only");
				starsLabel.textContent = " stars";
				stars.appendChild(starsLabel);
				meta.appendChild(stars);
				a.appendChild(meta);

				grid.appendChild(a);
			});
		}
	}

	function el(tag, cls) {
		var node = document.createElement(tag);
		if (cls) node.className = cls;
		return node;
	}

	function svgIcon(id) {
		var ns = "http://www.w3.org/2000/svg";
		var svg = document.createElementNS(ns, "svg");
		svg.setAttribute("class", "icon");
		svg.setAttribute("aria-hidden", "true");
		var use = document.createElementNS(ns, "use");
		use.setAttribute("href", "#" + id);
		svg.appendChild(use);
		return svg;
	}
})();
