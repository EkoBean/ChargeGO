// ================= Library =============================
// style
import '../styles/scss/map_index.scss'

//React
import React, { useEffect, Component } from 'react';

// @react-google-map/api 
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

//map style option
import mapOptions from './mapOptions.json';


// =============== Main function ===========================
function AppIndex() {

  // ======== MAP =============
  const APIkey = "AIzaSyB6R2pe5qFv0A4P2MchR6R9UJ8HpoTVzLg"
  const mapContainerStyle = {
    width: '100%',
    height: '100vh',
  };

  const center = {
    lat: 25.033964, // 台北 101 的緯度
    lng: 121.564468, // 台北 101 的經度
  };

  const Map = () => {
    return (
      <LoadScript googleMapsApiKey={APIkey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={16}
          options={mapOptions}
        >

        </GoogleMap>
      </LoadScript>
      )};


  // ============ Original JS ==============
  useEffect(() => {


  }, []);

  // ============= Render zone ================
  return (
    <>
      <Map />
    </>
  )};

export default AppIndex;