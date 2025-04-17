// 監聽文件中button按下
document.querySelector('button').addEventListener('click', function(){
    this.disabled = true;
    this.style.pointerEvents = 'none';
    this.style.backgroundColor = '#ccc';
    
    // 鎖定所有下拉清單
    const 下拉選單們 = document.querySelectorAll('select');
    下拉選單們.forEach(select => {
        select.disabled = true; 
    });

    //取所有的值
    const 平板代號 = document.getElementById('平板代號').value;
    const 平板號碼 = document.getElementById('平板號碼').value;
    const 我的年級 = document.getElementById('我的年級').value;
    const 我的班級 = document.getElementById('我的班級').value;
    const 我的座號 = document.getElementById('我的座號').value;
    const 平板狀況 = document.getElementById('平板狀況').value;
    
    // 將結果文字加入網頁
    const 結果文字 = `
    <div class="text-box" id="資訊區塊">
        <text>借用平板資訊：${平板代號}-${平板號碼}</text><br>
        <text>個人資訊：${我的年級}年${我的班級}班${我的座號}號</text><br>
        <text>借用前平板狀況：${平板狀況}</text><br>
        <p>⚠️請再次確認登記資訊，以免錯誤受罰</p>
    </div>`;

    const 現有資訊區塊 = document.getElementById('資訊區塊');
    const 現有退回按鈕 = document.getElementById('錯誤退回按鈕');
    const 現有送出按鈕 = document.getElementById('確認送出按鈕');

    if (現有資訊區塊) {
        現有資訊區塊.remove();
    }
    if (現有退回按鈕) {
        現有退回按鈕.remove();
    }
    if (現有送出按鈕) {
        現有送出按鈕.remove();
    }

    document.querySelector('hr').insertAdjacentHTML('afterend', 結果文字);
    
    const 資訊區塊 = document.getElementById('資訊區塊');

    // 動態新增「錯誤退回」按鈕
    const 錯誤退回按鈕 = document.createElement('button');
    錯誤退回按鈕.textContent = '退回';
    錯誤退回按鈕.id = '錯誤退回按鈕';
    錯誤退回按鈕.addEventListener('click', function(){
        // 清除資訊區塊和按鈕
        if (資訊區塊) {
            資訊區塊.remove();
        }
        if (錯誤退回按鈕) {
            錯誤退回按鈕.remove();
        }
        if (確認送出按鈕) {
            確認送出按鈕.remove();
        }

        // 恢復「確認」按鈕狀態
        const 確認按鈕 = document.querySelector('button');
        確認按鈕.disabled = false;
        確認按鈕.style.pointerEvents = 'auto';
        確認按鈕.style.backgroundColor = '';

        // 解鎖下拉選單
        下拉選單們.forEach(select => {
            select.disabled = false;
        });
    });

    // 動態新增「確認送出」按鈕
    const 確認送出按鈕 = document.createElement('button');
    確認送出按鈕.textContent = '送出';
    確認送出按鈕.id = '確認送出按鈕';
    確認送出按鈕.addEventListener('click', sendDataToGoogleSheet);

    // 按鈕插入到資訊區塊之後
    資訊區塊.insertAdjacentElement('afterend', 錯誤退回按鈕);
    錯誤退回按鈕.insertAdjacentElement('afterend', 確認送出按鈕);
});

function sendDataToGoogleSheet() {
    // 顯示 loading 畫面
    document.getElementById('loading-overlay').style.display = 'flex';  // 顯示 loading 畫面

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

    const baseUrl = "https://script.google.com/macros/s/AKfycbxBSNEKHGdKxh-uGRIV5tDpAjnj3RhSgQP3BJoDQDR5-NUN7VIoK4dGK7gfFG0esRiX/exec";
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
            // 無論成功或失敗都隱藏 loading 畫面
            document.getElementById('loading-overlay').style.display = 'none';
        });
}
