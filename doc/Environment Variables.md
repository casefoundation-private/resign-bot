# Environment Variables

To support extensive customization, Review-O-Matic has supports environment variables that dictate how the application functions.

## Required Variables

The required environment variables that must be set in both dev and prod use cases are:

* PORT
* MAIL_*
* DB_*
* JWT_SECRET

## Variables List

This is an index of all configurable environment variables used by the back end server.

### Web Server

* **JWT_SECRET** Secret string used to encrypt the JWT keys.
* **PORT** The port on which the web server should listen.

### Email

* **MAIL_HOST** Hostname of SMTP server
* **MAIL_PORT** SMTP server port
* **MAIL_SECURE** TRUE/FALSE to use SSL when connecting to SMTP server
* **MAIL_USERNAME** SMTP server username
* **MAIL_PASSWORD** SMTP server password

### Database

* **DB** "sqlite3" or "postgres" to set the type of database to connect to.
* **DATABASE_URL** If using PostgreSQL, the URL to the database.
* **DATABASE_FILE_PATH** If using sqlite3, the path to where the sqlite file should be saved.

---

For more documentation, visit the [Getting Started](Getting%20Started.md) guide.
