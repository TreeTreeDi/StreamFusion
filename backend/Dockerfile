    # backend/Dockerfile (适用于开发环境)

    # Use an official Node.js Alpine runtime as a parent image
    # Using standard node:20 (Debian-based) for better compatibility
    FROM node:20-alpine

    # Install pnpm globally
    RUN npm install -g pnpm

    # Set the working directory in the container
    WORKDIR /app

    # Copy package manifests
    COPY package.json pnpm-lock.yaml ./

    # Set NODE_ENV to development to ensure devDependencies are installed
    ENV NODE_ENV=development

    # Install ALL dependencies using pnpm (frozen lockfile ensures reproducible installs)
    RUN pnpm install --frozen-lockfile

    # Copy the rest of the backend source code
    # This should happen AFTER install to avoid caching issues if only code changes
    # COPY . .

    # Build the TypeScript project
    # RUN pnpm run build

    # The app binds to this port
    EXPOSE 5000

    # Define the command to run the application
    # Uses the "start" script from package.json which runs compiled JS
    CMD ["pnpm", "run", "dev"]
