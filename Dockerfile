FROM node:slim as builder

WORKDIR /app

COPY package.json /app
RUN npm install
RUN npm i -g typescript

COPY src /app/src
COPY tsconfig.json /app
RUN tsc


FROM node:slim as runner

RUN apt-get update

RUN apt-get install curl gnupg -y
RUN curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install google-chrome-stable -y --no-install-recommends
RUN rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json /app
RUN npm install --omit=dev

COPY --from=builder /app/dist /app

RUN ln -fs /usr/share/zoneinfo/Israel /etc/localtime

# run node from binary
CMD ["node", "schedule.js"]
