function makeId (url) {
    return url.trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_-]+/g, "_");
};

async function scrapePage(pagePath) {
  try {
    const url = new URL(pagePath,window.location.origin);
    const html = await fetch(url).then(r => r.text());
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    const title = 
      doc.querySelector("header .page-title")?.innerText ||
      doc.querySelector("title")?.innerText ||
      url;
    const page = {
      id: makeId(url.pathname),
      title: title,
      href: url.pathname
    }
    
    const rawLinks = [...doc.querySelectorAll("a")]
      .filter(a => 
        a &&
        !a.classList.contains("nav-button") &&
        !a.closest("#back-to-top")
      )
      .map(a => a.getAttribute("href"))
      .filter(href =>
        href &&
        href.endsWith(".html") &&
        !href.startsWith("http") &&
        !href.startsWith("#")
      );
    const links = rawLinks.map(href => ({
        source: page.id,
        sourceHref: page.href,
        target: makeId(href),
        targetHref: href
    }));

    return {page, links}
  } catch (e) {
    console.warn("Failed to fetch page:", url, e);
  }
};

async function readSitemap() {
  try {
    const sitemap = await fetch(new URL("/sitemap.xml", window.location.origin))
      .then(response => response.text());
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sitemap, "application/xml");
    const NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
    const locs = [...xmlDoc.getElementsByTagNameNS(NS, "loc")];
    const pageUrls = locs
      .map(el => el.textContent.trim())
      .map(el => new URL(el).pathname);
    // .filter(url => url.endsWith(".html"));
    return pageUrls;
  } catch (e) {
    console.warn("Failed to fetch sitemap:", url, e);
  }
};

(async () => {
  const allPageUrls = await readSitemap()
  const pageUrls = allPageUrls.filter(pageUrl => 
      pageUrl &&
      !pageUrl.endsWith("graph.html") &&
      !pageUrl.endsWith("all_notes.html")
    );
  const scrapedData = await Promise.all(
    pageUrls.map(async (pageUrl) => {
      const pageScrape = await scrapePage(pageUrl);
      return pageScrape;
    })
  );
  const graphData = {}
  graphData.nodes = scrapedData.map(el => el.page)
  graphData.links = scrapedData.map(el => el.links)

  window.GRAPH_DATA = graphData
  console.log(window.GRAPH_DATA)
})();
