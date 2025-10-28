function removeOldListeners(element, eventName) {
    const oldElement = element.cloneNode(true);
    element.parentNode.replaceChild(oldElement, element);
    return oldElement;
}

// 時段對照表
const timeSlots = [
    {value: "08:10-08:35", text: "晨光時間(08:10~08:35)"},
    {value: "08:35-09:20", text: "第一節(08:35-09:20)"},
    {value: "09:20-10:10", text: "第二節(09:20-10:10)"},
    {value: "10:10-11:10", text: "第三節(10:10-11:10)"},
    {value: "11:10-12:00", text: "第四節(11:10-12:00)"},
    {value: "12:00-13:20", text: "午休時間(12:00-13:20)"},
    {value: "13:20-14:10", text: "第五節(13:20-14:10)"},
    {value: "14:10-15:00", text: "第六節(14:10-15:00)"},
    {value: "15:00-15:55", text: "第七節(15:00-15:55)"}
];

// 當日期改變時更新選項
document.getElementById('日期').addEventListener('change', async function() {
    const selectedDate = this.value;
    const date = selectedDate.replace(/-/g, '/');
    
    // 重設並禁用其他下拉選單
    const gradeSelect = document.getElementById('年級');
    const classSelect = document.getElementById('班級');
    const timeSelect = document.getElementById('時段');
    
    gradeSelect.value = '';
    classSelect.value = '';
    timeSelect.value = '';
    
    classSelect.disabled = true;
    timeSelect.disabled = true;
    
    document.getElementById('loading-overlay').style.display = 'flex';
    
    const baseUrl = "https://script.google.com/macros/s/AKfycbwGWDCZhHUU7sTRvPEewA7LtSrdbFJRrKHkL3WWY5Rj6WUk11sgDgMfTNNL1jinOY7a/exec";
    const url = `${baseUrl}?action=getAvailableOptions&date=${encodeURIComponent(date)}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
        }
        const data = await response.json();
        
        // 更新年級選項
        const grades = [...new Set(data.map(item => item.年級))].sort((a, b) => Number(a) - Number(b));
        gradeSelect.innerHTML = '<option value="" disabled selected>請選擇</option>';
        grades.forEach(grade => {
            gradeSelect.innerHTML += `<option value="${grade}">${grade.padStart(2, '0')}</option>`;
        });
        gradeSelect.disabled = false;
        
        // 當年級改變時更新班級選項
        gradeSelect.addEventListener('change', function() {
            const selectedGrade = this.value;
            classSelect.disabled = false;
            timeSelect.disabled = true;
            timeSelect.value = '';
            
            const classes = [...new Set(data
                .filter(item => item.年級 === selectedGrade)
                .map(item => item.班級))]
                .sort((a, b) => Number(a) - Number(b));
            
            classSelect.innerHTML = '<option value="" disabled selected>請選擇</option>';
            classes.forEach(classNum => {
                classSelect.innerHTML += `<option value="${classNum}">${classNum.padStart(2, '0')}</option>`;
            });
        });
        
        // 當班級改變時更新時段選項
        classSelect.addEventListener('change', function() {
            const selectedGrade = document.getElementById('年級').value;
            const selectedClass = this.value;
            timeSelect.disabled = false;
            
            const availableTimes = new Set(data
                .filter(item => item.年級 === selectedGrade && item.班級 === selectedClass)
                .map(item => item.時段));
            
            timeSelect.innerHTML = '<option value="" disabled selected>請選擇</option>';
            // 依照預定義順序顯示可用的時段
            timeSlots.forEach(slot => {
                const [slotStart, slotEnd] = slot.value.split('-');
                const isAvailable = Array.from(availableTimes).some(time => {
                    return time >= slotStart && time <= slotEnd;
                });
    
                if (isAvailable) {
                    timeSelect.innerHTML += `<option value="${slot.value}">${slot.text}</option>`;
                }
            });
        });
    } catch (error) {
        console.error('錯誤：', error);
        alert('取得資料時發生錯誤，請稍後再試');
    } finally {
        document.getElementById('loading-overlay').style.display = 'none';
    }
});

document.getElementById('查詢按鈕').addEventListener('click', function() {
            const selectedDate = document.getElementById('日期').value;
            const grade = document.getElementById('年級').value;
            const classNum = document.getElementById('班級').value;
            const time = document.getElementById('時段').value;
            
            if (!selectedDate || !grade || !classNum || !time) {
                const alertBox = document.getElementById('缺漏警示');
                alertBox.innerText = '⚠️ 請填寫所有必要欄位！';
                alertBox.style.display = 'block';
                return;
            }
            
            // 將日期格式從 YYYY-MM-DD 轉換為 YYYY/MM/DD
            const date = selectedDate.replace(/-/g, '/');
            const times = time.split('-');
            const startTime = times[0];
            const endTime = times[1];
            
            document.getElementById('缺漏警示').style.display = 'none';
            document.getElementById('loading-overlay').style.display = 'flex';
            
            const baseUrl = "https://script.google.com/macros/s/AKfycbwGWDCZhHUU7sTRvPEewA7LtSrdbFJRrKHkL3WWY5Rj6WUk11sgDgMfTNNL1jinOY7a/exec";
            const url = `${baseUrl}?action=filterData&date=${encodeURIComponent(date)}&grade=${grade}&class=${classNum}&start_time=${startTime}&end_time=${endTime}`;
            
            fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('收到的資料:', data);
                if (data.length > 0) {
                    console.log('第一筆資料範例:', data[0]);
                    console.log('時間欄位內容:', data[0].時間);
                }
                displayResults(data, startTime, endTime);
                document.getElementById('loading-overlay').style.display = 'none';
            })
            .catch(error => {
                console.error('錯誤：', error);
                document.getElementById('loading-overlay').style.display = 'none';
                alert('查詢發生錯誤，請稍後再試');
            });
        });

        function displayResults(data, startTime, endTime) {
            const resultArea = document.getElementById('結果區域');
            resultArea.innerHTML = '';
            
            if (data.length === 0) {
                resultArea.innerHTML = '<div class="no-data">📭 目前無任何登記資料</div>';
                return;
            }
            
            data.sort((a, b) => a.座號 - b.座號);
            
            // 分析資料
            const seatNumberRecords = new Map(); // 記錄每個座號的所有登記
            const deviceToSeats = new Map(); // 記錄每個平板被哪些座號登記
            const deviceCount = {};
            const timeDistribution = {};
            const rawActions = []; // 原始問題記錄
            const normalRecords = [];
            
            data.forEach(record => {
                let hasWarning = false;
                
                // 記錄座號的登記次數
                if (!seatNumberRecords.has(record.座號)) {
                    seatNumberRecords.set(record.座號, []);
                }
                seatNumberRecords.get(record.座號).push(record);
                
                // 記錄平板被哪些座號登記
                if (!deviceToSeats.has(record.平板序號)) {
                    deviceToSeats.set(record.平板序號, []);
                }
                deviceToSeats.get(record.平板序號).push({
                    座號: record.座號,
                    時間: record.時間,
                    平板狀況: record.平板狀況
                });
                
                // 統計平板使用次數
                deviceCount[record.平板序號] = (deviceCount[record.平板序號] || 0) + 1;
                
                // 檢查時段
                if (record.時間) {
                    const 登記時間 = record.時間;
                    if (登記時間 < startTime || 登記時間 > endTime) {
                        rawActions.push({
                            type: 'wrong_time',
                            seat: record.座號,
                            time: 登記時間,
                            device: record.平板序號
                        });
                        hasWarning = true;
                    }
                    
                    // 統計時間分布
                    const timeKey = 登記時間.substring(0, 5);
                    timeDistribution[timeKey] = (timeDistribution[timeKey] || 0) + 1;
                }
                
                if (!hasWarning) {
                    normalRecords.push(record);
                }
            });
            
            // 智慧分析：整合座號重複和平板重複的問題
            const actions = [];
            const processedSeats = new Set(); // 已處理的座號
            
            // 先處理「座號重複登記」的情況
            seatNumberRecords.forEach((records, seat) => {
                if (records.length > 1) {
                    // 檢查是否所有登記都是相同平板序號
                    const devices = records.map(r => r.平板序號);
                    const uniqueDevices = [...new Set(devices)];
                    
                    if (uniqueDevices.length === 1) {
                        // 所有登記都是同一個平板
                        const theDevice = uniqueDevices[0];
                        const deviceUsers = deviceToSeats.get(theDevice);
                        const hasConflict = deviceUsers && deviceUsers.length > records.length; // 有其他人也登記這個平板
                        
                        // 檢查平板狀況是否不同
                        const conditions = records.map(r => r.平板狀況);
                        const uniqueConditions = [...new Set(conditions)];
                        
                        if (uniqueConditions.length > 1) {
                            // 平板狀況不同，表示是修正平板狀況
                            const conditionList = records.map((r, idx) => 
                                `第${idx + 1}次：${r.平板狀況}`
                            ).join('，');
                            
                            actions.push({
                                type: 'condition_correction',
                                seat: seat,
                                count: records.length,
                                instruction: `座號 ${seat} 發現登記平板狀況錯誤因此登記了 ${records.length} 次（${conditionList}），請確認最後一次登記是否正確。`
                            });
                        } else if (hasConflict) {
                            // 平板序號和狀況都相同，但有其他人也登記這個平板
                            actions.push({
                                type: 'duplicate_with_conflict',
                                seat: seat,
                                count: records.length,
                                device: theDevice,
                                instruction: `座號 ${seat} 重複登記了 ${records.length} 次（平板：${theDevice}，與他人重複），請確認是否登記錯誤。`
                            });
                            // 標記其他使用這個平板的座號
                            deviceUsers.forEach(user => {
                                if (user.座號 !== seat) {
                                    processedSeats.add(user.座號);
                                }
                            });
                        } else {
                            // 平板序號和狀況都相同，純粹重複登記
                            actions.push({
                                type: 'pure_duplicate',
                                seat: seat,
                                count: records.length,
                                instruction: `座號 ${seat} 重複登記，請提醒不要重複登記。`
                            });
                        }
                        processedSeats.add(seat);
                    } else {
                        // 有不同的平板序號，檢查是否有平板重複的情況
                        const conflictDevices = devices.filter(device => {
                            const users = deviceToSeats.get(device);
                            return users && users.length > 1;
                        });
                        
                        if (conflictDevices.length > 0) {
                            // 有平板衝突，表示是「登記錯誤後重新登記」
                            const deviceList = records.map((r, idx) => {
                                const isConflict = conflictDevices.includes(r.平板序號);
                                return `第${idx + 1}次：${r.平板序號}${isConflict ? '(與他人重複)' : ''}`;
                            }).join('，');
                            
                            actions.push({
                                type: 'seat_duplicate_with_conflict',
                                seat: seat,
                                count: records.length,
                                instruction: `座號 ${seat} 發現登記錯誤因此登記了 ${records.length} 次（${deviceList}），請確認最後一次登記是否正確。`
                            });
                            processedSeats.add(seat);
                            
                            // 標記這些平板衝突已被處理
                            conflictDevices.forEach(device => {
                                deviceToSeats.get(device).forEach(user => {
                                    if (user.座號 !== seat) {
                                        processedSeats.add(user.座號);
                                    }
                                });
                            });
                        } else {
                            // 不同平板但沒有衝突
                            const deviceList = records.map(r => r.平板序號).join('、');
                            actions.push({
                                type: 'seat_duplicate',
                                seat: seat,
                                count: records.length,
                                instruction: `座號 ${seat} 重複登記了 ${records.length} 次（平板：${deviceList}），請提醒不要重複登記。`
                            });
                            processedSeats.add(seat);
                        }
                    }
                }
            });
            
            // 處理「平板重複」但「座號沒重複」的情況
            const processedDevices = new Set();
            deviceToSeats.forEach((users, device) => {
                if (users.length > 1 && !processedDevices.has(device)) {
                    // 檢查是否所有使用者都已經被處理過
                    const unprocessedUsers = users.filter(u => !processedSeats.has(u.座號));
                    
                    if (unprocessedUsers.length >= 2) {
                        // 還有未處理的衝突
                        const seatList = unprocessedUsers.map(u => `座號 ${u.座號}`).join(' 與 ');
                        actions.push({
                            type: 'device_duplicate',
                            seats: unprocessedUsers.map(u => u.座號),
                            device: device,
                            instruction: `${seatList} 登記了相同平板（${device}），請確認誰登記錯誤。`
                        });
                        unprocessedUsers.forEach(u => processedSeats.add(u.座號));
                    }
                    processedDevices.add(device);
                }
            });
            
            // 處理時段錯誤
            rawActions.forEach(action => {
                if (action.type === 'wrong_time' && !processedSeats.has(action.seat)) {
                    actions.push({
                        type: 'wrong_time',
                        seat: action.seat,
                        time: action.time,
                        instruction: `座號 ${action.seat} 在非本時段登記（${action.time}，平板：${action.device}），請確認是否登記錯誤時段。`
                    });
                }
            });
            
            // 偵測缺漏座號
            const uniqueSeatNumbers = new Set();
            seatNumberRecords.forEach((records, seat) => {
                uniqueSeatNumbers.add(Number(seat));
            });
            
            const seatNumbers = Array.from(uniqueSeatNumbers).sort((a, b) => a - b);
            const missingSeats = [];
            if (seatNumbers.length > 0) {
                const min = seatNumbers[0];
                const max = seatNumbers[seatNumbers.length - 1];
                for (let i = min; i <= max; i++) {
                    if (!uniqueSeatNumbers.has(i)) {
                        missingSeats.push(i);
                    }
                }
            }
            
            // 將缺漏座號加入行動指示
            missingSeats.forEach(seat => {
                actions.push({
                    type: 'missing_seat',
                    seat: seat,
                    instruction: `座號 ${seat} 沒有登記資料，請確認是否沒借平板、是否登記錯年級班級或是否忘記登記。`
                });
            });
            
            // 顯示摘要統計
            const summaryHTML = `
                <div class="summary-stats">
                    <div class="summary-item info">
                        <div class="summary-number">${data.length}</div>
                        <div class="summary-label">已登記</div>
                    </div>
                    <div class="summary-item ${actions.length > 0 ? 'warning' : 'success'}">
                        <div class="summary-number">${actions.length}</div>
                        <div class="summary-label">需處理</div>
                    </div>
                    <div class="summary-item success">
                        <div class="summary-number">${normalRecords.length}</div>
                        <div class="summary-label">正常</div>
                    </div>
                </div>
            `;
            resultArea.innerHTML += summaryHTML;
            
            // 如果沒有任何問題，顯示慶祝訊息
            if (actions.length === 0) {
                resultArea.innerHTML += `
                    <div class="all-clear">
                        <h2>🎉 太棒了！</h2>
                        <p>所有登記都正確無誤，沒有需要處理的問題</p>
                    </div>
                `;
            }
            
            // 顯示需要執行的行動（包含缺漏座號）
            if (actions.length > 0) {
                let actionHTML = '<div class="action-section"><h2>請執行以下檢查</h2>';
                actions.forEach(action => {
                    // 提取座號並分開顯示
                    const match = action.instruction.match(/^座號 (\d+) (.+)$/);
                    if (match) {
                        const seatNumber = match[1];
                        const instruction = match[2];
                        actionHTML += `<div class="action-item"><strong>座號 ${seatNumber}</strong> ➜ ${instruction}</div>`;
                    } else {
                        actionHTML += `<div class="action-item">${action.instruction}</div>`;
                    }
                });
                actionHTML += '</div>';
                resultArea.innerHTML += actionHTML;
            }
            
            // 正常登記明細（可展開）
            if (normalRecords.length > 0) {
                let normalHTML = `
                    <div class="normal-section">
                        <h2 onclick="toggleNormalDetails()">✅ 正常登記（${normalRecords.length}筆）[點擊展開/收合]</h2>
                        <div id="正常明細">
                            <table>
                                <thead>
                                    <tr>
                                        <th>座號</th>
                                        <th>平板代號</th>
                                        <th>借用狀況</th>
                                        <th>登記時間</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                normalRecords.forEach(record => {
                    normalHTML += `
                        <tr>
                            <td>${record.座號}</td>
                            <td>${record.平板序號}</td>
                            <td>${record.平板狀況}</td>
                            <td>${record.時間 || '-'}</td>
                        </tr>
                    `;
                });
                
                normalHTML += '</tbody></table></div></div>';
                resultArea.innerHTML += normalHTML;
            }
        }

        function toggleNormalDetails() {
            const details = document.getElementById('正常明細');
            if (details.style.display === 'none' || details.style.display === '') {
                details.style.display = 'block';
            } else {
                details.style.display = 'none';
            }
        }