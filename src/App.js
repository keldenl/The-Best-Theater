import { useEffect, useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import "./App.css";

const validUrlRegex =
  // eslint-disable-next-line no-useless-escape
  /(http(s)?:\/\/.)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&=]*)/gm;

// const validUrlRegex = new RegExp(validUrl);

const defaultAppSection = {
  Home: [],
  Streaming: [],
  Games: [],
  Utility: [],
  Other: [],
};

const defaultApps = {
  Youtube: {
    url: "https://www.youtube.com",
    img: "https://assets.stickpng.com/thumbs/580b57fcd9996e24bc43c545.png",
  },
  Netflix: {
    url: "https://www.netflix.com",
    img: "https://www.freepnglogos.com/uploads/netflix-logo-circle-png-5.png",
  },
  Crunchyroll: {
    url: "https://www.crunchyroll.com",
    img: "https://assets.stickpng.com/images/61362684f5966900044cbf73.png",
  },
  'Xbox Cloud Gaming': {
    url: "https://www.xbox.com/en-us/play",
    img: "https://www.freeiconspng.com/thumbs/xbox-icon/xbox-logo-icon-5.png",
  },
  Reddit: {
    url: "https://www.reddit.com/",
    img: "https://external-preview.redd.it/iDdntscPf-nfWKqzHRGFmhVxZm4hZgaKe5oyFws-yzA.png?auto=webp&s=38648ef0dc2c3fce76d5e1d8639234d8da0152b2",
  },
};

function getLocalApps() {
  const apps = JSON.parse(localStorage.getItem("apps"));
  if (!apps) {
    setLocalApps(defaultApps);
    return defaultApps;
  }

  return apps;
}

function setLocalApps(updatedAppObj) {
  localStorage.setItem("apps", JSON.stringify(updatedAppObj));
  signalStorageUpdate();
}

function getLocalAppSections() {
  const appSections = JSON.parse(localStorage.getItem("sections"));
  if (!appSections) {
    setLocalAppSection(defaultAppSection);
    return defaultAppSection;
  }

  return appSections;
}

function setLocalAppSection(updatedAppObj) {
  localStorage.setItem("sections", JSON.stringify(updatedAppObj));
  signalStorageUpdate();
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
          {img ? (
            <img src={img} alt={name} className="img" loading="lazy" />
          ) : undefined}
          <p className="title">{name}</p>
        </div>
      </a>
      {/* <button onClick={() => removeApp(name)}>Remove</button> */}
    </div>
  );
}

function App() {
  const [apps, setApps] = useState({});
  const [appSections, setAppSections] = useState({});

  const [activeSection, setActiveSection] = useState();

  const [itemName, setItemName] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [itemImg, setItemImg] = useState("");

  useEffect(() => {
    // window.location.replace("http://google.com/");
    // setApps(JSON.parse(localStorage.getItem("apps")));

    // Keep apps up to date
    function storageEventHandler() {
      const a = getLocalApps();
      const aSection = getLocalAppSections();
      setApps(a);
      setAppSections(aSection);
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

  useEffect(() => {
    !activeSection &&
      Object.keys(appSections).length > 0 &&
      setActiveSection(Object.keys(appSections)[0]);
  }, [activeSection, appSections]);

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
        {Object.keys(appSections).map((section) => {
          return (
            <SidebarItem
              name={section}
              selected={section === activeSection}
              onClick={() => setActiveSection(section)}
            />
          );
        })}
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
                      href={`https://www.google.com/search?q=${itemName}+icon+transparent+png&tbm=isch&sclient=img&tbs=ic:trans%2Cisz:m`}
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
        <div className="webappNavBar">
          <h3 className="webappTitle">The Best Theater</h3>
          <div
            onClick={() =>
              window.location.replace(
                `https://www.youtube.com/redirect?q=${window.location.href}`
              )
            }
          >
            Fullscreen
          </div>
        </div>
        {/* <p>Favorites</p> */}
        <div className="appsContainer">
          {Object.keys(apps).map((app) => {
            const { url, img } = apps[app];
            return <MainItem key={app} name={app} url={url} img={img} />;
          })}
        </div>
        <button onClick={() => localStorage.clear()}>Nuke Local Storage</button>
      </div>
    </div>
  );
}

export default App;
