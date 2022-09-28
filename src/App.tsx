import dayjs from "dayjs";
import { useEffect, useState } from "react";
import "./styles.scss";

interface WindowStream {
  id: number;
  name: string;
  date: Date;
  imgSrc: string;
  color: string;
}

interface Position {}

const Positions = [{}];
const docId = "_ObKm8enqO";
const gridId = "grid-g3XU9U3kb8";
const CodaApiToken = "7c6d4082-5564-4ba6-81af-ff7600c5e576";

function App() {
  const [windowStreams, setWindowStreams] = useState<WindowStream[]>([]);

  async function loadWindows() {
    const resp = await fetch(
      `https://coda.io/apis/v1/docs/${docId}/tables/${gridId}/rows?useColumnNames=true`,
      {
        headers: {
          Authorization: `Bearer ${CodaApiToken}`,
        },
      }
    );
    const response = await resp.json();
    console.log(response);
    setWindowStreams(
      response.items.map((item: any) => ({
        ...item.values,
        date: new Date(item.values.date),
      }))
    );
  }
  useEffect(() => {
    void loadWindows();
  }, []);

  const renderWindowStream = (windowStream: WindowStream) => {
    const { id, name, imgSrc, date, color } = windowStream;

    // TODO: make the 09-09-1231
    const dateDisplay = dayjs(date).format("HH:mm:ss MM/DD/YYYY");

    return (
      <div className="window" style={{ background: color }}>
        <div className="imageContainer">
          <img src={imgSrc}></img>
          <div className="date">{dateDisplay}</div>
        </div>
        {/* <div className="blur"></div> */}
        <div className="ledge" style={{ background: color }}>
          {name}
        </div>
      </div>
    );
  };

  // TODO: add night mode
  return (
    <div className="App">
      <div className="description">
        <h1 className="title">welcome to my wall of windows.</h1>
        <button
          className="info"
          onClick={() => {
            window.open("https://spencerchang.me", "_blank");
          }}
        >
          i
        </button>
        <p>
          I wanted a digital space to dedicate to my daily experience of life as
          a memorial to the wonder that you find in every moment of existence.
          This project also experiments with intimacy through very personal but
          ephemeral glimpses into someone's life. With the rise of parasocial
          relationships from social media, I wanted to play with how digital
          mediums could be used to create something that felt more personal and
          human.
        </p>
        <details>
          <summary>
            <b>How does this work?</b>
          </summary>
          <p>
            I use a <a href="https://coda.io">coda doc</a> as my underlying
            database, which is automatically updated via an{" "}
            <a href="https://support.apple.com/guide/shortcuts/request-your-first-api-apd58d46713f/ios">
              iOS shortcut
            </a>
            whenever I take a photo related to a window on my phone. This makes
            it a natural extension on top of my normal behavior, an "in situ"
            computation augmentation, and requires me to do no extra work to
            maintain this website's data.
          </p>
          <p>
            I'm very captured by the ability of computation to be a natural
            extension of natural behavior, given you extra capabilities "for
            free." The intention of this project was to build a tiny system that
            will evolve on its own, while having the data in an easily
            exportable and extensible interface in case I need to make any
            manual changes.
          </p>
          <hr />
        </details>

        <p>You'll find windows into various slices of my life.</p>
      </div>
      <div className="windows">
        {windowStreams.map((windowStream) => renderWindowStream(windowStream))}
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" className="filter">
        <filter id="leftLight">
          <feDiffuseLighting
            in="SourceGraphic"
            result="light"
            lighting-color="#bbbbbb"
          >
            <fePointLight x="-20" y="-40" z="250"></fePointLight>
          </feDiffuseLighting>
          <feComposite
            in="SourceGraphic"
            in2="light"
            operator="arithmetic"
            k1="2.5"
            k2=".8"
            k3="0"
            k4="0"
          ></feComposite>
        </filter>
      </svg>
    </div>
  );
}

export default App;
