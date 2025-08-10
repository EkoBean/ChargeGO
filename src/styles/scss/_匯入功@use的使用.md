## **1. `@use` 的基本概念**
由於`@import`在SCSS中已經過氣了，要被淘汰了，將全面換成已`@use`的方式來引入其他的scss檔案。
- `@use`和`@import`有些許的不同，`@import`可以當成是很單純的將整段scss用一行code插入到整個scss文件中，因此也可以在檔案中隨意的重新定義原有內容（例如變數、函數、混合）。
- 但不同的是，`@use` 會將匯入的內容都放在自己的命名空間中。
- 這樣可以避免作用域污染，並且會強迫將整個自訂議內容都放在命名空間中統一管理。

---

## **2. 基本語法**
基本上就這三個
### **匯入檔案**
最基本的匯入
```scss
@use "檔案路徑";
// ex. @use ./src/global.scss
```

### **匯入檔案並指定命名空間**
自己定義要如何命名這個匯入的檔案
```scss
@use "檔案路徑" as customNamespace;
// ex. @use ./src/global.scss as bs

body{
  color: bs.$secondary
}
// 可以看見如果要調用匯入的global.scss中的$secondary，則需要前綴自定義的命名，範例中使用的的是"bs"
```

### **匯入檔案並覆蓋變數**
匯入scss並且更改其變數時的格式規定如下
```scss
@use "檔案路徑" with (
  $變數名稱: 值,
  $其他變數名稱: 值
);
//ex. 
@use ./src/global.scss as bs with (
 $primary: #000000
)
```


## **4. 總結**
- 使用 `@use` 匯入檔案，並通過命名空間訪問內容。
- 如果需要覆蓋變數，使用 `with` 選項。
- `@use` 是 Sass 的推薦方式，適合大型專案。
