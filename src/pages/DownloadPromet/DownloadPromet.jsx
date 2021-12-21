import "./DownloadPromet.css";
import { Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { actionAddVideo, actionNewVideoReceived } from "../../actions/index";
import Mmodal from "../../components/Mmodal/Mmodal";
const DownloadPromet = () => {
  const dispatch = useDispatch(null);
  const { Option } = Select;
  const [showDownloadPromet, setShowDownloadPromet] = useState(false);
  const [videoQualityChoosed, setVideoQualityChoosed] = useState(null);
  console.log("video quality : ",videoQualityChoosed)
  const videosData = useSelector((state) => state.videosReducer.videosData);
  const newVideoData = useSelector(
    (state) => state.newVideoReducer.newVideoData
  );
  const currentVideoIndex = useSelector(
    (state) => state.videosReducer.currentVideoIndex
  );
  //listen to electron app ipc channel for download video ask
  window.downloaderApi.receive("video:newInfo", (data) => {
    dispatch(actionNewVideoReceived(data));
    setShowDownloadPromet(true);
  });
  //check if video format contain audio and video and return the quality label to the select options
  const checkFormats = (format) => {
    if (format.hasVideo && format.hasAudio) {
      return format.qualityLabel;
    } else {
      return null;
    }
  };
  //handle the change on the select of video quality to download
  const handleSelectVideoQualityChange = (value) => {
    console.log("change happen : ", value);
    setVideoQualityChoosed(value);
  };
  //handle the download promet close
  const handleDownloadPrometClose = () => {
    setVideoQualityChoosed(null);
  };
  //handle the downoad promet download button click
  const handleDownloadPrometSubmit = () => {
    if (videoQualityChoosed !== null) {
      setShowDownloadPromet(false);
      let videoInfoObj = {
        videoId : newVideoData.videoId,
        title : newVideoData.title,
        lengthSeconds : newVideoData.lengthSeconds,
        thumbnail : newVideoData.thumbnail,
        itag : videoQualityChoosed
      }
      dispatch(actionAddVideo(currentVideoIndex, videoInfoObj));
      setVideoQualityChoosed(null);
      window.downloaderApi.send("video:startDownload",{
        videoId : newVideoData.videoId,
        title : newVideoData.title,
        itag : videoQualityChoosed,
        videoUrl : newVideoData.videoUrl
      })
    }
  };
  return (
    <Mmodal
      setShow={setShowDownloadPromet}
      show={showDownloadPromet}
      submitText="Download"
      onClose={handleDownloadPrometClose}
      onSubmit={handleDownloadPrometSubmit}
    >
      {newVideoData && (
        <>
          <h3>{newVideoData.title}</h3>
          <br />
          <section className="download-promet-container">
            <img src={newVideoData.thumbnail.url}></img>
            <section className="download-option-container">
              <p>Select Download Quality</p>
              <Select
                style={{ width: 120 }}
                onChange={handleSelectVideoQualityChange}
                value={videoQualityChoosed}
              >
                {newVideoData.formats.map((format) => {
                  let videoFormat = checkFormats(format);
                  return (
                    <>
                      {videoFormat && (
                        <Option value={format.itag} key={format.itag}>
                          {videoFormat}
                        </Option>
                      )}
                    </>
                  );
                })}
              </Select>
            </section>
          </section>
          <br />
        </>
      )}
    </Mmodal>
  );
};

export default DownloadPromet;
