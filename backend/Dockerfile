FROM python:3.12

# Install poppler-utils
RUN apt-get update && apt-get install -y poppler-utils

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 5000

CMD ["python", "run.py"]