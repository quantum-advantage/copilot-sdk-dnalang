"""
OSIRIS ArXiv/PubMed Literature Watcher — Phase 1: Continuous Data Ingestion.

Monitors arxiv.org, PubMed, and bioRxiv for new papers relevant to
the research knowledge graph. Every paper ingested becomes a graph node;
its abstract is scanned for claims that may support or contradict
existing nodes.

This is what OSIRIS needs to stop reasoning from a frozen corpus and
start operating on the live global scientific output.

APIs:
  arXiv    — https://export.arxiv.org/api/query  (Atom/XML, free, no key)
  PubMed   — https://eutils.ncbi.nlm.nih.gov/entrez/eutils/ (free, no key needed)
  bioRxiv  — https://api.biorxiv.org/details/biorxiv/ (JSON REST, free)

Usage:
  watcher = ArxivWatcher()
  new_nodes = watcher.scan()            # check all sources, return new nodes
  watcher.start_daemon(interval=3600)   # background hourly check

  osiris literature scan
  osiris literature query "quantum coherence oncology"
"""

from __future__ import annotations

import os
import re
import json
import time
import math
import hashlib
import threading
import xml.etree.ElementTree as ET
import urllib.request
import urllib.parse
import urllib.error
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from .research_graph import (
    ResearchGraph, ConceptNode, TheoreticalClaim, ResearchQuestion,
    EdgeType, Domain, NodeType,
    get_research_graph, _make_id,
)

# ── Constants ─────────────────────────────────────────────────────────────────

_STATE_FILE    = os.path.expanduser("~/.osiris/arxiv_seen.json")
_SCAN_LOG      = os.path.expanduser("~/.osiris/literature_scan.jsonl")
_REQUEST_DELAY = 3.0   # seconds between API calls (be a good citizen)

# Default queries — derived from the research graph's core keywords + extended
_DEFAULT_QUERIES: Dict[str, List[str]] = {
    Domain.QUANTUM: [
        "quantum coherence heavy-hex superconducting",
        "quantum circuit decoherence fidelity ibm",
        "theta lock quantum phase coherence",
        "lindblad master equation qubit fidelity",
        "quantum advantage variational eigensolver",
        "quantum error mitigation noise characterization",
    ],
    Domain.ONCOLOGY: [
        "BRCA2 mutation quantum chemistry binding",
        "oncology drug resistance quantum tunneling",
        "cancer biomarker quantum coherence DNA",
        "BRCA2 D1152H inhibitor selectivity",
        "tumor quantum biology information",
    ],
    Domain.DRUG_DISCOVERY: [
        "quantum computing drug discovery binding free energy",
        "HOMO LUMO drug target selectivity",
        "variational quantum eigensolver molecular hamiltonian",
        "quantum simulation drug binding affinity",
        "molecular dynamics quantum enhancement",
    ],
    Domain.PHYSICS: [
        "integrated information consciousness phi",
        "quantum biology coherence biological systems",
        "pilot wave quantum mechanics coherence",
        "quantum information biological noise",
        "negentropy quantum thermodynamics",
    ],
    Domain.CROSS_DOMAIN: [
        "quantum coherence enzyme catalysis tunneling",
        "quantum biology DNA repair coherence",
        "quantum sensing biological measurement",
        "quantum advantage life sciences",
    ],
}

# ArXiv category mappings for each domain
_ARXIV_CATS: Dict[str, str] = {
    Domain.QUANTUM:        "quant-ph+cond-mat.mes-hall",
    Domain.PHYSICS:        "quant-ph+physics.bio-ph",
    Domain.DRUG_DISCOVERY: "q-bio.BM+quant-ph",
    Domain.ONCOLOGY:       "q-bio.MN+q-bio.CB",
    Domain.CROSS_DOMAIN:   "quant-ph+q-bio",
}

# PubMed MeSH term augmentation
_PUBMED_MESH: Dict[str, str] = {
    Domain.ONCOLOGY:       "[MeSH] AND (quantum coherence[tiab] OR quantum tunneling[tiab])",
    Domain.DRUG_DISCOVERY: "AND (quantum computing[tiab] OR variational quantum[tiab])",
    Domain.PHYSICS:        "AND (integrated information[tiab] OR quantum biology[tiab])",
}


# ── Paper dataclass ───────────────────────────────────────────────────────────

@dataclass
class Paper:
    paper_id:  str
    title:     str
    abstract:  str
    authors:   List[str]
    published: str
    url:       str
    source:    str      # "arxiv" | "pubmed" | "biorxiv"
    domain:    str
    categories: List[str] = field(default_factory=list)
    doi:       str = ""
    relevance: float = 0.0   # keyword overlap with graph


# ── ArXiv watcher ─────────────────────────────────────────────────────────────

class ArxivWatcher:
    """
    Continuously monitors academic literature for papers relevant to
    the research knowledge graph.

    Each scan:
    1. Derives search queries from the graph's keywords
    2. Queries arXiv, PubMed, bioRxiv
    3. Deduplicates against seen set
    4. For each new paper: creates a graph node, detects bridges
    5. Returns the new nodes added
    """

    def __init__(self, graph: Optional[ResearchGraph] = None,
                 max_results_per_query: int = 5):
        self._graph   = graph or get_research_graph()
        self._max_per = max_results_per_query
        self._seen:  set = set()
        self._lock   = threading.Lock()
        self._daemon: Optional[threading.Thread] = None
        self._running = False
        os.makedirs(os.path.dirname(_STATE_FILE), exist_ok=True)
        self._load_state()

    # ── Public interface ──────────────────────────────────────────────────────

    def scan(self, domains: Optional[List[str]] = None,
             extra_queries: Optional[List[str]] = None) -> List[Paper]:
        """
        Run a full literature scan. Returns list of new papers ingested.
        Automatically adds nodes to the research graph.
        """
        domains = domains or list(_DEFAULT_QUERIES.keys())
        papers  = []

        # Derive additional queries from the graph itself
        graph_queries = self._derive_graph_queries()

        for domain in domains:
            base_queries = _DEFAULT_QUERIES.get(domain, [])
            for query in base_queries[:3]:   # 3 queries per domain per scan
                new = self._fetch_arxiv(query, domain)
                papers.extend(new)
                time.sleep(_REQUEST_DELAY)

        # PubMed for biomedical domains
        for domain in [Domain.ONCOLOGY, Domain.DRUG_DISCOVERY]:
            for query in _DEFAULT_QUERIES.get(domain, [])[:2]:
                new = self._fetch_pubmed(query, domain)
                papers.extend(new)
                time.sleep(_REQUEST_DELAY)

        # Extra user-specified queries
        for query in (extra_queries or []):
            d = self._classify_query_domain(query)
            new = self._fetch_arxiv(query, d)
            papers.extend(new)
            time.sleep(_REQUEST_DELAY)

        # Graph-derived high-priority queries
        for query, domain in graph_queries[:4]:
            new = self._fetch_arxiv(query, domain)
            papers.extend(new)
            time.sleep(_REQUEST_DELAY)

        # Deduplicate
        new_papers = [p for p in papers if p.paper_id not in self._seen]

        # Ingest into graph
        for paper in new_papers:
            self._ingest_paper(paper)
            with self._lock:
                self._seen.add(paper.paper_id)

        self._save_state()

        # Detect bridges on new data
        if new_papers:
            self._detect_new_bridges(new_papers)

        self._log_scan(new_papers)
        return new_papers

    def query_papers(self, query: str, source: str = "arxiv",
                     max_results: int = 10) -> List[Paper]:
        """Manual literature query — not stored to seen set."""
        domain = self._classify_query_domain(query)
        if source == "pubmed":
            return self._fetch_pubmed(query, domain, max_results=max_results)
        elif source == "biorxiv":
            return self._fetch_biorxiv(query, domain, max_results=max_results)
        return self._fetch_arxiv(query, domain, max_results=max_results)

    def start_daemon(self, interval_seconds: int = 3600) -> None:
        """Start background thread that scans every `interval_seconds`."""
        if self._daemon and self._daemon.is_alive():
            return
        self._running = True
        self._daemon  = threading.Thread(
            target=self._daemon_loop,
            args=(interval_seconds,),
            daemon=True,
            name="osiris-arxiv-daemon",
        )
        self._daemon.start()

    def stop_daemon(self) -> None:
        self._running = False

    @property
    def seen_count(self) -> int:
        return len(self._seen)

    # ── ArXiv fetch ───────────────────────────────────────────────────────────

    def _fetch_arxiv(self, query: str, domain: str,
                     max_results: int = None) -> List[Paper]:
        """Query the arXiv Atom API."""
        max_results = max_results or self._max_per
        encoded = urllib.parse.quote(query)
        cats    = _ARXIV_CATS.get(domain, "quant-ph")
        url = (
            f"https://export.arxiv.org/api/query"
            f"?search_query=all:{encoded}"
            f"&start=0&max_results={max_results}"
            f"&sortBy=submittedDate&sortOrder=descending"
        )
        try:
            with urllib.request.urlopen(url, timeout=15) as resp:
                xml_data = resp.read().decode("utf-8")
        except Exception:
            return []

        return self._parse_arxiv_atom(xml_data, domain)

    def _parse_arxiv_atom(self, xml_str: str, domain: str) -> List[Paper]:
        papers = []
        try:
            root = ET.fromstring(xml_str)
        except ET.ParseError:
            return []
        ns = {"atom": "http://www.w3.org/2005/Atom",
              "arxiv": "http://arxiv.org/schemas/atom"}
        for entry in root.findall("atom:entry", ns):
            def _txt(tag: str, default: str = "") -> str:
                el = entry.find(tag, ns)
                return (el.text or default).strip() if el is not None else default

            paper_id  = _txt("atom:id").split("/abs/")[-1].strip()
            title     = re.sub(r'\s+', ' ', _txt("atom:title"))
            abstract  = re.sub(r'\s+', ' ', _txt("atom:summary"))
            published = _txt("atom:published", datetime.now(timezone.utc).isoformat())
            authors   = [
                (a.find("atom:name", ns).text or "").strip()
                for a in entry.findall("atom:author", ns)
                if a.find("atom:name", ns) is not None
            ]
            url       = _txt("atom:id")
            cats      = [
                c.get("term", "")
                for c in entry.findall("arxiv:primary_category", ns)
            ]

            if not paper_id or not title:
                continue

            relevance = self._relevance_score(title + " " + abstract)
            papers.append(Paper(
                paper_id=f"arxiv:{paper_id}",
                title=title,
                abstract=abstract[:2000],
                authors=authors[:5],
                published=published,
                url=url,
                source="arxiv",
                domain=domain,
                categories=cats,
                relevance=relevance,
            ))
        return papers

    # ── PubMed fetch ──────────────────────────────────────────────────────────

    def _fetch_pubmed(self, query: str, domain: str,
                      max_results: int = None) -> List[Paper]:
        """Query the NCBI E-utilities (PubMed)."""
        max_results = max_results or self._max_per
        # Step 1: esearch — get PMID list
        encoded = urllib.parse.quote(query)
        search_url = (
            f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
            f"?db=pubmed&term={encoded}&retmode=json"
            f"&retmax={max_results}&sort=date"
        )
        try:
            with urllib.request.urlopen(search_url, timeout=15) as resp:
                data = json.loads(resp.read().decode())
            pmids = data.get("esearchresult", {}).get("idlist", [])
        except Exception:
            return []

        if not pmids:
            return []

        time.sleep(0.5)   # rate limit

        # Step 2: efetch — get abstracts
        ids_str  = ",".join(pmids[:max_results])
        fetch_url = (
            f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
            f"?db=pubmed&id={ids_str}&retmode=xml&rettype=abstract"
        )
        try:
            with urllib.request.urlopen(fetch_url, timeout=15) as resp:
                xml_data = resp.read().decode("utf-8", errors="replace")
        except Exception:
            return []

        return self._parse_pubmed_xml(xml_data, domain)

    def _parse_pubmed_xml(self, xml_str: str, domain: str) -> List[Paper]:
        papers = []
        try:
            root = ET.fromstring(xml_str)
        except ET.ParseError:
            return []
        for article in root.findall(".//PubmedArticle"):
            pmid_el = article.find(".//PMID")
            pmid    = pmid_el.text.strip() if pmid_el is not None else ""
            if not pmid:
                continue

            title_el = article.find(".//ArticleTitle")
            title    = (title_el.text or "").strip() if title_el is not None else ""

            abstract_parts = [
                (el.text or "") for el in article.findall(".//AbstractText")
            ]
            abstract = " ".join(abstract_parts)[:2000]

            authors  = []
            for author in article.findall(".//Author")[:5]:
                last  = getattr(author.find("LastName"),  "text", "") or ""
                fore  = getattr(author.find("ForeName"),  "text", "") or ""
                if last:
                    authors.append(f"{fore} {last}".strip())

            pub_date_el = article.find(".//PubDate")
            published   = ""
            if pub_date_el is not None:
                year  = getattr(pub_date_el.find("Year"),  "text", "") or ""
                month = getattr(pub_date_el.find("Month"), "text", "01") or "01"
                published = f"{year}-{month}-01"

            doi_el = article.find(".//ArticleId[@IdType='doi']")
            doi    = (doi_el.text or "").strip() if doi_el is not None else ""

            if not title:
                continue

            relevance = self._relevance_score(title + " " + abstract)
            papers.append(Paper(
                paper_id=f"pubmed:{pmid}",
                title=title,
                abstract=abstract,
                authors=authors,
                published=published or datetime.now().strftime("%Y-%m-%d"),
                url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                source="pubmed",
                domain=domain,
                doi=doi,
                relevance=relevance,
            ))
        return papers

    # ── bioRxiv fetch ─────────────────────────────────────────────────────────

    def _fetch_biorxiv(self, query: str, domain: str,
                       max_results: int = None) -> List[Paper]:
        """Query bioRxiv content API (date-range recent papers)."""
        max_results = max_results or self._max_per
        # bioRxiv API returns by date range, not keyword — we filter locally
        today    = datetime.now().strftime("%Y-%m-%d")
        from_date = "2025-01-01"
        url      = (
            f"https://api.biorxiv.org/details/biorxiv/{from_date}/{today}/0"
        )
        try:
            with urllib.request.urlopen(url, timeout=15) as resp:
                data = json.loads(resp.read().decode())
        except Exception:
            return []

        papers  = []
        q_words = set(re.findall(r'\b\w{4,}\b', query.lower()))
        for item in data.get("collection", []):
            title    = item.get("title", "")
            abstract = item.get("abstract", "")
            # Local keyword filter
            text_words = set(re.findall(r'\b\w{4,}\b',
                                        (title + " " + abstract).lower()))
            if len(q_words & text_words) < 2:
                continue
            paper_id = f"biorxiv:{item.get('doi', hashlib.sha1(title.encode()).hexdigest()[:8])}"
            relevance = len(q_words & text_words) / max(len(q_words), 1)
            papers.append(Paper(
                paper_id=paper_id,
                title=title,
                abstract=abstract[:2000],
                authors=item.get("authors", "").split(";")[:5],
                published=item.get("date", ""),
                url=f"https://www.biorxiv.org/content/{item.get('doi', '')}",
                source="biorxiv",
                domain=domain,
                doi=item.get("doi", ""),
                relevance=relevance,
            ))
            if len(papers) >= max_results:
                break
        return papers

    # ── Graph ingestion ───────────────────────────────────────────────────────

    def _ingest_paper(self, paper: Paper) -> Optional[str]:
        """Create a ConceptNode in the graph for a paper."""
        nid = _make_id("LIT", paper.paper_id)
        node = ConceptNode(
            id=nid,
            title=paper.title[:80],
            domain=paper.domain,
            summary=paper.abstract[:300],
            definition=paper.abstract[:2000],
            references=[paper.url],
            keywords=list(set(re.findall(r'\b\w{5,}\b',
                               (paper.title + " " + paper.abstract[:500]).lower())))[:15],
            metadata={
                "source": paper.source,
                "paper_id": paper.paper_id,
                "authors": paper.authors,
                "published": paper.published,
                "url": paper.url,
                "doi": paper.doi,
                "relevance": paper.relevance,
                "type": "literature",
            },
        )
        result = self._graph.add_node(node)

        # Auto-link to existing graph nodes with high keyword overlap
        paper_words = set(node.keywords)
        for existing in self._graph.all_nodes():
            if existing.id == nid:
                continue
            existing_words = set(re.findall(r'\b\w{5,}\b',
                                             f"{existing.title} {existing.summary}".lower()))
            overlap = len(paper_words & existing_words)
            if overlap >= 4:
                self._graph.connect(
                    nid, existing.id,
                    EdgeType.RELATES_TO,
                    weight=overlap / 10.0,
                    note=f"literature auto-link (overlap={overlap})"
                )

        return nid

    # ── Bridge detection on new papers ────────────────────────────────────────

    def _detect_new_bridges(self, papers: List[Paper]) -> None:
        """
        Check if new papers span cross-domain topics that bridge existing
        nodes in different domains. Flag as UNEXPLORED_BRIDGE.
        """
        for paper in papers:
            words = set(re.findall(r'\b\w{5,}\b',
                                   (paper.title + " " + paper.abstract[:500]).lower()))
            # Find nodes in a different domain that share keywords
            paper_nid = _make_id("LIT", paper.paper_id)
            for existing in self._graph.all_nodes():
                if existing.domain == paper.domain:
                    continue
                if existing.node_type == NodeType.CONCEPT and \
                   existing.metadata.get("type") == "literature":
                    continue   # don't bridge two literature nodes
                existing_words = set(re.findall(r'\b\w{5,}\b',
                                                 f"{existing.title} {existing.summary}".lower()))
                overlap = len(words & existing_words)
                if overlap >= 3 and paper_nid in self._graph._nodes:
                    existing_edges = [
                        e for e in self._graph.edges_for(paper_nid)
                        if e.edge_type == EdgeType.UNEXPLORED_BRIDGE and
                        (e.source_id == existing.id or e.target_id == existing.id)
                    ]
                    if not existing_edges:
                        self._graph.connect(
                            paper_nid, existing.id,
                            EdgeType.UNEXPLORED_BRIDGE,
                            weight=overlap / 10.0,
                            note=f"literature bridge: {paper.domain} ↔ {existing.domain}"
                        )

    # ── Query-domain classification ───────────────────────────────────────────

    def _classify_query_domain(self, query: str) -> str:
        q_lower = query.lower()
        scores  = {}
        from .ingest import _DOMAIN_KEYWORDS
        for domain, keywords in _DOMAIN_KEYWORDS.items():
            scores[domain] = sum(1 for kw in keywords if kw in q_lower)
        best = max(scores, key=scores.get)  # type: ignore
        return best if scores[best] > 0 else Domain.CROSS_DOMAIN

    def _relevance_score(self, text: str) -> float:
        """Score paper relevance to core research keywords."""
        CORE = {
            "quantum", "coherence", "decoherence", "fidelity", "ibm",
            "brca2", "oncology", "cancer", "drug", "binding", "homo",
            "chi_pc", "theta_lock", "lindblad", "dna", "tunneling",
            "enzyme", "catalysis", "selectivity", "inhibitor",
        }
        words = set(re.findall(r'\b\w{4,}\b', text.lower()))
        return len(CORE & words) / max(len(CORE), 1)

    def _derive_graph_queries(self) -> List[Tuple[str, str]]:
        """
        Derive search queries from the most important graph nodes.
        Returns list of (query_string, domain) tuples.
        """
        queries = []
        # Top-degree nodes → most central concepts → best search targets
        central = self._graph.find_high_degree(top_k=6)
        for node, _ in central:
            if len(node.keywords) >= 3:
                q = " ".join(node.keywords[:4])
                queries.append((q, node.domain))
        # Unexplored bridges → literature may hold the bridge
        for bridge in self._graph.find_bridges()[:3]:
            src_kws = bridge["source"].keywords[:2]
            tgt_kws = bridge["target"].keywords[:2]
            q = " ".join(src_kws + tgt_kws)
            queries.append((q, Domain.CROSS_DOMAIN))
        return queries

    # ── State persistence ─────────────────────────────────────────────────────

    def _load_state(self) -> None:
        if os.path.exists(_STATE_FILE):
            try:
                with open(_STATE_FILE) as f:
                    data = json.load(f)
                self._seen = set(data.get("seen", []))
            except Exception:
                self._seen = set()

    def _save_state(self) -> None:
        try:
            with open(_STATE_FILE, "w") as f:
                json.dump({"seen": list(self._seen),
                           "last_scan": datetime.now(timezone.utc).isoformat()}, f)
        except Exception:
            pass

    def _log_scan(self, new_papers: List[Paper]) -> None:
        try:
            with open(_SCAN_LOG, "a") as f:
                f.write(json.dumps({
                    "ts": datetime.now(timezone.utc).isoformat(),
                    "new_papers": len(new_papers),
                    "total_seen": len(self._seen),
                    "sample": [p.title[:60] for p in new_papers[:3]],
                }) + "\n")
        except Exception:
            pass

    # ── Daemon ────────────────────────────────────────────────────────────────

    def _daemon_loop(self, interval: int) -> None:
        while self._running:
            try:
                self.scan()
            except Exception:
                pass
            elapsed = 0
            while self._running and elapsed < interval:
                time.sleep(10)
                elapsed += 10

    # ── Formatted output ──────────────────────────────────────────────────────

    @staticmethod
    def format_paper(paper: Paper) -> str:
        return (
            f"[{paper.source.upper()}] {paper.title}\n"
            f"  {', '.join(paper.authors[:3])}"
            + (" et al." if len(paper.authors) > 3 else "") + "\n"
            f"  {paper.published[:10]}  relevance={paper.relevance:.2f}\n"
            f"  {paper.url}\n"
            f"  {paper.abstract[:200]}..."
        )


# ── Singleton ─────────────────────────────────────────────────────────────────

_watcher_singleton: Optional[ArxivWatcher] = None


def get_watcher() -> ArxivWatcher:
    global _watcher_singleton
    if _watcher_singleton is None:
        _watcher_singleton = ArxivWatcher()
    return _watcher_singleton
