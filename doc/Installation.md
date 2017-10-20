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

To support extensive customization, Review-O-Matic has supports environment variables that dictate how the application functions. Specify those on the command line using the `--env` directive when running the Docker image or via your container service's configuration tool. For a definition of each variable available, please see [Environment Variables](Environment%20Variables.md).
