## Docker Helper

Build the Docker image:

```bash
docker build -t {{SERVICE_NAME}} .
```

Run it:

```bash
docker run --rm -p 3000:3000 {{SERVICE_NAME}}
```

then visit: [http://localhost:3000](http://localhost:3000)