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
            <p>借用平板資訊：${平板代號}-${平板號碼}</p>
            <p>個人資訊：${我的年級}年${我的班級}班${我的座號}號</p>
            <p>借用前平板狀況：${平板狀況}</p>
            <p>⚠️請再次確認登記資訊，以免錯誤受罰</p>
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
        const 平板狀況 = document.getElementById('平板狀況').value;
        
        // 檢查是否需要資訊長確認
        const 需要資訊長確認 = 
            平板狀況 === "螢幕有破裂，給資訊長看過，還可以用" || 
            平板狀況 === "螢幕有破裂，給資訊長看過，已請資訊長送修";
        
        if (需要資訊長確認) {
            顯示資訊長確認視窗();
        } else {
            sendDataToGoogleSheet();
        }
    });
});

// 顯示資訊長確認視窗
function 顯示資訊長確認視窗() {
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
    if (平板狀況 === "螢幕有破裂，給資訊長看過，還可以用") {
        狀況說明 = "螢幕有破裂尚可以使用";
    } else if (平板狀況 === "螢幕有破裂，給資訊長看過，已請資訊長送修") {
        狀況說明 = "螢幕有破裂需要送修";
    }
    
    const 資訊長確認內容 = `
        <div class="modal-content info-chief-modal">
            <p class="warning-text">⚠️ 請將平板送交資訊長檢查 ⚠️</p>
            <div class="info-display">
                <p><strong>借用平板資訊：</strong>${平板代號}-${平板號碼}</p>
                <p><strong>個人資訊：</strong>${我的年級}年${我的班級}班${我的座號}號</p>
                <p><strong>平板目前狀況：</strong><span class="status-text">${狀況說明}</span></p>
            </div>
            <p class="instruction-text">請資訊長確認學生填寫的資料是否正確</p>
            <div class="password-section">
                <label for="資訊長密碼">資訊長密碼：</label>
                <input type="password" id="資訊長密碼" placeholder="請輸入密碼">
            </div>
            <div class="button-group">
                <button id="資訊長退回按鈕">資料有誤，退回重填</button>
                <button id="資訊長確認按鈕">確認送出</button>
            </div>
        </div>`;
    
    資訊區塊.innerHTML = 資訊長確認內容;
    
    // 綁定資訊長退回按鈕
    const 資訊長退回按鈕 = document.getElementById('資訊長退回按鈕');
    資訊長退回按鈕.addEventListener('click', function() {
        alert("請重新填寫資料");
        location.reload(); // 重新整理頁面
    });
    
    // 綁定資訊長確認按鈕
    const 資訊長確認按鈕 = document.getElementById('資訊長確認按鈕');
    資訊長確認按鈕.addEventListener('click', function() {
        const 密碼 = document.getElementById('資訊長密碼').value;
        const 正確密碼 = "in1969"; // 這裡設定資訊長密碼，請改成你想要的密碼
        
        if (密碼 === 正確密碼) {
            // 如果是需要送修的平板，顯示額外提醒
            if (平板狀況 === "螢幕有破裂，給資訊長看過，已請資訊長送修") {
                alert("⚠️ 請立刻更換平板，並於下課時段將平板送到教務處資訊組。");
            }
            sendDataToGoogleSheet();
        } else {
            alert("❌ 密碼錯誤！");
            document.getElementById('資訊長密碼').value = ''; // 清空密碼欄位
            document.getElementById('資訊長密碼').focus(); // 聚焦到密碼欄位
        }
    });
}

function sendDataToGoogleSheet() {
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

    const baseUrl = "https://script.google.com/macros/s/AKfycbyhQ4B6YChFqMwDGztNYybfmBYFpp1m_Wq2aqFq6sXENSukvbEQYGmO6KgfyVg4eBdX/exec";
    const url = `${baseUrl}?action=appendData&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&grade=${encodeURIComponent(grade)}&class=${encodeURIComponent(classNum)}&seatNumber=${encodeURIComponent(seatNumber)}&tabletCode=${encodeURIComponent(tabletFullCode)}&status=${encodeURIComponent(status)}`;

    console.log(`請求的 URL: ${url}`);

    fetch(url)
        .then(response => response.json())
        .then(result => {
            console.log('成功：', result);
            alert("你已經成功登記，請關閉視窗專心上課");
            location.reload();
        })
        .catch(error => {
            console.error('錯誤：', error);
            alert("⚠️ 發生錯誤，請稍後再試！");
        })
        .finally(() => {
            // 隱藏 loading 畫面(如果存在)
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        });
}