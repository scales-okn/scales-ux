# scales-ux
The frontend repo for public-facing version of the SCALES implementation of Satyrn

### License

This repo is part of the SCALES implementation of Satyrn.
Satyrn is free software: you can redistribute it and/or modify it under 
the terms of the GNU General Public License as published by the Free Software Foundation, 
either version 3 of the License, or (at your option) any later version.
Satyrn is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with Satyrn. 
If not, see <https://www.gnu.org/licenses/>.

## Dependencies
NodeJs - https://nodejs.org/en/

NPM

## Server

### Database

For local development make sure to have a Postgres instance up and running.
https://www.codecademy.com/article/installing-and-using-postgresql-locally

### Configuration
Create a file called .env in ./server/.env

Copy and complete the .env.example variables

### Running
```
cd server 
npm install
npm run start
```

## Client

### Configuration

Create a file callend .env in ./client/.env

Copy and complete the .env.example variables

### Running
```
cd client 
npm install
npm run start
```

### For testing purposes:

1. Register a user via {host}/sign-up
2. Open up the Users table in the database
3. Manually change `approved` to TRUE and `role` to "admin" for the new user
4. Login in via {host}/sign-in
5. (Optionally) Copy-Paste the relevant components of a ring config into the (alpha) Ring editor (only available to admins)

### Known Issues

See the associated Github Issues for known issues under development (and report there as necessary)
