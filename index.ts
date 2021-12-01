import * as soap from 'soap'
import * as xml2json from 'xml2json'
// TODO: replace any type with cool custom types
// BODY: types like StudentVueSchedule

// begin types
// im guessing that it returns the same format for all schools
// im going to be screwed if not
/** StudentVue Course */
export type Course = {
    Period: string,
    CourseTitle: string,
    RoomName: string,
    TeacherName: string,
    TeacherEmail: string,
    SectionGU: string,
    TeacherStaffGU: string
}
/** StudentVue Term */
export type Term = {
    TermIndex: string,
    TermCode: string,
    TermName: string,
    BeginDate: string,
    EndDate: string,
    SchoolYearTrmCodeGU: string,
    TermDefCodes: {
        TermDefCode: {
            TermDefName: string
        }[]
    }
}
/**
 * If you see this, it means that the type has not been implemented yet.
 * This does not mean that the function hasn't been implemented, just the type
 */
export type NotImplemented = {[key: string]: unknown}
/**  Error from studentvue */
export type StudentVueError = {
    RT_ERROR: { ERROR_MESSAGE: string, STACK_TRACE: string }
}


/** Check if the output of a StudentVueClient function is an error 
 * @param {StudentVueResponse<any>} response
 * @returns boolean
*/
export function isError(response: any): response is StudentVueError {
    return response && response.RT_ERROR
}
/** A schedule from studentvue */
export type StudentVueSchedule = { 
    StudentClassSchedule: {
        TermIndex: string,
        TermIndexName: string,
        ErrorMessage: any,
        IncludeAdditionalStaffWhenEmailingTeachers: boolean,
        TodayScheduleInfoData: {
            Date: string
            SchoolInfos: {
                SchoolInfo: any // replace with actual type later
            }
        },
        ClassLists: {
            ClassListing: Course[]
        },
        TermLists: {
            TermListing: Term[]
        }
    }
}

// end types
/** Main studentvue class */
class StudentVueClient {
    username: string
    password: string
    client: soap.Client
    /** Dont use this, use the {@link login|login} function instead 
    */
    constructor(username: string, password: string, client: soap.Client) { 
        this.username = username;
        this.password = password;

        this.client = client;
    }
    /** get messages from teachers / school 
     * @returns {(NotImplemented | StudentVueError)} Messages
    */
    getMessages(): NotImplemented | StudentVueError {
        // @ts-ignore
        return this._xmlJsonSerialize(this._makeServiceRequest('GetPXPMessages'));
    }
    /** get assignments / events from calendar 
     * @returns {(NotImplemented | StudentVueError)} Calendar
    */
    getCalendar(): NotImplemented | StudentVueError {
        // @ts-ignore
        return this._xmlJsonSerialize(this._makeServiceRequest('StudentCalendar'));
    }
    /** get past attendance 
     * @returns {(NotImplemented | StudentVueError)} Past Attendance
    */
    getAttendance(): NotImplemented | StudentVueError {
        // @ts-ignore
        return this._xmlJsonSerialize(this._makeServiceRequest('Attendance'));
    }
    /** get grades and assignments from the specified reporting period, or the current grades if no reporting period is specified
     * @param {number} reportPeriod - Reporting Period to get
     * @returns {(NotImplemented | StudentVueError)} Gradebook
     */
    getGradebook(reportPeriod: number | undefined): NotImplemented | StudentVueError {
        let params = {};
        if (typeof reportPeriod !== 'undefined') {
            params = { ReportPeriod: reportPeriod };
        }
        // @ts-ignore
        return this._xmlJsonSerialize(this._makeServiceRequest('Gradebook', params));
    }
    /** get provided class notes 
     * @returns {(NotImplemented | StudentVueError)} Class Notes
    */
    getClassNotes(): NotImplemented | StudentVueError {
        // @ts-ignore
        return this._xmlJsonSerialize(this._makeServiceRequest('StudentHWNotes'));
    }
    /** get school's info on the student
     * @returns {(NotImplemented | StudentVueError)} School Info
     */
    getStudentInfo(): NotImplemented | StudentVueError {
        // @ts-ignore
        return this._xmlJsonSerialize(this._makeServiceRequest('StudentInfo'));
    }
    /** get student's schedule from the specified term, or the current schedule if no term is specified
     * @param {number} [termIndex]
     * @returns {(StudentVueSchedule | StudentVueError)}
     */
    getSchedule(termIndex: number | undefined): StudentVueSchedule | StudentVueError {
        let params = {};
        if (typeof termIndex !== 'undefined') {
            params = { TermIndex: termIndex };
        }
        // @ts-ignore cant really fix this
        return this._xmlJsonSerialize(this._makeServiceRequest('StudentClassList', params));
    }
    /** get school info 
     * @returns {(NotImplemented | StudentVueError)} School Info
    */
    getSchoolInfo(): NotImplemented | StudentVueError {
        // @ts-ignore
        return this._xmlJsonSerialize(this._makeServiceRequest('StudentSchoolInfo'));
    }
    /** list all uploaded report card documents 
     * @returns {(NotImplemented | StudentVueError)} Report Cards
    */
    listReportCards(): NotImplemented | StudentVueError {
        // @ts-ignore
        return this._xmlJsonSerialize(this._makeServiceRequest('GetReportCardInitialData'));
    }
    /** get content of a report card document by it's guid
     * @param {string} [documentGuid] - Report Card to get
     * @returns {(NotImplemented | StudentVueError)} Report Card
     */
    getReportCard(documentGuid: string | undefined): NotImplemented | StudentVueError {
        // @ts-ignore
        return this._xmlJsonSerialize(this._makeServiceRequest('GetReportCardDocumentData', { DocumentGU: documentGuid }));
    }
    /** list all uploaded documents 
     * @returns {(NotImplemented | StudentVueError)} Documents
    */
    listDocuments(): NotImplemented | StudentVueError {
        // @ts-ignore
        return this._xmlJsonSerialize(this._makeServiceRequest('GetStudentDocumentInitialData'));
    }
    /** get content of a document by it's guid 
     * @param {string} [documentGuid] - document to get
     * @returns {(NotImplemented | StudentVueError)} Document
    */
    getDocument(documentGuid: string | undefined): NotImplemented | StudentVueError {
        // @ts-ignore
        return this._xmlJsonSerialize(this._makeServiceRequest('GetContentOfAttachedDoc', { DocumentGU: documentGuid }));
    }

    _xmlJsonSerialize(servicePromise: Promise<any>) {
        return servicePromise.then(result => xml2json.toJson(result[0].ProcessWebServiceRequestResult,{ object: true }));
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
/** Login to studentvue 
 * @param {string} url - Url of portal (mobile url)
 * @param {string} username - Username
 * @param {string} password - Password
 * @param {soap.IOptions} soapOptions - Options for soap client
 * @returns {Promise<StudentVueClient>}
*/
export function login(url: string, username: string, password: string, soapOptions: soap.IOptions = {}) {
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
/** Get district urls from zipCode 
 * @param {number} zipCode - zipcode to search for
 * @returns {Promise<NotImplemented>} District info around zipCode
*/
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

