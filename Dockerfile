FROM node:0.10

RUN groupadd -r app \
&&  useradd -r -g app app

ENV VERSION 1.0.0

WORKDIR /app

RUN curl -fSL "https://github.com/pierreozoux/TioApp/releases/download/v${VERSION}/TioApp.tar.gz" -o TioApp.tar.gz \
 && tar zxvf TioApp.tar.gz \
 && rm TioApp.tar.gz \
 && cd bundle/programs/server \
 && npm install \
 && chown -R app:app /app

USER app

WORKDIR /app/bundle

# needs a mongoinstance - defaults to container linking with alias 'db'
ENV MONGO_URL=mongodb://db:27017/meteor \
    HOME=/tmp \
    PORT=3000 \
    ROOT_URL=http://localhost:3000

EXPOSE 3000

CMD ["node", "main.js"]
