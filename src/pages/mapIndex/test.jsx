// ...existing code...
function AppIndex() {
  // ...existing code...

  const AppBaseMap = () => {
    const map = useMap();
    const [infoWindowShown, setInfoWindowShown] = React.useState(false);
    const [infoWindowContent, setInfoWindowContent] = React.useState(null);

    // 以 index 為 key 暫存各 marker 的 instance（用 ref，不是 state，避免 re-render）
    const markerAnchorsRef = React.useRef({}); // { [index]: AdvancedMarkerInstance }
    const [activeIndex, setActiveIndex] = React.useState(null);

    // 註冊 anchor：只寫入 ref，不做 setState（避免無限循環）
    const registerAnchor = React.useCallback((index, anchor) => {
      if (anchor) markerAnchorsRef.current[index] = anchor;
    }, []);

    const handleMarkerClick = React.useCallback((index) => {
      setActiveIndex(index);
      setInfoWindowShown(true);
      setInfoWindowContent('這是 InfoWindow 的內容');

      const st = stations[index];
      if (map && st) {
        map.panTo({
          lat: st.geometry.coordinates[1],
          lng: st.geometry.coordinates[0]
        });
      }
    }, [map, stations]);

    const infoWindowHandlers = {
      closeWindow: () => {
        setInfoWindowShown(false);
        setActiveIndex(null);
      }
    };

    // 子元件：每個 marker 自己管理一個 ref，不在 ref 裡做 setState
    const MarkerItem = ({ station, index, onClick, registerAnchor }) => {
      const [markerRef, marker] = useAdvancedMarkerRef();

      useEffect(() => {
        if (marker) registerAnchor(index, marker); // 只寫入 ref 容器，不 setState
      }, [marker, index, registerAnchor]);

      return (
        <AdvancedMarker
          position={{
            lat: station.geometry.coordinates[1],
            lng: station.geometry.coordinates[0]
          }}
          ref={markerRef}
          onClick={() => onClick(index)}
        >
          <Pin
            background={activeIndex === index ? '#34A853' : '#FBBC04'}
            glyphColor={'#000'}
            borderColor={'#000'}
          />
        </AdvancedMarker>
      );
    };

    const MarkerWithInfoWindow = () => (
      <>
        {stations.map((station, index) => (
          <React.Fragment key={station.id || index}>
            <MarkerItem
              station={station}
              index={index}
              onClick={handleMarkerClick}
              registerAnchor={registerAnchor}
            />
          </React.Fragment>
        ))}

        {infoWindowShown &&
          activeIndex !== null &&
          markerAnchorsRef.current[activeIndex] && (
            <InfoWindow
              anchor={markerAnchorsRef.current[activeIndex]}
              onCloseClick={infoWindowHandlers.closeWindow}
            >
              {infoWindowContent || (
                <div>
                  <div>站點名稱: {stations[activeIndex]?.properties?.name}</div>
                  <div>
                    座標: {stations[activeIndex]?.geometry?.coordinates?.join(', ')}
                  </div>
                </div>
              )}
            </InfoWindow>
          )}
      </>
    );

    return (
      <>
        {/* ...existing code... */}
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

  // ...existing code...
}