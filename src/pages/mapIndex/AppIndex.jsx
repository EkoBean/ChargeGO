// ================= Library =============================
// style
import '../../styles/scss/map_index.scss'

//React
import React, { cloneElement, useEffect, useRef } from 'react';

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

// geojson fetch
export const fetchGeoJSONData = async () => {
  try {
    const response = await fetch('./sample.geojson');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.features; // 返回 GeoJSON 的 features
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
    return [];
  }
};

// ================= Constants ============================
const APIkey = 'AIzaSyB6R2pe5qFv0A4P2MchR6R9UJ8HpoTVzLg'
const mapId = '7ade7c4e6e2cc1087f2619a5'
const defaultCenter = { lat: 25.033964, lng: 121.564468 }


// =============== Main function ===========================
function AppIndex() {
  const [stations, setStations] = React.useState([]);

  // 在組件掛載時加載資料
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchGeoJSONData();
      setStations(data); // 將資料存入狀態
    };
    loadData();
  }, []);




  // ================= App base map =====================
  const AppBaseMap = () => {
    // 載入map hook的功能
    const map = useMap();

    // ================= Marker with InfoWindow =================
    const MarkerWithInfoWindow = () => {
      useEffect(() => {
      }, []);

      return (
        <>
          {stations.map((station, index) => {
            return (
              <React.Fragment key={station.properties.id}>
                <MarkerItem
                  station={station}
                />
              </React.Fragment>
            )
          })}
        </>
      )
    };

    // =============marker item元件 =================
    const MarkerItem = ({ station, index }) => {
      const [infoWindowShown, setInfoWindowShown] = React.useState(false);
      const [markerRef, marker] = useAdvancedMarkerRef();
      const [activeMarker, setActiveMarker] = React.useState(null);

      const id = station?.properties?.id ?? index;

      // =============== info window toggle ================
      const toggleInfoWindow = () => {
        setInfoWindowShown((prev) => !prev);
        if (!infoWindowShown) {
        }
      }

      // =============== marker click handler =================
      const markerClick = (marker, station) => {
        if (map && station) {
          const pos = {
            lat: station.geometry.coordinates[1],
            lng: station.geometry.coordinates[0]
          };
          map.panTo(pos);
          toggleInfoWindow();
          setActiveMarker(marker);
          window.dispatchEvent(new CustomEvent('marker:clicked', { detail: { id } }));
        }
      };


      // ================= click map to close info window =================
      useEffect(() => {
        if (!map) return;
        const listener = map.addListener('click', (e) => {
          setInfoWindowShown(false);
          setActiveMarker(null);
        });
        return () => {
          listener.remove();
        };
      }, [map]);




      // 監聽別的 marker 被點擊 → 關閉本 InfoWindow
      React.useEffect(() => {
        const onOtherMarkerClicked = (e) => {
          const clickedId = e.detail?.id;
          if (clickedId !== id) setInfoWindowShown(false);
        };
        window.addEventListener('marker:clicked', onOtherMarkerClicked);
        return () => window.removeEventListener('marker:clicked', onOtherMarkerClicked);
      }, [id]);
      return (
        <>
          <AdvancedMarker
            position={
              {
                lat: station.geometry.coordinates[1],
                lng: station.geometry.coordinates[0]
              }
            }
            ref={markerRef}
            onClick={() => markerClick(marker, station)}
          >
            <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
          </AdvancedMarker >
          {infoWindowShown && activeMarker && (
            <InfoWindow anchor={activeMarker} onCloseClick={() => setInfoWindowShown(false)}>
              <div>
                <h3>{station.properties.name}</h3>
                <p>{station.properties.description}</p>
                <p>地址: {station.properties.address}</p>
                <p>狀態: {station.properties.status}</p>
                <p>ID: {station.properties.id}</p>
              </div>
            </InfoWindow>
          )}
        </>
      )
    }

    useEffect(() => {
    }, [])
    return (
      <>
        {/* ==== search bar ==== */}
        <input type="text" id="search-bar" placeholder="搜尋地點" />

        {/* ==== maps ==== */}

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
      <APIProvider apiKey={APIkey}>
        <AppBaseMap />
      </APIProvider>
    </>
  );
}

export default AppIndex;