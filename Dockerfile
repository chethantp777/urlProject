FROM node:22
WORKDIR /urlProject
COPY package.json package-lock.json ./
RUN npm install && npm install moment && npm install mongoose && npm install google-auth-library && npm install mongodb && npm install dotenv
COPY . .
EXPOSE 5000
CMD ["node", "src/index.js"]
