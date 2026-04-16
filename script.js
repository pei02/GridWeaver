const BLOCK_CLASSES = ["ball-orange", "ball-blue", "ball-green"];
const PAGE_TYPE = document.body.dataset.page || "single";

let currentMode = "SMT_AOI";
let selectedSet = new Set();

function getElements() {
  return {
    xInput: document.getElementById("xInput"),
    yInput: document.getElementById("yInput"),
    blockInput: document.getElementById("blockInput"),
    modeTabs: document.getElementById("modeTabs"),
    generateBtn: document.getElementById("generateBtn"),
    clearBtn: document.getElementById("clearBtn"),
    gridBoard: document.getElementById("gridBoard"),
    metaInfo: document.getElementById("metaInfo"),
    selectedResult: document.getElementById("selectedResult"),
    remainingResult: document.getElementById("remainingResult"),
    copySelectedBtn: document.getElementById("copySelectedBtn"),
    copyRemainingBtn: document.getElementById("copyRemainingBtn"),
    copyMessage: document.getElementById("copyMessage"),
    pageSwitchBtn: document.getElementById("pageSwitchBtn")
  };
}

function buildBaseArray(total) {
  return Array.from({ length: total }, (_, i) => i + 1);
}

function to2D(arr, cols) {
  const result = [];
  for (let i = 0; i < arr.length; i += cols) {
    result.push(arr.slice(i, i + cols));
  }
  return result;
}

function flatten2D(matrix) {
  return matrix.flat();
}

/* =========================
   單排排序
========================= */

function generateSMTAOI(x, y, blockCount) {
  const totalCols = x * blockCount;
  const total = totalCols * y;
  return to2D(buildBaseArray(total), totalCols);
}

function generateLSCAOI(x, y, blockCount) {
  const totalCols = x * blockCount;
  const total = totalCols * y;
  const matrix = to2D(buildBaseArray(total), totalCols);
  return matrix.map((row) => [...row].reverse());
}

function generate2900AOI(x, y, blockCount) {
  const totalCols = x * blockCount;
  const total = totalCols * y;
  return to2D(buildBaseArray(total).reverse(), totalCols);
}

function generate3190BSKSingle(x, y, blockCount) {
  const blockSize = x * y;
  const rows = [];

  for (let row = 0; row < y; row++) {
    const rowData = [];

    for (let block = 0; block < blockCount; block++) {
      const blockStart = blockSize * (blockCount - block);

      for (let col = 0; col < x; col++) {
        const value = blockStart - (row * x + col);
        rowData.push(value);
      }
    }

    rows.push(rowData);
  }

  return rows;
}

function generateSingleSequence(mode, x, y, blockCount) {
  switch (mode) {
    case "SMT_AOI":
      return generateSMTAOI(x, y, blockCount);

    case "LSC_AOI":
      return generateLSCAOI(x, y, blockCount);

    case "BSK_3190":
      return generate3190BSKSingle(x, y, blockCount);

    case "AOI_2900":
      return generate2900AOI(x, y, blockCount);

    default:
      return generateSMTAOI(x, y, blockCount);
  }
}

/* =========================
   雙排排序
========================= */

function addOffsetToMatrix(matrix, offset) {
  return matrix.map((row) => row.map((value) => value + offset));
}

function generateDualSequence(mode, x, y, blockCount) {
  const singleTotal = x * y * blockCount;

  if (mode === "BSK_3190") {
    const upper = addOffsetToMatrix(generate3190BSKSingle(x, y, blockCount), singleTotal);
    const lower = generate3190BSKSingle(x, y, blockCount);
    return [...upper, ...lower];
  }

  if (mode === "AOI_2900") {
    const upper = addOffsetToMatrix(generate2900AOI(x, y, blockCount), singleTotal);
    const lower = generate2900AOI(x, y, blockCount);
    return [...upper, ...lower];
  }

  if (mode === "SMT_AOI") {
    const upper = generateSMTAOI(x, y, blockCount);
    const lower = addOffsetToMatrix(generateSMTAOI(x, y, blockCount), singleTotal);
    return [...upper, ...lower];
  }

  if (mode === "LSC_AOI") {
    const upper = generateLSCAOI(x, y, blockCount);
    const lower = addOffsetToMatrix(generateLSCAOI(x, y, blockCount), singleTotal);
    return [...upper, ...lower];
  }

  const upper = generateSingleSequence(mode, x, y, blockCount);
  const lower = addOffsetToMatrix(generateSingleSequence(mode, x, y, blockCount), singleTotal);
  return [...upper, ...lower];
}

/* =========================
   UI 建立
========================= */

function createBall(value, blockIndex) {
  const ball = document.createElement("label");
  ball.className = `ball ${BLOCK_CLASSES[blockIndex % BLOCK_CLASSES.length]}`;
  ball.dataset.value = value;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = value;

  if (selectedSet.has(value)) {
    checkbox.checked = true;
    ball.classList.add("selected");
  }

  const text = document.createElement("span");
  text.textContent = value;

  checkbox.addEventListener("change", () => {
    const numericValue = Number(value);

    if (checkbox.checked) {
      selectedSet.add(numericValue);
      ball.classList.add("selected");
    } else {
      selectedSet.delete(numericValue);
      ball.classList.remove("selected");
    }

    updateResults();
  });

  ball.addEventListener("click", (event) => {
    event.preventDefault();
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event("change"));
  });

  ball.appendChild(checkbox);
  ball.appendChild(text);

  return ball;
}

function renderGrid(matrix, x, blockCount) {
  const { gridBoard } = getElements();
  gridBoard.innerHTML = "";

  const lineSections = PAGE_TYPE === "dual"
    ? [
        { title: "上排", rows: matrix.slice(0, matrix.length / 2) },
        { title: "下排", rows: matrix.slice(matrix.length / 2) }
      ]
    : [
        { title: "單排", rows: matrix }
      ];

  lineSections.forEach((section) => {
    const sectionWrap = document.createElement("div");
    sectionWrap.className = "line-section";

    const title = document.createElement("div");
    title.className = "line-title";
    title.textContent = section.title;
    sectionWrap.appendChild(title);

    const blockRow = document.createElement("div");
    blockRow.className = "block-row";

    for (let block = 0; block < blockCount; block++) {
      const blockPanel = document.createElement("div");
      blockPanel.className = "block-panel";

      const ballGrid = document.createElement("div");
      ballGrid.className = "ball-grid";
      ballGrid.style.gridTemplateColumns = `repeat(${x}, 48px)`;

      section.rows.forEach((row) => {
        const blockValues = row.slice(block * x, block * x + x);
        blockValues.forEach((value) => {
          ballGrid.appendChild(createBall(value, block));
        });
      });

      blockPanel.appendChild(ballGrid);
      blockRow.appendChild(blockPanel);
    }

    sectionWrap.appendChild(blockRow);
    gridBoard.appendChild(sectionWrap);
  });
}

function updateResults() {
  const { selectedResult, remainingResult } = getElements();

  const values = Array.from(document.querySelectorAll(".ball"))
    .map((ball) => Number(ball.dataset.value))
    .sort((a, b) => a - b);

  const selected = [...selectedSet].sort((a, b) => a - b);
  const remaining = values.filter((v) => !selectedSet.has(v));

  selectedResult.textContent = selected.length ? selected.join(", ") : "（尚未選取）";
  remainingResult.textContent = remaining.length ? remaining.join(", ") : "（沒有可用數字）";
}

function updateMetaInfo(x, y, blockCount, matrix) {
  const { metaInfo } = getElements();
  const total = flatten2D(matrix).length;
  const lineCount = PAGE_TYPE === "dual" ? 2 : 1;

  const modeNameMap = {
    SMT_AOI: "SMT AOI",
    LSC_AOI: "LSC AOI",
    BSK_3190: "3190&BSK",
    AOI_2900: "2900 AOI"
  };

  metaInfo.innerHTML = `
    模式：${modeNameMap[currentMode] || currentMode}<br>
    X：${x} ｜ Y：${y} ｜ BLOCK：${blockCount}<br>
    排列數量：${total} ｜ 頁面型態：${lineCount === 2 ? "雙排" : "單排"}
  `;
}

function generateGrid() {
  const { xInput, yInput, blockInput } = getElements();
  const x = Number(xInput.value);
  const y = Number(yInput.value);
  const blockCount = Number(blockInput.value);

  if (x <= 0 || y <= 0 || blockCount <= 0) {
    return;
  }

  selectedSet = new Set();

  const matrix = PAGE_TYPE === "dual"
    ? generateDualSequence(currentMode, x, y, blockCount)
    : generateSingleSequence(currentMode, x, y, blockCount);

  renderGrid(matrix, x, blockCount);
  updateMetaInfo(x, y, blockCount, matrix);
  updateResults();
}

function clearSelection() {
  selectedSet.clear();

  document.querySelectorAll(".ball").forEach((ball) => {
    ball.classList.remove("selected");
    const checkbox = ball.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = false;
    }
  });

  updateResults();
}

async function copyText(text, message) {
  const { copyMessage } = getElements();
  copyMessage.textContent = "";

  if (!text || text.startsWith("（")) {
    copyMessage.textContent = "沒有可複製的內容。";
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copyMessage.textContent = message;
  } catch (error) {
    copyMessage.textContent = "複製失敗，請手動複製。";
  }
}

function bindTabs() {
  const { modeTabs } = getElements();
  const buttons = modeTabs.querySelectorAll(".tab-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.dataset.mode;
      generateGrid();
    });
  });
}

function bindEvents() {
  const {
    generateBtn,
    clearBtn,
    copySelectedBtn,
    copyRemainingBtn,
    selectedResult,
    remainingResult,
    pageSwitchBtn
  } = getElements();

  generateBtn.addEventListener("click", generateGrid);
  clearBtn.addEventListener("click", clearSelection);

  copySelectedBtn.addEventListener("click", () => {
    copyText(selectedResult.textContent.trim(), "已複製已選取數列。");
  });

  copyRemainingBtn.addEventListener("click", () => {
    copyText(remainingResult.textContent.trim(), "已複製未選取數列。");
  });

  pageSwitchBtn.addEventListener("click", () => {
    window.location.href = PAGE_TYPE === "dual" ? "index.html" : "dual.html";
  });
}

function init() {
  bindTabs();
  bindEvents();
  generateGrid();
}

init();