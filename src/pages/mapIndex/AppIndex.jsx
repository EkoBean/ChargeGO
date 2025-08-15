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
  const SearchBar = (stations) => {
    const map = useMap();

    // const { AutocompleteSuggestion } = google.maps.importLibrary("places") 

    return (
      <div className='search-bar'>
        <input type="text"
          placeholder='搜尋地點'
        />
      </div>
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