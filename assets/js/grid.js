async function make_grid () {
  // Grid Options: Contains all of the Data Grid configurations
  const data = await fetch(new URL("/assets/data/graph.json",window.location.origin))
    .then(response => response.json())

  const gridOptions = {
    // Row Data: The data to be displayed.
    rowData: data.nodes,
    // Column Definitions: Defines the columns to be displayed.
    columnDefs: [
      { field: "title" },
    ],
    onCellClicked: (event) => {
      url = new URL(
        event.data.filepath,
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

make_grid()
