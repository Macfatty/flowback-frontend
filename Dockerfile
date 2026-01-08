FROM node:24-alpine3.21 AS sk-build
WORKDIR /app

# This just sets the timezone
ARG TZ=Europe/Stockholm

COPY package*.json ./
RUN npm ci

COPY . .
# RUN apk --no-cache add curl tzdata
# RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# EXPOSE 3333
# EXPOSE 8080
# EXPOSE 24678

ARG PORT="3000"
EXPOSE ${PORT}
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", ${PORT}]
# CMD ["npm", "run", "dev3000"]

# RUN npm run build
# CMD ["npm", "run", "dev3000"]

# FROM node:24-alpine3.21
# WORKDIR /usr/src/app

# This just sets the timezone
# ARG TZ=Europe/Stockholm
# RUN apk --no-cache add curl tzdata
# RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# COPY --from=sk-build /usr/src/app/package.json /usr/src/app/package.json
# COPY --from=sk-build /usr/src/app/package-lock.json /usr/src/app/package-lock.json

# Should use "--only=production" but generates errors
# best guess is that there are some outdated packaged,
# but we don't know
#RUN npm i --only=production
# RUN npm install 
#
# COPY --from=sk-build /usr/src/app/build /usr/src/app/build
#
# EXPOSE 5173
# EXPOSE 3000
# CMD ["node", "build/index.js"]
# CMD ["vite", "dev", "--port", "3000", "--host"]
