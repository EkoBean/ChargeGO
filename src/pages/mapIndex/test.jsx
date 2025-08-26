// ...existing code...
  const AppBaseMap = () => {
    // 載入map hook的功能
    const map = useMap();

+    // ========== current location store (ref) & watcher ==========
+    // useRef 不會觸發重渲染，儲存最新位置供按鈕讀取。
+    const currentLocationRef = React.useRef(null);
+    // 這個 ref 用來把位置更新通知給只負責顯示 current marker 的子元件（避免重新渲染整個 AppBaseMap）
+    const markerPosSetterRef = React.useRef(null);
+
+    React.useEffect(() => {
+      if (!('geolocation' in navigator)) {
+        console.warn('Geolocation not supported');
+        return;
+      }
+      const success = (position) => {
+        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
+        currentLocationRef.current = pos;
+        if (markerPosSetterRef.current) markerPosSetterRef.current(pos);
+      };
+      const error = (err) => {
+        console.error('geolocation error', err);
+      };
+      const watchId = navigator.geolocation.watchPosition(success, error, {
+        enableHighAccuracy: true,
+        timeout: 10000,
+        maximumAge: 0,
+      });
+      return () => {
+        navigator.geolocation.clearWatch(watchId);
+      };
+    }, []);
+
    // ================= HUD component =================
    const HudSet = () => {
      // ================= SearchBar component =================
      const SearchBar = () => {
@@
       // =========== current location switch button ==============
       const LocationButton = () => {
-        function handleLocate() { }
+        function handleLocate() {
+          const pos = currentLocationRef.current;
+          if (!pos) {
+            // 沒有位置時可提示或觸發一次 getCurrentPosition
+            alert('尚未取得定位，請稍候或允許定位權限');
+            return;
+          }
+          if (map && typeof map.panTo === 'function') {
+            map.panTo(pos);
+            map.setZoom(16);
+          }
+        }
         return (
           <div className='hud-container'>
 
             <button
               type="button"
               name=""
               id=""
               className="btn btn-primary locate-button"
-            >
+              onClick={handleLocate}
+            >
               <i className="bi bi-pin-map"></i>
             </button>
 
 
           </div>
         )
       }
       return (
         <>
           <SearchBar />
           <LocationButton />
         </>
       )
     }
 
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
 
+    // =============== single CurrentLocationMarker (moved out of MarkerItem) ===============
+    const CurrentLocationMarker = () => {
+      const [pos, setPos] = React.useState(null);
+      // 在 mount 時把 setPos 註冊到 markerPosSetterRef，讓 geolocation watcher 只更新這個子元件的 state
+      React.useEffect(() => {
+        markerPosSetterRef.current = setPos;
+        // 同步當前 ref（如果已經有值）
+        if (currentLocationRef.current) setPos(currentLocationRef.current);
+        return () => {
+          markerPosSetterRef.current = null;
+        };
+      }, []);
+
+      if (!pos) return null;
+      return <AdvancedMarker position={pos} />;
+    };
+
     // ============= MarkerItem  =================
     const MarkerItem = ({ station, index }) => {
@@
-      return (
-        <>
-          {/* Current Location Marker */}
-          <CurrentLocationMarker />
-          {/* Stations Marker */}
+      return (
+        <>
+          {/* Stations Marker */}
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
       const closeWindow = map.addListener('click', () => (markerBus.clear(), listBus.set(false)));
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
 
-          <HudSet />
-          <MarkerWithInfoWindow />
+          <HudSet />
+          <MarkerWithInfoWindow />
+          <CurrentLocationMarker />
         </Map>
 
       </>
     );
   };
 
// ...existing code...