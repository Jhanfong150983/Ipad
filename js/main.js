// 監聽文件中button按下
document.querySelector('button').addEventListener('click', function(){
    const 送出按鈕 = this; // 保存按鈕引用
    
    // 取所有的值
    const 平板代號 = document.getElementById('平板代號').value;
    const 平板號碼 = document.getElementById('平板號碼').value;
    const 我的年級 = document.getElementById('我的年級').value;
    const 我的班級 = document.getElementById('我的班級').value;
    const 我的座號 = document.getElementById('我的座號').value;
    const 平板狀況 = document.getElementById('平板狀況').value;

    if (!平板代號 || !平板號碼 || !我的年級 || !我的班級 || !我的座號 || !平板狀況) {
        alert("請填寫完整資訊");
        return;
    }
    
    // 鎖定送出按鈕
    送出按鈕.disabled = true;
    送出按鈕.style.pointerEvents = 'none';
    送出按鈕.style.backgroundColor = '#ccc';
    
    // 鎖定所有下拉清單
    const 下拉選單們 = document.querySelectorAll('select');
    下拉選單們.forEach(select => {
        select.disabled = true; 
    });
    
    // 建立模態框內容
    const 結果文字 = `
        <div class="modal-content">
            <p>借用平板資訊:${平板代號}-${平板號碼}</p>
            <p>個人資訊:${我的年級}年${我的班級}班${我的座號}號</p>
            <p>借用前平板狀況:${平板狀況}</p>
            <p>⚠️請再次確認登記資訊,以免錯誤受罰</p>
            <button id="錯誤退回按鈕">退回</button>
            <button id="確認送出按鈕">送出</button>
        </div>`;

    // 顯示模態框
    const 資訊區塊 = document.getElementById('資訊區塊');
    資訊區塊.style.display = 'flex';
    資訊區塊.style.position = 'fixed';
    資訊區塊.style.zIndex = '1000';
    資訊區塊.style.left = '0';
    資訊區塊.style.top = '0';
    資訊區塊.style.width = '100%';
    資訊區塊.style.height = '100%';
    資訊區塊.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    資訊區塊.style.justifyContent = 'center';
    資訊區塊.style.alignItems = 'center';
    資訊區塊.innerHTML = 結果文字;

    // 綁定退回按鈕事件 - 解鎖表單
    const 錯誤退回按鈕 = document.getElementById('錯誤退回按鈕');
    錯誤退回按鈕.addEventListener('click', function () {
        資訊區塊.style.display = 'none';
        
        // 解鎖送出按鈕
        送出按鈕.disabled = false;
        送出按鈕.style.pointerEvents = 'auto';
        送出按鈕.style.backgroundColor = ''; // 恢復原始顏色
        
        // 解鎖所有下拉選單
        下拉選單們.forEach(select => {
            select.disabled = false;
        });
    });

    // 綁定送出按鈕事件
    const 確認送出按鈕 = document.getElementById('確認送出按鈕');

    // 延遲啟用送出按鈕
    確認送出按鈕.disabled = true;
    確認送出按鈕.style.opacity = '0.5';
    確認送出按鈕.textContent = '送出 (3)';

    let countdown = 3;
    const timer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            確認送出按鈕.textContent = `送出 (${countdown})`;
        } else {
            確認送出按鈕.disabled = false;
            確認送出按鈕.style.opacity = '1';
            確認送出按鈕.textContent = '送出';
            clearInterval(timer);
        }
    }, 1000);

    確認送出按鈕.addEventListener('click', function() {
        checkAndSubmit();
    });
});

// 檢查平板狀態並決定是否需要資訊長確認
async function checkAndSubmit() {
    const 平板代號 = document.getElementById('平板代號').value;
    const 平板號碼 = document.getElementById('平板號碼').value;
    const 平板狀況 = document.getElementById('平板狀況').value;
    const 平板完整代號 = `${平板代號}-${平板號碼}`;
    
    console.log('=== 開始檢查平板狀態 ===');
    console.log('平板完整代號:', 平板完整代號);
    console.log('本次登記狀況:', 平板狀況);
    
    // 顯示 loading
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // 查詢該平板的最新記錄
    const baseUrl = "https://script.google.com/macros/s/AKfycbydLQfP_riu9PYQI7wzf1sxH9qIjeBKmLc4g42tPRYDGGkb_61dSIBp2NS1ku2Lxi2t/exec";
    const queryUrl = `${baseUrl}?action=getLastRecord&tabletCode=${encodeURIComponent(平板完整代號)}`;
    
    console.log('查詢 URL:', queryUrl);
    
    try {
        console.log('發送查詢請求...');
        const response = await fetch(queryUrl);
        console.log('收到回應, status:', response.status);
        
        const result = await response.json();
        console.log('API 回應結果:', result);
        console.log('result.status:', result.status);
        console.log('result.lastStatus:', result.lastStatus);
        
        // 隱藏 loading
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        // 判斷是否需要資訊長確認
        let 需要資訊長確認 = false;
        let 可能重複填寫 = false;
        let 前一筆狀況 = '';
        
        if (result.status === 'success' && result.lastStatus) {
            // 有前一筆記錄
            前一筆狀況 = result.lastStatus;
            console.log('找到前一筆記錄，狀況:', 前一筆狀況);
            console.log('本次登記狀況:', 平板狀況);
            
            // 取得本次填寫的資料
            const 我的年級 = document.getElementById('我的年級').value;
            const 我的班級 = document.getElementById('我的班級').value;
            const 我的座號 = document.getElementById('我的座號').value;
            
            console.log('前一筆完整資料:', result);
            console.log('本次填寫: 年級=%s, 班級=%s, 座號=%s', 我的年級, 我的班級, 我的座號);
            console.log('前一筆: 年級=%s, 班級=%s, 座號=%s', result.lastGrade, result.lastClass, result.lastSeat);
            
            // 判斷是否為同一個人 (統一轉成字串比較,避免型別不同)
            const 是同一人 = (String(result.lastGrade) === String(我的年級) && 
                             String(result.lastClass) === String(我的班級) && 
                             String(result.lastSeat) === String(我的座號));
            
            // 判斷狀況是否相同
            const 狀況相同 = (前一筆狀況 === 平板狀況);
            
            console.log('判斷結果 - 是同一人:', 是同一人, ', 狀況相同:', 狀況相同);
            
            if (是同一人 && 狀況相同) {
                // 同平板序號 + 同人 + 同狀況 → 重複填寫警告
                可能重複填寫 = true;
                console.log('⚠️ 偵測到可能重複填寫! (同人+同狀況)');
            } else if (!狀況相同) {
                // 同平板序號 + 任何人 + 不同狀況 → 資訊長確認
                需要資訊長確認 = true;
                console.log('✓ 狀況不同，需要資訊長確認');
            } else {
                // 同平板序號 + 不同人 + 同狀況 → 直接送出
                console.log('✓ 狀況相同但人員不同，正常送出');
            }
        } else {
            // 沒有前一筆記錄，不需要確認
            console.log('沒有找到前一筆記錄，首次使用，不需要確認');
            前一筆狀況 = '無前一筆記錄';
        }
        
        console.log('最終判斷 - 需要資訊長確認:', 需要資訊長確認);
        console.log('最終判斷 - 可能重複填寫:', 可能重複填寫);
        
        // 根據判斷結果執行動作
        if (可能重複填寫) {
            console.log('顯示重複填寫警告視窗');
            顯示重複填寫警告視窗(result);
        } else if (需要資訊長確認) {
            console.log('顯示資訊長確認視窗');
            顯示資訊長確認視窗(前一筆狀況);
        } else {
            console.log('直接送出資料');
            sendDataToGoogleSheet();
        }
        
    } catch (error) {
        console.error('❌ 查詢發生錯誤:', error);
        console.error('錯誤詳細資訊:', error.message);
        console.error('錯誤堆疊:', error.stack);
        
        // 隱藏 loading
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        // 發生錯誤時，詢問是否直接送出
        if (confirm("⚠️ 無法查詢平板記錄，是否直接送出資料？\n(建議聯繫資訊長確認)")) {
            sendDataToGoogleSheet();
        } else {
            location.reload();
        }
    }
}

// 顯示重複填寫警告視窗
function 顯示重複填寫警告視窗(前一筆資料) {
    console.log('進入顯示重複填寫警告視窗函數');
    console.log('前一筆資料:', 前一筆資料);
    
    const 資訊區塊 = document.getElementById('資訊區塊');
    
    const 重複警告內容 = `
        <div class="modal-content duplicate-warning-modal">
            <p class="warning-text">⚠️ 偵測到可能重複填寫 ⚠️</p>
            <div class="info-display">
                <p class="duplicate-title">📋 前一筆登記資訊:</p>
                <p>登記時間: ${前一筆資料.lastDate} ${前一筆資料.lastTime}</p>
                <p>登記人: ${前一筆資料.lastGrade}年${前一筆資料.lastClass}班${前一筆資料.lastSeat}號</p>
                <p>平板狀況: ${前一筆資料.lastStatus}</p>
            </div>
            <p class="instruction-text">
                ⚠️ 如果你已經填過就不用再填了
            </p>
            <div class="button-group">
                <button id="重複退回按鈕">返回</button>
                <button id="重複確認送出按鈕" disabled style="opacity: 0.5;">我沒填過確認送出</button>
            </div>
        </div>`;
    
    資訊區塊.innerHTML = 重複警告內容;
    console.log('重複填寫警告視窗已更新');
    
    // 延遲啟用送出按鈕
    const 重複確認送出按鈕 = document.getElementById('重複確認送出按鈕');
    重複確認送出按鈕.textContent = '確認送出 (5)';
    let countdown = 5;
    
    const timer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            重複確認送出按鈕.textContent = `確認送出 (${countdown})`;
        } else {
            重複確認送出按鈕.disabled = false;
            重複確認送出按鈕.style.opacity = '1';
            重複確認送出按鈕.textContent = '確認送出';
            clearInterval(timer);
        }
    }, 1000);
    
    // 綁定退回按鈕
    const 重複退回按鈕 = document.getElementById('重複退回按鈕');
    重複退回按鈕.addEventListener('click', function() {
        console.log('點擊退回按鈕');
        clearInterval(timer);
        alert("請檢查你的資料是否正確");
        location.reload();
    });
    
    // 綁定確認送出按鈕
    重複確認送出按鈕.addEventListener('click', function() {
        console.log('確認重複送出');
        clearInterval(timer);
        sendDataToGoogleSheet();
    });
}

// 顯示資訊長確認視窗
function 顯示資訊長確認視窗(前一筆狀況 = '') {
    console.log('進入顯示資訊長確認視窗函數');
    console.log('前一筆狀況參數:', 前一筆狀況);
    
    const 資訊區塊 = document.getElementById('資訊區塊');
    
    // 取得所有填寫的資料
    const 平板代號 = document.getElementById('平板代號').value;
    const 平板號碼 = document.getElementById('平板號碼').value;
    const 我的年級 = document.getElementById('我的年級').value;
    const 我的班級 = document.getElementById('我的班級').value;
    const 我的座號 = document.getElementById('我的座號').value;
    const 平板狀況 = document.getElementById('平板狀況').value;
    
    // 判斷平板狀況文字
    let 狀況說明 = "";
    if (平板狀況 === "螢幕有破裂,給資訊長看過,還可以用") {
        狀況說明 = "螢幕有破裂尚可以使用";
    } else if (平板狀況 === "螢幕有破裂,給資訊長看過,已請資訊長送修") {
        狀況說明 = "螢幕有破裂需要送修";
    } else {
        狀況說明 = 平板狀況;
    }
    
    // 顯示前一筆狀況(如果有)
    let 前一筆顯示 = '';
    if (前一筆狀況 && 前一筆狀況 !== '無前一筆記錄') {
        前一筆顯示 = `<p><strong>前一筆狀況:</strong><span class="status-text">${前一筆狀況}</span></p>`;
    } else {
        前一筆顯示 = `<p><strong>前一筆狀況:</strong><span class="status-text">無記錄(首次登記)</span></p>`;
    }
    
    const 資訊長確認內容 = `
        <div class="modal-content info-chief-modal">
            <p class="warning-text">⚠️ 平板狀態已改變，請資訊長確認 ⚠️</p>
            <div class="info-display">
                <p><strong>借用平板資訊:</strong>${平板代號}-${平板號碼}</p>
                <p><strong>個人資訊:</strong>${我的年級}年${我的班級}班${我的座號}號</p>
                ${前一筆顯示}
                <p><strong>本次登記狀況:</strong><span class="status-text">${狀況說明}</span></p>
            </div>
            <p class="instruction-text">請資訊長確認學生填寫的資料是否正確</p>
            <div class="password-section">
                <label for="資訊長密碼">資訊長密碼:</label>
                <input type="password" id="資訊長密碼" placeholder="請輸入密碼">
            </div>
            <div class="button-group">
                <button id="資訊長退回按鈕">資料有誤,退回重填</button>
                <button id="資訊長確認按鈕">確認送出</button>
            </div>
        </div>`;
    
    資訊區塊.innerHTML = 資訊長確認內容;
    console.log('資訊長確認視窗已更新');
    
    // 綁定資訊長退回按鈕
    const 資訊長退回按鈕 = document.getElementById('資訊長退回按鈕');
    資訊長退回按鈕.addEventListener('click', function() {
        console.log('點擊退回按鈕');
        alert("請重新填寫資料");
        location.reload();
    });
    
    // 綁定資訊長確認按鈕
    const 資訊長確認按鈕 = document.getElementById('資訊長確認按鈕');
    資訊長確認按鈕.addEventListener('click', function() {
        console.log('點擊確認按鈕');
        const 密碼 = document.getElementById('資訊長密碼').value;
        const 正確密碼 = "in1969";
        
        console.log('輸入密碼長度:', 密碼.length);
        console.log('密碼是否正確:', 密碼 === 正確密碼);
        
        if (密碼 === 正確密碼) {
            const 平板狀況 = document.getElementById('平板狀況').value;
            if (平板狀況 === "螢幕有破裂,給資訊長看過,已請資訊長送修") {
                alert("⚠️ 請立刻更換平板,並於下課時段將平板送到教務處資訊組。");
            }
            sendDataToGoogleSheet();
        } else {
            alert("❌ 密碼錯誤!");
            document.getElementById('資訊長密碼').value = '';
            document.getElementById('資訊長密碼').focus();
        }
    });
}

function sendDataToGoogleSheet() {
    console.log('=== 開始送出資料到 Google Sheet ===');
    
    // 顯示 loading 畫面(如果存在)
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }

    const today = new Date();
    const date = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;
    const time = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
    const grade = document.getElementById('我的年級').value;
    const classNum = document.getElementById('我的班級').value;
    const seatNumber = document.getElementById('我的座號').value;
    const tabletCode = document.getElementById('平板代號').value;
    const tabletNumber = document.getElementById('平板號碼').value;
    const status = document.getElementById('平板狀況').value;

    const tabletFullCode = `${tabletCode}-${tabletNumber}`;

    console.log('送出資料:', {
        date, time, grade, classNum, seatNumber, tabletFullCode, status
    });

    const baseUrl = "https://script.google.com/macros/s/AKfycbydLQfP_riu9PYQI7wzf1sxH9qIjeBKmLc4g42tPRYDGGkb_61dSIBp2NS1ku2Lxi2t/exec";
    const url = `${baseUrl}?action=appendData&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&grade=${encodeURIComponent(grade)}&class=${encodeURIComponent(classNum)}&seatNumber=${encodeURIComponent(seatNumber)}&tabletCode=${encodeURIComponent(tabletFullCode)}&status=${encodeURIComponent(status)}`;

    console.log(`請求的 URL: ${url}`);

    fetch(url)
        .then(response => response.json())
        .then(result => {
            console.log('✅ 送出成功:', result);
            alert("你已經成功登記,請關閉視窗專心上課");
            location.reload();
        })
        .catch(error => {
            console.error('❌ 送出錯誤:', error);
            alert("⚠️ 發生錯誤,請稍後再試!");
        })
        .finally(() => {
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        });
}