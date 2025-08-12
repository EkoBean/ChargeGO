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


// ================= Constants ============================
const APIkey = 'AIzaSyB6R2pe5qFv0A4P2MchR6R9UJ8HpoTVzLg'
const mapId = '7ade7c4e6e2cc1087f2619a5'
const defaultCenter = { lat: 25.033964, lng: 121.564468 }


// =============== Main function ===========================
function AppIndex() {



  useEffect(() => {

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

      // infoWindowShown =====> control InforWindow

      useEffect(() => {

      }, []);

      return (
        <>
          <AdvancedMarker position={defaultCenter} ref={markerRef} onClick={infoWindowHandlers.toggleInfoWindow} >
            <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
          </AdvancedMarker>

          {infoWindowShown && (
            <InfoWindow anchor={marker}>Infowindow Content</InfoWindow>
          )}
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