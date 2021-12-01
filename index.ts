import * as soap from 'soap'
import * as xml2json from 'xml2json'
// TODO: replace any type with cool custom types
// BODY: types like StudentVueSchedule
class StudentVueClient {
    username: string
    password: string
    client: soap.Client
    constructor(username: string, password: string, client: soap.Client) { 
        this.username = username;
        this.password = password;

        this.client = client;
    }

    getMessages() {
        return this._xmlJsonSerialize(this._makeServiceRequest('GetPXPMessages'));
    }

    getCalendar() {
        return this._xmlJsonSerialize(this._makeServiceRequest('StudentCalendar'));
    }

    getAttendance() {
        return this._xmlJsonSerialize(this._makeServiceRequest('Attendance'));
    }

    getGradebook(reportPeriod: number | undefined) {
        let params = {};
        if (typeof reportPeriod !== 'undefined') {
            params = { ReportPeriod: reportPeriod };
        }
        return this._xmlJsonSerialize(this._makeServiceRequest('Gradebook', params));
    }

    getClassNotes() {
        return this._xmlJsonSerialize(this._makeServiceRequest('StudentHWNotes'));
    }

    getStudentInfo() {
        return this._xmlJsonSerialize(this._makeServiceRequest('StudentInfo'));
    }

    getSchedule(termIndex: number | undefined) {
        let params = {};
        if (typeof termIndex !== 'undefined') {
            params = { TermIndex: termIndex };
        }
        return this._xmlJsonSerialize(this._makeServiceRequest('StudentClassList', params));
    }

    getSchoolInfo() {
        return this._xmlJsonSerialize(this._makeServiceRequest('StudentSchoolInfo'));
    }

    listReportCards() {
        return this._xmlJsonSerialize(this._makeServiceRequest('GetReportCardInitialData'));
    }

    getReportCard(documentGuid: string | undefined) {
        return this._xmlJsonSerialize(this._makeServiceRequest('GetReportCardDocumentData', { DocumentGU: documentGuid }));
    }

    listDocuments() {
        return this._xmlJsonSerialize(this._makeServiceRequest('GetStudentDocumentInitialData'));
    }

    getDocument(documentGuid: string | undefined) {
        return this._xmlJsonSerialize(this._makeServiceRequest('GetContentOfAttachedDoc', { DocumentGU: documentGuid }));
    }

    _xmlJsonSerialize(servicePromise: Promise<any>) {
        return servicePromise.then(result => xml2json.toJson(result[0].ProcessWebServiceRequestResult));
    }

    _makeServiceRequest(methodName: string, params = {}, serviceHandle = 'PXPWebServices') {
        let paramStr = '&lt;Parms&gt;';
        Object.entries(params).forEach(([key, value]) => {
            paramStr += '&lt;' + key + '&gt;';
            paramStr += value;
            paramStr += '&lt;/' + key + '&gt;';
        });
        paramStr += '&lt;/Parms&gt;';

        return this.client.ProcessWebServiceRequestAsync({
            userID: this.username,
            password: this.password,
            skipLoginLog: 1,
            parent: 0,
            webServiceHandleName: serviceHandle,
            methodName,
            paramStr
        });
    }
}

export function login(url: string, username: string, password: string, soapOptions = {}) {
    const host = new URL(url).host;
    const endpoint = `https://${ host }/Service/PXPCommunication.asmx`;

    const resolvedOptions = Object.assign({
        endpoint: endpoint, // enforces https
        escapeXML: false
    }, soapOptions);

    const wsdlURL = endpoint + '?WSDL';

    return soap.createClientAsync(wsdlURL, resolvedOptions)
        .then(client => new StudentVueClient(username, password, client));
}

export function getDistrictUrls(zipCode: number) {
    return soap.createClientAsync('https://support.edupoint.com/Service/HDInfoCommunication.asmx?WSDL', {
        endpoint: 'https://support.edupoint.com/Service/HDInfoCommunication.asmx',
        escapeXML: false
    })
        .then(client => {
            const supportClient = new StudentVueClient('EdupointDistrictInfo', 'Edup01nt', client);
            return supportClient._xmlJsonSerialize(supportClient._makeServiceRequest('GetMatchingDistrictList', {
                MatchToDistrictZipCode: zipCode,
                Key: '5E4B7859-B805-474B-A833-FDB15D205D40' // idk how safe this is
            }, 'HDInfoServices'));
        });
}

