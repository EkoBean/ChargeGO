import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

// 這是一個 debounce 函式，用來延遲 API 請求，避免過度頻繁的呼叫
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const SearchBar = ({ stations, markerBus }) => {
  const map = useMap();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const autocompleteService = useRef(null);

  // 使用 debounce 來優化效能
  const debouncedInput = useDebounce(inputValue, 300);

  // 初始化 Google Autocomplete Service
  useEffect(() => {
    if (map && !autocompleteService.current) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
  }, [map]);

  // 當使用者輸入時，觸發搜尋
  useEffect(() => {
    if (!autocompleteService.current || !debouncedInput) {
      setSuggestions([]);
      return;
    }

    // 1. 搜尋自訂站點
    const localSuggestions = stations
      .filter(station =>
        station.site_name.toLowerCase().includes(debouncedInput.toLowerCase())
      )
      .map(station => ({
        isLocal: true,
        ...station,
        description: station.site_name,
      }));

    // 2. 搜尋 Google Places
    autocompleteService.current.getPlacePredictions(
      {
        input: debouncedInput,
        componentRestrictions: { country: 'tw' }, // 優先顯示台灣的結果
      },
      (googleResults, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && googleResults) {
          const googleSuggestions = googleResults.map(result => ({
            isLocal: false,
            ...result,
          }));
          // 合併並更新建議列表 (自訂站點優先)
          setSuggestions([...localSuggestions, ...googleSuggestions]);
        } else {
          // 如果 Google 沒有結果，只顯示自訂站點的結果
          setSuggestions(localSuggestions);
        }
      }
    );
  }, [debouncedInput, stations]);

  const handleSelect = (suggestion) => {
    setInputValue(suggestion.description, false);
    setSuggestions([]);

    if (suggestion.isLocal) {
      // 處理自訂站點
      const pos = { lat: suggestion.latitude, lng: suggestion.longitude };
      map.panTo(pos);
      map.setZoom(18);
      markerBus.set(suggestion.site_id);
    } else {
      // 處理 Google Place
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          map.panTo(location);
          map.setZoom(16);
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      handleSelect(suggestions[0]);
    }
  };

  return (
    <div className='search-bar'>
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='搜尋充電站或地點'
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.isLocal ? suggestion.site_id : suggestion.place_id} onClick={() => handleSelect(suggestion)}>
              <strong>{suggestion.isLocal ? suggestion.description : suggestion.structured_formatting.main_text}</strong>
              <small>{suggestion.isLocal ? ' (自訂站點)' : ` ${suggestion.structured_formatting.secondary_text}`}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### 3. 修改 `AppIndex.jsx` 來使用新的 `SearchBar`

現在，更新您的 `AppIndex.jsx`，移除舊的 `SearchBar` 程式碼，並匯入和使用我們剛剛建立的新元件。

````jsx
// filepath: c:\Coding Learning\The_Final_Profject\src\pages\mapIndex\AppIndex.jsx
// ================= Library =============================
// style
import '../../styles/scss/map_index.scss'

//React
import React, { cloneElement, useEffect, useRef } from 'react';
import axios from 'axios';

// Google Maps
import {
  APIProvider,
  Map,
  useMap,
  useAdvancedMarkerRef,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';

// +++ 匯入新的 SearchBar 元件 +++
import { SearchBar } from './SearchBar';


// ================= Constants ============================
// ...existing code...
const markerBus = new MarkerBus();

// =============== Main function ===========================
function AppIndex() {
  const [stations, setStations] = React.useState([]);
  // --- 移除 isGoogleMapsLoaded 狀態 ---

  // ================= Axios fetch =================
  // all stations
  useEffect(() => {
    const getStations = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/stations');
        setStations(res.data);
      }
      catch (error) {
        console.error(error);
        return [];
      }
    }

    getStations();
  }, []);


  // --- 移除舊的 SearchBar component 和手動載入 script 的 useEffect ---


  // ================= App base map =====================
  const AppBaseMap = () => {
    // ...existing code...
    // ...existing code...
    return (
      <>
        {/* +++ 將 SearchBar 移到 Map 內部，這樣才能使用 useMap() hook +++ */}
        <SearchBar stations={stations} markerBus={markerBus} />
        <Map
          style={{ width: '100vw', height: '100vh' }}
          // ...existing code...
        >
          <MarkerWithInfoWindow />
        </Map>

      </>
    );
  };

  // ============= Render zone ================
  return (
    <>
      <APIProvider apiKey={APIkey}
        region='TW'
        // +++ 加上 libraries 屬性，讓 APIProvider 幫我們載入 places API +++
        libraries={['places']}
      >
        <AppBaseMap />
      </APIProvider>
    </>
  );
}

export default AppIndex;
```

### 總結與說明

1.  **`APIProvider` 載入 API**：我們在 `APIProvider` 中加入了 `libraries={['places']}`。這是 `@vis.gl/react-google-maps` 建議的方式，它會確保在渲染地圖前，Google Maps 的 Places API 已經被正確載入。
2.  **獨立的 `SearchBar.jsx`**：將 `SearchBar` 邏輯分離到自己的檔案中，讓程式碼更清晰。
3.  **手動呼叫 Google API**：我們直接使用 `window.google.maps.places.AutocompleteService()` 來獲取建議，完全繞過了有問題的舊套件。
4.  **合併建議**：程式碼會先過濾您自己的 `stations` 資料，然後再呼叫 Google API，最後將兩種結果合併顯示在同一個列表中。
5.  **`useDebounce`**：這是一個自訂的 Hook，用來防止使用者每輸入一個字元就觸發一次 API 呼叫，可以節省 API 用量並提升效能。
6.  **點擊處理**：`handleSelect` 函式會判斷使用者點擊的是自訂站點 (`isLocal: true`) 還是 Google 地點，並執行相應的地圖操作。

這樣就完成了一個現代、高效且功能完整的搜尋列！// filepath: c:\Coding Learning\The_Final_Profject\src\pages\mapIndex\SearchBar.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

// 這是一個 debounce 函式，用來延遲 API 請求，避免過度頻繁的呼叫
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const SearchBar = ({ stations, markerBus }) => {
  const map = useMap();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const autocompleteService = useRef(null);

  // 使用 debounce 來優化效能
  const debouncedInput = useDebounce(inputValue, 300);

  // 初始化 Google Autocomplete Service
  useEffect(() => {
    if (map && !autocompleteService.current) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
  }, [map]);

  // 當使用者輸入時，觸發搜尋
  useEffect(() => {
    if (!autocompleteService.current || !debouncedInput) {
      setSuggestions([]);
      return;
    }

    // 1. 搜尋自訂站點
    const localSuggestions = stations
      .filter(station =>
        station.site_name.toLowerCase().includes(debouncedInput.toLowerCase())
      )
      .map(station => ({
        isLocal: true,
        ...station,
        description: station.site_name,
      }));

    // 2. 搜尋 Google Places
    autocompleteService.current.getPlacePredictions(
      {
        input: debouncedInput,
        componentRestrictions: { country: 'tw' }, // 優先顯示台灣的結果
      },
      (googleResults, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && googleResults) {
          const googleSuggestions = googleResults.map(result => ({
            isLocal: false,
            ...result,
          }));
          // 合併並更新建議列表 (自訂站點優先)
          setSuggestions([...localSuggestions, ...googleSuggestions]);
        } else {
          // 如果 Google 沒有結果，只顯示自訂站點的結果
          setSuggestions(localSuggestions);
        }
      }
    );
  }, [debouncedInput, stations]);

  const handleSelect = (suggestion) => {
    setInputValue(suggestion.description, false);
    setSuggestions([]);

    if (suggestion.isLocal) {
      // 處理自訂站點
      const pos = { lat: suggestion.latitude, lng: suggestion.longitude };
      map.panTo(pos);
      map.setZoom(18);
      markerBus.set(suggestion.site_id);
    } else {
      // 處理 Google Place
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          map.panTo(location);
          map.setZoom(16);
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      handleSelect(suggestions[0]);
    }
  };

  return (
    <div className='search-bar'>
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='搜尋充電站或地點'
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.isLocal ? suggestion.site_id : suggestion.place_id} onClick={() => handleSelect(suggestion)}>
              <strong>{suggestion.isLocal ? suggestion.description : suggestion.structured_formatting.main_text}</strong>
              <small>{suggestion.isLocal ? ' (自訂站點)' : ` ${suggestion.structured_formatting.secondary_text}`}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### 3. 修改 `AppIndex.jsx` 來使用新的 `SearchBar`

現在，更新您的 `AppIndex.jsx`，移除舊的 `SearchBar` 程式碼，並匯入和使用我們剛剛建立的新元件。

````jsx
// filepath: c:\Coding Learning\The_Final_Profject\src\pages\mapIndex\AppIndex.jsx
// ================= Library =============================
// style
import '../../styles/scss/map_index.scss'

//React
import React, { cloneElement, useEffect, useRef } from 'react';
import axios from 'axios';

// Google Maps
import {
  APIProvider,
  Map,
  useMap,
  useAdvancedMarkerRef,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';

// +++ 匯入新的 SearchBar 元件 +++
import { SearchBar } from './SearchBar';


// ================= Constants ============================
// ...existing code...
const markerBus = new MarkerBus();

// =============== Main function ===========================
function AppIndex() {
  const [stations, setStations] = React.useState([]);
  // --- 移除 isGoogleMapsLoaded 狀態 ---

  // ================= Axios fetch =================
  // all stations
  useEffect(() => {
    const getStations = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/stations');
        setStations(res.data);
      }
      catch (error) {
        console.error(error);
        return [];
      }
    }

    getStations();
  }, []);


  // --- 移除舊的 SearchBar component 和手動載入 script 的 useEffect ---


  // ================= App base map =====================
  const AppBaseMap = () => {
    // ...existing code...
    // ...existing code...
    return (
      <>
        {/* +++ 將 SearchBar 移到 Map 內部，這樣才能使用 useMap() hook +++ */}
        <SearchBar stations={stations} markerBus={markerBus} />
        <Map
          style={{ width: '100vw', height: '100vh' }}
          // ...existing code...
        >
          <MarkerWithInfoWindow />
        </Map>

      </>
    );
  };

  // ============= Render zone ================
  return (
    <>
      <APIProvider apiKey={APIkey}
        region='TW'
        // +++ 加上 libraries 屬性，讓 APIProvider 幫我們載入 places API +++
        libraries={['places']}
      >
        <AppBaseMap />
      </APIProvider>
    </>
  );
}

export default AppIndex;
```

### 總結與說明

1.  **`APIProvider` 載入 API**：我們在 `APIProvider` 中加入了 `libraries={['places']}`。這是 `@vis.gl/react-google-maps` 建議的方式，它會確保在渲染地圖前，Google Maps 的 Places API 已經被正確載入。
2.  **獨立的 `SearchBar.jsx`**：將 `SearchBar` 邏輯分離到自己的檔案中，讓程式碼更清晰。
3.  **手動呼叫 Google API**：我們直接使用 `window.google.maps.places.AutocompleteService()` 來獲取建議，完全繞過了有問題的舊套件。
4.  **合併建議**：程式碼會先過濾您自己的 `stations` 資料，然後再呼叫 Google API，最後將兩種結果合併顯示在同一個列表中。
5.  **`useDebounce`**：這是一個自訂的 Hook，用來防止使用者每輸入一個字元就觸發一次 API 呼叫，可以節省 API 用量並提升效能。
6.  **點擊處理**：`handleSelect` 函式會判斷使用者點擊的是自訂站點 (`isLocal: true`) 還是 Google 地點，並執行相應的地圖操作。

這樣就完成了一個現代、高效且功能完整