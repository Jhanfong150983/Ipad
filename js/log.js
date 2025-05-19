document.getElementById('查詢按鈕').addEventListener('click', function() {
    const today = new Date();
    const date = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`; // 今日日期 yyyy/MM/dd
    const grade = document.getElementById('年級').value;
    const classNum = document.getElementById('班級').value;
    const time = document.getElementById('時段').value;
    const times = time.split('-');
    const startTime = times[0];
    const endTime = times[1];
    
    if (!grade || !classNum || !time) {
        document.getElementById('缺漏警示').innerText = '請填寫所有必要欄位！';
        return; // 如果有欄位未填，就不繼續執行
    }
    
    document.getElementById('缺漏警示').innerText = ''; // 清除先前的警告
    
    // 顯示 loading 畫面
    document.getElementById('loading-overlay').style.display = 'flex';
    
    const baseUrl = "https://script.google.com/macros/s/AKfycbwb-mFgkGFY9_TPCGHoAT80SzzVVDDwxqWEs-3-_vkFMzCSRBlximWAT1ffsAJa3yCC/exec";
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
        data.sort((a, b) => a.座號 - b.座號);
    
        const table = document.getElementById('結果表格');
        table.innerHTML = ''; // 清空舊資料（只清 <tbody> 的內容即可）
    
        const seenSeatNumbers = new Set();
        const seenDeviceNumbers = new Set();
    
        if (data.length === 0) {
            const noDataMessage = document.createElement('tr');
            noDataMessage.innerHTML = `<td colspan="4">目前無任何資料</td>`;
            table.appendChild(noDataMessage);
        } else {
            data.forEach(record => {
                const tr = document.createElement('tr');
    
                let warnings = [];
    
                if (seenSeatNumbers.has(record.座號)) {
                    warnings.push('⚠️ 座號重複');
                } else {
                    seenSeatNumbers.add(record.座號);
                }
    
                if (seenDeviceNumbers.has(record.平板序號)) {
                    warnings.push('⚠️ 平板序號重複');
                } else {
                    seenDeviceNumbers.add(record.平板序號);
                }
    
                const warningText = warnings.join('；');
    
                tr.innerHTML = `
                    <td>${record.座號}</td>
                    <td>${record.平板序號}</td>
                    <td>${record.平板狀況}</td>
                    <td style="color: red; font-weight: bold;">${warningText}</td>
                `;
    
                if (warnings.length > 0) {
                    tr.style.backgroundColor = '#fdd'; // 加上淡紅色底
                }
    
                table.appendChild(tr);
            });
            
            // === 偵測缺漏座號 ===
            const seatNumbers = Array.from(seenSeatNumbers).map(Number).sort((a, b) => a - b);
            const missingSeats = [];
            const min = seatNumbers[0];
            const max = seatNumbers[seatNumbers.length - 1];
            for (let i = min; i <= max; i++) {
                if (!seenSeatNumbers.has(i)) {
                    missingSeats.push(i);
                }
            }
            
            // 顯示在上方 div 中
            const warningDiv = document.getElementById('缺漏警示');
            if (missingSeats.length > 0) {
                warningDiv.innerText = `⚠️ 缺少座號：${missingSeats.join('、')}`;
            } else {
                warningDiv.innerText = ''; // 沒有缺號就清空
            }
        }
        
        // 在資料處理完成後隱藏 loading 畫面
        document.getElementById('loading-overlay').style.display = 'none';
    })    
    .catch(error => {
        console.error('錯誤：', error);
        // 發生錯誤時也要隱藏 loading 畫面
        document.getElementById('loading-overlay').style.display = 'none';
    });
});
