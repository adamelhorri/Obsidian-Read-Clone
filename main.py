import os
import networkx as nx
import re

def build_graph(root_dir):
    graph = nx.DiGraph()
    md_files_content = read_md_files(root_dir)

    # Add all markdown files as nodes
    for filename in md_files_content.keys():
        graph.add_node(filename)

    # Add edges based on references
    for filename, content in md_files_content.items():
        references = re.findall(r'\[\[([^\]]+)\]\]', content)
        for ref in references:
            ref_filename = ref + '.md'
            if ref_filename in md_files_content:
                graph.add_edge(filename, ref_filename)
    
    return graph

def get_graph_data(graph):
    nodes = []
    for node in graph.nodes():
        node_type = "file" if node.endswith('.md') else "directory"
        nodes.append({"id": node, "label": os.path.basename(node), "type": node_type})
    links = [{"source": u, "target": v} for u, v in graph.edges()]
    return {"nodes": nodes, "links": links}

def read_md_files(root_dir):
    md_files_content = {}
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.md'):
                file_path = os.path.join(dirpath, filename)
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    md_files_content[filename] = content
    return md_files_content
