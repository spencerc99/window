import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import "./styles.scss";

interface RawData {
  values: WindowStream & Omit<Metadata, "location"> & { metadata: string };
}

interface WindowStream {
  name: string;
  Kind: string;
  date: Date;
  imgSrc: string;
  color: string;
  isWindow: boolean;
}

interface Metadata {
  location: string;
  totalWindows: number;
}

const docId = "_ObKm8enqO";
const gridId = "grid-g3XU9U3kb8";
// read-only token for this public database. Feel free to query if you'd like and you're poking around.
const CodaApiToken = "7c6d4082-5564-4ba6-81af-ff7600c5e576";

// adapted from https://ericdcobb.medium.com/scrolling-to-an-anchor-in-react-when-your-elements-are-rendered-asynchronously-8c64f77b5f34
const scrollToLocation = () => {
  const scrolledRef = useRef(false);
  const { hash } = window.location;

  // not very efficient, would be better to set the event listener
  // in the actual rendering of the window but w/e
  useEffect(() => {
    if (hash && !scrolledRef.current) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (!element) {
        return;
      }

      const windowImg = element.querySelector<HTMLImageElement>("img");
      if (!windowImg) {
        return;
      }

      windowImg.addEventListener("load", () => {
        element.scrollIntoView();
        scrolledRef.current = true;
      });
    }
  });
};

function App() {
  const [windowStreams, setWindowStreams] = useState<WindowStream[]>([]);
  const [metadata, setMetadata] = useState<Metadata | undefined>(undefined);

  scrollToLocation();

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
    const data: RawData[] = response.items;
    setWindowStreams(
      data
        .filter((ele) => ele.values.isWindow)
        .map((item: any) => ({
          ...item.values,
          date: new Date(item.values.date),
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime())
    );

    const { metadata: location, totalWindows } = data.filter(
      (ele) => !ele.values.isWindow
    )[0].values;
    setMetadata({ location, totalWindows });
  }
  useEffect(() => {
    void loadWindows();
  }, []);

  const renderWindowStream = (windowStream: WindowStream) => {
    const { name, imgSrc, date, color } = windowStream;

    const dateDisplay = dayjs(date).format("HH:mm:ss MM/DD/YYYY");

    return (
      <div className="windowWrapper" id={name} key={name}>
        <div className="window" style={{ background: color }}>
          <div className="imageContainer">
            <img width="320" height="320" loading="lazy" src={imgSrc}></img>
            <div className="date">{dateDisplay}</div>
          </div>
          <div className="ledge" style={{ background: color }}>
            {name}
          </div>
        </div>
      </div>
    );
  };

  const [showDetailedDescription, setShowDescription] = useState(false);

  // TODO: add night mode toggle
  return (
    <div className="App">
      <div className="description">
        <h1 className="title">welcome to the wall of windows</h1>
        <div className="headerDescription">
          <h3>
            windows are portals into recent slices of my life as seen by me and
            my phone.
          </h3>
          <h3>
            since the winter solstice, the wall has been open to visitor
            submissions through the guest window.
          </h3>
        </div>
        {metadata ? (
          <span className="metadata">
            Last updated from <b>{metadata.location}</b> with the{" "}
            <b>{metadata.totalWindows}th</b> image.
          </span>
        ) : (
          ""
        )}
        <button
          className={showDetailedDescription ? "info toggled" : "info"}
          onClick={() => {
            setShowDescription(!showDetailedDescription);
          }}
        >
          i
        </button>
        {showDetailedDescription && (
          <>
            <p>
              <b>behind the project</b> - I wanted to dedicate a digital space
              to the wonder that you find in your daily experience and show
              little vignettes of how I perceive the world as I move through it,
              what I am drawn towards and naturally find interesting. With the
              rise of parasocial relationships from social media, I wanted to
              play with how digital mediums could be used to facilitate a
              natural intimacy through ephemeral yet personal glimpses into how
              someone moves through their life.
            </p>
            <p>
              Seeing these, what do you think I would gravitate towards or point
              out in your daily life environments? What would your windows look
              out onto? What sorts of objects or views might you find?
            </p>
            <p>
              I opened this up to visitors with guest submissions a few months
              after the initial launch because I wanted others to be able to
              share windows into their lives. I hope this corner of windows on
              the internet can provide shelter for spontaneous intimacy and
              honor these ordinary moments in our lives. Submit your own by
              finding the guest window below. You can also share the link with
              others by sharing{" "}
              <a href="https://spencerchang.me/window/submit">
                https://spencerchang.me/window/submit
              </a>
            </p>
            <p>
              I hope these windows evoke a sense of intimacy with me and how I
              see the world. I wanted these to feel like ephemeral social media
              stories without all the pressure of notifying people and being
              perceived. I wanted these to mimic the digital equivalent of my
              front porch, where you can stop by to see what I'm thinking about,
              but only if you have the intention to do so. Feel free to{" "}
              <a href="https://twitter.com/spencerc99">let me know</a> if
              anything especially strikes you.
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
                </a>{" "}
                whenever I take a photo related to a window on my phone. This
                workflow naturally fits into my existing behavior, an "in situ"
                computation augmentation, and requires me to do no extra work to
                maintain this website's data.
              </p>
              <p>
                I'm very captured by the ability of computation to be a natural
                extension of regular behavior, given you extra capabilities "for
                free." The intention of this project was to build a tiny system
                that will evolve on its own, while having the data in an easily
                exportable and extensible interface in case I need to make any
                manual changes.
              </p>
            </details>
            <hr />
          </>
        )}
      </div>
      <div className="windows">
        {windowStreams.length === 0 ? null : (
          <>
            {windowStreams
              .filter((w) => w.Kind !== "guest")
              .map((windowStream) => renderWindowStream(windowStream))}
            {/* CTA to add your own */}
            <div className="windowWrapper" id="guestWindow">
              <div className="window">
                <div className="imageContainer guest">
                  <div className="windowImg">
                    <a href="https://coda.io/form/guest-window_dL64YUDTJ2e">
                      {"<your image here>"}
                    </a>
                    <span>
                      share a slice of your life with us. submissions will
                      gradually disappear and be replaced over the span of a few
                      days, just like the rest of the windows.
                    </span>
                  </div>
                  <div className="date">
                    right now or sometime in the past...
                  </div>
                </div>
                <div className="ledge">the internet</div>
              </div>
            </div>
            {windowStreams
              .filter((w) => w.Kind === "guest")
              .map((windowStream) => renderWindowStream(windowStream))}
          </>
        )}
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" className="filter">
        <filter id="leftLight">
          <feDiffuseLighting
            in="SourceGraphic"
            result="light"
            lightingColor="#bbbbbb"
          >
            <fePointLight x="20" y="50" z="150"></fePointLight>
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
