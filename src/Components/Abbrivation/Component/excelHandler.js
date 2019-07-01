import XLSX from "xlsx";

export default class ExcelHandler {
  constructor() {
    this.file = {};
  }

  getModifiedJson = (fileData, handler) => {
    // console.log(`welcome here ----------`);
    var first_worksheet = fileData.Sheets[fileData.SheetNames[0]];
    var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
    let finalData = [];
    for (let i in data) {
      let temp = {};
      if (i !== 0) {
        temp.word = data[i][0];
        temp.defination = data[i][1];
      }
      finalData.push(temp);
    }
    //work here before sending things u
    // remove all unnecessary thigns
    // console.log(finalData);
    if (handler !== undefined) handler(finalData);
  };

  getJsonFileFile = (file, complitionHandler) => {
    // console.log(file[0]);

    let fileReader = new FileReader();
    try {
      fileReader.onload = e => {
        var binary = "";
        var bytes = new Uint8Array(e.target.result);
        var length = bytes.byteLength;
        for (var i = 0; i < length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        var oFile = XLSX.read(binary, {
          type: "binary",
          cellDates: true,
          cellStyles: true
        });
        this.getModifiedJson(oFile, complitionHandler);
      };
      fileReader.readAsArrayBuffer(file[0]);
    } catch (err) {
      console.log(err);
    }

    // var first_worksheet = file.Sheets[file.SheetNames[0]];
    // var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
    // console.log(data);
  };

  downloadXlsxFileFromData = data => {
    /*
    var elt = document.getElementById('data-table');
    var wb = XLSX.utils.table_to_book(elt, {sheet:"Sheet JS"});
    return dl ?
    XLSX.write(wb, {bookType:type, bookSST:true, type: 'base64'}) :
    XLSX.writeFile(wb, fn || ('test.' + (type || 'xlsx')));
    */
    let wb = this.aoa_to_workbook(data);
    try {
      XLSX.writeFile(wb, "test.xlsx");
    } catch (err) {
      console.log(err);
    }
  };

  sheet_to_workbook(sheet /*:Worksheet*/, opts) /*:Workbook*/ {
    var n = opts && opts.sheet ? opts.sheet : "Sheet1";
    var sheets = {};
    sheets[n] = sheet;
    return { SheetNames: [n], Sheets: sheets };
  }

  aoa_to_workbook(data /*:Array<Array<any> >*/, opts) /*:Workbook*/ {
    return this.sheet_to_workbook(XLSX.utils.aoa_to_sheet(data, opts), opts);
  }
}

export let ExcelHandlerObj = new ExcelHandler();
