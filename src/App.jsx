import "./App.css";
import DownloadPromet from "./pages/DownloadPromet/DownloadPromet";
import Downloader from "./pages/Downloader/Downloader";
const App = () => {
  return (
    <div className="app-main-container">
      <DownloadPromet/>
      <Downloader />
    </div>
  );
};

export default App;
