# Use an official Python runtime as a parent image
FROM python:3.9.11

# Set the working directory to /app
WORKDIR /app

# Fix GPG key issues and update apt

# Now update and install dependencies
# RUN apt-get update && apt-get install -y cmake

# Copy the requirements file into the container and install the dependencies
COPY requirements.txt /app
COPY ./ /app
COPY .env /app
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . /app

# Expose port 7017 for the Flask application
EXPOSE 5001

# Set the environment variable for Flask to run in production mode
ENV FLASK_ENV=production

# Start the Flask application
CMD ["flask", "run", "--host", "0.0.0.0", "--port=5001"]
