# Development Dockerfile (без nginx)
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# 1. Копируем только package.json для кэширования
COPY polyprep-web/package*.json ./

# 2. Устанавливаем зависимости
RUN npm install && \
    npm install --save-dev @types/axios

# 3. Копируем все файлы проекта
COPY polyprep-web/ ./

# 4. Открываем порт 3000
EXPOSE 3001

# 5. Запускаем приложение с параметрами для Docker
CMD ["npm", "start"]