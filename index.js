require('dotenv').config();
const fs = require('fs');
const fetch = require('node-fetch');

const email = process.env.email;
const password = process.env.password;
let authToken;
let courseId;
let enrollmentId;
const today = new Date().getDay();

/**
 * I swear if they didn't make me do so many fetch requests to get the appropriate data I need I wouldn't be making this many fetch requests.
 * 
 * Why I need these endpoints:
 * login - returns authToken needed for other routes
 * me - returns array of Enrollments that is used to grab the courseId for the attendance request
 * attendance - returns an array of attendance for ALL sessions
 * sessions - returns an array of sessions to compare with today's date to get correct session for today
 * 
 * 
 * Once we have the array of attendance
 */

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
        // Get courseId from first index in Enrollments array
        courseId = meRes.Enrollments[0].courseId;
        enrollmentId = meRes.Enrollments[0].id;
        // Get attendance array
        let attendanceRes = await fetch("https://bootcampspot.com/api/instructor/v1/attendance", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'authToken': authToken
            },
            body: JSON.stringify({courseId})
        });

        if (attendanceRes.status >= 400) {
            throw new Error("Bad response from attendance request");
        }

        attendanceRes = await attendanceRes.json();
        
        let sessionRes = await fetch("https://bootcampspot.com/api/instructor/v1/sessions", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'authToken': authToken
            },
            body: JSON.stringify({enrollmentId})
        });

        if (sessionRes.status >= 400) {
            throw new Error("Bad response from session request");
        }

        sessionRes = await sessionRes.json();
        const testDate = new Date(sessionRes.currentWeekSessions[0].session.startTime)
        // console.log(sessionRes.currentWeekSessions.length);
        // console.log(today)
        // console.log(sessionRes.currentWeekSessions[today - 1]);
        console.log(attendanceRes)

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