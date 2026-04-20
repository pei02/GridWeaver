function getBlockClass(blockIndex) {
  const classes = ["block-extra", "block-odd", "block-even"];
  return classes[blockIndex % classes.length];
}

// =========================
// 上半部：SMT AOI / 2900
// =========================
function generateSMTAOI(x, y, blockCount) {
  const totalCols = x * blockCount;
  const data = [];
  let num = 1;

  for (let row = 0; row < y; row++) {
    const rowData = [];
    for (let col = 0; col < totalCols; col++) {
      rowData.push(num++);
    }
    data.push(rowData);
  }

  return data;
}

function generate2900(x, y, blockCount) {
  const totalCols = x * blockCount;
  const totalCells = totalCols * y;
  const data = [];
  let num = totalCells;

  for (let row = 0; row < y; row++) {
    const rowData = [];
    for (let col = 0; col < totalCols; col++) {
      rowData.push(num--);
    }
    data.push(rowData);
  }

  return data;
}

function renderNormalTable(data, x, blockCount, mode) {
  const table = document.createElement("table");

  const headerRow = document.createElement("tr");
  for (let block = 0; block < blockCount; block++) {
    const th = document.createElement("th");
    th.colSpan = x;
    th.textContent = block === 0 ? mode : "";
    th.className = "block-header";
    headerRow.appendChild(th);
  }
  //table.appendChild(headerRow);

  for (let row = 0; row < data.length; row++) {
    const tr = document.createElement("tr");

    for (let col = 0; col < data[row].length; col++) {
      const td = document.createElement("td");
      td.textContent = data[row][col];

      const blockIndex = Math.floor(col / x);
      td.className = getBlockClass(blockIndex);

      tr.appendChild(td);
    }

    table.appendChild(tr);
  }

  return table;
}

function generateTopTable() {
  const x = parseInt(document.getElementById("xInput").value, 10);
  const y = parseInt(document.getElementById("yInput").value, 10);
  const blockCount = parseInt(document.getElementById("blockInput").value, 10);
  const mode = document.getElementById("modeSelect").value;

  const errorArea = document.getElementById("errorArea");
  const infoArea = document.getElementById("infoArea");
  const tableContainer = document.getElementById("tableContainer");

  errorArea.textContent = "";
  infoArea.textContent = "";
  tableContainer.innerHTML = "";

  if (
    isNaN(x) || isNaN(y) || isNaN(blockCount) ||
    x <= 0 || y <= 0 || blockCount <= 0
  ) {
    errorArea.textContent = "請輸入大於 0 的 X、Y、BLOCK 值。";
    return;
  }

  let data = [];

  if (mode === "SMT AOI") {
    data = generateSMTAOI(x, y, blockCount);
  } else if (mode === "2900") {
    data = generate2900(x, y, blockCount);
  }

  const totalCols = x * blockCount;
  const totalCells = totalCols * y;

  
  tableContainer.appendChild(renderNormalTable(data, x, blockCount, mode));
}

// =========================
// 下半部：3190 & BSK
// =========================
function generate3190BaseData(x, y, blockCount) {
  const blockSize = x * y;
  const data = [];

  for (let row = 0; row < y; row++) {
    const rowData = [];

    for (let block = 0; block < blockCount; block++) {
      const blockStart = blockSize * (blockCount - block);
      for (let colInBlock = 0; colInBlock < x; colInBlock++) {
        const value = blockStart - (row * x + colInBlock);
        rowData.push(value);
      }
    }

    data.push(rowData);
  }

  return data;
}

function render3190SelectionTable(data, x, blockCount) {
  const table = document.createElement("table");

  const headerRow = document.createElement("tr");
  for (let block = 0; block < blockCount; block++) {
    const th = document.createElement("th");
    th.colSpan = x;
    th.textContent = block === 0 ? "3190 & BSK" : "";
    th.className = "block-header";
    headerRow.appendChild(th);
  }

  //table.appendChild(headerRow);

  for (let row = 0; row < data.length; row++) {
    const tr = document.createElement("tr");

    for (let col = 0; col < data[row].length; col++) {
      const value = data[row][col];
      const td = document.createElement("td");

      const blockIndex = Math.floor(col / x);
      td.className = getBlockClass(blockIndex);

      const wrapper = document.createElement("div");
      wrapper.className = "checkbox-cell";

      const numberSpan = document.createElement("div");
      numberSpan.textContent = value;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.dataset.value = value;


      checkbox.addEventListener("change", function () {
  const td = this.closest("td");

  if (this.checked) {
    td.classList.add("selected");
  } else {
    td.classList.remove("selected");
  }
});

      wrapper.appendChild(numberSpan);
      wrapper.appendChild(checkbox);
      td.appendChild(wrapper);
      tr.appendChild(td);
    }

    table.appendChild(tr);
  }

  return table;
}

function build3190Table() {
  const x = parseInt(document.getElementById("x3190Input").value, 10);
  const y = parseInt(document.getElementById("y3190Input").value, 10);
  const blockCount = parseInt(document.getElementById("block3190Input").value, 10);

  const errorArea = document.getElementById("error3190Area");
  const infoArea = document.getElementById("info3190Area");
  const tableContainer = document.getElementById("table3190Container");
  const resultContainer = document.getElementById("result3190Container");

  errorArea.textContent = "";
  infoArea.textContent = "";
  tableContainer.innerHTML = "";
  resultContainer.textContent = "";

  if (
    isNaN(x) || isNaN(y) || isNaN(blockCount) ||
    x <= 0 || y <= 0 || blockCount <= 0
  ) {
    errorArea.textContent = "請輸入大於 0 的 X、Y、BLOCK 值。";
    return;
  }

  const data = generate3190BaseData(x, y, blockCount);
  const totalCols = x * blockCount;
  const totalCells = totalCols * y;


  tableContainer.appendChild(render3190SelectionTable(data, x, blockCount));
}

function generate3190Result() {
  const x = parseInt(document.getElementById("x3190Input").value, 10);
  const y = parseInt(document.getElementById("y3190Input").value, 10);
  const blockCount = parseInt(document.getElementById("block3190Input").value, 10);

  const errorArea = document.getElementById("error3190Area");
  const tableContainer = document.getElementById("table3190Container");
  const resultContainer = document.getElementById("result3190Container");

  errorArea.textContent = "";
  resultContainer.textContent = "";

  if (!tableContainer.querySelector("table")) {
    errorArea.textContent = "請先建立 3190 表格。";
    return;
  }

  const totalCells = x * y * blockCount;
  const checkboxes = tableContainer.querySelectorAll('input[type="checkbox"]');
  const excludedSet = new Set();

  checkboxes.forEach(function (cb) {
    if (cb.checked) {
      excludedSet.add(parseInt(cb.dataset.value, 10));
    }
  });

  const remaining = [];
  for (let i = 1; i <= totalCells; i++) {
    if (!excludedSet.has(i)) {
      remaining.push(i);
    }
  }

  if (remaining.length === 0) {
    resultContainer.textContent = "（沒有可用數字）";
  } else {
    resultContainer.textContent = remaining.join(", ");
  }
}

function copy3190Result() {
  const resultContainer = document.getElementById("result3190Container");
  const messageArea = document.getElementById("copy3190Message");
  const text = resultContainer.textContent.trim();

  messageArea.textContent = "";

  if (!text || text === "（沒有可用數字）") {
    messageArea.textContent = "沒有可複製的結果。";
    return;
  }

  navigator.clipboard.writeText(text)
    .then(function () {
      messageArea.textContent = "已複製到剪貼簿。";
    })
    .catch(function () {
      messageArea.textContent = "複製失敗，請手動複製。";
    });
}

document.getElementById("generateBtn").addEventListener("click", generateTopTable);
document.getElementById("build3190Btn").addEventListener("click", build3190Table);
document.getElementById("generate3190Btn").addEventListener("click", generate3190Result);
document.getElementById("copy3190Btn").addEventListener("click", copy3190Result);

generateTopTable();
build3190Table();