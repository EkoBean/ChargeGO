// ================= Library =============================
// style
import '../../styles/scss/map_index.scss'

//React
import React, { useEffect, useRef } from 'react';

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

// 
export const fetchGeoJSONData = async () => {
  try {
    const response = await fetch('./sample.geojson'); // 確保 sample.geojson 位於 public 資料夾
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



  // ================= Base Map Component =====================
  const AppBaseMap = () => {
    const map = useMap();
    const [infoWindowShown, setInfoWindowShown] = React.useState(false);

    // =============== 開關 InfoWindow =================
    const infoWindowHandlers = {
      toggleInfoWindow: () => {
        setInfoWindowShown((prev) => !prev);
        console.log('Marker clicked, InfoWindow toggled.');
      },
      closeWindow: () => {
        setInfoWindowShown(false);
        console.log('Map clicked, InfoWindow closed.');
      }
    };


    // ================= Marker with InfoWindow =================
    const MarkerWithInfoWindow = props => {
      const [markerRef, marker] = useAdvancedMarkerRef();


      useEffect(() => {
      }, []);

      return (
        <>
          {stations.map((station, index) => (
            <React.Fragment key={station.id || index}>
              <AdvancedMarker
                position={{
                  lat: station.geometry.coordinates[1],
                  lng: station.geometry.coordinates[0]
                }}
                onClick={() => infoWindowHandlers.toggleInfoWindow()}
                ref={markerRef}
              >
                <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
              </AdvancedMarker>
              {infoWindowShown && (
                <InfoWindow anchor={marker}>Infowindow Content</InfoWindow>
              )}
            </React.Fragment>
          ))}
        </>
      )
    };

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
          onClick={infoWindowHandlers.closeWindow}
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