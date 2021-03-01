require('dotenv').config();
const fs = require('fs');
const fetch = require('node-fetch');

const email = process.env.email;
const password = process.env.password;
let authToken;
let courseId;

(async () => {
    try {
        // Login request
        let loginRes = await fetch("https://bootcampspot.com/api/instructor/v1/login", {
            method: 'post',
            body: JSON.stringify({email, password})
        });

        if (loginRes.status >= 400) {
            console.log(loginRes)
            throw new Error("Bad response from login request");
        }

        loginRes = await loginRes.json();
        // Set authToken
        authToken = loginRes.authenticationInfo.authToken;

        // Me request to get courseId from enrollments array in response
        let meRes = await fetch("https://bootcampspot.com/api/instructor/v1/me", {
            headers: {
                'Content-Type': 'application/json',
                'authToken': authToken
            }
        });

        if (meRes.status >= 400) {
            console.log(meRes)
            throw new Error("Bad response from me request");
        }
        
        meRes = await meRes.json();
        courseId = meRes.Enrollments[0].courseId;
        console.log(courseId);

        // let attendanceRes = await fetch("https://bootcampspot.com/api/instructor/v1/attendance", {
        //     method: 'post',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'authToken': authToken
        //     },
        //     body: JSON.stringify({"courseId": 3296})
        // })

        // if (attendanceRes.status >= 400) {
        //     throw new Error("Bad response from login request");
        // }

        // attendanceRes = await attendanceRes.json();
        
        // fs.writeFile('./data/attendance.json', JSON.stringify(attendanceRes), 'utf-8', (err) => {
        //     if (err) {
        //         return console.log(err);
        //     }

        //     console.log("Done! Attendance saved to data/attendance.json");
        // });
        
    } catch(err) {
        console.log(err)
    }
})()