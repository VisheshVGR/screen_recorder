import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container, Row, Col, Button } from 'react-bootstrap';

const App = () => {
  // references of components
  const videoRef = useRef(null);
  const downloadRef = useRef(null);
  const startRecRef = useRef(null);
  const stopRecRef = useRef(null);

  // Notification
  const notify = (msg) =>
    toast(msg, {
      position: toast.POSITION.BOTTOM_RIGHT,
      autoClose: 4000,
    });

  // pages
  const [homePage, setHomePage] = useState(true);
  const [recPage, setRecPage] = useState(false);
  const [downPage, setDownPage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // use state
  const [frontCamRec, setFrontCamRec] = useState(true);
  const [downloadLink, setDownloadLink] = useState('#');
  const [isMobile, setIsMobile] = useState(false);
  const [constraintObj, setConstraintObj] = useState({
    audio: true,
    video: true,
  });

  useEffect(() => {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      // true for mobile device
      setIsMobile(true);
    }
  }, []);

  const startSystem = () => {
    {
      //handle older browsers that might implement getUserMedia in some way
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
        navigator.mediaDevices.getUserMedia = function (constraintObj) {
          let getUserMedia =
            navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
          if (!getUserMedia) {
            return Promise.reject(
              new Error('getUserMedia is not implemented in this browser')
            );
          }
          return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraintObj, resolve, reject);
          });
        };
      } else {
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            devices.forEach((device) => {
              console.log(device.kind.toUpperCase(), device.label);
              //, device.deviceId
            });
          })
          .catch((err) => {
            console.log(err.name, err.message);
          });
      }

      const stream = (mediaStreamObj) => {
        //connect the media stream to the first video element
        notify('All Set! Start Recording!!!');
        let video = videoRef.current;
        if ('srcObject' in video) {
          video.srcObject = mediaStreamObj;
        } else {
          //old version
          video.src = window.URL.createObjectURL(mediaStreamObj);
        }

        video.onloadedmetadata = function (ev) {
          //show in the video element what is being captured by the webcam
          video.play();
        };

        //add listeners for saving video/audio
        let start = startRecRef.current;
        let stop = stopRecRef.current;
        let vidSave = downloadRef.current;
        let mediaRecorder = new MediaRecorder(mediaStreamObj);
        let chunks = [];

        start.addEventListener('click', (ev) => {
          mediaRecorder.start();
          setIsRecording(true);
          console.log(mediaRecorder.state);
          notify('Recording Started');
        });
        stop.addEventListener('click', (ev) => {
          mediaRecorder.stop();
          setIsRecording(false);
          console.log(mediaRecorder.state);

          let tracks = video.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
          video.srcObject = null;

          setRecPage(false);
          setDownPage(true);
          notify('Recording Stopped');
        });
        mediaRecorder.ondataavailable = function (ev) {
          chunks.push(ev.data);
        };
        mediaRecorder.onstop = (ev) => {
          let blob = new Blob(chunks, { type: 'video/mp4;' });
          chunks = [];
          let videoURL = window.URL.createObjectURL(blob);

          vidSave.src = videoURL;
          setDownloadLink(videoURL);
        };
      };

      frontCamRec
        ? navigator.mediaDevices
            .getUserMedia(constraintObj)
            .then(function (mediaStreamObj) {
              stream(mediaStreamObj);
            })
            .catch(function (err) {
              console.log(err.name, err.message);
              notify(`Video / Audio ${err.message}`);
              notify('Refresh and allow permissions');
            })
        : navigator.mediaDevices
            .getDisplayMedia(constraintObj)
            .then(function (mediaStreamObj) {
              stream(mediaStreamObj);
            })
            .catch(function (err) {
              console.log(err.name, err.message);
              notify(`Screen Capture ${err.message}`);
              notify('Refresh and allow permissions');
            });

      /*********************************
      getUserMedia returns a Promise
      resolve - returns a MediaStream Object
      reject returns one of the following errors
      AbortError - generic unknown cause
      NotAllowedError (SecurityError) - user rejected permissions
      NotFoundError - missing media track
      NotReadableError - user permissions given but hardware/OS error
      OverconstrainedError - constraint video settings preventing
      TypeError - audio: false, video: false
      *********************************/
    }
  };

  const Social = () => {
    return (
      <section>
        <div className="wrapper mt-4">
          <div
            className="button-social"
            onClick={() =>
              window.location.assign('https://www.instagram.com/vishesh22_17/')
            }
          >
            <div className="icon">
              <i className="fab fa-instagram"></i>
            </div>
            <span>Instagram</span>
          </div>

          <div
            className="button-social mx-2"
            onClick={() =>
              window.location.assign('https://www.linkedin.com/in/vishesh-vgr/')
            }
          >
            <div className="icon">
              <i className="fab fa-linkedin"></i>
            </div>
            <span>Linkedin</span>
          </div>

          <div
            className="button-social"
            onClick={() =>
              window.location.assign('https://github.com/VisheshVGR')
            }
          >
            <div className="icon">
              <i className="fab fa-github"></i>
            </div>
            <span>Github</span>
          </div>
        </div>
      </section>
    );
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col className="container-main shadow" style={{ marginTop: '5vh' }}>
          <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
            {/* Home Page */}
            <div
              style={{ display: homePage ? 'flex' : 'none' }}
              className="flex-column justify-content-around align-items-center"
            >
              <h1>
                <i className="fab fa-creative-commons-sampling"></i> Recorder
                App
              </h1>
              <hr />

              <p>
                Wish to record videos from your web browser!!! Try this Recorder
                App which records either audio and video from device default
                camera and mic or capture screen (without audio) and you can
                download the recorded media in mp4 file. Give it a try!!!
              </p>

              <button
                className="button button--fenrir"
                onClick={() => {
                  setHomePage(false);
                  setRecPage(true);
                  startSystem();
                }}
              >
                <svg
                  aria-hidden="true"
                  className="progress"
                  width="70"
                  height="70"
                  viewBox="0 0 70 70"
                >
                  <path
                    className="progress__circle"
                    d="m35,2.5c17.955803,0 32.5,14.544199 32.5,32.5c0,17.955803 -14.544197,32.5 -32.5,32.5c-17.955803,0 -32.5,-14.544197 -32.5,-32.5c0,-17.955801 14.544197,-32.5 32.5,-32.5z"
                  />
                  <path
                    className="progress__path"
                    d="m35,2.5c17.955803,0 32.5,14.544199 32.5,32.5c0,17.955803 -14.544197,32.5 -32.5,32.5c-17.955803,0 -32.5,-14.544197 -32.5,-32.5c0,-17.955801 14.544197,-32.5 32.5,-32.5z"
                    pathLength="1"
                  />
                </svg>
                <span>GO</span>
              </button>

              <h6 className="mb-5">
                Check your browser compatibility by{' '}
                <a
                  className="link"
                  href="https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API#browser_compatibility"
                  target="_blank"
                >
                  clicking here <i className="fas fa-external-link-alt"></i>
                </a>
              </h6>

              <Container className="rounded border-white border p-4 bg-light text-dark shadow">
                <Row>
                  <Col className="d-flex justify-content-center border-bottom mb-2">
                    <h3>
                      <i className="fas fa-cogs"></i> Settings
                    </h3>
                  </Col>
                </Row>
                <Row className="my-2">
                  <Col className="d-flex justify-content-center">
                    <h4>
                      <i className="fas fa-camera"></i> Camera Recording
                    </h4>
                  </Col>
                  <Col className="d-flex justify-content-center">
                    <Button
                      variant="outline-primary"
                      disabled={isMobile}
                      onClick={() => setFrontCamRec(!frontCamRec)}
                    >
                      {frontCamRec ? (
                        <i className="fas fa-toggle-on"></i>
                      ) : (
                        <i className="fas fa-toggle-off"></i>
                      )}
                    </Button>
                  </Col>
                </Row>
                <Row className="my-2">
                  <Col className="d-flex justify-content-center">
                    <h4>
                      <i className="fas fa-desktop"></i> Screen Capture
                    </h4>
                  </Col>
                  <Col className="d-flex justify-content-center">
                    <Button
                      variant="outline-primary"
                      disabled={isMobile}
                      onClick={() => {
                        setFrontCamRec(!frontCamRec);
                        setConstraintObj({
                          audio: false,
                          video: constraintObj.video,
                        });
                      }}
                    >
                      {frontCamRec ? (
                        <i className="fas fa-toggle-off"></i>
                      ) : (
                        <i className="fas fa-toggle-on"></i>
                      )}
                    </Button>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col className="d-flex justify-content-center">
                    <h4>
                      <i className="fas fa-microphone-alt"></i> Audio Recording
                    </h4>
                  </Col>
                  <Col className="d-flex justify-content-center">
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        setConstraintObj({
                          audio: !constraintObj.audio,
                          video: constraintObj.video,
                        })
                      }
                      disabled={!frontCamRec}
                    >
                      {constraintObj.audio ? (
                        <i className="fas fa-toggle-on"></i>
                      ) : (
                        <i className="fas fa-toggle-off"></i>
                      )}
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col className="d-flex flex-column align-items-center h6 mt-4 grey text-muted`">
                    *Only audio recording not supported!
                    {isMobile && (
                      <div>
                        <br />
                        *Screen Capture not supported by Mobile Device
                      </div>
                    )}
                  </Col>
                </Row>
              </Container>

              <Container className="rounded border-white border p-4 mt-3 bg-light text-dark shadow">
                <Row>
                  <Col className="d-flex justify-content-center border-bottom mb-2">
                    <h3 className="text-success">
                      <i className="far fa-comments"></i> Join the Discussion
                    </h3>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <div
                    id="gimme-comments-root"
                    data-gimme_comments_website_id="64c3b23958de0fe7fe3d81a8"
                  ></div>
                </Row>
              </Container>

              <Social />
            </div>

            {/* Recording Page */}
            <div
              className="flex-column justify-content-around"
              style={{ display: recPage ? 'flex' : 'none' }}
            >
              <video ref={videoRef} controls muted />
              <div className="d-flex justify-content-around align-items-center">
                <button
                  className="button button--anthe"
                  ref={startRecRef}
                  style={{
                    display: !isRecording ? 'inline-block' : 'none',
                    marginTop: '55px',
                  }}
                >
                  <span>
                    <i className="fas fa-play"></i> Start Recording
                  </span>
                </button>
                <button
                  className="button button--rhea"
                  ref={stopRecRef}
                  style={{ display: isRecording ? 'inline-block' : 'none' }}
                >
                  <span style={{ color: 'black' }}>
                    <i className="fas fa-stop"></i> Stop Recording
                  </span>
                </button>
              </div>
            </div>

            {/* Download Page */}
            <div
              className="flex-column justify-content-around"
              style={{ display: downPage ? 'flex' : 'none' }}
            >
              <video ref={downloadRef} controls />
              <div className="d-flex justify-content-around align-items-center">
                <a
                  target="_blank"
                  download
                  href={downloadLink}
                  onClick={() => notify('Download Started')}
                >
                  <button className="button button--bestia">
                    <div className="button__bg"></div>
                    <span>
                      <i className="fas fa-download"></i> Download
                    </span>
                  </button>
                </a>

                <button
                  className="button button--fenrir"
                  onClick={() => {
                    setDownPage(false);
                    setHomePage(true);
                    downloadRef.current.pause();
                  }}
                >
                  <svg
                    aria-hidden="true"
                    className="progress"
                    width="70"
                    height="70"
                    viewBox="0 0 70 70"
                  >
                    <path
                      className="progress__circle"
                      d="m35,2.5c17.955803,0 32.5,14.544199 32.5,32.5c0,17.955803 -14.544197,32.5 -32.5,32.5c-17.955803,0 -32.5,-14.544197 -32.5,-32.5c0,-17.955801 14.544197,-32.5 32.5,-32.5z"
                    />
                    <path
                      className="progress__path"
                      d="m35,2.5c17.955803,0 32.5,14.544199 32.5,32.5c0,17.955803 -14.544197,32.5 -32.5,32.5c-17.955803,0 -32.5,-14.544197 -32.5,-32.5c0,-17.955801 14.544197,-32.5 32.5,-32.5z"
                      pathLength="1"
                    />
                  </svg>
                  <span>HOME</span>
                </button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <ToastContainer />

      {/* social buttons */}
    </Container>
  );
};

export default App;
