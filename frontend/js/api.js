(function () {
  const { protocol, hostname, port } = window.location;
  const staticDevPorts = new Set(["3000", "5173", "5500", "5501", "8080"]);
  const isLocalStatic =
    protocol === "file:" ||
    ((hostname === "localhost" || hostname === "127.0.0.1") && staticDevPorts.has(port));

  window.apiUrl = function apiUrl(path) {
    return (isLocalStatic ? "http://127.0.0.1:5000" : "") + path;
  };
})();
