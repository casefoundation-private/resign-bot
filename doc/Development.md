# Development

To setup a development environment, do the following:

```bash
# git clone git@github.com:casefoundation/review-o-matic.git
# cd review-o-matic
```

Now open two terminal tabs/windows in the `review-o-matic` directory

**Tab 1**

This will be the tab where we run the backend node server:

```bash
# cd server
# npm install
# touch .env
```

Now open the `.env` file in your editor of choice and specify the variables required for your purposes. For a definition of each variable available, please see [Environment Variables](Environment%20Variables.md).

```bash
# node index.js
```

When this runs for the first time, it will check the database for user accounts. If the `users` table is empty, it will generate a new admin user account and output the login credentials to the command line.

**Tab 2**

This will be our front end React app tab:

```bash
# cd client
# npm install
# npm start
```

After that, the npm script will automatically open up a window with the application's frontend.

---

For more documentation, visit the [Getting Started](Getting%20Started.md) guide.
