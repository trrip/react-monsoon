export default class FileHander {
  readFile = (file, completionHandler) => {
    try {
      let reader = new FileReader();
      let currentFile = file;
      let fileName = file.name;
      console.log(`[File Handler]--${file.name}`);
      reader.readAsText(currentFile, "UTF-8");
      reader.onload = event => {
        completionHandler(event.target.result, fileName);
      };
    } catch (err) {
      console.log(`file could not be read : ${err}`);
    }
  };
}
