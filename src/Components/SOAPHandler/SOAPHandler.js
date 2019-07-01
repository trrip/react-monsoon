export default class SOAPHandler {
  constructor(methodName) {
    this.methodName = methodName;
  }
  TAGNAME = "Data";
  xml = () => {
    return `<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/"><SOAP-ENV:Body><ns1096:${
      this.methodName
    } xmlns:ns1096="http://tempuri.org"><${
      this.TAGNAME
    } xsi:type="xsd:string">SOME_DATA</${this.TAGNAME}></ns1096:${
      this.methodName
    }></SOAP-ENV:Body></SOAP-ENV:Envelope>`;
  };

  async sendRequest(url, soapAction, dataToSend, completionHandlers) {
    let requestString = this.xml();
    requestString = requestString.replace("SOME_DATA", dataToSend);
    console.log(requestString);

    const headers = new Headers();
    headers.append("Content-Type", "text/xml; charset=UTF-8");
    headers.append("SOAPAction", "urn:MonsoonRequestHandler#uploadTOC_HTML"); //soapAction);
    fetch(url, {
      body: requestString,
      method: "POST",
      mode: "no-cors", //importtant to add because new chrome as some issues
      headers: headers
    })
      .then(res => completionHandlers(res))
      .catch(err => console.log(err));
  }

  soap(url, soapAction, body) {
    var xmlhttp = new XMLHttpRequest();

    //replace second argument with the path to your Secret Server webservices
    xmlhttp.open("POST", url, true, "super");
    xmlhttp.withCredentials = false;
    //create the SOAP request
    //replace username, password (and org + domain, if necessary) with the appropriate info
    body = body.replace(/</g, "&lt;");
    body = body.replace(/>/g, "&gt;");
    body = body.replace(/&/g, "&amp;");
    body = body.replace(/'/g, "&apos;");
    body = body.replace(/"/g, "&quot;");

    let strRequest = this.xml().replace("SOME_DATA", body);
    console.log(`[SOAPHandler]--${strRequest}--`);

    //specify request headers
    xmlhttp.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
    xmlhttp.setRequestHeader("SOAPAction", soapAction);
    // xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "SOAPAction,SOAPAction");

    // xmlhttp.setRequestHeader("credentials", "include");

    //FOR TESTING: display results in an alert box once the response is received
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4) {
        console.log(`[XML RESPONSE]--${xmlhttp.response}--`);
      }
    };

    //send the SOAP request
    xmlhttp.send(strRequest);
  }
}

/*
 <?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/"><SOAP-ENV:Body><ns1096:uploadTOC_HTML xmlns:ns1096="http://tempuri.org"><Data xsi:type="xsd:string">[]</Data></ns1096:uploadTOC_HTML></SOAP-ENV:Body></SOAP-ENV:Envelope>

 */
