# **@react-google-maps**
Google自己出的，把自己的原生API打包成React。
- [說明文件](https://visgl.github.io/react-google-maps/docs/get-started)



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
這份文檔主要介紹了如何使用 `@vis.gl/react-google-maps` 提供的工具來與 Google Maps JavaScript API 進行互動。以下是文檔的重點和解釋：

---

### 1. **高層次的地圖創建**
`@vis.gl/react-google-maps` 提供了一種聲明式的方式來創建地圖和標記。例如，你可以使用 `<APIProvider>` 和 `<Map>` 元件來快速創建地圖，並使用 `<Marker>` 或 `<AdvancedMarker>` 元件來添加標記。

---

### 2. **與 Google Maps API 的低層次互動**
除了聲明式的地圖創建，這個庫還提供了三種主要方式來與 Google Maps JavaScript API 進行更低層次的互動：

#### **(1) Hooks**
- **`useMap` Hook**：
  - 提供對底層 `google.maps.Map` 實例的訪問。
  - 任何被包裹在 `<APIProvider>` 中的子元件都可以使用這個 Hook 獲取地圖實例。
  - 例如：
    ```jsx
    const map = useMap();
    useEffect(() => {
      if (!map) return;
      // 在這裡與地圖實例進行互動
    }, [map]);
    ```

- **`useMapsLibrary` Hook**：
  - 用於動態加載 Google Maps 的其他庫（例如 Places API、Geocoding API 等）。
  - 當需要使用這些附加功能時，可以通過這個 Hook 加載相關的庫。

#### **(2) Refs**
- **`useMarkerRef` 和 `useAdvancedMarkerRef` Hooks**：
  - 提供對標記實例的訪問。
  - 例如，`useAdvancedMarkerRef` 可以用來獲取 `google.maps.marker.AdvancedMarkerElement` 實例，從而進一步自訂標記的行為。

#### **(3) 自定義 Hooks**
- 你可以基於 `useMap` 和 `useMapsLibrary` 創建自己的自定義 Hook，來封裝更複雜的功能。例如，創建一個 `usePlacesService` Hook 來使用 Places API。

---

### 3. **如何使用 Hooks**

#### **`useMap` Hook**
- 用於獲取地圖實例，並與地圖進行互動。
- 例如：
  ```jsx
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    // 在這裡與地圖 API 進行互動
  }, [map]);
  ```

#### **`useMapsLibrary` Hook**
- 用於動態加載 Google Maps 的附加庫。
- 例如，使用 Places API：
  ```jsx
  const placesLibrary = useMapsLibrary('places');
  const [placesService, setPlacesService] = useState(null);

  useEffect(() => {
    if (!placesLibrary || !map) return;
    setPlacesService(new placesLibrary.PlacesService(map));
  }, [placesLibrary, map]);
  ```

#### **自定義 Hook**
- 你可以將上述邏輯封裝成一個自定義 Hook，例如：
  ```jsx
  function usePlacesService() {
    const map = useMap();
    const placesLibrary = useMapsLibrary('places');
    const [placesService, setPlacesService] = useState(null);

    useEffect(() => {
      if (!placesLibrary || !map) return;
      setPlacesService(new placesLibrary.PlacesService(map));
    }, [placesLibrary, map]);

    return placesService;
  }
  ```

---

### 4. **如何使用 Refs**

#### **`useMarkerRef` 和 `useAdvancedMarkerRef`**
- 用於獲取標記實例，並與標記進行互動。
- 例如：
  ```jsx
  const [markerRef, marker] = useMarkerRef();

  useEffect(() => {
    if (!marker) return;
    // 在這裡與標記實例進行互動
  }, [marker]);
  ```

---

### 5. **動態加載其他 Google Maps API 庫**
- Google Maps 提供了許多附加功能（例如 Places API、Geocoding API 等），這些功能需要單獨加載。
- 使用 `useMapsLibrary` Hook 可以動態加載這些庫，並在加載完成後使用它們。

---

### 總結

這份文檔的核心是介紹如何使用 `@vis.gl/react-google-maps` 提供的工具來與 Google Maps API 進行互動。它提供了三種主要方式：
1. **Hooks**：用於訪問地圖實例和其他附加庫。
2. **Refs**：用於訪問標記或其他地圖元素的實例。
3. **自定義 Hooks**：用於封裝更複雜的功能。

#### 要使用變數就用setState
`const [state, setState] = React.setState()`

### Auto Complete doc
https://github.com/wellyshen/use-places-autocomplete#api



# 如何使用AutoCompleteSuggestions()

`fetchAutocompleteSuggestions()` 是 Google Maps Places Library 的**靜態方法**，用來取得地點自動完成（autocomplete）建議。

---

### 用法說明

**語法：**
```js
const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
```

**參數：**
- `request` 必須是一個 `AutocompleteRequest` 物件，內容至少要有 `input`（搜尋字串），可以加上 `sessionToken`、`language`、`region`、`locationBias` 等選項。

**回傳值：**
- 回傳一個 Promise，resolve 後是一個物件 `{ suggestions: Array<AutocompleteSuggestion> }`。
- 每個 `AutocompleteSuggestion` 代表一個地點建議。

---

### 實際範例

```js
const request = {
  input: '台中',
  sessionToken: sessionToken, // 用於同一搜尋 session
  language: 'zh-TW',
  region: 'tw',
  locationBias: map.getCenter()
};

const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
// response.suggestions 是一個 AutocompleteSuggestion 陣列
```

---

### 你可以怎麼用

1. 傳入使用者輸入的字串等參數
2. 取得建議陣列
3. 顯示在 UI 上讓使用者選擇

---

**總結：**  
`fetchAutocompleteSuggestions()` 讓你用 Google Maps API 取得地點自動完成建議，回傳一個建議陣列，適合用在搜尋列自動提示功能。


## AutocompleteSuggestions Request
```jsx
const request = {
  input: '搜尋字串', // 必填，使用者輸入的文字
  sessionToken: sessionToken, // 建議填入，AutocompleteSessionToken 物件
  language: 'zh-TW', // optional，回傳結果語言
  region: 'tw', // optional，地區代碼
  locationBias: map.getCenter(), // optional，偏好地理位置
  // 其他可選屬性：
  // includedPrimaryTypes: ['restaurant', 'gas_station'],
  // includedRegionCodes: ['TW'],
  // inputOffset: 文字游標位置
  // locationRestriction: 限制地理位置
  // origin: {lat, lng}
}
```

## AutocompleteSuggestions Response


在 Google Maps Places API 中，`AutocompleteSuggestion` 和 `PlacePrediction` 具有明確的層級關係：

### AutocompleteSuggestion
- 是 `fetchAutocompleteSuggestions()` 方法回傳的**建議項**
- 代表一個搜尋結果建議
- 是一個**容器物件**，內含更多詳細資訊

### PlacePrediction 
- 是 `AutocompleteSuggestion` 的**子屬性**
- 可透過 `suggestion.placePrediction` 取得
- 包含地點的核心資訊，如 `placeId`、`mainText` 等
- 提供 `toPlace()` 方法轉換為更詳細的 `Place` 物件

### 完整的資料流程
1. **取得建議列表**：
   ```js
   const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
   // response 包含 suggestions 陣列
   ```

2. **從建議中取得 placePrediction**：
   ```js
   const placePrediction = suggestion.placePrediction;
   ```

3. **轉換為 Place 物件**：
   ```js
   const place = placePrediction.toPlace();
   ```

4. **取得詳細資訊**：
   ```js
   await place.fetchFields({
     fields: ["location", "formattedAddress", "displayName"]
   });
   ```

### 為什麼要這樣設計？
這種設計讓 Google Maps API 可以**分階段提供資訊**：
- 先快速提供簡單的建議列表 (AutocompleteSuggestion)
- 只有當使用者選定了某個建議，才需進一步取得詳細資訊 (Place)
- 這樣既節省資料傳輸量，又能降低 API 計費

這就像是餐廳先給你菜單(AutocompleteSuggestion)，然後你點了菜(placePrediction)，最後才上完整的餐點(Place)。