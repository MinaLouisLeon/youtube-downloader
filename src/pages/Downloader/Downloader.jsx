import "./Downloader.css";
import { useDispatch, useSelector } from "react-redux";
import {Progress} from 'antd';
const Downloader = () => {
  const dispatch = useDispatch(null);
  const videosData = useSelector((state) => state.videosReducer.videosData);
  let sec = new Date(null);
  return (
    <div className="downloader-main-container">
      <div className="downloader-inner-container shadow-2 br4">
        {videosData &&
          Object.keys(videosData).map((key) => {
              let timeSec = parseInt(videosData[key].lengthSeconds)
              sec.setSeconds(timeSec);
            return (
              <>
                <section className="download-item pa2 ma2">
                  <section>
                    <img
                      src={videosData[key].thumbnail.url}
                      className="br4"
                    ></img>
                  </section>
                  <section>
                      <h3>{videosData[key].title}</h3>
                      <p>Video Length : {sec.toISOString().substr(11, 8)}</p>
                      <Progress percent={0} size="small" status="active" />
                  </section>
                </section>
              </>
            );
          })}
      </div>
    </div>
  );
};

export default Downloader;
