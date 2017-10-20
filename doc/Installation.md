# Installation

## Requirements

Review-O-Matic has flexible hosting requirements thanks to its use of Docker. The only external resource Review-O-Matic requires is a database. You may use either Sqlite for small installations or PostgrSQL for larger installations.

## Running With Docker

To build a Docker image of Review-O-Matic, build the Dockerfile located in the root of the project by running:

```bash
# docker build -t review-o-matic
```

Then run the image using Docker's run command:

```bash
# docker run [--env options] -p 8000:8000 review-o-matic
```

## Environment Variables

To support extensive customization, Review-O-Matic has supports environment variables that dictate how the application functions. Specify those on the command line when running the Docker image or via your container service's configuration tool.

### Web Server

* **URL_ROOT** The base URL for the site. (i.e. https://reviewomatic.com)
* **PORT** The port on which the web server should listen.

### Email

* **MAIL_HOST** Hostname of SMTP server
* **MAIL_PORT** SMTP server port
* **MAIL_SECURE** TRUE/FALSE to use SSL when connecting to SMTP server
* **MAIL_USERNAME** SMTP server username
* **MAIL_PASSWORD** SMTP server password
* **MAIL_FROM** SMTP send address

### Database

* **DB** "sqlite" or "postgres" to set the type of database to connect to.
* **DB_HOST** If using PostgreSQL, specify the database server's hostname.
* **DB_USERNAME** If using PostgreSQL, specify the database server's username.
* **DB_PASSWORD** If using PostgreSQL, specify the database server's password.
* **DB_DATABASE** If using PostgreSQL, specify the database server's database name.

### Importing

* **SUSPEND_IMPORTING** Set to anything to disable automated importing. Omit to allow automated importing.
* **IMPORT_INTERVAL** Interval in milliseconds in which to run automated imports.
* **REVIEWS_PER_SUBMISSION** Per each new submission created, specify the number of reviews to assign. Cannot be greater than REVIEW_LIMIT.
* **WUFOO_KEY** Wufoo API key
* **WUFOO_FORM_ID** Wufoo form ID to pull submissions from
* **WUFOO_SUBDOMAIN** Wufoo account subdomain
* **WUFOO_HANDSHAKE_KEY** When setting up a webhook with Wufoo, set a handshake key here to validate Wufoo's incoming requests

### Embargo Control

* **EMBARGO_DATE** To prevent content create prior to a certain date, such as test data, from coming into the system set this embargo date. Review-O-Matic will ignore anything created prior to this date. The created date, in the case of Wufoo, is determined by the created date for an entry supplied by the Wufoo API not the date of import.  Omit to disable embargoing.
* **IMPORT_PAUSES** To enable period pauses on publishing new submissions, set up the IMPORT_PAUSEs. Set this variable to an integer indicating how many pauses are to be configured. Omit to disable pauses.
* **IMPORT_PAUSE_[N]_START** For each pause, specify when a pause should start using Cronjob syntax "\* \* \* \* \*". [N] should be an integer from 0 up to, but not including, the value of IMPORT_PAUSES.
* **IMPORT_PAUSE_[N]_LENGTH** For each pause, specify the time the pause should last from IMPORT\_PAUSE\_[N]\_START in a number of milliseconds. [N] should be an integer from 0 up to, but not including, the value of IMPORT_PAUSES.

### Submission Control

* **REVIEW_LIMIT** Set an integer to be the total number of reviews allowed for any one submission. Omit to disable limiting.
* **PINNED_LIMIT** Set an integer to be the total number of submissions that may be pinned at any one time. Omit to disable limiting.

### Security

* **ALLOWED_SUBMISSION_ORIGINS** When using the public submissions feed, you may set the CORS policy for that endpoint's access so that other front-end applications may make direct calls. Specify each host origin that may make cross-domain requests and separate each host with with a comma ",".  Omit to disable CORS policy.
* **JWT_SECRET** TODO

### Review Prompt Grading Customization

* **REVIEW_PROMPTS_COUNT** The total number of grading prompts to show on the review screen.
* **REVIEW_PROMPT_LABELS_COUNT** The total number of options for each review prompt.
* **REVIEW_PROMPT_[N]** For each review prompt, specify the text for the prompt. [N] should be an integer from 0 up to, but not including, the value of REVIEW_PROMPTS_COUNT.
* **REVIEW_PROMPT_[N]_LABEL_[K]** For each prompt, specify each text value for the dropdown. [N] should be an integer from 0 up to, but not including, the value of REVIEW_PROMPTS_COUNT and [K] should be an integer from 0 up to, but not including, the value of REVIEW_PROMPT_LABELS_COUNT.

### Review Categorization Customization

* **REVIEW_CATEGORIES_COUNT** The total number of categorization prompts to show on the review screen.
* **REVIEW_CATEGORY_[N]** For each categorization prompt, specify the text for the prompt. [N] should be an integer from 0 up to, but not including, the value of REVIEW_CATEGORIES_COUNT.
* **REVIEW_CATEGORY_[N]_LABELS_COUNT**  For each categorization prompt, specify the number of options that will be in the dropdown. [N] should be an integer from 0 up to, but not including, the value of REVIEW_CATEGORIES_COUNT.
* **REVIEW_CATEGORY_[N]_LABEL_[K]** For each categorization prompt, specify each dropdown option's value.  [N] should be an integer from 0 up to, but not including, the value of REVIEW_CATEGORIES_COUNT and [K] should be an integer from 0 up to, but not including, the value of REVIEW_CATEGORY_[N]\_LABELS_COUNT.

### User Interface

* **PER_PAGE** Set the number of entries that should appear per-page on the front end. Omit to disable pagination.
* **HELP_GOOGLE_DOC_ID** ID of the Google Doc to use for the help screen. Omit to disable help screen.
* **GOOGLE_API_KEY** Google API key with Google Drive API enabled to use when accessing HELP_GOOGLE_DOC_ID. Required if HELP_GOOGLE_DOC_ID is specified.
* **HELP_HTML** Instead of a Google Doc, directly provide the HTML for the content of the help page.
