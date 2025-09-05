// ================= Library =============================
// style
import styles from "../../styles/scss/map_index.module.scss";
//React
import React, { cloneElement, use, useEffect, useRef } from "react";
import axios from "axios";

// Google Maps
import {
  APIProvider,
  Map,
  useMap,
  useAdvancedMarkerRef,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

// Bootstrap Icons
import "bootstrap-icons/font/bootstrap-icons.css";

// environment variables
const API_URL = import.meta.env.VITE_BACKEND_API_URL;


// ================= Constants ============================
const APIkey = "AIzaSyB6R2pe5qFv0A4P2MchR6R9UJ8HpoTVzLg";

const mapId = "7ade7c4e6e2cc1087f2619a5";
let defaultCenter = { lat: 24.14815277439618, lng: 120.67403583217342 };

// Warning time threshold in minutes (e.g., 4320 minutes = 3 days)
const WARNING_MINUTES = 4320;

// ======== MarkerBus  ==========
// 將對markerID的操作不管在哪裡都將他連結進markerItem裡面
// 不管在父元件還是在其他地方都可以操作subscribe這個class的物件
class Bus {
  constructor() {
    this.current = null;
    this.listeners = new Set();
  }
  set(id) {
    this.current = this.current === id ? null : id;
    this.listeners.forEach((l) => l(this.current));
  }
  clear() {
    if (this.current !== null) {
      this.current = null;
      this.listeners.forEach((l) => l(this.current));
    }
  }
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}
const markerBus = new Bus();
const listBus = new Bus();

// =============== Main function ===========================
function MapIndex() {
  const [stations, setStations] = React.useState([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = React.useState(false);

  // ================= Axios fetch =================
  // all stations
  useEffect(() => {
    const getStations = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/stations`);
        setStations(res.data);
      } catch (error) {
        console.error(error);
        return [];
      }
    };

    getStations();
  }, []);

  // ================= App base map =====================
  const AppBaseMap = () => {
    // 載入map hook的功能
    const map = useMap();
    const locationRef = React.useRef(null);
    const locationSetterRef = React.useRef(null);
    const rentWindowRef = React.useRef(null);
    // ================= HUD component =================
    const HudSet = () => {
      // ================= SearchBar component =================
      const SearchBar = () => {
        const map = useMap();
        const [inputValue, setInputValue] = React.useState("");
        const [listOpen, setListOpen] = React.useState(null);
        const [suggestions, setSuggestions] = React.useState([]);
        const [sessionToken, setSessionToken] = React.useState(null);
        const [selectSuggestion, setSelectSuggestion] = React.useState(null);
        const suggestionRefs = React.useRef([]);
        //================ initial session token =================
        // token是用來避免打字的時候去不斷重新向API要求搜尋
        useEffect(() => {
          const { AutocompleteSessionToken } = window.google.maps.places;
          setSessionToken(new AutocompleteSessionToken());
          listBus.subscribe((x) => setListOpen(x));
        }, [isGoogleMapsLoaded]);

        useEffect(() => {
          if (!inputValue || !sessionToken || !map) {
            setSuggestions([]);
            return;
          }
          // ================= Autocomplete fetch =================
          const fetchSuggestions = async () => {
            if (!inputValue || !sessionToken || !map) {
              setSuggestions([]);
              return;
            }
            // ========== local search ==============
            const localResults = stations
              .filter((station) =>
                station.site_name
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
              )
              .map((station) => {
                // make the filter result into a suggestion object
                return {
                  id: station.site_id,
                  primaryText: station.site_name,
                  secondaryText: station.address,
                  type: "local",
                  data: station,
                };
              });
            // ========== google search ==============
            try {
              const { AutocompleteSuggestion } = window.google.maps.places;
              const request = {
                input: inputValue,
                sessionToken: sessionToken,
                language: "zh-TW",
                region: "tw",
                locationBias: map.getCenter(),
              };

              const response =
                await AutocompleteSuggestion.fetchAutocompleteSuggestions(
                  request
                );

              // 建立可用的 googleResults 陣列
              const googleResults = (
                await Promise.all(
                  response.suggestions.map(async (suggestion) => {
                    try {
                      // 取得 placePrediction (正確的方式)
                      const placePrediction = suggestion.placePrediction;
                      if (!placePrediction) return null;

                      // 轉換為 Place 並取得需要的欄位
                      const place = placePrediction.toPlace();
                      await place.fetchFields({
                        fields: ["location", "formattedAddress", "displayName"],
                      });

                      return {
                        id: place.id,
                        primaryText: place.displayName || "",
                        secondaryText: place.formattedAddress || "",
                        type: "google",
                        data: place,
                      };
                    } catch (error) {
                      console.error("Error processing suggestion:", error);
                      return null;
                    }
                  })
                )
              ).filter((x) => x !== null);
              setSuggestions([...localResults, ...googleResults]);
            } catch (error) {
              // ========== google search error handling ==============
              console.error("Error fetching suggestions:", error);
              setSuggestions(localResults);
            }
          };

          fetchSuggestions();
        }, [inputValue, sessionToken, stations, map]);

        // input bar press the enter
        const handleKeyDown = (e) => {
          if (e.key === "Enter" && suggestions.length > 0) {
            e.preventDefault();
            if (suggestions.length > 0 && !selectSuggestion) {
              handleSelect(suggestions[0]);
              listBus.set(false);
            } else if (
              selectSuggestion !== null &&
              suggestions[selectSuggestion]
            ) {
              handleSelect(suggestions[selectSuggestion]);
              listBus.set(false);
            }
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectSuggestion((prev) =>
              prev === null || prev >= suggestions.length - 1 ? 0 : prev + 1
            );
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectSuggestion((prev) =>
              prev === null || prev <= 0 ? suggestions.length - 1 : prev - 1
            );
          }
        };
        useEffect(() => {
          if (
            selectSuggestion !== null &&
            suggestionRefs.current[selectSuggestion]
          ) {
            suggestionRefs.current[selectSuggestion].scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }, [selectSuggestion]);

        // select suggestion option
        const handleSelect = async (suggestion) => {
          setInputValue(suggestion.primaryText);

          setSuggestions([]);
          setListOpen(false);
          if (suggestion.type === "local") {
            const { longitude, latitude, site_id } = suggestion.data;
            const pos = { lat: latitude, lng: longitude };
            map.panTo(pos);
            markerBus.set(site_id);
            map.setZoom(16);
          } else if (suggestion.type === "google") {
            const place = suggestion.data;
            if (place.location) {
              map.panTo(place.location);
              map.setZoom(16);
            }
          }

          // Reset session token after selection
          const { AutocompleteSessionToken } = window.google.maps.places;
          setSessionToken(new AutocompleteSessionToken());
        };

        // ================= Escape key handler =================
        // 監聽Esc鍵，關閉建議列表並清空輸入
        useEffect(() => {
          const handleEscape = (e) => {
            if (e.key === "Escape") {
              setListOpen(false);
              document.activeElement.blur();
              setInputValue("");
              return handleEscape;
            }
          };
          document.addEventListener("keydown", handleEscape);
          return () => document.removeEventListener("keydown", handleEscape);
        }, [map]);
        return (
          <div className={`${styles.searchBarContainer}`}>
            <div className={`${styles.searchBar}`}>
              <input
                type="text"
                placeholder="搜尋地點"
                onChange={(e) => (
                  setInputValue(e.target.value), setListOpen(true)
                )}
                onKeyDown={handleKeyDown}
                onClick={() => (
                  markerBus.clear(),
                  setListOpen(true),
                  rentWindowRef.current(false)
                )}
                value={inputValue}
              />
            </div>
            {suggestions.length > 0 && listOpen && (
              <div className={`${styles.suggestionsList}`}>
                <ul>
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={suggestion.id}
                      onClick={() => handleSelect(suggestion)}
                      className={
                        index === selectSuggestion
                          ? `${styles.selectedSuggestion}`
                          : ""
                      }
                      ref={(el) => (suggestionRefs.current[index] = el)}
                    >
                      <div
                        className={
                          suggestion.type === "local"
                            ? `${styles.localStation} ${styles.suggestionPrimary}`
                            : `${styles.googleStation} ${styles.suggestionPrimary}`
                        }
                      >
                        {suggestion.primaryText}
                      </div>
                      <div className={`${styles.suggestionSecondary}`}>
                        {suggestion.secondaryText}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      };

      // =========== current location switch button ==============
      const HudButton = () => {
        const [rentOpen, setRentOpen] = React.useState(null);
        const [rentalStatus, setRentalStatus] = React.useState(false); // 是否有租借狀態
        const [rentMessage, setRentMessage] = React.useState("");
        const [startTime, setStartTime] = React.useState(null);
        const [rentalFee, setRentalFee] = React.useState(null);
        const [rentalTime, setRentalTime] = React.useState(null);
        // overtime return variables
        const [returnWarning, setReturnWarning] = React.useState(null);
        const [overtimeReturnWindow, setOvertimeReturnWindow] =
          React.useState(null); // orvertime return window trigger
        const [overtimeConfirm, setOvertimeConfirm] = React.useState(null); // confirmation made by user for overtime return
        const [overtimeFee, setOvertimeFee] = React.useState(null); //overtime fee state

        // ================ init rent window ref ================
        useEffect(() => {
          rentWindowRef.current = (x) => {
            setRentOpen(x);
            if (!x) {
              setRentalFee(null);
              setRentalTime(null);
            }
          };
          return () => {
            rentWindowRef.current = null;
          };
        }, []);

        // ================= button links =================
        const buttonlinks = [
          {
            icon: "bi bi-gift-fill",
            color: "white",
            url: "./coupon",
            action: handleLink,
          },
          {
            icon: "bi bi-person-fill",
            color: "black",
            url: "./mber_profile",
            action: handleLink,
          },
          {
            icon: "bi bi-pin-map",
            color: "black",
            url: "",
            action: handleLocate,
          },
        ];
        function handleLocate() {
          if (!locationRef.current) return null;
          const pos = locationRef.current;
          if (!pos) {
            // 沒有位置時可提示或觸發一次 getCurrentPosition
            alert("尚未取得定位，請稍候或允許定位權限");
            return;
          }
          if (map && typeof map.panTo === "function") {
            map.panTo(pos);
            map.setZoom(17);
          }
        }
        function handleLink(url) {
          window.location.href = url;
        }

        // ================= rent & return function =================
        // =======假設數值=========
        const deviceId = "2"; // 假設裝置ID為2
        const batteryAmount = 30; // 假設電池狀態為 30%
        const returnSite = 1; // 假設歸還站點 ID 為 1
        const uid = "2"; //假設使用者ID為2

        // ========================

        // ================ user rental check =================
        useEffect(() => {
          let mounted = true;
          axios
            .get(`${API_URL}/api/checkRental/${uid}`)
            .then((res) => {
              if (!mounted) return;
              if (res.data.renting) {
                const start = res.data.start_date
                  ? new Date(res.data.start_date)
                  : null;
                if (start) setStartTime(start);
                setRentalStatus(true);
                const period = Math.round(
                  (new Date().getTime() - start.getTime()) / (1000 * 60)
                );

                if (period > WARNING_MINUTES) {
                  setReturnWarning(true);
                }
              }
            })
            .catch((err) => {
              console.error("checkRental error", err);
            });
          return () => {
            mounted = false;
          };
        }, [uid]);

        // ================ rent button =================
        function handleRent() {
          rentWindowRef.current(true);

          // ====== axios patch ======
          axios
            .patch(`${API_URL}/api/rent`, { deviceId, uid })
            .then((res) => {
              if (res.data.success) {
                if (startTime) {
                  setRentalStatus(true);
                  return;
                } else if (res.data.success === false) {
                  setRentMessage("Unknown issue, please contact support.");
                  setRentalStatus(false);
                  console.warn(
                    'Get to check "api/rent" backend call-back. If there any of status(2xx) but with {success: false}, please check the backend logic.去確認一下後端api/rent是不是有送出status(2xx)但回傳了{success: false}，請檢查後端邏輯'
                  );
                } else {
                  setRentMessage("租借成功");
                  setRentalStatus(true);
                  setTimeout(() => {
                    setStartTime(res.data.start_date);
                  }, 1800);
                }
              }
            })
            .catch((err) => {
              if (err.response) {
                console.error(err.response?.data?.details || null + err);
                setRentMessage(err.response?.data?.message || "系統錯誤");
              } else {
                setRentMessage("連線錯誤");
                console.error(err);
              }
            });
        }
        //=========calculate rent time=========
        useEffect(() => {
          if (startTime && rentOpen) {
            const timer = setInterval(() => {
              if (startTime) {
                const now = new Date();
                let period = now.getTime() - new Date(startTime).getTime();
                let hours = String(
                  Math.floor(period / (1000 * 60 * 60))
                ).padStart(2, "0");
                let minutes = String(
                  Math.floor((period % (1000 * 60 * 60)) / (1000 * 60))
                ).padStart(2, "0");
                let seconds = String(
                  Math.floor((period % (1000 * 60)) / 1000)
                ).padStart(2, "0");
                period = `${hours}：${minutes}：${seconds}`;
                setRentMessage(`租借中，租借時間 ${period}`);
                console.log("period :>> ", period);
              }
            }, 100);
            return () => clearInterval(timer);
          }
        }, [rentOpen, startTime]);
        // =============== return button =================
        function handleReturn(overtimeComfirm) {
          axios
            .patch(`${API_URL}/api/return`, {
              returnSite,
              batteryAmount,
              deviceId,
              uid,
              overtimeConfirm,
            })
            .then((res) => {
              if (res.data.success) {
                if (res.data) setStartTime(null);
                setRentalStatus(false);
                // ======== calculate rental fee =========
                setRentalFee(res.data.rentalFee);
                // ========= calculate rental time showing for use the final time =========
                const minutes = Number(res.data.period) || 0;
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                const hhmm = `${String(hours).padStart(2, "0")}:${String(
                  mins
                ).padStart(2, "0")}`;
                setRentalTime(hhmm);
                // rest states
                setRentMessage("歸還成功，感謝使用");
              } else if (res.data.success === false) {
                // ======== Overtime return handling =========
                if (res.data.overtime || returnWarning) {
                  setOvertimeReturnWindow(true);
                  setOvertimeFee(res.data.rentalFee);
                } else {
                  setRentMessage("Unknown issue, please contact support.");
                  setRentalStatus(false);
                  console.warn(
                    'Get to check "api/rent" backend call-back. If there any of status(2xx) but with {success: false}, please check the backend logic.去確認一下後端api/rent是不是有送出status(2xx)但回傳了{success: false}，請檢查後端邏輯'
                  );
                }
              }
            })
            .catch((err) => {
              // ======== other error handling =========
              console.error(err);
              setRentMessage(
                err.response?.data?.message || "連線問題，請再試一次。"
              );
            });
        }

        // ================ overtime returning window =================
        // wait for overtimeConfirm state update
        useEffect(() => {
          if (overtimeConfirm) handleReturn();
        }, [overtimeConfirm]);
        // main funtion
        function OvertimeWindow() {
          function handleOvertime() {
            setOvertimeConfirm(true);
            setOvertimeReturnWindow(false);
          }

          return (
            <div className={`${styles.overtimeOverlay}`}>
              <div className={`${styles.overtimeWindow}`}>
                <p className={`${styles.header}`}>
                  <i className="bi bi-exclamation-triangle-fill"></i>警告
                </p>
                <p>
                  您已超過三天未歸還，本次歸還將會扣除 {overtimeFee}{" "}
                  元，且留下帳戶紀錄。
                </p>
                <div className={`${styles.handleBtns}`}>
                  <button
                    className='btn btn-primary'
                    onClick={handleOvertime}
                  >
                    確認歸還
                  </button>
                  <button
                    className='btn btn-primary cancel'
                    onClick={() => setOvertimeReturnWindow(false)}
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className={`${styles.hudContainer}`}>
            <div className={`${styles.buttons}`}>
              {buttonlinks.map((button, index) => (
                <button
                  className='btn btn-primary'
                  key={index}
                  onClick={() => button.action(button.url)}
                >
                  <i
                    className={`bi ${button.icon}`}
                    style={{ color: button.color }}
                  ></i>
                </button>
              ))}
            </div>
            <div className={`${styles.qrCode}`}>
              <button className='btn btn-primary' onClick={handleRent}>
                <i className="bi bi-qr-code-scan"></i>
              </button>
            </div>
            <div
              className={`${styles.rentInfo}`}
              style={{
                transform: rentOpen
                  ? "translate(-50%, 0%)"
                  : "translate(-50%, 100%)",
              }}
            >
              {rentMessage && <p>{rentMessage}</p>}
              {rentalStatus ? (
                returnWarning ? (
                  <>
                    <p style={{ color: "red" }}>
                      您已超過三天未歸還，請盡速歸還以免影響信用紀錄
                    </p>
                    <button
                      className='btn btn-primary'
                      onClick={handleReturn}
                    >
                      歸還裝置
                    </button>
                  </>
                ) : (
                  <button
                    className='btn btn-primary'
                    onClick={handleReturn}
                  >
                    歸還裝置
                  </button>
                )
              ) : (
                <div>
                  <p>已歸還，感謝使用</p>

                  <p>使用時間 {rentalTime}</p>
                  <p>扣款金額 {rentalFee}元</p>

                  <button
                    className='btn btn-primary'
                    onClick={() => (
                      rentWindowRef.current(false),
                      setRentMessage(""),
                      setRentalFee(null),
                      setRentalTime(null)
                    )}
                  >
                    關閉視窗
                  </button>
                </div>
              )}
            </div>
            {returnWarning ? (
              <div
                className={`${styles.alert} ${styles.alertDanger} ${styles.returnWarning}`}
                style={{ opacity: rentOpen ? 0 : 0.7 }}
              >
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>警告</span>
                <br />
                <span>
                  您已超過三天未歸還
                  <br />
                  請盡速歸還以免影響信用紀錄
                </span>
              </div>
            ) : null}
            {overtimeReturnWindow && <OvertimeWindow />}
          </div>
        );
      };
      return (
        <>
          <SearchBar />
          <HudButton />
        </>
      );
    };

    // ================= Marker with InfoWindow =================
    const MarkerWithInfoWindow = () => {
      return (
        <>
          {stations.map((station, index) => {
            return (
              <React.Fragment key={station.site_id}>
                <MarkerItem station={station} />
              </React.Fragment>
            );
          })}
        </>
      );
    };

    // ============= MarkerItem  =================
    const MarkerItem = ({ station, index }) => {
      const id = station?.site_id ?? index;
      const [markerRef, marker] = useAdvancedMarkerRef();
      const [activeMarkerId, setActiveMarkerId] = React.useState(null);

      // =================location fetch =================

      function CurrentLocationMarker() {
        const [pos, setPos] = React.useState(null);

        useEffect(() => {
          locationSetterRef.current = setPos;
          if (locationSetterRef.current) setPos(locationRef.current);
          return () => {
            locationSetterRef.current = null;
          };
        }, []);
        useEffect(() => {
          if (!navigator.geolocation) {
            console.log("Geolocation is not supported by this browser.");
            alert("Geolocation is not supported by this browser.");
            return;
          }
          function success(position) {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            locationRef.current = pos; // 可選：同步 ref
          }
          function error() {
            console.error("Unable to retrieve your location");
            // Fallback to default center if geolocation fails
          }
          const pos = navigator.geolocation.watchPosition(success, error);
        });
        if (!pos) return null;

        return (
          <>
            <AdvancedMarker position={pos} />
          </>
        );
      }

      // =============== Info Window =================
      function InfoWin() {
        const [info, setInfo] = React.useState([]);

        // ================= Axios fetch =================
        // infowindow detail
        useEffect(() => {
          const siteId = station.site_id;
          const getInfo = async () => {
            try {
              const res = await axios.get(
                `http://localhost:3000/api/infoWindow/${siteId}`
              );
              setInfo(res.data);
            } catch (error) {
              console.error(error);
              return [];
            }
          };
          getInfo();
        }, []);

        if (info.length >= 1) {
          const rentable = info.filter(
            (x) => x.status === "2" || x.status === "3"
          ).length;
          const charging = info.filter((x) => x.status === "4").length;
          return (
            <InfoWindow anchor={marker}>
              <div>
                <h4 className={`${styles.siteName}`}>{info[0].site_name}</h4>
                <p className={`${styles.address}`}>{info[0].address}</p>
                <div className={`${styles.batStatus}`}>
                  <p>可租借 {rentable}</p>
                  <p>充電中 {charging}</p>
                </div>
              </div>
            </InfoWindow>
          );
        }
      }

      // =============== marker click handler =================
      const markerClick = (marker, station) => {
        if (map && station) {
          const pos = {
            lat: station.latitude,
            lng: station.longitude,
          };
          map.panTo(pos);
          markerBus.set(id);
        }
      };

      // ================= suscribe markerBus 把id綁進markerBus裡面，僅限一次 =================
      useEffect(() => {
        const unsub = markerBus.subscribe(
          // markerBus主程式
          (activeId) => {
            const x = activeId === id;
            setActiveMarkerId(x ? id : null);
          }
        );
        return unsub;
      }, [id]);

      return (
        <>
          {/* Current Location Marker */}
          <CurrentLocationMarker />

          {/* Stations Marker */}
          <AdvancedMarker
            position={{
              lat: station.latitude,
              lng: station.longitude,
            }}
            ref={markerRef}
            onClick={() => markerClick(marker, station)}
          >
            <Pin
              background={"#FBBC04"}
              glyphColor={"#000"}
              borderColor={"#000"}
            />
          </AdvancedMarker>
          {activeMarkerId && marker && (
            <InfoWin onCloseClick={() => markerBus.clear()} />
          )}
        </>
      );
    };
    // ============== close InfoWindow on map click ===============
    useEffect(() => {
      if (!map) return;
      const closeWindow = map.addListener(
        "click",
        () => (
          markerBus.clear(), listBus.set(false), rentWindowRef.current(false)
        )
      );
      return () => closeWindow.remove();
    }, [map]);

    return (
      <>
        <Map
          style={{ width: "100vw", height: "100vh" }}
          defaultCenter={defaultCenter}
          defaultZoom={16}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          draggingCursor={"default"}
          draggableCursor={"default"}
          mapId={mapId}
        >
          <HudSet />
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
        onLoad={() => setIsGoogleMapsLoaded(true)}
      >
        {isGoogleMapsLoaded && (
          <>
            <AppBaseMap />
          </>
        )}
      </APIProvider>
    </>
  );
}

export default MapIndex;
