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

// geojson fetch
// export const fetchGeoJSONData = async () => {
//   try {
//     const response = await fetch('./sample.geojson');
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const data = await response.json();
//     return data.features; // 返回 GeoJSON 的 features
//   } catch (error) {
//     console.error('Error loading GeoJSON:', error);
//     return [];
//   }
// };

// ================= Constants ============================
const APIkey = 'AIzaSyB6R2pe5qFv0A4P2MchR6R9UJ8HpoTVzLg'
const mapId = '7ade7c4e6e2cc1087f2619a5'
const defaultCenter = { lat: 25.033964, lng: 121.564468 }

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
  // ================= fetch sataions =================
  useEffect(() => {
    const getStations = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/stations');
        console.log('res.data :>> ', res.data);
        setStations(res.data);
      }
      catch (error) {
        console.error(error);
        return [];
      }
    }
    getStations();
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
      // const [infoWindowShown, setInfoWindowShown] = React.useState(false);



      // =============== marker click handler =================
      const markerClick = (marker, station) => {
        if (map && station) {
          const pos = {
            lat: station.latitude,
            lng: station.longitude
          };
          map.panTo(pos);
          markerBus.set(id);
          // setInfoWindowShown((prev) => !prev);
          // setActiveMarker(marker);
          // window.dispatchEvent(new CustomEvent('marker:clicked', { detail: { id } }));
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
            <InfoWindow anchor={marker}
              onCloseClick={() => markerBus.clear()}

            >
              <div>
                <h3>{station.properties.name}</h3>
                <p>{station.properties.description}</p>
                <p>地址: {station.properties.address}</p>
                <p>狀態: {station.properties.status}</p>
                <p>ID: {station.site_id}</p>
              </div>
            </InfoWindow>
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