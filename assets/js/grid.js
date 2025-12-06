async function makeGrid (data) {
  const gridOptions = {
    // Row Data: The data to be displayed.
    rowData: data.nodes,
    // Column Definitions: Defines the columns to be displayed.
    columnDefs: [
      { field: "title" },
    ],
    onCellClicked: (event) => {
      const url = new URL(
        event.data.href,
        window.location.origin
      )
      window.location = url
    },
    defaultColDef: {
      flex: 1,
      sortable: true,
      filter: true,
    }
  };

  // Your Javascript code to create the Data Grid
  const myGridElement = document.querySelector('#pagesGrid');
  agGrid.createGrid(myGridElement, gridOptions);
}

window.addEventListener("graph-ready", (e) => {
  const graph = e.detail;
  makeGrid(graph);
});
