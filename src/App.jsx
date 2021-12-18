const App = () => {
    window.downloaderApi.receive("fromMain",(data) => {
        console.log(data);
    })
    return(
        <h1>downloader webapp</h1>
    )
}

export default App;