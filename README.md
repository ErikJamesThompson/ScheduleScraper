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
1. Go to your console for Google developers
2. Create a new set of credentials with OAuth clientID option
3. Select Web Application and note the client ID and client Secret

* "google refresh token" can be received by going to the google Oauth playground
1. Go to the google OAuth playground
2. Select the Calendar v3 API and authorize it
3. Exchange the given Auth code to recieve your refresh token

* "creds" Both fields can be achieved by making a new google dev project
1. Go to your console for Google developers
2. Create a new set of credentials with service account key
3. Select "Owner" from the roles dropdown
4. A JSON file of the auth credentials has been saved and you can fill in the relevant details

```
run "npm run help" to get started
```

```
run "npm run sheets" to write to your specified Google Sheets
```
Run sheets requires the spreadsheet key to be filled in on the Auth file

```
run "npm run self" to send a formatted email to yourself
```

```
run "npm run team" to send a formatted email to your specified team emails
```
