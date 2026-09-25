(function () {
	document.documentElement.classList.add("js");

	var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

	// Year in footer
	var year = document.getElementById("year");
	if (year) year.textContent = new Date().getFullYear();

	// Reveal on scroll, with a per-group stagger
	var reveals = document.querySelectorAll(".reveal");
	function startReveals() {
		if ("IntersectionObserver" in window && !reduceMotion) {
			var io = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) return;
					entry.target.classList.add("is-in");
					io.unobserve(entry.target);
				});
			}, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
			reveals.forEach(function (el) { io.observe(el); });
		} else {
			reveals.forEach(function (el) { el.classList.add("is-in"); });
		}
	}

	// Preloader: let the logo finish drawing (~4s), and wait for the page to load
	var preload = document.getElementById("preload");
	var minTime = reduceMotion ? 0 : 4000;
	function hidePreload() {
		// performance.now() counts from navigation start, when the logo began drawing
		var elapsed = window.performance && performance.now ? performance.now() : minTime;
		setTimeout(function () {
			document.documentElement.classList.remove("is-loading");
			if (!preload) return startReveals();
			preload.classList.add("out");
			startReveals();
			setTimeout(function () { preload.remove(); }, 1000);
		}, Math.max(0, minTime - elapsed));
	}
	if (document.readyState === "complete") hidePreload();
	else window.addEventListener("load", hidePreload, { once: true });

	// Stagger the bullet list inside each role
	document.querySelectorAll(".role__body li").forEach(function (li, i, all) {
		li.style.setProperty("--n", Array.prototype.indexOf.call(li.parentNode.children, li));
	});

	// Nav: glass background once scrolled, and highlight the current section
	var nav = document.getElementById("nav");
	var sentinel = document.createElement("div");
	sentinel.style.cssText = "position:absolute;top:0;height:40px;width:1px;pointer-events:none";
	document.body.prepend(sentinel);
	if ("IntersectionObserver" in window) {
		new IntersectionObserver(function (e) {
			nav.classList.toggle("is-scrolled", !e[0].isIntersecting);
		}).observe(sentinel);

		var links = {};
		document.querySelectorAll(".nav__links a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
		var spy = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				var link = links[entry.target.id];
				if (link) link.classList.toggle("is-active", entry.isIntersecting);
			});
		}, { rootMargin: "-45% 0px -50% 0px" });
		Object.keys(links).forEach(function (id) {
			var s = document.getElementById(id);
			if (s) spy.observe(s);
		});
	}

	// Experience accordion: keep one role open at a time
	var roles = document.querySelectorAll(".role details");
	roles.forEach(function (d) {
		d.addEventListener("toggle", function () {
			if (!d.open) return;
			roles.forEach(function (other) { if (other !== d) other.open = false; });
		});
	});

	// Magnetic buttons: transform only, driven by rAF
	if (finePointer && !reduceMotion) {
		document.querySelectorAll(".magnetic").forEach(function (btn) {
			var frame = null, tx = 0, ty = 0;
			function apply() { btn.style.transform = "translate(" + tx + "px," + ty + "px)"; frame = null; }
			btn.addEventListener("pointermove", function (e) {
				var r = btn.getBoundingClientRect();
				tx = (e.clientX - (r.left + r.width / 2)) * 0.22;
				ty = (e.clientY - (r.top + r.height / 2)) * 0.3;
				if (!frame) frame = requestAnimationFrame(apply);
			});
			btn.addEventListener("pointerleave", function () {
				tx = 0; ty = 0;
				if (!frame) frame = requestAnimationFrame(apply);
			});
		});
	}
})();
