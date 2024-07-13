document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('container');
    const graphContainer = document.getElementById('graph');
    const contentContainer = document.getElementById('content');
    const divider = document.getElementById('divider');
    let isDragging = false;

    function resizeGraph() {
        const width = graphContainer.clientWidth;
        const height = graphContainer.clientHeight;
        svg.attr('width', width).attr('height', height);

        simulation.force('center', d3.forceCenter(width / 2, height / 2));
        simulation.alpha(1).restart();
    }

    let initialWidth = graphContainer.clientWidth;
    let initialHeight = graphContainer.clientHeight;

    const svg = d3.select(graphContainer).append('svg')
        .attr('width', initialWidth)
        .attr('height', initialHeight);

    const simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(70))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(initialWidth / 2, initialHeight / 2))
        .force('x', d3.forceX(initialWidth / 2).strength(0.2))
        .force('y', d3.forceY(initialHeight / 2).strength(0.2));

    d3.json('/graph').then(data => {
        const link = svg.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(data.links)
            .enter().append('line')
            .attr('class', 'link');

        const node = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(data.nodes)
            .enter().append('circle')
            .attr('class', d => d.type === 'file' ? 'node file' : 'node directory')
            .attr('r', 10)
            .on('click', (event, d) => {
                const title = d.label;
                if (d.type === 'file') {
                    fetch('/readmd', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ title: title })
                    })
                    .then(response => response.json())
                    .then(data => {
                        renderMarkdown(data.content);
                    });
                }
            })
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        const text = svg.append('g')
            .attr('class', 'texts')
            .selectAll('text')
            .data(data.nodes)
            .enter().append('text')
            .attr('class', 'node-label')
            .attr('dy', '.31em')
            .text(d => d.label);

        simulation.nodes(data.nodes).on('tick', ticked);
        simulation.force('link').links(data.links);

        function ticked() {
            const width = graphContainer.clientWidth;
            const height = graphContainer.clientHeight;

            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => Math.max(10, Math.min(width - 10, d.x)))
                .attr('cy', d => Math.max(10, Math.min(height - 10, d.y)));

            text
                .attr('x', d => Math.max(10, Math.min(width - 10, d.x)))
                .attr('y', d => Math.max(10, Math.min(height - 10, d.y)));
        }

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    });

    window.addEventListener('resize', resizeGraph);

    document.addEventListener('mousemove', function(event) {
        if (isDragging) {
            const x = event.pageX - container.offsetLeft;
            divider.style.left = `${x}px`;
            initialWidth = x;
            graphContainer.style.width = `${initialWidth}px`;
            contentContainer.style.left = `${x + 10}px`;
            resizeGraph();
        }
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    divider.addEventListener('mousedown', function() {
        isDragging = true;
    });
});

function renderMarkdown(content) {
    document.getElementById('content').innerHTML = marked.parse(content);
}
