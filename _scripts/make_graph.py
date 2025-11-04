import os
import re
import json

from pathlib import Path

import pandas as pd

# Path to your folder of Markdown notes
NOTES_DIR = Path("./_notes")
PAGES_DIR = Path("./_pages")

# Output file
GRAPH_FOLDER = Path("./assets/data")
OUTPUT_JSON = Path("graph.json")

# Regex patterns
# wiki_pattern = re.compile(r"\[\[([^\]]+)\]\]")
MDLINK_PATTERN = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
TITLE_PATTERN = re.compile(r"(?<=title:)[^\n]+")


def list_page_files(dir: Path) -> list:
    all_note_files = os.listdir(NOTES_DIR)
    all_note_files = list(map(
        lambda x: NOTES_DIR / Path(x),
        all_note_files
    ))
    all_page_files = os.listdir(PAGES_DIR)
    all_page_files = list(map(
        lambda x: PAGES_DIR / Path(x),
        all_page_files
    ))
    
    all_files = []
    all_files += [Path("index.md")]
    all_files += all_note_files
    all_files += all_page_files

    return all_files


def read_file(filepath: Path) -> str:
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    return text


def title_to_id(title: str) -> str:
    return re.sub(r"\s","_", title).lower()


def extract_title(filepath: Path) -> str:
    text = read_file(filepath)
    title = TITLE_PATTERN.findall(text)[0].strip()
    return title


def create_all_nodes_df(NOTES_DIR: Path) -> pd.DataFrame:
    all_nodes = pd.DataFrame({
        "filepath": list_page_files([NOTES_DIR]),
    })
    all_nodes["title"] = all_nodes.filepath.apply(lambda x: extract_title(x))
    all_nodes["id"] = all_nodes.title.apply(title_to_id)

    return all_nodes


def create_all_links_df(nodes: pd.DataFrame) -> pd.DataFrame:
    all_links = nodes.copy().rename(
        {
            "id": "source",
            "filepath": "source_filepath",
        }, 
        axis=1
    )
    all_links["link"] = all_links.source_filepath.apply(
        lambda x: MDLINK_PATTERN.findall(read_file(x))
    )
    all_links = all_links.explode("link").dropna()
    all_links["target_filename"] = all_links.link.apply(
        lambda x: f"{Path(x[1]).stem}{Path(x[1]).suffix}"
    )
    all_links = all_links.drop("link", axis=1)

    linkage_df = nodes.copy()
    linkage_df = linkage_df.rename(
        {
            "id": "target",
            "filepath": "target_filepath",
        }, 
        axis=1
    )
    linkage_df["source_filename"] = linkage_df.target_filepath.apply(
        lambda x: f"{x.stem}{x.suffix}" 
    )

    linked = (
        all_links.merge(linkage_df, left_on="target_filename", right_on="source_filename")
            .drop(["target_filename", "source_filename"], axis=1)
    )

    return linked


def md_to_html(filename: str) -> str:
    return re.sub(
        r".md", ".html", filename, flags = re.IGNORECASE
    )

def main():

    nodes = create_all_nodes_df(NOTES_DIR)
    links = create_all_links_df(nodes)

    nodes.filepath = nodes.filepath.astype(str)
    nodes.filepath = nodes.filepath.apply(md_to_html)
    links.source_filepath = links.source_filepath.astype(str)
    links.source_filepath = links.source_filepath.apply(md_to_html)
    links.target_filepath = links.target_filepath.astype(str)
    links.target_filepath = links.target_filepath.apply(md_to_html)

    output = {
        "nodes": nodes.to_dict("records"),
        "links": links.to_dict("records")
    }
    
    os.makedirs(Path(GRAPH_FOLDER), exist_ok=True)
    with open(GRAPH_FOLDER / OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)


if __name__=="__main__":
    main()
