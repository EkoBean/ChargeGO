// ================= Library =============================
// style
import '../styles/scss/map_index.scss'

//React
import React, { useEffect, Component } from 'react';

//map style option
import mapOptions from './mapOptions.json';

// APIProvider
import { APIProvider, Map } from '@vis.gl/react-google-maps';

const APIkey = 'AIzaSyB6R2pe5qFv0A4P2MchR6R9UJ8HpoTVzLg'



// =============== Main function ===========================
function AppIndex() {

  // ======== Base Map =============

  const AppBaseMap = () => {
    return (
      <APIProvider apiKey={APIkey}>
        <Map
          style={{ width: '100vw', height: '100vh' }}
          defaultCenter={{ lat: 22.54992, lng: 0 }}
          defaultZoom={3}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        />
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