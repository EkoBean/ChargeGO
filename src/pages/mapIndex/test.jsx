// ================= SearchBar component =================
const SearchBar = () => {
  const map = useMap();
  const [inputValue, setInputValue] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const [sessionToken, setSessionToken] = React.useState(null);

  // 初始化 Session Token
  useEffect(() => {
    if (!isGoogleMapsLoaded || !window.google) return;
    const { AutocompleteSessionToken } = google.maps.places;
    setSessionToken(new AutocompleteSessionToken());
  }, [isGoogleMapsLoaded]);

  // 當輸入框文字改變時，觸發搜尋
  useEffect(() => {
    if (!inputValue || !sessionToken) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      // 1. 搜尋本地站點
      const localResults = stations
        .filter(station => station.site_name.toLowerCase().includes(inputValue.toLowerCase()))
        .map(station => ({
          id: station.site_id,
          primaryText: station.site_name,
          secondaryText: 'iRent 站點',
          type: 'local',
          data: station
        }));

      // 2. 搜尋 Google Places
      try {
        const { AutocompleteSuggestion } = google.maps.places;
        const request = {
          input: inputValue,
          sessionToken: sessionToken,
          language: 'zh-TW',
          region: 'tw',
          locationBias: map.getCenter() // 以地圖中心為搜尋偏好
        };

        const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        const googleResults = response.suggestions.map(prediction => ({
          id: prediction.placeId,
          primaryText: prediction.mainText.text,
          secondaryText: prediction.secondaryText?.text || '',
          type: 'google',
          data: prediction
        }));

        // 3. 合併結果，本地站點優先
        setSuggestions([...localResults, ...googleResults]);
      } catch (error) {
        console.error('Autocomplete search error:', error);
        setSuggestions(localResults); // 如果 Google API 失敗，仍顯示本地結果
      }
    };

    fetchSuggestions();
  }, [inputValue, sessionToken, stations, map]);

  // 處理選項點擊或 Enter
  const handleSelect = async (suggestion) => {
    setInputValue(suggestion.primaryText); // 將 input 設為選定的文字
    setSuggestions([]); // 清空建議列表

    if (suggestion.type === 'local') {
      const { latitude, longitude, site_id } = suggestion.data;
      const pos = { lat: latitude, lng: longitude };
      map.panTo(pos);
      map.setZoom(18);
      markerBus.set(site_id); // 開啟 InfoWindow
    } else if (suggestion.type === 'google') {
      try {
        // 使用現代 API：PlacePrediction.toPlace() 和 fetchFields
        const place = suggestion.data.toPlace();
        await place.fetchFields({ fields: ['location'] });
        
        if (place.location) {
          map.panTo(place.location);
          map.setZoom(17);
        }
      } catch (error) {
        console.error('Fetch place details error:', error);
      }
    }

    // 產生一個新的 session token 供下次搜尋使用
    const { AutocompleteSessionToken } = google.maps.places;
    setSessionToken(new AutocompleteSessionToken());
  };

  // 處理鍵盤事件 (Enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault(); // 防止表單提交
      handleSelect(suggestions[0]); // 自動選取第一個
    }
  };

  return (
    <div className='search-bar-container'>
      <div className='search-bar'>
        <input
          type="text"
          placeholder='搜尋 iRent 站點或地點'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id} onClick={() => handleSelect(suggestion)}>
              <div className='suggestion-primary'>{suggestion.primaryText}</div>
              <div className='suggestion-secondary'>{suggestion.secondaryText}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};