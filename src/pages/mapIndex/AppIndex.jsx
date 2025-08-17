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
import { data } from 'react-router-dom';


// ================= Constants ============================
const APIkey = 'AIzaSyB6R2pe5qFv0A4P2MchR6R9UJ8HpoTVzLg'

const mapId = '7ade7c4e6e2cc1087f2619a5'
const defaultCenter = { lat: 24.14815277439618, lng: 120.67403583217342 }



// ======== MarkerBus  ==========
// 將對markerID的操作不管在哪裡都將他連結進markerItem裡面
// 不管在父元件還是在其他地方都可以操作subscribe這個class的物件
class MarkerBus {
  constructor() {
    this.current = null;
    this.listeners = new Set();
  }
  set(id) {
    this.current = (this.current === id ? null : id);
    this.listeners.forEach(l => l(this.current));
  }
  clear() {
    if (this.current !== null) {
      this.current = null;
      this.listeners.forEach(l => l(this.current));
    }
  }
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}
const markerBus = new MarkerBus();

// =============== Main function ===========================
function AppIndex() {
  const [stations, setStations] = React.useState([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = React.useState(false);
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


  // ================= SearchBar component =================
  const SearchBar = () => {
    const map = useMap();
    const [inputValue, setInputValue] = React.useState('');
    const [suggestions, setSuggestions] = React.useState([]);
    const [sessionToken, setSessionToken] = React.useState(null);
    //================ initial session token =================
    // token是用來避免打字的時候去不斷重新向API要求搜尋 
    useEffect(() => {
      const { AutocompleteSessionToken } = window.google.maps.places;
      setSessionToken(new AutocompleteSessionToken());
    }, [isGoogleMapsLoaded])

    useEffect(() => {
      if (!inputValue || !sessionToken || !map) {
        setSuggestions([]);
        return;
      }
      // ================= Autocomplete fetch =================
      const fetchSuggestions = async () => {
        // ========== local search ==============
        const localResults = stations
          .filter(station => (
            station.site_name.toLowerCase().includes(inputValue.toLowerCase())
          ))
          .map(station => {
            // make the filter result into a suggestion object
            return {
              id: station.site_id,
              primaryText: station.site_name,
              secondaryText: station.address,
              type: 'local',
              data: station
            }
          })
        // ========== google search ==============
        try {
          const { AutocompleteSuggestion } = await window.google.maps.places;
          const request = {
            input: inputValue,
            sessionToken: sessionToken,
            language: 'zh-TW',
            region: 'tw',
            locationBias: map.getCenter(),
          }

          const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

          // 建立可用的 googleResults 陣列
          const googleResults = await Promise.all(
            response.suggestions.map(async (suggestion) => {
              try {
                // 取得 placePrediction (正確的方式)
                const placePrediction = suggestion.placePrediction;
                if (!placePrediction) return null;

                // 轉換為 Place 並取得需要的欄位
                const place = placePrediction.toPlace();
                await place.fetchFields({
                  fields: ["location", "formattedAddress", "displayName"]
                });

                return {
                  id: place.id,
                  primaryText: place.displayName || '',
                  secondaryText: place.formattedAddress || '',
                  type: 'google',
                  data: place
                };
              } catch (error) {
                console.error('Error processing suggestion:', error);
                return null;
              }
            })
          );

console.log('googleResults :>> ', googleResults);


        }
        // ========== google search error handling ==============
        catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions(localResults);
        }
      }

      fetchSuggestions();
    }, [inputValue, sessionToken, stations, map]);




    // press the enter
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect();
      }
    }


    return (
      <div className='search-bar-container'>
        <div className='search-bar'>
          <input type="text"
            placeholder='搜尋地點'
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        {suggestions.length > 0 && (
          <div className='suggestions-list'>
            <ul>
              {suggestions.map((suggest) => {
                <li key={suggest.id} onClick={() => handleSelect()} >
                  <div className="suggestion-primary">{suggestion.primaryText}</div>
                  <div className="suggestion-secondary">{suggestion.secondary}</div>
                </li>
              })}
            </ul>
          </div>

        )
        }
      </div >
    )

  }

  // ================= App base map =====================
  const AppBaseMap = () => {
    // 載入map hook的功能
    const map = useMap();
    // ================= Marker with InfoWindow =================
    const MarkerWithInfoWindow = () => {
      return (
        <>
          {stations.map((station, index) => {
            return (
              <React.Fragment key={station.site_id}>
                <MarkerItem
                  station={station}
                />
              </React.Fragment>
            )
          })}
        </>
      )
    };

    // ============= MarkerItem  =================
    const MarkerItem = ({ station, index }) => {
      const id = station?.site_id ?? index;
      const [markerRef, marker] = useAdvancedMarkerRef();
      const [activeMarkerId, setActiveMarkerId] = React.useState(null);

      // =============== Info Window =================
      function InfoWin() {
        const [info, setInfo] = React.useState([]);

        // ================= Axios fetch =================
        // infowindow detail
        useEffect(() => {
          const siteId = station.site_id;
          const getInfo = async () => {
            try {
              const res = await axios.get(`http://localhost:3000/api/infoWindow/${siteId}`);
              setInfo(res.data);
            }
            catch (error) {
              console.error(error);
              return [];
            }
          }
          getInfo();
        }, []);


        if (info.length >= 1) {
          const rentable = info.filter(x => x.status === '2' || x.status === '3').length;
          const charging = info.filter(x => x.status === '4').length;
          return (
            <InfoWindow
              anchor={marker}
            >
              <div>
                <h4 className='site-name'>{info[0].site_name}</h4>
                <p className='address'>{info[0].address}</p>
                <div className='bat-status'>
                  <p>可租借 {rentable}</p>
                  <p>充電中 {charging}</p>
                </div>

              </div>
            </InfoWindow>
          )
        }


      }

      // =============== marker click handler =================
      const markerClick = (marker, station) => {
        if (map && station) {
          const pos = {
            lat: station.latitude,
            lng: station.longitude
          };
          map.panTo(pos);
          markerBus.set(id);
        }
      };

      // ================= suscribe markerBus 把id綁進markerBus裡面，僅限一次 =================
      useEffect(() => {
        const unsub = markerBus.subscribe(
          // markerBus主程式
          activeId => {
            const x = activeId === id;
            setActiveMarkerId(x ? id : null);
          }
        )
        return unsub;
      }, [id]);


      return (
        <>
          <AdvancedMarker
            position={
              {
                lat: station.latitude,
                lng: station.longitude
              }
            }
            ref={markerRef}
            onClick={() => markerClick(marker, station)}
          >
            <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
          </AdvancedMarker >
          {activeMarkerId && marker && (
            <InfoWin
              onCloseClick={() => markerBus.clear()}
            />

          )}
        </>
      )
    }
    // ============== close InfoWindow on map click ===============
    useEffect(() => {
      if (!map) return;
      const closeWindow = map.addListener('click', () => markerBus.clear());
      return () => closeWindow.remove();
    }, [map])


    return (
      <>
        <Map
          style={{ width: '100vw', height: '100vh' }}
          defaultCenter={defaultCenter}
          defaultZoom={16}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          draggingCursor={'default'}
          draggableCursor={'default'}
          mapId={mapId}
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
        libraries={['places']}
        onLoad={() => setIsGoogleMapsLoaded(true)}>
        {isGoogleMapsLoaded && (
          <>
            <SearchBar />
            <AppBaseMap />
          </>
        )}
      </APIProvider>
    </>
  );
}

export default AppIndex;