const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const columns = Array.from({ length: 36 }, (_, i) => i + 1); // 1~36
const grid = document.getElementById('grid');

// 顯示欄標籤 1~36
const headerCol = document.createElement('div');
headerCol.classList.add('column-label');
grid.appendChild(headerCol);

columns.forEach(col => {
  const headerCell = document.createElement('div');
  headerCell.classList.add('column-label');
  headerCell.innerText = col;
  grid.appendChild(headerCell);
});

// 從 Google Apps Script 取得資料
fetch("https://script.google.com/macros/s/AKfycbwb-mFgkGFY9_TPCGHoAT80SzzVVDDwxqWEs-3-_vkFMzCSRBlximWAT1ffsAJa3yCC/exec?action=getSummary")
  .then(response => response.json())
  .then(data => {
    // 將資料轉為 lookup 結構，例如 A-01: {...}
    const lookup = {};
    data.forEach(row => {
      const id = row["平板序號"]; // 比如 A-01
      let status = 'empty';
      if (row["最後狀況"].includes("正常")) {
        status = 'green';
      } else if (row["最後狀況"].includes("小裂痕")) {
        status = 'yellow';
      } else if (row["最後狀況"].includes("碎片")) {
        status = 'red';
      } else if (row["最後狀況"].includes("破洞")) {
        status = 'linear';
      }
      lookup[id] = {
        status,
        info: 
        `最後狀況：${row["最後狀況"]}\n` +
        `最後使用：${row["最後使用時間"] || "無資料"}\n` +
        `借用人：${row["年級"]}年${row["班級"]}班${row["座號"]}號`
      };
    });

    // 顯示每一列
    rows.forEach(row => {
      const rowLabel = document.createElement('div');
      rowLabel.classList.add('row-label');
      rowLabel.innerText = row;
      grid.appendChild(rowLabel);

      columns.forEach(col => {
        const cell = document.createElement('div');
        const key = `${row}-${String(col).padStart(2, '0')}`;
        const statusData = lookup[key] || { status: 'empty', info: '無資料' };

        cell.classList.add('cell', statusData.status);
        const tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        tooltip.innerText = statusData.info;
        cell.appendChild(tooltip);
        grid.appendChild(cell);
      });
    });
  })
  .catch(err => {
    console.error("資料載入失敗：", err);
  });
