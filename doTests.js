/** @file This file does automated tests on the studentvue api
 * making sure what the api returns matches the types written
 */
let StudentVue = require("./dist/index.js")
const fs = require('fs')

if (process.argv.length < 5) {
    console.error(`Usage: node ${process.argv[1]} <username> <password> <portal>`)
    console.error(`or npm test <username> <password> <portal>`)
    process.exit(1)
}

outfs = "import { StudentVueSchedule } from '../dist/index'\n"
var url = process.argv[4]
var username = process.argv[2]
var password = process.argv[3]
StudentVue.login(url,username,password).then(client => { 
    client.getSchedule().then(sch => {
        if (StudentVue.isError(sch)) {
            console.error("Unable to fetch studentvue info: ")
            console.error(sch.RT_ERROR.ERROR_MESSAGE)
            return
        }
        outfs += `let schedule: StudentVueSchedule = ${JSON.stringify(sch, null, 4)}\n`
        
        fs.writeFileSync("./tests/test-run.ts",outfs)
    })
})