export default class DownloadHelper {
  download_file(name, contents, mime_type, senderDoccument, senderWindow) {
    mime_type = mime_type || "text/plain";
    var blob = new Blob([contents], { type: mime_type });

    var dlink = senderDoccument.createElement("a");
    dlink.download = name;
    dlink.href = senderWindow.URL.createObjectURL(blob);
    dlink.onclick = function(e) {
      // revokeObjectURL needs a delay to work properly
      var that = this;
      setTimeout(function() {
        senderWindow.URL.revokeObjectURL(that.href);
      }, 1500);
    };

    dlink.click();
    dlink.remove();
  }
}

export let downloadHelperObject = new DownloadHelper();
