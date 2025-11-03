async function draw_graph() {
    const graph = await d3.json(
      "../assets/data/graph.json"
    )
    
    const svgParent = document.getElementById("content-container")
    const width = svgParent.clientWidth
    const height = 0.6 * width
    const svg = d3.select("#graph")
    svg.attr("width", width)
      .attr("height", height)

    const simulation = d3.forceSimulation(graph.nodes)
      .force("link", d3.forceLink(graph.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line");

    const node = svg.append("g")
      .selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", 10)
      .call(drag(simulation));

    const label = svg.append("g")
      .selectAll("text")
      .data(graph.nodes)
      .enter().append("text")
      .text(d => d.id)
      .attr("font-size", 16)
      .attr("dx", 18)
      .attr("dy", ".35em");

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    function drag(simulation) {
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
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    d3.selectAll(".node").on("click", (event) => {
      url = new URL(
        event.target.__data__.filepath,
        window.location.origin
      )
      window.location = url 
    })

}

draw_graph()
