document.getElementById('查詢按鈕').addEventListener('click', function() {
    const today = new Date();
    const date = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`; // 今日日期 yyyy/MM/dd
    const grade = document.getElementById('年級').value;
    const classNum = document.getElementById('班級').value;
    const time = document.getElementById('時段').value;
    const times = time.split('-');
    const startTime = times[0];
    const endTime = times[1];

    const baseUrl = "https://script.google.com/macros/s/AKfycbz9qtQ8qUrCQiH5LdXxLQh9wuqdaS8ANGiJaiTYEFVGdG1-EZRZvB27ert-8UGNZpJg/exec";
    const url = `${baseUrl}?action=filterData&date=${encodeURIComponent(date)}&grade=${grade}&class=${classNum}&start_time=${startTime}&end_time=${endTime}`;
    console.log(`請求的 URL: ${url}`);

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // 按照座號進行排序
        data.sort((a, b) => {
            return a.座號 - b.座號; // 假設座號是數字，如果座號是字符串，可以使用 a.座號.localeCompare(b.座號) 來排序
        });

        const table = document.getElementById('結果表格');
        table.innerHTML = ''; // 清空舊資料

        if (data.length === 0) {
            const noDataMessage = document.createElement('tr');
            noDataMessage.innerHTML = `<td colspan="3">目前無任何資料</td>`;
            table.appendChild(noDataMessage);
        } else {
            data.forEach(record => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${record.座號}</td>
                    <td>${record.平板序號}</td>
                    <td>${record.平板狀況}</td>
                `;
                table.appendChild(tr);
            });
        }
    })
    .catch(error => console.error('錯誤：', error));
});
