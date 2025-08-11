# **@react-google-maps/api**
比起google官方提供的@vis.gl/  react-google-maps，由第三方製作的@react-google-maps/api更加簡化了原生地API，並且可以透過直接操作React的DOM來直接實現功能。
- [說明文件](https://tomchentw.github.io/react-google-maps/#introduction)

## 四大主要功能
這是 `@react-google-maps/api` 提供的核心功能，幫助開發者更方便地在 React 中使用 Google Maps JavaScript API。

---

### **1. Props Delegation（屬性委派）**
- **意思**：`@react-google-maps/api` 將 Google Maps JavaScript API 的屬性（如 `center`、`zoom` 等）映射為 React 元件的 `props`。
- **作用**：你可以像使用普通的 React 元件一樣，通過 `props` 傳遞地圖的配置，而不需要直接操作 Google Maps 的原生 API。

#### **範例**
```jsx
<GoogleMap
  center={{ lat: 25.033964, lng: 121.564468 }} // 傳遞地圖中心點
  zoom={16} // 傳遞縮放等級
  options={mapOptions} // 傳遞地圖樣式選項
/>
```
在這裡，`center`、`zoom` 和 `options` 都是通過 `props` 傳遞的，`@react-google-maps/api` 會自動將它們應用到 Google Maps 的地圖實例中。

---

### **2. Events as Callbacks（事件作為回調函數）**
- **意思**：`@react-google-maps/api` 將 Google Maps 的事件（如 `onClick`、`onDragEnd` 等）封裝為 React 的回調函數。
- **作用**：你可以通過 React 的方式來處理地圖或標記的事件，而不需要手動添加事件監聽器。

#### **範例**
```jsx
<GoogleMap
  onClick={(e) => console.log('地圖被點擊', e)} // 點擊地圖時觸發
  onDragEnd={() => console.log('地圖拖動結束')} // 地圖拖動結束時觸發
>
  <Marker
    position={{ lat: 25.033964, lng: 121.564468 }}
    onClick={() => alert('標記被點擊')} // 點擊標記時觸發
  />
</GoogleMap>
```
在這裡，`onClick` 和 `onDragEnd` 是 React 的回調函數，讓事件處理變得更簡單。

---

### **3. Lifecycle Management（生命週期管理）**
- **意思**：`@react-google-maps/api` 自動管理 Google Maps 元件的生命週期（如初始化、更新和銷毀）。
- **作用**：你不需要手動初始化或銷毀地圖實例，React 會根據元件的生命週期自動處理。

#### **範例**
當你使用 `<GoogleMap>` 時：
- **初始化**：地圖會在元件掛載（`componentDidMount`）時自動初始化。
- **更新**：當 `props`（如 `center` 或 `zoom`）改變時，地圖會自動更新。
- **銷毀**：當元件卸載（`componentWillUnmount`）時，地圖實例會自動銷毀。

你只需要關注地圖的配置和事件處理，而不需要手動管理地圖的初始化和銷毀。

---

### **4. Auto-Mount on Map（自動掛載到地圖）**
- **意思**：`@react-google-maps/api` 的子元件（如 `Marker`、`InfoWindow` 等）會自動掛載到地圖上。
- **作用**：你只需要將子元件放在 `<GoogleMap>` 中，它們就會自動顯示在地圖上。

#### **範例**
```jsx
<GoogleMap
  center={{ lat: 25.033964, lng: 121.564468 }}
  zoom={16}
>
  <Marker position={{ lat: 25.033964, lng: 121.564468 }} />
  <Marker position={{ lat: 25.047924, lng: 121.517081 }} />
</GoogleMap>
```
在這裡，`Marker` 是 `GoogleMap` 的子元件，它們會自動掛載到地圖上，並顯示在對應的位置。

---

## **總結**
這四個功能的作用是讓 Google Maps API 更加符合 React 的開發模式，簡化了地圖的使用流程：
1. **Props Delegation**：通過 `props` 傳遞地圖配置。
2. **Events as Callbacks**：通過回調函數處理地圖和標記的事件。
3. **Lifecycle Management**：自動管理地圖和元件的生命週期。
4. **Auto-Mount on Map**：子元件自動掛載到地圖上。
---

## HOC (Higher-Order Component) 高階元件
### `withGoogleMap`
用於包裝你的 React 元件，使其能夠與 Google Maps API 一起使用。它的主要功能是幫助你管理地圖的初始化和生命周期，並將地圖的相關屬性和方法注入到你的元件中。