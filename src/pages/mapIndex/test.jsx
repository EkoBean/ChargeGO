// ================= Library =============================
// ...existing code imports...

// ---- 新增：Marker 狀態事件總線（module scope，不觸發 React re-render）----
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

// ...existing code...

function AppIndex() {
  // ...existing code...

  const AppBaseMap = () => {
    const map = useMap();

    // 地圖點擊關閉
    useEffect(() => {
      if (!map) return;
      const listener = map.addListener('click', () => markerBus.clear());
      return () => listener.remove();
    }, [map]);

    // ESC 關閉（不觸發任何 React state）
    useEffect(() => {
      const onKey = e => { if (e.key === 'Escape') markerBus.clear(); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, []);

    const MarkerWithInfoWindow = () => (
      <>
        {stations.map((station, index) => (
          <React.Fragment key={station.properties.id}>
            <MarkerItem station={station} index={index} />
          </React.Fragment>
        ))}
      </>
    );

    const MarkerItem = ({ station, index }) => {
      const [markerRef, marker] = useAdvancedMarkerRef();
      const [open, setOpen] = React.useState(false);
      const id = station?.properties?.id ?? index;

      // 訂閱 bus（只在 mount / id 變化時綁定）
      useEffect(() => {
        const unsub = markerBus.subscribe(activeId => {
          const shouldOpen = activeId === id;
            // 若要開啟，確保 marker 已存在
          setOpen(shouldOpen);
        });
        return unsub;
      }, [id]);

      // 點 marker
      const onMarkerClick = () => {
        if (!map) return;
        map.panTo({
          lat: station.geometry.coordinates[1],
          lng: station.geometry.coordinates[0]
        });
        markerBus.set(id);
      };

      return (
        <>
          <AdvancedMarker
            position={{
              lat: station.geometry.coordinates[1],
              lng: station.geometry.coordinates[0]
            }}
            ref={markerRef}
            onClick={onMarkerClick}
          >
            <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
          </AdvancedMarker>
          {open && marker && (
            <InfoWindow
              anchor={marker}
              onCloseClick={() => markerBus.clear()}
            >
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
      );
    };

    return (
      <>
        <input type="text" id="search-bar" placeholder="搜尋地點" />
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

  // ...existing code render...
}
// ...existing export...