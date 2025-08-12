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

你可以根據需求選擇合適的方式來實現地圖的功能。如果有具體需求或問題，請提供更多細節，我可以進一步協助！