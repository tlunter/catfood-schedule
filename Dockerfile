FROM node:5.6.0
ADD . /app
WORKDIR /app
RUN npm install
RUN npm run build:min:js
EXPOSE 3000
CMD ["node","index.js"]
