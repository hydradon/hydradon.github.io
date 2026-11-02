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
})();
