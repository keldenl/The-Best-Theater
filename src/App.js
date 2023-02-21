import { useEffect, useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import "./App.css";

const validUrlRegex =
  // eslint-disable-next-line no-useless-escape
  /(http(s)?:\/\/.)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&=]*)/gm;

// const validUrlRegex = new RegExp(validUrl);

function getLocalApps() {
  return JSON.parse(localStorage.getItem("apps")) || {};
}

function setLocalApps(updatedAppObj) {
  return localStorage.setItem("apps", JSON.stringify(updatedAppObj));
}

function signalStorageUpdate() {
  return dispatchEvent(new Event("storage"));
}

// local storage functions
function createOrUpdateApp(name, url, img, onClose) {
  const isValidUrl = url.match(validUrlRegex) !== null;
  if (!isValidUrl) {
    alert("Please enter a valid link for the app.");
    return;
  }
  const currApps = getLocalApps();
  const isNewApp = !currApps[name];
  currApps[name] = {
    url,
    img,
  };
  setLocalApps(currApps);
  alert(isNewApp ? `Added ${name}!` : `${name} url or image was updated!`);
  !!onClose && onClose();
  signalStorageUpdate();
}

function removeApp(name) {
  const currApps = getLocalApps();
  if (!!currApps[name]) {
    delete currApps[name];
    setLocalApps(currApps);
    signalStorageUpdate();
    alert(`The ${name} app has been deleted!`);
  } else {
    alert("The app you're trying to remove doesn't exist!");
  }
}

function SidebarItem({ name, onClick, selected = false }) {
  return (
    <div
      className={`sidebarItem ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <p>{name}</p>
    </div>
  );
}

function MainItem({ name, url, img }) {
  return (
    <div className="mainItem">
      <a href={url}>
        <div>
          {img ? <img src={img} alt={name} className="img" /> : undefined}
          <p className="title">{name}</p>
        </div>
      </a>
      {/* <button onClick={() => removeApp(name)}>Remove</button> */}
    </div>
  );
}

function App() {
  const [apps, setApps] = useState({});

  const [itemName, setItemName] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [itemImg, setItemImg] = useState("");

  useEffect(() => {
    // window.location.replace("http://google.com/");
    // setApps(JSON.parse(localStorage.getItem("apps")));

    // Keep apps up to date
    function storageEventHandler() {
      const apps = JSON.parse(localStorage.getItem("apps")) || {};
      setApps(apps);
    }

    window.addEventListener("storage", storageEventHandler);
    storageEventHandler(); // INITIAL MOUNT
    return () => {
      window.removeEventListener("storage", storageEventHandler);
    };
  }, []);

  useEffect(() => {
    console.log("APP UDPATED");
    console.log(apps);
  }, [apps]);

  const handleUrlInputFocus = (input, setInput) => {
    if (input.length === 0) {
      setInput("https://");
    }
  };

  const handleUrlInputBlur = (input, setInput) => {
    if (input === "https://" || input === "http://") {
      setInput("");
    }
  };

  const clearNewAppInputs = () => {
    setItemName("");
    setItemUrl("");
    setItemImg("");
  };

  return (
    <div className="app">
      <div className="sidebar">
        {/* <h2>Sidebar</h2> */}
        <SidebarItem name="Favorites" selected />
        <div>
          <Popup
            trigger={
              <SidebarItem
                name="+ Item"
                // onClick={() => createOrUpdateApp(itemName, itemUrl, itemImg)}
              />
            }
            className="modal"
            modal
          >
            {(close) => (
              <>
                <div className="modalHeader">
                  <div onClick={close}>X</div>
                  <p className="title">New App</p>
                </div>
                <div className="modalContent">
                  <input
                    id="itemName"
                    type="text"
                    value={itemName}
                    placeholder="App Name*"
                    onChange={(e) => setItemName(e.target.value)}
                  />
                  <input
                    type="url"
                    value={itemUrl}
                    placeholder="App URL*"
                    onChange={(e) => setItemUrl(e.target.value)}
                    onFocus={() => handleUrlInputFocus(itemUrl, setItemUrl)}
                    onBlur={() => handleUrlInputBlur(itemUrl, setItemUrl)}
                  />
                  <input
                    type="url"
                    value={itemImg}
                    placeholder="App Image URL"
                    onChange={(e) => setItemImg(e.target.value)}
                    // onFocus={() => handleUrlInputFocus(itemImg, setItemImg)}
                    // onBlur={() => handleUrlInputBlur(itemImg, setItemImg)}
                  />
                  {/* <Popup
                    trigger={<button> Trigger</button>}
                    position="right center"
                  >
                    <div>Popup content here !!</div>
                  </Popup> */}
                  <p className="modalNote">
                    Tap{" "}
                    <a
                      href={`https://www.google.com/search?q=${itemName}+icon+transparent+png&tbm=isch&sclient=img`}
                      target="__blank"
                    >
                      here
                    </a>{" "}
                    to quickly open a new tab and get a logo image from Google.
                    Tap on the image and long press to get the image url and
                    copy it to the text box above.
                  </p>

                  <button
                    className="block"
                    onClick={() => {
                      createOrUpdateApp(itemName, itemUrl, itemImg, () => {
                        close();
                        clearNewAppInputs();
                      });
                    }}
                    disabled={itemName.length === 0 || itemUrl.length === 0}
                  >
                    Add "{itemName}" to Theater
                  </button>
                </div>
              </>
            )}
          </Popup>
        </div>
      </div>
      <div className="main">
        {/* <h2>Main</h2> */}
        {/* <p>Favorites</p> */}
        <div className="appsContainer">
          {Object.keys(apps).map((app) => {
            const { url, img } = apps[app];
            return <MainItem key={app} name={app} url={url} img={img} />;
          })}
          <MainItem name="Crunchyroll" url="https://www.crunchyroll.com" />
        </div>
        {/* <button onClick={() => localStorage.clear()}>Nuke Local Storage</button> */}
      </div>
    </div>
  );
}

export default App;
