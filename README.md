# StudentVue.js

Node.js Library for interacting with StudentVue portals.

## Installation

Install with `npm install studentvue.js`

## Basic Usage

Logging in and getting messages:

```javascript
const StudentVue = require('studentvue.js');
StudentVue.login('district url', 'username', 'password')
    .then(client => client.getMessages())
    .then(console.log);
```

Getting districts near a zip code:

```javascript
const StudentVue = require('studentvue.js');
StudentVue.getDistrictUrls('zip code').then(console.log);
{
    "DistrictLists": {
        "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
        "xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance",
        "DistrictInfos": {
            "DistrictInfo": [
                {"DistrictID":"","Name":"San Francisco Unified School District","Address":"San Francisco CA 94102","PvueURL":"https://portal.sfusd.edu/"}
                ...
            ]
        }
    }
}
```

## Documentation
You can generate the documentaion with jsdoc

`npm run docs`

Outputed docs are in docs/

