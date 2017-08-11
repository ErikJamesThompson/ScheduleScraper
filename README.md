# ScheduleScraper

This is a script I created to scrape my co-workers' calendars for unbooked interview times.
The script then parses this data, formats it into an email or writes to a shared spreadsheet.
The purpose of this app is to increase efficiency within the team and allocate hours to where they are needed most.

***

To start using the schedule scraper, clone down the repo and inside the root of the project:
```
run "npm install"
```
* modify the contents of constants.js to reflect you and the current staff

* change the name of auth.example.js to auth.js and fill in relevent fields
"client id" and "client secret" can be found by creating a new google dev project
1.
2.
3.

"google refresh token" can be received by going to the google Oauth playground
1.
2.
3.

"creds" Both fields can be achieved by making a new google dev project
1.
2.
3.

```
run "npm run help" to get started
```

```
run "npm run sheets" to write to your specified Google Sheets
```

```
run "npm run self" to send a formatted email to yourself
```

```
run "npm run team" to send a formatted email to your specified team emails
```
