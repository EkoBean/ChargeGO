// ================= Library =============================
// style
import '../../styles/scss/map_index.scss'

//React
import React, { useEffect, Component } from 'react';

//map style option
import mapOptions from '../mapOptions.json';

// APIProvider
import { APIProvider, Map, Pin, AdvancedMarker } from '@vis.gl/react-google-maps';


const APIkey = 'AIzaSyB6R2pe5qFv0A4P2MchR6R9UJ8HpoTVzLg'
const mapId = '7ade7c4e6e2cc1087f2619a5'
const defaultCenter = { lat: 25.033964, lng: 121.564468 }



// =============== Main function ===========================
function AppIndex() {

  // ======== Base Map =============

  const AppBaseMap = () => {
    return (
      <APIProvider apiKey={APIkey}>
        <Map
          style={{ width: '100vw', height: '100vh' }}
          defaultCenter={defaultCenter}
          defaultZoom={16}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId={mapId}

        >
          <AdvancedMarker position={defaultCenter} />
        </Map>
      </APIProvider>
    )
  }


  // ============ Original JS ==============
  useEffect(() => {

  }, []);

  // ============= Render zone ================
  return (
    <>
      <AppBaseMap />
    </>
  )
};

export default AppIndex;