# Configuration

## General

* **Root URL** This is the main URL of the site, such as `https://myreview.mysite.com`. It is used as the base URL when sending out email notifications to users.
* **From Address** When sending email notifications, this is used as the sender/reply-to address.
* **Rows Per Page** This controls the number of rows to show on table views like Submissions, Users, etc.
* **Help Text** In the navbar, there is a help page, this is where the text of that page may be set.

## Importing & External Services

### Automated Importing

* **Suspend Automated Importing** Temporarily stops automated importing of data from external services.
* **Import Interval** Sets the delay in minutes between automated importing attempts.
* **Import Pause Schedule** Use this to set scheduled times to not automatically import new data.

### Wufoo

The only supported automated import service is currently Wufoo. For information on configuring this section, see [Creating Submissions](Creating%20Submissions.md).

## Restrictions

* **Max Pinnable Submissions** Admins may _pin_ submissions to the top of the list. This sets the maximum number of pins that may be set. Blank means unlimited pins.
* **Max Reviews Per Submission** Sets the maximum number of reviews for a single submission. (Auto-assigned and manually assigned reviews.) Blank means unlimited reviews.

## Reviewing

### Assigning Reviews

* **Reviews Per Submission** sets the number of auto-assigned reviews per submission. (When new submissions come in, the system will automatically assign a reviews of each submission to this number of users.)

### Review Prompts

Prompts are the scoring dropdowns reviewers use to grade submissions. Each row has a question/prompt field and then a set number of a labeled score dropdown values starting with 0 points and incrementing by one each new dropdown value. The score for an individual review is the average of all prompt dropdowns selected, and the total score for a submission is an average of each individual reviewer's score given.

### Submissions

Categories are the classifying dropdowns reviewers use to organize submissions. Each _prompt_ has a question/prompt field and then a set number of category dropdowns. A submission's final value for each categorization is determined by simple voting, the most chosen category is the final.

## Submissions

* **Allow public read access to submissions** enables public `GET` requests to `/api/submission/public`. This returns a JSON array of all unflagged submissions.
* **Allow public write access to submissions** enables public `PUT` requests to `/api/submission/public`. See [Creating Submissions / API](Creating%20Submissions.md#API) for more information.
* **Cross-origin-request allowed domains (One per line)** Add hostnames (one per line) to this field to enable cross-origin-requests to `/api/submission/public`. This is useful for publicly displaying submissions or submitting submissions via AJAX without processing through a separate backend server.
