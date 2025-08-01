# SCSS 是什麼？
SCSS是管理CSS的手段，你可以想成是css的mata data。

- 「變數」管理顏色、字體等重複用到的值。
- 「巢狀結構」，讓選擇器誰包含誰一目了然。
- 有「函數」、「條件判斷」、「迴圈」等進階功能。
- 樣式拆分成多個檔案，例如A可以開一個card.scss來做卡片樣式，B可以開一個navbar.scss來做菜單樣式，最後在style.scss裡面匯入全部人的成果，一起打包編譯。

寫好的 SCSS 會經過編譯，產生一般瀏覽器能讀的 CSS 檔案。

---

# SCSS 的安裝

1. 在專案資料夾下執行：
   ```bash
   npm install --save-dev sass
   ```
2. 安裝後會在 `package.json` 的 devDependencies 看到 sass
    - `pakage.json`是整個專案模組的mata data，所有裝過的模組、所有自訂義的node指令都會寫在`pakage.json`

---

# SCSS 的編譯
SCSS只是一個開發工具，在網頁上架運作的時候，他一點關係也沒有。

它的存在價值就是生出`.css`，丟給`.html`去引用樣式表。

過程是這樣的，SCSS將自己檔案內的指令打包指令一起打包，經過一連串的編譯，在css資料夾裡面吐出一個`.css`

至於讓node.js知道要編譯什麼，什麼不編譯？那就要回到`pakage.json`的script。
在`pakage.json`裡面我們可以自訂義所需的npm指令，例如：
```json
  "scripts": {
    "sass": "sass --watch scss:css",
    "sass-build": "sass scss:css"
  },
```
這代表我定義了兩種scripts去打包scss的模組指令，讓npm更簡短的使用。
1. sass
2. sass-build
他們都是調用sass 模組的指令 將 scss編譯成css(scss:css)，沒有指定任何的路徑，因此代表他會編譯scss底下所有.scss，放在css資料夾底下。

如果不要讓自己的scss被編譯，那就在檔案前面加個底線 `_tutorial.scss`，那就不會被編譯了。

被分配出去的子檔案可以利用這種方式來避免被編譯，保持css資料夾裡面只有一個style.css。


---


# SCSS 的常用指令

- **啟動監看模式（自動編譯）**

  ```bash
  npm run sass
  ```
  只要你修改 .scss 檔案，Sass 會自動編譯成 css 檔案。
  可以在開始寫scss前開啟這個指令，這樣就可以邊寫邊看網頁的外觀了。

- **手動編譯一次**
  ```bash
  npm run sass-build
  ```
  只會編譯一次，不會持續監看。

---

# SCSS 的基本語法

- 變數：就是變數可以定義東西用的。
`$primary: #f0be52;` 
- 巢狀：讓class的從屬關係更清楚。
  ```scss
  .nav {
    ul { margin: 0; }
  }
  ```
- 混合（mixin）：把想要設定的style打包好，在選擇器後面一致送進去好。
  ```scss
  @mixin btn($color) {
    background: $color;
  }
  .btn-main { @include btn($primary); }
  ```
- 匯入其他檔案：`@import 'base';`


# 結語
更多工具跟範例可以去看`_tutorial.scss`

其實也不複雜，你就把他當一個，可以一層包一層的css在寫就好，只是開始寫之前記得在終端機打這個`npm run sass`
讓他開始實時監聽。

如果你要跟伺服器同時跑，那就**再開一個cmd**。



---

# 參考資源
- 官方網站：https://sass-lang.com/
- 中文教學：https://w3c.hexschool.com/blog/7a9b6b52
- Bootstrap 官方 SCSS 文件：https://getbootstrap.com/docs/5.3/customize/sass/