import { useEffect, useState } from "react";
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
function createOrUpdateApp(name, url, img) {
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

function SidebarItem({ name, onClick }) {
  return (
    <div onClick={onClick}>
      <p>{name}</p>
    </div>
  );
}

function MainItem({ name, url, img }) {
  return (
    <>
      <a href={url}>
        <div>
          {img ? <img src={img} alt={name} className="img" /> : undefined}
          <p>{name}</p>
        </div>
      </a>
      <button onClick={() => removeApp(name)}>Remove</button>
    </>
  );
}

function App() {
  const [apps, setApps] = useState({});

  const [itemName, setItemName] = useState("");
  const [itemUrl, setItemUrl] = useState("https://");
  const [itemImg, setItemImg] = useState("https://");

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
  return (
    <div className="app">
      <div className="sidebar">
        <h2>Sidebar</h2>
        <SidebarItem name="Favorites" />
        <div>
          <input
            type="text"
            value={itemName}
            placeholder="New App Name"
            onChange={(e) => setItemName(e.target.value)}
          />
          <input
            type="url"
            value={itemUrl}
            placeholder="New App URL"
            onChange={(e) => setItemUrl(e.target.value)}
          />
          <input
            type="url"
            value={itemImg}
            placeholder="New App Image URL"
            onChange={(e) => setItemImg(e.target.value)}
          />
          <a
            href={`https://www.google.com/search?q=${itemName}+icon+transparent+png&tbm=isch&sclient=img`}
            target="_blank"
          >
            Suggested Logo
          </a>
          <SidebarItem
            name="+ Item"
            onClick={() => createOrUpdateApp(itemName, itemUrl, itemImg)}
          />
        </div>
      </div>
      <div className="main">
        <h2>Main</h2>
        {/* <p>Favorites</p> */}
        {Object.keys(apps).map((app) => {
          const { url, img } = apps[app];
          return <MainItem key={app} name={app} url={url} img={img} />;
        })}
        <MainItem name="Crunchyroll" url="https://www.crunchyroll.com" />
        <button onClick={() => localStorage.clear()}>Nuke Local Storage</button>
      </div>
    </div>
  );
}

export default App;
